// Traveler count module - badges on map markers
const TravelerCountModule = (() => {
  let counts = {};

  async function loadCounts() {
    try {
      const res = await fetch('/api/traveler-counts');
      counts = await res.json();
      updateMarkerBadges();
    } catch (e) {
      console.error('Traveler counts error:', e);
    }
  }

  function updateMarkerBadges() {
    const allDests = DestinationsModule.getAll();
    allDests.forEach(dest => {
      if (dest.isOrigin) return;
      const count = counts[dest.id] || 0;
      MapModule.setTravelerBadge(dest.id, count);
    });
  }

  function getCount(destId) {
    return counts[destId] || 0;
  }

  return { loadCounts, getCount };
})();
