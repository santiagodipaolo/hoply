const Amadeus = require('amadeus');

let amadeus = null;

function getClient() {
  if (!amadeus) {
    const hostname = process.env.AMADEUS_ENV || 'test';
    amadeus = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET,
      hostname
    });
    console.log(`✈️ Amadeus client initialized in ${hostname.toUpperCase()} mode`);
  }
  return amadeus;
}

// Simple in-memory cache (1 hour TTL)
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function searchFlights(origin, destination, departureDate, returnDate, adults = 1) {
  const cacheKey = `flights:${origin}:${destination}:${departureDate}:${returnDate}:${adults}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const client = getClient();
    const response = await client.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
      adults: adults.toString(),
      max: '5',
      currencyCode: 'ARS'
    });

    const flights = response.data.map(offer => ({
      id: offer.id,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      outbound: {
        departure: offer.itineraries[0].segments[0].departure.at,
        arrival: offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.at,
        stops: offer.itineraries[0].segments.length - 1,
        duration: offer.itineraries[0].duration,
        airline: offer.itineraries[0].segments[0].carrierCode
      },
      inbound: offer.itineraries[1] ? {
        departure: offer.itineraries[1].segments[0].departure.at,
        arrival: offer.itineraries[1].segments[offer.itineraries[1].segments.length - 1].arrival.at,
        stops: offer.itineraries[1].segments.length - 1,
        duration: offer.itineraries[1].duration,
        airline: offer.itineraries[1].segments[0].carrierCode
      } : null
    }));

    setCache(cacheKey, flights);
    return flights;
  } catch (error) {
    console.error('Amadeus flights error:', error.response?.body || error.message);
    throw new Error('No se pudieron obtener vuelos');
  }
}

async function searchHotels(cityCode) {
  const cacheKey = `hotels:${cityCode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const client = getClient();
    const response = await client.referenceData.locations.hotels.byCity.get({
      cityCode,
      radius: 30,
      radiusUnit: 'KM',
      hotelSource: 'ALL'
    });

    const hotels = response.data.slice(0, 15).map(hotel => ({
      hotelId: hotel.hotelId,
      name: hotel.name,
      latitude: hotel.geoCode?.latitude,
      longitude: hotel.geoCode?.longitude
    }));

    setCache(cacheKey, hotels);
    return hotels;
  } catch (error) {
    console.error('Amadeus hotels list error:', error.response?.body || error.message);
    throw new Error('No se pudieron obtener hoteles');
  }
}

async function searchHotelOffers(hotelIds, checkInDate, checkOutDate, adults = 1) {
  const cacheKey = `hotelOffers:${hotelIds.join(',')}:${checkInDate}:${checkOutDate}:${adults}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const client = getClient();
    const response = await client.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.join(','),
      checkInDate,
      checkOutDate,
      adults: adults.toString(),
      currency: 'ARS'
    });

    const offers = response.data.map(hotel => ({
      hotelId: hotel.hotel.hotelId,
      name: hotel.hotel.name,
      rating: hotel.hotel.rating,
      offers: hotel.offers?.map(offer => ({
        id: offer.id,
        price: parseFloat(offer.price.total),
        currency: offer.price.currency,
        room: offer.room?.description?.text || 'Habitación estándar',
        boardType: offer.boardType || 'ROOM_ONLY'
      })) || []
    }));

    setCache(cacheKey, offers);
    return offers;
  } catch (error) {
    console.error('Amadeus hotel offers error:', error.response?.body || error.message);
    throw new Error('No se pudieron obtener ofertas de hoteles');
  }
}

module.exports = { searchFlights, searchHotels, searchHotelOffers };
