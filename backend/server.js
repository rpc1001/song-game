require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

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

const genreCache = {};
const artistCache = {};

// /artist and /genre free-play wont repeat the same track in that session.
const previouslyPlayedFreePlay = new Set();

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

app.get("/rotate-dailies", async (req, res) => {
  const secret = req.query.secret;
  if (secret !== process.env.ROTATE_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    await rotateDailies();
    res.json({ success: true, message: "Dailies rotated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/artist", async (req, res) => {
  const { artist } = req.query;
  if (!artist) {
    return res.status(400).json({ error: "Artist name is required." });
  }

  try {
    const artistName = artist.toLowerCase().trim();

    // fetch from cache or Deezer
    if (!artistCache[artistName]) {
      // search for artist
      const artistSearchResponse = await axios.get(
        `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`
      );
      const artists = artistSearchResponse.data?.data;
      if (!artists || artists.length === 0) {
        return res.status(404).json({ error: "No artist found." });
      }
      const foundArtist = artists[0];

      // fetch top tracks
      const tracklistResponse = await axios.get(foundArtist.tracklist);
      const songs = tracklistResponse.data?.data || [];
      if (songs.length === 0) {
        return res.status(404).json({ error: "No songs found for this artist." });
      }

      artistCache[artistName] = {
        confirmedArtist: foundArtist,
        tracks: songs,
      };
    }

    const { confirmedArtist, tracks } = artistCache[artistName];
    // filter out previously played
    const newTracks = tracks.filter(t => !previouslyPlayedFreePlay.has(t.id));
    if (newTracks.length === 0) {
      // reset if we've exhausted them
      previouslyPlayedFreePlay.clear();
      // after clearing, all tracks are available again
      return res.status(404).json({ error: "No new tracks available. Try again." });
    }

    // pick random
    const randomSong = newTracks[Math.floor(Math.random() * newTracks.length)];
    previouslyPlayedFreePlay.add(randomSong.id);

    return res.json({
      confirmedArtist: {
        id: confirmedArtist.id,
        name: confirmedArtist.name,
        picture_big: confirmedArtist.picture_big,
      },
      song: {
        id: randomSong.id,
        title: randomSong.title_short,
        preview: randomSong.preview,
        artist: randomSong.artist,
        album: randomSong.album,
        contributors: randomSong.contributors,
      },
    });
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
app.get("/genre", async (req, res) => {
  const { genre } = req.query;
  if (!genre || !genrePlaylists[genre]) {
    return res.status(400).json({ error: "Invalid genre selected." });
  }

  try {
    // cache
    if (!genreCache[genre]) {
      let allTracks = [];
      const playlistIds = genrePlaylists[genre];
      for (const playlistId of playlistIds) {
        const response = await axios.get(`https://api.deezer.com/playlist/${playlistId}`);
        const tracks = response.data?.tracks?.data || [];
        allTracks = allTracks.concat(tracks.map(t => t.id));
      }
      genreCache[genre] = [...new Set(allTracks)];
    }

    const cachedTrackIds = genreCache[genre];
    // try up to 10 times
    for (let i = 0; i < 10; i++) {
      // pick from freePlay set
      const newTrackIds = cachedTrackIds.filter(id => !previouslyPlayedFreePlay.has(id));
      if (newTrackIds.length === 0) {
        previouslyPlayedFreePlay.clear();
        return res.status(404).json({ error: "No new tracks available. Try again." });
      }
      const randomTrackId = newTrackIds[Math.floor(Math.random() * newTrackIds.length)];
      // add to set
      previouslyPlayedFreePlay.add(randomTrackId);

      try {
        const trackResponse = await axios.get(`https://api.deezer.com/track/${randomTrackId}`);
        const track = trackResponse.data;
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
    // if no readable track is found after retries
    return res.status(404).json({ error: "No readable tracks found after retries." });
  } catch (error) {
    console.error("Error fetching genre playlist tracks:", error.message);
    res.status(500).json({ error: "Failed to fetch genre tracks." });
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
