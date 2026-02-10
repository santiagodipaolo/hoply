const destinations = [
  {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    iata: 'EZE',
    lat: -34.6037,
    lng: -58.3816,
    description: 'La capital argentina, cuna del tango, la gastronomía y la vida nocturna.',
    bestSeason: 'Marzo a Mayo / Septiembre a Noviembre',
    activities: ['Tango en San Telmo', 'Caminito en La Boca', 'Teatro Colón', 'Puerto Madero', 'Recoleta'],
    image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&q=80',
    isOrigin: true,
    flightEstimate: 0
  },
  {
    id: 'bariloche',
    name: 'San Carlos de Bariloche',
    iata: 'BRC',
    lat: -41.1335,
    lng: -71.3103,
    description: 'La Suiza argentina. Lagos cristalinos, montañas nevadas y el mejor chocolate del país.',
    bestSeason: 'Junio a Septiembre (ski) / Diciembre a Marzo (verano)',
    activities: ['Cerro Catedral', 'Circuito Chico', 'Isla Victoria', 'Ruta de los 7 Lagos', 'Chocolaterías'],
    image: 'https://images.unsplash.com/photo-1597479052352-3fba4f46f5f6?w=600&q=80',
    flightEstimate: 650000,
    hotelEstimates: [
      { name: 'Hostel Bariloche Centro', rating: 2, pricePerNight: 35000, category: 'economico' },
      { name: 'Hotel Tres Reyes', rating: 3, pricePerNight: 72000, category: 'medio' },
      { name: 'Llao Llao Resort & Spa', rating: 5, pricePerNight: 180000, category: 'premium' }
    ]
  },
  {
    id: 'mendoza',
    name: 'Mendoza',
    iata: 'MDZ',
    lat: -32.8895,
    lng: -68.8458,
    description: 'Capital del vino argentino, al pie de la Cordillera de los Andes.',
    bestSeason: 'Marzo a Mayo (vendimia) / Todo el año',
    activities: ['Bodegas y viñedos', 'Aconcagua', 'Rafting en Potrerillos', 'Villavicencio', 'Puente del Inca'],
    image: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=600&q=80',
    flightEstimate: 420000,
    hotelEstimates: [
      { name: 'Hostel Mendoza Inn', rating: 2, pricePerNight: 28000, category: 'economico' },
      { name: 'Hotel Argentino', rating: 3, pricePerNight: 58000, category: 'medio' },
      { name: 'Park Hyatt Mendoza', rating: 5, pricePerNight: 155000, category: 'premium' }
    ]
  },
  {
    id: 'iguazu',
    name: 'Puerto Iguazú',
    iata: 'IGR',
    lat: -25.5972,
    lng: -54.5786,
    description: 'Las majestuosas Cataratas del Iguazú, una de las 7 maravillas naturales del mundo.',
    bestSeason: 'Marzo a Mayo / Agosto a Octubre',
    activities: ['Cataratas del Iguazú', 'Garganta del Diablo', 'Paseo en gomón', 'Hito Tres Fronteras', 'Selva Misionera'],
    image: 'https://images.unsplash.com/photo-1540174401473-df5f1c06c716?w=600&q=80',
    flightEstimate: 340000,
    hotelEstimates: [
      { name: 'Hostel Iguazú Falls', rating: 2, pricePerNight: 30000, category: 'economico' },
      { name: 'Loi Suites Iguazú', rating: 4, pricePerNight: 85000, category: 'medio' },
      { name: 'Gran Meliá Iguazú', rating: 5, pricePerNight: 200000, category: 'premium' }
    ]
  },
  {
    id: 'ushuaia',
    name: 'Ushuaia',
    iata: 'USH',
    lat: -54.8019,
    lng: -68.3030,
    description: 'La ciudad más austral del mundo. Puerta de entrada a la Antártida.',
    bestSeason: 'Noviembre a Marzo (verano) / Junio a Septiembre (ski)',
    activities: ['Canal Beagle', 'Parque Nacional Tierra del Fuego', 'Glaciar Martial', 'Tren del Fin del Mundo', 'Cerro Castor'],
    image: 'https://images.unsplash.com/photo-1551627059-1ceff5c55a1e?w=600&q=80',
    flightEstimate: 950000,
    hotelEstimates: [
      { name: 'Hostel Yakush', rating: 2, pricePerNight: 32000, category: 'economico' },
      { name: 'Hotel Los Cauquenes', rating: 4, pricePerNight: 95000, category: 'medio' },
      { name: 'Arakur Resort & Spa', rating: 5, pricePerNight: 220000, category: 'premium' }
    ]
  },
  {
    id: 'salta',
    name: 'Salta',
    iata: 'SLA',
    lat: -24.7829,
    lng: -65.4232,
    description: 'La Linda. Arquitectura colonial, empanadas legendarias y paisajes del norte.',
    bestSeason: 'Abril a Noviembre',
    activities: ['Tren a las Nubes', 'Quebrada de las Flechas', 'Cachi', 'Cafayate', 'Cerro San Bernardo'],
    image: 'https://images.unsplash.com/photo-1591378603223-e15b45a81640?w=600&q=80',
    flightEstimate: 380000,
    hotelEstimates: [
      { name: 'Hostel Backpackers Salta', rating: 2, pricePerNight: 22000, category: 'economico' },
      { name: 'Hotel Salta', rating: 3, pricePerNight: 52000, category: 'medio' },
      { name: 'Legado Mítico Salta', rating: 5, pricePerNight: 140000, category: 'premium' }
    ]
  },
  {
    id: 'calafate',
    name: 'El Calafate',
    iata: 'FTE',
    lat: -50.3403,
    lng: -72.2648,
    description: 'Hogar del impresionante Glaciar Perito Moreno y el Parque Nacional Los Glaciares.',
    bestSeason: 'Octubre a Abril',
    activities: ['Glaciar Perito Moreno', 'Minitrekking', 'Lago Argentino', 'Estancias patagónicas', 'Glaciar Upsala'],
    image: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=600&q=80',
    flightEstimate: 880000,
    hotelEstimates: [
      { name: 'Hostel del Glaciar', rating: 2, pricePerNight: 30000, category: 'economico' },
      { name: 'Hotel Kosten Aike', rating: 3, pricePerNight: 75000, category: 'medio' },
      { name: 'Esplendor El Calafate', rating: 5, pricePerNight: 165000, category: 'premium' }
    ]
  },
  {
    id: 'cordoba',
    name: 'Córdoba',
    iata: 'COR',
    lat: -31.4201,
    lng: -64.1888,
    description: 'La Docta. Sierras, ríos, cultura universitaria y cuarteto.',
    bestSeason: 'Todo el año (mejor en primavera/otoño)',
    activities: ['Villa General Belgrano', 'La Cumbrecita', 'Mina Clavero', 'Sierras de Córdoba', 'Jesuíticas'],
    image: 'https://images.unsplash.com/photo-1617724613498-3f8fed3b3670?w=600&q=80',
    flightEstimate: 280000,
    hotelEstimates: [
      { name: 'Hostel Aldea', rating: 2, pricePerNight: 22000, category: 'economico' },
      { name: 'Hotel de la Cañada', rating: 3, pricePerNight: 48000, category: 'medio' },
      { name: 'Azur Real Hotel', rating: 5, pricePerNight: 120000, category: 'premium' }
    ]
  },
  {
    id: 'puerto-madryn',
    name: 'Puerto Madryn',
    iata: 'PMY',
    lat: -42.7692,
    lng: -65.0385,
    description: 'Capital del buceo y avistaje de ballenas. Fauna marina única.',
    bestSeason: 'Junio a Diciembre (ballenas) / Todo el año',
    activities: ['Avistaje de ballenas', 'Península Valdés', 'Punta Tombo', 'Buceo', 'Lobos marinos'],
    image: 'https://images.unsplash.com/photo-1598534659089-dcb85e145f6c?w=600&q=80',
    flightEstimate: 720000,
    hotelEstimates: [
      { name: 'Hostel El Gualicho', rating: 2, pricePerNight: 25000, category: 'economico' },
      { name: 'Hotel Territorio', rating: 4, pricePerNight: 70000, category: 'medio' },
      { name: 'Dazzler Puerto Madryn', rating: 5, pricePerNight: 130000, category: 'premium' }
    ]
  },
  {
    id: 'jujuy',
    name: 'San Salvador de Jujuy',
    iata: 'JUJ',
    lat: -24.1858,
    lng: -65.2995,
    description: 'Puerta a la Quebrada de Humahuaca, Patrimonio de la Humanidad.',
    bestSeason: 'Abril a Noviembre',
    activities: ['Quebrada de Humahuaca', 'Cerro de los 7 Colores', 'Purmamarca', 'Tilcara', 'Salinas Grandes'],
    image: 'https://images.unsplash.com/photo-1609863539586-ee50e2e73e50?w=600&q=80',
    flightEstimate: 390000,
    hotelEstimates: [
      { name: 'Hostel Jujuy', rating: 2, pricePerNight: 20000, category: 'economico' },
      { name: 'Hotel Terrazas de Luz', rating: 3, pricePerNight: 45000, category: 'medio' },
      { name: 'Mantra Resort & Spa', rating: 5, pricePerNight: 110000, category: 'premium' }
    ]
  }
];

const routes = [
  {
    id: 'patagonia-completa',
    name: 'Patagonia Completa',
    description: 'El circuito patagonico definitivo: lagos, glaciares y el fin del mundo.',
    stops: ['bariloche', 'calafate', 'ushuaia'],
    days: 12,
    icon: '🏔️'
  },
  {
    id: 'norte-argentino',
    name: 'Norte Argentino',
    description: 'Cultura, colores y sabores del noroeste. Quebradas, vinos y empanadas.',
    stops: ['salta', 'jujuy', 'mendoza'],
    days: 10,
    icon: '🌄'
  },
  {
    id: 'naturaleza-extrema',
    name: 'Naturaleza Extrema',
    description: 'Las maravillas naturales mas impactantes de Argentina.',
    stops: ['iguazu', 'puerto-madryn', 'calafate'],
    days: 11,
    icon: '🌊'
  },
  {
    id: 'escapada-clasica',
    name: 'Escapada Clasica',
    description: 'Los destinos mas populares para una primera aventura argentina.',
    stops: ['cordoba', 'bariloche', 'mendoza'],
    days: 9,
    icon: '✨'
  }
];

module.exports = { destinations, routes };
