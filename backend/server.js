require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const cron = require("node-cron"); 

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const mainDailyPlaylist = 13502908143; 

const genrePlaylists = {
  "Pop": [13416990423, 2098157264], 
  "Rap": [13417104363, 1996494362, 1677006641],
  "Rock": [13374370263, 13374370263, 11335739484],
  "R&B": [1314725125, 5411628342, 2021626162],
  "Country": [1130102843, 1294431447],
  "Alt/Indie": [668126235, 8716319082],
  "K-Pop": [4096400722, 873660353],
  "Jazz": [1615514485],
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours time to live for cache 
const trackCache = {};
const genreCache = {};
const artistCache = {};

function isCacheValid(cacheEntry) {
  if (!cacheEntry) return false;
  const now = Date.now();
  return now - cacheEntry.timestamp < CACHE_TTL_MS;
}


cron.schedule("0 8 * * *", async () => {
  console.log("Running scheduled job: rotateDailies");
  try {
    await rotateDailies();
    console.log("rotateDailies completed successfully.");
  } catch (error) {
    console.error("Error during rotateDailies cron job:", error.message);
  }
});

async function fetchTrack(trackId) {
  if (trackCache[trackId] && isCacheValid(trackCache[trackId])) {
    return trackCache[trackId].data;
  }
  // otherwise, fetch fresh
  const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
  trackCache[trackId] = {
    data: response.data,
    timestamp: Date.now()
  };
  return response.data;
}

async function getPlaylistTracks(playlistIds) {
  const ids = Array.isArray(playlistIds) ? playlistIds : [playlistIds];
  let allTracks = [];
  for (const pId of ids) {
    try {
      const response = await axios.get(`https://api.deezer.com/playlist/${pId}`);
      const tracks = response.data.tracks.data || [];
      // collect just track IDs
      allTracks = allTracks.concat(tracks.map(t => t.id));
    } catch (err) {
      console.error(`Failed to fetch playlist ${pId}:`, err.message);
    }
  }
  // return unique track IDs
  return [...new Set(allTracks)];
}

// pick a random track from a list that isn't in previouslyUsed
function selectNewTrack(allTrackIds, previouslyUsed) {
  const usedSet = new Set(previouslyUsed || []);
  const available = allTrackIds.filter(id => !usedSet.has(id));
  if (available.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

async function rotateDailies() {
  console.log("Running rotateDailies()...");

  const mainTracks = await getPlaylistTracks(mainDailyPlaylist);
  await updateDailyChallenge("daily", mainTracks, null);

  for (const [genre, playlistIds] of Object.entries(genrePlaylists)) {
    const tracks = await getPlaylistTracks(playlistIds);
    await updateDailyChallenge("genre", tracks, genre);
  }
}

async function updateDailyChallenge(type, allTrackIdsPromise, genre = null) {
  try {
    const allTrackIds = await allTrackIdsPromise;
    if (!allTrackIds || allTrackIds.length === 0) {
      console.warn(`No tracks found for type=${type}, genre=${genre}.`);
      return;
    }

    // fetch the row
    let query = supabase
      .from("daily_challenges")
      .select("*")
      .eq("type", type)
      .single();

    if (genre) {
      query = supabase
        .from("daily_challenges")
        .select("*")
        .eq("type", "genre")
        .eq("genre", genre)
        .single();
    }

    const { data, error } = await query;
    if (error || !data) {
      console.error("No daily challenge record found or error:", error);
      return;
    }

    // pick a new track
  let newTrackId = null;

  for (let i = 0; i < 10; i++) {
    const candidateTrackId = selectNewTrack(allTrackIds, data.previous_ids);
    if (!candidateTrackId) break;

    try {
      const response = await axios.get(`https://api.deezer.com/track/${candidateTrackId}`);
      if (response.data.readable) {
        newTrackId = candidateTrackId;
        break;
      } else {
        console.warn(`Track ${candidateTrackId} is not readable, retrying...`);
      }
    } catch (error) {
      console.error(`Error checking track ${candidateTrackId}:`, error.message);
    }
  }

    if (!newTrackId) {
      console.warn(`All tracks exhausted for ${type}, genre=${genre}. Resetting previous_ids...`);
      await supabase
        .from("daily_challenges")
        .update({ 
          previous_ids: [], 
          last_updated: new Date().toISOString()
        })
        .eq("id", data.id);
      return;
    }

    const updatedPrev = [...data.previous_ids, newTrackId];
    await supabase
      .from("daily_challenges")
      .update({
        current_song_id: newTrackId,
        previous_ids: updatedPrev,
        last_updated: new Date().toISOString(),
      })
      .eq("id", data.id);

    console.log(`Updated ${type} challenge for genre=${genre} with track ${newTrackId}`);
  } catch (err) {
    console.error(`Error in updateDailyChallenge(${type}, ${genre}):`, err.message);
  }
}

async function fetchArtistData(artistName) {
  // normalize key
  const key = artistName.toLowerCase().trim();

  // use cache if valid
  if (artistCache[key] && isCacheValid(artistCache[key])) {
    return artistCache[key].data; // { confirmedArtist, tracks }
  }

  // 1) search for artist
  const artistSearchResponse = await axios.get(
    `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`
  );
  const artists = artistSearchResponse.data?.data;
  if (!artists || artists.length === 0) {
    return null;
  }
  const foundArtist = artists[0];

  // fetch top tracks
  const tracklistResponse = await axios.get(foundArtist.tracklist);
  const songs = tracklistResponse.data?.data || [];
  if (songs.length === 0) {
    return null;
  }

  // store in cache
  artistCache[key] = {
    data: {
      confirmedArtist: foundArtist,
      tracks: songs
    },
    timestamp: Date.now(),
  };

  return artistCache[key].data;
}

app.get("/artist", async (req, res) => {
  const { artist } = req.query;
  if (!artist) {
    return res.status(400).json({ error: "Artist name is required." });
  }

  try {
    const artistData = await fetchArtistData(artist);
    if (!artistData) {
      return res.status(404).json({ error: "No artist or no tracks found." });
    }

    const { confirmedArtist, tracks } = artistData;
    if (tracks.length === 0) {
      return res.status(404).json({ error: "No songs found for this artist." });
    }

    // pick random readable track (up to 10 tries)
    for (let i = 0; i < 10; i++) {
      const randomSong = tracks[Math.floor(Math.random() * tracks.length)];
      // check readability from trackCache
      try {
        const track = await fetchTrack(randomSong.id);
        if (track.readable) {
          return res.json({
            confirmedArtist: {
              id: confirmedArtist.id,
              name: confirmedArtist.name,
              picture_big: confirmedArtist.picture_big,
            },
            song: {
              id: track.id,
              title: track.title_short,
              preview: track.preview,
              artist: track.artist,
              album: track.album,
              contributors: track.contributors,
            },
          });
        }
      } catch (err) {
        console.warn("Error verifying track readability:", err.message);
      }
    }

    // if no readable track found
    return res.status(404).json({ error: "No readable tracks found. Try again later." });
  } catch (error) {
    console.error("Error fetching artist or songs:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});


app.get("/genres", (req, res) => {
  const genres = Object.keys(genrePlaylists);
  res.json({ genres });
});

app.get("/genre-daily", async (req, res) => {
  const { genre } = req.query;
  if (!genre) {
    return res.status(400).json({ error: "Missing genre parameter" });
  }
  try {
    const { data, error } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("type", "genre")
      .eq("genre", genre)
      .single();

    if (error || !data) {
      return res.status(500).json({ error: `No daily challenge found for genre=${genre}` });
    }

    const trackId = data.current_song_id;
    if (!trackId) {
      return res.status(404).json({ error: "No current_song_id for this genre daily." });
    }

    // fetch from Deezer
    const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
    const track = response.data;
    return res.json({
      id: track.id,
      title: track.title_short,
      artist: track.artist,
      preview: track.preview,
      album: track.album,
      contributors: track.contributors,
    });
  } catch (err) {
    console.error("Error fetching genre daily song:", err.message);
    return res.status(500).json({ error: "Failed to fetch genre daily song." });
  }
});

async function fetchGenreTrackIds(genre) {
  // if cache is valid, use it
  if (genreCache[genre] && isCacheValid(genreCache[genre])) {
    return genreCache[genre].data; // array of track IDs
  }

  //  fetch fresh from all playlists for this genre
  const playlistIds = genrePlaylists[genre];
  let allTrackIds = [];

  for (const pId of playlistIds) {
    try {
      const trackIds = await getPlaylistTracks(pId);
      allTrackIds = allTrackIds.concat(trackIds);
    } catch (err) {
      console.error(`Failed to fetch playlist ${pId} for genre ${genre}:`, err.message);
    }
  }

  // deduplicate
  const uniqueIds = [...new Set(allTrackIds)];

  // store in cache
  genreCache[genre] = {
    data: uniqueIds,
    timestamp: Date.now(),
  };

  return uniqueIds;
}


// for free play
app.get("/genre", async (req, res) => {
  const { genre } = req.query;
  if (!genre || !genrePlaylists[genre]) {
    return res.status(400).json({ error: "Invalid genre selected." });
  }

  try {
    // fetch list of track IDs from cache or Deezer
    const trackIds = await fetchGenreTrackIds(genre);
    if (!trackIds || trackIds.length === 0) {
      return res.status(404).json({ error: `No tracks found for genre: ${genre}` });
    }

    // try to get readable up to 10 times
    for (let i = 0; i < 10; i++) {
      const randomTrackId = trackIds[Math.floor(Math.random() * trackIds.length)];
      try {
        const track = await fetchTrack(randomTrackId);
        if (track.readable) {
          return res.json({
            id: track.id,
            title: track.title_short,
            preview: track.preview,
            artist: track.artist,
            album: track.album,
            contributors: track.contributors,
          });
        } else {
          console.warn(`Track ${randomTrackId} not readable. Retrying...`);
        }
      } catch (error) {
        console.warn(`Error fetching track ${randomTrackId}: ${error.message}. Retrying...`);
      }
    }

    // if no readable track found
    return res.status(404).json({ error: "No readable tracks found after retries." });
  } catch (error) {
    console.error("Error fetching genre tracks:", error.message);
    return res.status(500).json({ error: "Failed to fetch genre tracks." });
  }
});

app.get("/daily-challenge", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("type", "daily")
      .single();

    if (error || !data) {
      return res.status(500).json({ error: "No daily challenge found for type='daily'." });
    }

    const trackId = data.current_song_id;
    if (!trackId) {
      return res.status(404).json({ error: "No current_song_id set for daily challenge." });
    }

    const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
    const track = response.data;

    return res.json({
      id: track.id,
      title: track.title_short,
      artist: track.artist,
      preview: track.preview,
      album: track.album,
      contributors: track.contributors,
    });
  } catch (error) {
    console.error("Error fetching daily challenge song:", error.message);
    return res.status(500).json({ error: "Failed to fetch daily challenge song." });
  }
});

app.get("/validate-song", async (req, res) => {
  const { artist, song } = req.query;
  if (!song) {
    return res.status(400).json({ error: "Song name is required." });
  }

  try {
    // combine artist & song
    const query = `${encodeURIComponent(song)} ${encodeURIComponent(artist || "")}`;
    const response = await axios.get(`https://api.deezer.com/search?q=${query}`);
    const results = response.data?.data || [];
    if (results.length === 0) {
      return res.json({ match: false });
    }

    const firstMatch = results[0];
    const cleanedTrackTitle = firstMatch.title_short.toLowerCase().trim();
    const cleanedArtist = firstMatch.artist.name.toLowerCase().trim();
    const cleanedAlbum = firstMatch.album.title.toLowerCase().trim();

    return res.json({
      match: true,
      title: cleanedTrackTitle,
      artist: cleanedArtist,
      album: cleanedAlbum,
    });
  } catch (error) {
    console.error("Error validating song:", error.message);
    return res.status(500).json({ error: "Failed to validate song." });
  }
});


// app.post("/upload-data", async (req, res) => {
//   const { userId, localData } = req.body;
//   if (!userId) {
//     return res.status(400).json({ error: "Missing userId." });
//   }
//   try {
//     const { data, error } = await supabase
//       .from("user_data")
//       .upsert({ user_id: userId, data: localData });

//     if (error) throw error;
//     return res.status(200).json({ success: true, data });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });


// app.get("/get-data", async (req, res) => {
//   const { userId } = req.query;
//   if (!userId) {
//     return res.status(400).json({ error: "Missing userId query param." });
//   }

//   try {
//     const { data, error } = await supabase
//       .from("user_data")
//       .select("data")
//       .eq("user_id", userId)
//       .single();

//     if (error) throw error;
//     return res.status(200).json({ data });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
