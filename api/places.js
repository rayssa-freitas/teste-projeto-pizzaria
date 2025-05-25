const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/places/viewport', async (req, res) => {
  const { north, south, east, west } = req.query;
  const key = process.env.KEY;
  if (!north || !south || !east || !west) {
    return res.status(400).send({ error: 'Missing bounds parameters.' });
  }

  const centerLat = (parseFloat(north) + parseFloat(south)) / 2;
  const centerLng = (parseFloat(east) + parseFloat(west)) / 2;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${centerLat},${centerLng}`,
        radius: 5000,
        keyword: 'pizzaria',
        type: 'restaurant',
        key
      }
    });

    const places = response.data.results;
    const filtered = places.filter(p => (p.rating >= 4.6) && (p.user_ratings_total >= 300));
    const fallback = filtered.length === 0;

    const results = (fallback ? places : filtered).map(p => ({
      name: p.name,
      rating: p.rating,
      total_ratings: p.user_ratings_total,
      address: p.vicinity,
      location: p.geometry.location,
      recommended: (p.rating >= 4.6) && (p.user_ratings_total >= 300),
      maps_url: `https://www.google.com/maps/search/?api=1&query=${p.geometry.location.lat},${p.geometry.location.lng}`
    }));

    res.send({ fallback, results });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'API error' });
  }
});

module.exports = app;
