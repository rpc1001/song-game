require("dotenv").config();
const express = require("express");
const axios = require("axios");
const stringSimilarity = require("string-similarity");



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

app.get("/", (req, res) => {
  res.send("Welcome to Song Game.");
});

const previousTracks = new Set(); //  already played tracks

app.get("/genres", (req, res) => {
  // for the list of genres they can select
  const genres = Object.keys(genrePlaylists);
  res.json({ genres });
});

app.get("/artist", async (req, res) => {
  const { artist } = req.query;
  console.log(req.query.artist)

  if (!artist) {
    return res.status(400).json({ error: "Artist name is required." });
  }

  try {
    const artistSearchResponse = await axios.get(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}`,
    );
    const artists = artistSearchResponse.data?.data;

    if (!artists || artists.length === 0) {
      return res.status(404).json({ error: "No artist found." });
    }

    const foundArtist = artists[0]; // the first matching artist
    console.log("Valid Artist:", foundArtist.name);

    const tracklistResponse = await axios.get(foundArtist.tracklist);

    if (
      !tracklistResponse.data?.data ||
      tracklistResponse.data.data.length === 0
    ) {
      return res.status(404).json({ error: "No songs found for this artist." });
    }

    const songs = tracklistResponse.data.data;

    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    console.log(
      "Random Song Found:",
      randomSong.title_short,
      "by",
      randomSong.artist.name,
    );

    return res.json({
      title: randomSong.title_short,
      preview: randomSong.preview,
      artist: randomSong.artist.name,
      album: randomSong.album,
      confirmedArtist: foundArtist.name, 
    });
  } catch (error) {
    console.error("Error fetching artist or songs:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/genre", async (req, res) => {
  const { genre } = req.query;

  if (!genre || !genrePlaylists[genre]) {
    return res.status(400).json({ error: "Invalid genre selected." });
  }

  try {
    const playlistIds = genrePlaylists[genre];
    let allTracks = [];

    // combine tracks from all playlists
    for (const playlistId of playlistIds) {
      const response = await axios.get(
        `https://api.deezer.com/playlist/${playlistId}`,
      );
      const tracks = response.data.tracks.data;

      if (tracks && tracks.length > 0) {
        allTracks = allTracks.concat(tracks);
      }
    }

    // deduplicate tracks
    const uniqueTracks = Array.from(
      new Map(allTracks.map((track) => [track.title, track])).values(),
    );

    // filter out previous tracks
    const newTracks = uniqueTracks.filter(
      (track) => !previousTracks.has(track.id),
    );

    if (newTracks.length === 0) {
      previousTracks.clear();
      return res
        .status(404)
        .json({ error: "No new tracks available. Try again." });
    }

    // select a track
    const randomTrack = newTracks[Math.floor(Math.random() * newTracks.length)];
    previousTracks.add(randomTrack.id);
    res.json({
      title: randomTrack.title_short,
      preview: randomTrack.preview,
      artist: randomTrack.artist.name,
      album: randomTrack.album,
    });
  } catch (error) {
    console.error("Error fetching genre playlist tracks:", error.message);
    res.status(500).json({ error: "Failed to fetch genre tracks." });
  }
});

app.get("/daily-challenge", async (req, res) => {
  try {
    const trackId = "1084418082";
    const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
    res.json({
      id: response.data.id,
      title: response.data.title,
      artist: response.data.artist.name,
      preview: response.data.preview,
      album: response.data.album,
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
        cleanedTrackTitle === cleanedSong ||
        stringSimilarity.compareTwoStrings(cleanedTrackTitle, cleanedSong) > 0.85
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
