const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const cors = require('cors');

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
const PORT = process.env.PORT || 3000;
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY'; // Use env variable

app.use(cors());
app.use(express.json());

app.get('/api/apod', async (req, res) => {
  const { date } = req.query;
  const cacheKey = `apod_${date || 'today'}`;

  try {
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Fetch from NASA API
    const response = await axios.get('https://api.nasa.gov/planetary/apod', {
      params: {
        api_key: NASA_API_KEY,
        date: date || undefined,
      },
    });

    // Store in cache
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching APOD:', error.message);
    res.status(500).json({ error: 'Failed to fetch APOD data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});