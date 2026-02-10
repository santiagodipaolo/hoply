// Destinations module - loads destinations and renders markers
const DestinationsModule = (() => {
  let destinations = [];

  async function load() {
    try {
      const res = await fetch('/api/destinations');
      destinations = await res.json();
      return destinations;
    } catch (err) {
      console.error('Error loading destinations:', err);
      return [];
    }
  }

  function renderMarkers(onMarkerClick) {
    destinations.forEach((dest, index) => {
      // Stagger animation
      setTimeout(() => {
        MapModule.addMarker(dest, onMarkerClick);
      }, index * 80);
    });
  }

  function getById(id) {
    return destinations.find(d => d.id === id);
  }

  function getAll() {
    return destinations;
  }

  return { load, renderMarkers, getById, getAll };
})();
