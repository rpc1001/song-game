require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);



const app = express();
const cors = require("cors");

app.use(cors());

const PORT = process.env.PORT || 3000;

const genrePlaylists = {
  "Pop": [13416990423, 2098157264], // pop, pop global hits
  "Rap": [13417104363, 1996494362, 1677006641], //rap, rap bangers, hit hop hits
  "Rock": [13374370263, 13374370263, 11335739484], // rock essentials, modern rock essentials,  rock classics 
  "R&B": [1314725125, 5411628342, 2021626162], // r&b essentials, 2010s r&b,  2000s r&b
  'Country': [1130102843, 1294431447], // country essentials, country top hits
  "Alt/Indie": [668126235, 8716319082], // alternative essentials, indie rock essentials
  "K-Pop": [4096400722, 873660353], //top k pop, k-pop essentials
  // "Electronic":[123],
  // "Latin":[123],
  // "Raggae":[123],
  // "Afrobeats": [],
  "Jazz": [1615514485], // jazz essentials
  // "Classical": [],
  // "Metal":[],
  // "Musicals": [123],

};

const genreCache = {};
const artistCache = {}; 



app.get("/", (req, res) => {
  res.send("Welcome to Song Game.");
});

const previousTracks = new Set(); //  already played tracks
app.get("/artist", async (req, res) => {
  const { artist } = req.query;


  if (!artist) {
    return res.status(400).json({ error: "Artist name is required." });
  }

  try {
    const artistName = artist.toLowerCase().trim();

    // check if the artist top tracks are in the cache
    if (!artistCache[artistName]) {
      // fetch artist information
      const artistSearchResponse = await axios.get(
        `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`
      );
      const artists = artistSearchResponse.data?.data;

      if (!artists || artists.length === 0) {
        return res.status(404).json({ error: "No artist found." });
      }

      const foundArtist = artists[0];

      // fetch the artist's top tracks
      const tracklistResponse = await axios.get(foundArtist.tracklist);
      const songs = tracklistResponse.data.data;

      if (!songs || songs.length === 0) {
        return res.status(404).json({ error: "No songs found for this artist." });
      }

      // cache the top tracks
      artistCache[artistName] = {
        confirmedArtist: foundArtist,
        tracks: songs,    
      };
    }
    // retrieve the cached tracks
    const cachedData = artistCache[artistName];
    const { confirmedArtist, tracks } = cachedData;

    // filter out previously played tracks
    const newTracks = tracks.filter((track) => !previousTracks.has(track.id));

    if (newTracks.length === 0) {
      previousTracks.clear(); // reset if no new tracks are available
      console.log("no new tracks"); 
      return res.status(404).json({ error: "No new tracks available. Try again." });
    }

    // select a random track from the new tracks
    const randomSong = newTracks[Math.floor(Math.random() * newTracks.length)];
    previousTracks.add(randomSong.id); // mark the track as played
    console.log("Song is ", randomSong.title_short, +"by ",randomSong.artist)
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
      }
    });
  } catch (error) {
    console.error("Error fetching artist or songs:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/genres", (req, res) => {
  // for the list of genres they can select
  const genres = Object.keys(genrePlaylists);
  res.json({ genres });
});

app.get("/genre", async (req, res) => {
  const { genre } = req.query;

  if (!genre || !genrePlaylists[genre]) {
    return res.status(400).json({ error: "Invalid genre selected." });
  }

  try {
    if (!genreCache[genre]) {
      let allTracks = [];
      const playlistIds = genrePlaylists[genre];

      // fetch track IDs from playlists and store in cache
      for (const playlistId of playlistIds) {
        const response = await axios.get(`https://api.deezer.com/playlist/${playlistId}`);
        const tracks = response.data.tracks.data;

        if (tracks && tracks.length > 0) {
          allTracks = allTracks.concat(tracks.map((track) => track.id)); // store only track IDs
        }
      }

      genreCache[genre] = [...new Set(allTracks)];
    }
    const cachedTrackIds = genreCache[genre];
    
    for (let i = 0; i < 10; i++) { // retry up to 10 times
      const newTrackIds = cachedTrackIds.filter((id) => !previousTracks.has(id));
      if (newTrackIds.length === 0) {
        previousTracks.clear(); // reset if no new tracks are available
        return res.status(404).json({ error: "No new tracks available. Try again." });
      }

      // select a random track ID
      const randomTrackId = newTrackIds[Math.floor(Math.random() * newTrackIds.length)];
      previousTracks.add(randomTrackId); // mark as played

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
          console.warn(`Track ${randomTrackId} is not readable. Retrying...`);
        }
      } catch (error) {
        console.error(`Error fetching track ${randomTrackId}:`, error.message);
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
    const trackId = "936899";
    const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
    res.json({
      id: response.data.id,
      title: response.data.title_short,
      artist: response.data.artist,
      preview: response.data.preview,
      album: response.data.album,
      contributors: response.data.contributors,
    });
  } catch (error) {
    console.error("Error fetching daily challenge song:", error.message);
    res.status(500).json({ error: "Failed to fetch daily challenge song" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/validate-song", async (req, res) => {
  const { artist, song } = req.query;

  if (!song) {
    return res.status(400).json({ error: "Song name is required." });
  }

  try {
    // const query = `artist:"${encodeURIComponent(artist)}" track:"${encodeURIComponent(song)}"`; other way to do it but more strict
    const query = `${encodeURIComponent(song)} ${encodeURIComponent(artist)}`;
    const response = await axios.get(`https://api.deezer.com/search?q=${query}`);

  const results = response.data?.data || [];

    if (results.length === 0) {
      return res.json({ match: false });
    }
    const firstMatch = results[0];
    const cleanedTrackTitle = firstMatch.title_short.toLowerCase().trim();
    const cleanedArtist = firstMatch.artist.name.toLowerCase().trim();
    const cleanedAlbum = firstMatch.album.title.toLowerCase().trim();

    res.json({
      match: true,
      title: cleanedTrackTitle,
      artist: cleanedArtist,
      album: cleanedAlbum,
    });
  } catch (error) {
    console.error("Error validating song:", error.message);
    res.status(500).json({ error: "Failed to validate song." });
  }
});

app.post("/upload-data", async (req, res) => {
  const { userId, localData } = req.body;

  try {
    const { data, error } = await supabase
      .from('user_data')
      .upsert({ user_id: userId, data: localData });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/get-data", async (req, res) => {
  const { userId } = req.query;

  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

