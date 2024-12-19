require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const cors = require("cors");

app.use(cors());

const PORT = process.env.PORT || 3000;

const genrePlaylists = {
  Pop: [1036183001, 2098157264], // pop essentials, pop global hits
  Rap: [12547421383, 7662551722], // 2020s rap, 2010s rap
  Rock: [1306931615], // rock essentials
  "R&B": [1314725125, 5411628342, 2021626162], // r&b essentials, 2010s r&b,  2000s r&b
  Country: [1130102843, 1294431447], // country essentials, country top hits
  Jazz: [1615514485], // jazz essentials
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

  if (!artist) {
    return res.status(400).json({ error: "Artist name is required." });
  }

  try {
    const artistSearchResponse = await axios.get(
      `https://api.deezer.com/search?q=${encodeURIComponent(artist)}`,
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
      randomSong.title,
      "by",
      randomSong.artist.name,
    );

    return res.json({
      title: randomSong.title,
      preview: randomSong.preview,
      artist: randomSong.artist.name,
      album: randomSong.album.title,
    });
  } catch (error) {
    console.error("Error fetching artist or songs:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/genre", async (req, res) => {
  const { genre } = req.query;
  console.log("Genre");

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
      title: randomTrack.title,
      preview: randomTrack.preview,
      artist: randomTrack.artist.name,
      album: randomTrack.album.title,
    });
  } catch (error) {
    console.error("Error fetching genre playlist tracks:", error.message);
    res.status(500).json({ error: "Failed to fetch genre tracks." });
  }
});

app.get("/daily-challenge", async (req, res) => {
  try {
    const trackId = "545992732";
    const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
    res.json({
      id: response.data.id,
      title: response.data.title,
      artist: response.data.artist.name,
      preview: response.data.preview,
    });
  } catch (error) {
    console.error("Error fetching daily challenge song:", error.message);
    res.status(500).json({ error: "Failed to fetch daily challenge song" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
