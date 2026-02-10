require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const { searchFlights, searchHotels, searchHotelOffers } = require('./amadeus');
const { destinations, routes } = require('./destinations');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Weather cache ---
const weatherCache = new Map();
const WEATHER_TTL = 30 * 60 * 1000; // 30 min

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// --- API Routes ---

// Get all destinations (includes flightEstimate for budget filter)
app.get('/api/destinations', (req, res) => {
  const publicDestinations = destinations.map(d => ({
    id: d.id, name: d.name, iata: d.iata, lat: d.lat, lng: d.lng,
    description: d.description, bestSeason: d.bestSeason,
    activities: d.activities, image: d.image, isOrigin: d.isOrigin,
    flightEstimate: d.flightEstimate || 0
  }));
  res.json(publicDestinations);
});

// Get pre-built routes/circuits
app.get('/api/routes', (req, res) => {
  const enrichedRoutes = routes.map(route => {
    const stops = route.stops.map(stopId => {
      const dest = destinations.find(d => d.id === stopId);
      return dest ? { id: dest.id, name: dest.name, iata: dest.iata, lat: dest.lat, lng: dest.lng, image: dest.image, flightEstimate: dest.flightEstimate } : null;
    }).filter(Boolean);
    const totalEstimate = stops.reduce((sum, s) => sum + (s.flightEstimate || 0), 0);
    return { ...route, stops, totalEstimate };
  });
  res.json(enrichedRoutes);
});

// Weather for a destination (Open-Meteo, free, no key)
app.get('/api/weather/:destId', async (req, res) => {
  const dest = destinations.find(d => d.id === req.params.destId);
  if (!dest) return res.status(404).json({ error: 'Destino no encontrado' });

  const cacheKey = `weather:${dest.id}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < WEATHER_TTL) {
    return res.json(cached.data);
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${dest.lat}&longitude=${dest.lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=America/Argentina/Buenos_Aires`;
    const data = await fetchJSON(url);
    const current = data.current;

    const weatherCodes = {
      0: { desc: 'Despejado', icon: '☀️' },
      1: { desc: 'Mayormente despejado', icon: '🌤️' },
      2: { desc: 'Parcialmente nublado', icon: '⛅' },
      3: { desc: 'Nublado', icon: '☁️' },
      45: { desc: 'Niebla', icon: '🌫️' },
      48: { desc: 'Niebla helada', icon: '🌫️' },
      51: { desc: 'Llovizna leve', icon: '🌦️' },
      53: { desc: 'Llovizna', icon: '🌦️' },
      55: { desc: 'Llovizna intensa', icon: '🌧️' },
      61: { desc: 'Lluvia leve', icon: '🌧️' },
      63: { desc: 'Lluvia', icon: '🌧️' },
      65: { desc: 'Lluvia intensa', icon: '⛈️' },
      71: { desc: 'Nevada leve', icon: '🌨️' },
      73: { desc: 'Nevada', icon: '🌨️' },
      75: { desc: 'Nevada intensa', icon: '❄️' },
      80: { desc: 'Chubascos', icon: '🌦️' },
      81: { desc: 'Chubascos fuertes', icon: '🌧️' },
      95: { desc: 'Tormenta', icon: '⛈️' },
    };

    const code = current.weather_code;
    const weather = weatherCodes[code] || { desc: 'Variable', icon: '🌡️' };

    const result = {
      temp: Math.round(current.temperature_2m),
      description: weather.desc,
      icon: weather.icon,
      wind: Math.round(current.wind_speed_10m),
      humidity: current.relative_humidity_2m
    };

    weatherCache.set(cacheKey, { data: result, ts: Date.now() });
    res.json(result);
  } catch (error) {
    console.error('Weather error:', error.message);
    res.status(502).json({ error: 'No se pudo obtener el clima' });
  }
});

// Get weather for ALL destinations at once (for map markers)
app.get('/api/weather-all', async (req, res) => {
  const results = {};
  const promises = destinations.filter(d => !d.isOrigin).map(async dest => {
    const cacheKey = `weather:${dest.id}`;
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < WEATHER_TTL) {
      results[dest.id] = cached.data;
      return;
    }
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${dest.lat}&longitude=${dest.lng}&current=temperature_2m,weather_code&timezone=America/Argentina/Buenos_Aires`;
      const data = await fetchJSON(url);
      const weatherCodes = { 0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'⛈️',71:'🌨️',73:'🌨️',75:'❄️',80:'🌦️',81:'🌧️',95:'⛈️' };
      const result = {
        temp: Math.round(data.current.temperature_2m),
        icon: weatherCodes[data.current.weather_code] || '🌡️'
      };
      weatherCache.set(cacheKey, { data: result, ts: Date.now() });
      results[dest.id] = result;
    } catch (e) {
      results[dest.id] = { temp: null, icon: '❓' };
    }
  });
  await Promise.all(promises);
  res.json(results);
});

// Price calendar (estimated monthly prices for a destination)
app.get('/api/price-calendar/:destId', (req, res) => {
  const dest = destinations.find(d => d.id === req.params.destId);
  if (!dest) return res.status(404).json({ error: 'Destino no encontrado' });

  const base = dest.flightEstimate || 500000;
  // Seasonal multipliers (Jan-Dec)
  const seasonal = {
    'bariloche':    [1.4, 1.3, 1.0, 0.8, 0.7, 0.9, 1.5, 1.5, 1.2, 0.9, 1.0, 1.3],
    'mendoza':      [1.2, 1.1, 1.3, 1.0, 0.8, 0.7, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2],
    'iguazu':       [1.3, 1.2, 0.9, 0.8, 0.8, 0.7, 1.4, 1.0, 0.9, 0.9, 1.1, 1.3],
    'ushuaia':      [1.5, 1.3, 1.1, 0.9, 0.8, 0.9, 1.3, 1.4, 1.2, 1.0, 1.1, 1.4],
    'salta':        [1.1, 1.0, 0.9, 0.8, 0.7, 0.7, 1.3, 1.0, 0.8, 0.9, 1.0, 1.2],
    'calafate':     [1.5, 1.3, 1.1, 0.8, 0.7, 0.7, 0.8, 0.8, 0.9, 1.1, 1.3, 1.5],
    'cordoba':      [1.3, 1.2, 1.0, 0.8, 0.7, 0.7, 1.4, 0.8, 0.9, 1.0, 1.1, 1.3],
    'puerto-madryn':[1.2, 1.1, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.3, 1.4, 1.2, 1.1],
    'jujuy':        [1.1, 1.0, 0.9, 0.8, 0.7, 0.7, 1.3, 1.0, 0.8, 0.9, 1.0, 1.1],
  };

  const multipliers = seasonal[dest.id] || [1,1,1,1,1,1,1,1,1,1,1,1];
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const calendar = months.map((month, i) => ({
    month,
    price: Math.round(base * multipliers[i]),
    isCheap: multipliers[i] <= 0.8,
    isExpensive: multipliers[i] >= 1.3
  }));

  res.json({ destination: dest.name, calendar });
});

// Search flights
app.get('/api/flights/:destinationIata', async (req, res) => {
  const { destinationIata } = req.params;
  const { departureDate, returnDate, adults } = req.query;
  if (!departureDate || !returnDate) {
    return res.status(400).json({ error: 'Se requieren departureDate y returnDate' });
  }
  const origin = req.query.origin || 'EZE';
  try {
    const flights = await searchFlights(origin, destinationIata, departureDate, returnDate, parseInt(adults) || 1);
    res.json({ origin, destination: destinationIata, flights });
  } catch (error) {
    res.status(502).json({ error: error.message, fallback: true });
  }
});

// Search hotels
app.get('/api/hotels/:cityIata', async (req, res) => {
  try {
    const hotels = await searchHotels(req.params.cityIata);
    res.json({ city: req.params.cityIata, hotels });
  } catch (error) {
    res.status(502).json({ error: error.message, fallback: true });
  }
});

// Hotel offers
app.get('/api/hotel-offers', async (req, res) => {
  const { hotelIds, checkInDate, checkOutDate, adults } = req.query;
  if (!hotelIds || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Se requieren hotelIds, checkInDate y checkOutDate' });
  }
  try {
    const offers = await searchHotelOffers(hotelIds.split(','), checkInDate, checkOutDate, parseInt(adults) || 1);
    res.json({ offers });
  } catch (error) {
    res.status(502).json({ error: error.message, fallback: true });
  }
});

// Build package
app.get('/api/package/:destinationIata', async (req, res) => {
  const { destinationIata } = req.params;
  const { departureDate, returnDate, adults } = req.query;
  if (!departureDate || !returnDate) {
    return res.status(400).json({ error: 'Se requieren departureDate y returnDate' });
  }
  const destination = destinations.find(d => d.iata === destinationIata);
  if (!destination) {
    return res.status(404).json({ error: 'Destino no encontrado' });
  }

  const results = { destination: destination.name, flights: null, hotels: null, error: null };

  const origin = req.query.origin || 'EZE';
  results.origin = origin;

  try {
    results.flights = await searchFlights(origin, destinationIata, departureDate, returnDate, parseInt(adults) || 1);
  } catch (e) {
    results.error = (results.error || '') + ' Vuelos: ' + e.message;
  }

  try {
    const hotelList = await searchHotels(destinationIata);
    if (hotelList.length > 0) {
      const hotelIds = hotelList.slice(0, 5).map(h => h.hotelId);
      results.hotels = await searchHotelOffers(hotelIds, departureDate, returnDate, parseInt(adults) || 1);
    }
  } catch (e) {
    if (destination.hotelEstimates) {
      const nights = Math.ceil((new Date(returnDate) - new Date(departureDate)) / (1000 * 60 * 60 * 24));
      results.hotels = destination.hotelEstimates.map(est => ({
        hotelId: est.name.toLowerCase().replace(/\s+/g, '-'),
        name: est.name,
        rating: String(est.rating),
        offers: [{
          id: 'est-' + est.category,
          price: est.pricePerNight * nights,
          currency: 'ARS',
          room: `Habitacion ${est.category} (${nights} noches x $${est.pricePerNight.toLocaleString('es-AR')}/noche)`,
          boardType: est.rating >= 4 ? 'BREAKFAST' : 'ROOM_ONLY'
        }]
      }));
      results.hotelsFallback = true;
    } else {
      results.error = (results.error || '') + ' Hoteles: ' + e.message;
    }
  }

  res.json(results);
});

// Reviews (save/get - stored in memory for MVP)
const reviews = {};

// Traveler wall (stored in memory for MVP)
const travelerWall = {};  // { [destId]: [ { id, name, message, dateFrom, dateTo, createdAt } ] }

// Group trip rooms (stored in memory for MVP)
const groupRooms = {};    // { [code]: { code, name, createdAt, members: [ { id, name, destinations, dateFrom, dateTo } ] } }

app.get('/api/reviews/:destId', (req, res) => {
  res.json(reviews[req.params.destId] || []);
});

app.post('/api/reviews/:destId', (req, res) => {
  const { destId } = req.params;
  const { name, rating, comment } = req.body;
  if (!name || !rating || !comment) {
    return res.status(400).json({ error: 'name, rating y comment son requeridos' });
  }
  if (!reviews[destId]) reviews[destId] = [];
  const review = { id: Date.now().toString(), name, rating: Math.min(5, Math.max(1, parseInt(rating))), comment, date: new Date().toISOString() };
  reviews[destId].push(review);
  res.json(review);
});

// --- Travelers Wall (Feature 10) ---
app.get('/api/travelers/:destId', (req, res) => {
  const trips = travelerWall[req.params.destId] || [];
  res.json([...trips].reverse());
});

app.post('/api/travelers/:destId', (req, res) => {
  const { destId } = req.params;
  const { name, message, dateFrom, dateTo } = req.body;
  if (!name || !dateFrom || !dateTo) {
    return res.status(400).json({ error: 'name, dateFrom y dateTo son requeridos' });
  }
  if (!travelerWall[destId]) travelerWall[destId] = [];
  const trip = {
    id: Date.now().toString(),
    name: name.slice(0, 30),
    message: (message || '').slice(0, 140),
    dateFrom,
    dateTo,
    createdAt: new Date().toISOString()
  };
  travelerWall[destId].push(trip);
  res.json(trip);
});

// --- Traveler Counts (Feature 11) ---
app.get('/api/traveler-counts', (req, res) => {
  const counts = {};
  for (const destId in travelerWall) {
    counts[destId] = travelerWall[destId].length;
  }
  res.json(counts);
});

// --- Group Trip (Feature 12) ---
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

app.post('/api/group-trip', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name es requerido' });
  let code = generateRoomCode();
  while (groupRooms[code]) code = generateRoomCode();
  const room = { code, name: name.slice(0, 40), createdAt: new Date().toISOString(), members: [] };
  groupRooms[code] = room;
  res.json(room);
});

app.get('/api/group-trip/:code', (req, res) => {
  const room = groupRooms[req.params.code.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
  res.json(room);
});

app.post('/api/group-trip/:code/join', (req, res) => {
  const room = groupRooms[req.params.code.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
  const { name, destinations: dests, dateFrom, dateTo } = req.body;
  if (!name || !dests || !Array.isArray(dests) || dests.length === 0 || !dateFrom || !dateTo) {
    return res.status(400).json({ error: 'name, destinations, dateFrom y dateTo son requeridos' });
  }
  // Remove previous vote from same name
  room.members = room.members.filter(m => m.name !== name);
  room.members.push({
    id: Date.now().toString(),
    name: name.slice(0, 30),
    destinations: dests.slice(0, 3),
    dateFrom,
    dateTo
  });
  res.json(room);
});

app.get('/api/group-trip/:code/results', (req, res) => {
  const room = groupRooms[req.params.code.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Sala no encontrada' });

  // Tally votes per destination
  const voteCounts = {};
  room.members.forEach(m => {
    m.destinations.forEach(d => {
      voteCounts[d] = (voteCounts[d] || 0) + 1;
    });
  });

  const ranking = Object.entries(voteCounts)
    .map(([destId, votes]) => ({ destId, votes }))
    .sort((a, b) => b.votes - a.votes);

  // Calculate date overlap
  let overlapFrom = null;
  let overlapTo = null;
  if (room.members.length >= 2) {
    overlapFrom = room.members.reduce((max, m) => m.dateFrom > max ? m.dateFrom : max, room.members[0].dateFrom);
    overlapTo = room.members.reduce((min, m) => m.dateTo < min ? m.dateTo : min, room.members[0].dateTo);
    if (overlapFrom > overlapTo) {
      overlapFrom = null;
      overlapTo = null;
    }
  }

  res.json({
    room: { code: room.code, name: room.name },
    memberCount: room.members.length,
    ranking,
    dateOverlap: overlapFrom ? { from: overlapFrom, to: overlapTo } : null
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Only listen locally (Vercel uses serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🥕 Hoply server running at http://localhost:${PORT}`);
    console.log(`📍 ${destinations.filter(d => !d.isOrigin).length} destinos | ${routes.length} circuitos`);
    console.log(`✈️ Amadeus mode: ${(process.env.AMADEUS_ENV || 'test').toUpperCase()}`);
  });
}

module.exports = app;
