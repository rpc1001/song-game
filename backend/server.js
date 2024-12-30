require("dotenv").config();
const express = require("express");
const axios = require("axios");



const app = express();
const cors = require("cors");

app.use(cors());

const PORT = process.env.PORT || 3000;

const genrePlaylists = {
  "Pop": [1036183001, 2098157264], // pop essentials, pop global hits
  "Rap": [12547421383, 7662551722], // 2020s rap, 2010s rap
  "Rock": [1306931615], // rock essentials
  "R&B": [1314725125, 5411628342, 2021626162], // r&b essentials, 2010s r&b,  2000s r&b
  'Country': [1130102843, 1294431447], // country essentials, country top hits
  "Jazz": [1615514485], // jazz essentials
  "Alternative & Indie": [668126235, 8716319082], // alternative essentials, indie rock essentials
  "K-Pop": [4096400722, 873660353], //top k pop, k-pop essentials
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
      artistCache[artistName] = songs;
    }

    // retrieve the cached tracks
    const cachedTracks = artistCache[artistName];

    // filter out previously played tracks
    const newTracks = cachedTracks.filter((track) => !previousTracks.has(track.id));

    if (newTracks.length === 0) {
      previousTracks.clear(); // reset if no new tracks are available
      return res.status(404).json({ error: "No new tracks available. Try again." });
    }

    // select a random track from the new tracks
    const randomSong = newTracks[Math.floor(Math.random() * newTracks.length)];
    previousTracks.add(randomSong.id); // mark the track as played

    return res.json({
      title: randomSong.title_short,
      preview: randomSong.preview,
      artist: randomSong.artist.name,
      album: randomSong.album,
      contributors: randomSong.contributors,
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
    const newTrackIds = cachedTrackIds.filter((id) => !previousTracks.has(id));
    if (newTrackIds.length === 0) {
      previousTracks.clear(); // reset if no new tracks available
      return res.status(404).json({ error: "No new tracks available. Try again." });
    }
    const playlistIds = genrePlaylists[genre];

    const randomTrackId = newTrackIds[Math.floor(Math.random() * newTrackIds.length)];
    previousTracks.add(randomTrackId); // mark as played

    const trackResponse = await axios.get(`https://api.deezer.com/track/${randomTrackId}`);
    const track = trackResponse.data;

    res.json({
      title: track.title_short,
      preview: track.preview,
      artist: track.artist.name,
      album: track.album,
      contributors: track.contributors,
    });
  } catch (error) {
    console.error("Error fetching genre playlist tracks:", error.message);
    res.status(500).json({ error: "Failed to fetch genre tracks." });
  }
});

app.get("/daily-challenge", async (req, res) => {
  try {
    const trackId = "2493888291";
    const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
    res.json({
      id: response.data.id,
      title: response.data.title,
      artist: response.data.artist.name,
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

app.get("/album-tracks", async (req, res) => {
  const { albumTracklistUrl } = req.query;
  try {
    const response = await axios.get(albumTracklistUrl);
    const tracks = response.data.data.map((track) => ({
      title: track.title,
      preview: track.preview,
    }));
    res.json(tracks);
  } catch (error) {
    console.error("Error fetching album tracks:", error.message);
    res.status(500).json({ error: "Failed to fetch album tracks." });
  }
});

app.get("/validate-song-artist", async (req, res) => {
  const { artist, song } = req.query;

  if (!artist || !song) {
    return res.status(400).json({ error: "Artist and song name are required." });
  }

  try {
    const query = `artist:"${artist}" track:"${song}"`;
    const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl);

    const results = response.data?.data || [];

    const cleanedSong = song.toLowerCase().trim();
    const isMatch = results.some((track) => {
    const cleanedTrackTitle = track.title.toLowerCase().trim();
      return (
        track.artist.name === artist  &&
        cleanedTrackTitle === cleanedSong
      );
    });

    if (isMatch) {
      res.json({ match: true });
    } else {
      res.json({ match: false });
    }
  } catch (error) {
    console.error("Error validating song-artist match:", error.message);
    res.status(500).json({ error: "Failed to validate song-artist match." });
  }
});
