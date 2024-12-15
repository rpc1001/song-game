require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');

app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Welcome to Song Game.');
});
app.get('/songs', async (req, res) => {
    try {
        const trackId = '500099612';
        const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching song:', error.message);
        res.status(500).json({ error: 'Failed to fetch song data' });
    }
});


app.get('/random-song', async (req, res) => {
    try {
        const response = await axios.get('https://api.deezer.com/chart'); // Fetch popular tracks
        const randomSong = response.data.tracks.data[
            Math.floor(Math.random() * response.data.tracks.data.length)
        ];
        res.json({
            id: randomSong.id,
            title: randomSong.title, // Hide on frontend
            artist: randomSong.artist.name,
            preview: randomSong.preview,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch a random song' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

