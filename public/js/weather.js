// Weather module - real-time weather on markers and sidebar
const WeatherModule = (() => {
  let weatherData = {};

  async function loadAll() {
    try {
      const res = await fetch('/api/weather-all');
      weatherData = await res.json();
      return weatherData;
    } catch (e) {
      console.error('Weather load error:', e);
      return {};
    }
  }

  async function loadForDestination(destId) {
    try {
      const res = await fetch(`/api/weather/${destId}`);
      const data = await res.json();
      weatherData[destId] = data;
      return data;
    } catch (e) {
      return null;
    }
  }

  function get(destId) {
    return weatherData[destId] || null;
  }

  function updateMarkerTooltips() {
    const allDests = DestinationsModule.getAll();
    allDests.forEach(dest => {
      const w = weatherData[dest.id];
      if (w && w.temp !== null) {
        MapModule.updateTooltip(dest.id, `${dest.name} ${w.icon} ${w.temp}°C`);
      }
    });
  }

  function showInSidebar(destId) {
    const w = weatherData[destId];
    const badge = document.getElementById('dest-weather');
    const detail = document.getElementById('weather-detail');

    if (w && w.temp !== null) {
      badge.textContent = `${w.icon} ${w.temp}°C`;
      badge.style.display = 'inline';

      if (w.description) {
        detail.style.display = 'flex';
        document.getElementById('weather-icon-detail').textContent = w.icon;
        document.getElementById('weather-text-detail').textContent =
          `${w.description}, ${w.temp}°C` +
          (w.wind ? ` | ${I18n.t('wind')}: ${w.wind} km/h` : '') +
          (w.humidity ? ` | ${I18n.t('humidity')}: ${w.humidity}%` : '');
      }
    } else {
      badge.style.display = 'none';
      detail.style.display = 'none';
    }
  }

  return { loadAll, loadForDestination, get, updateMarkerTooltips, showInSidebar };
})();
