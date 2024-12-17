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

app.get('/daily-challenge', async (req, res) => {
    try {
      const trackId = '17326261';
      const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
      res.json({
        id: response.data.id,
        title: response.data.title,
        artist: response.data.artist.name,
        preview: response.data.preview,
      });
    } catch (error) {
      console.error('Error fetching daily challenge song:', error.message);
      res.status(500).json({ error: 'Failed to fetch daily challenge song' });
    }
  });
  
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

