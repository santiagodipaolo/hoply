// Routes module - multi-destination circuits
const RoutesModule = (() => {
  let routesData = [];
  let activeRoute = null;
  let routePolyline = null;

  async function load() {
    try {
      const res = await fetch('/api/routes');
      routesData = await res.json();
      return routesData;
    } catch (e) {
      console.error('Routes load error:', e);
      return [];
    }
  }

  function init() {
    document.getElementById('btn-routes').addEventListener('click', openModal);
    document.getElementById('routes-close').addEventListener('click', closeModal);
    document.getElementById('routes-modal').addEventListener('click', (e) => {
      if (e.target.id === 'routes-modal') closeModal();
    });
  }

  function openModal() {
    document.getElementById('routes-modal').style.display = 'flex';
    renderRoutes();
  }

  function closeModal() {
    document.getElementById('routes-modal').style.display = 'none';
  }

  function renderRoutes() {
    const container = document.getElementById('routes-list');
    if (routesData.length === 0) {
      container.innerHTML = `<p>${I18n.t('loading_routes')}</p>`;
      return;
    }

    container.innerHTML = routesData.map(route => `
      <div class="route-card ${activeRoute?.id === route.id ? 'active' : ''}" data-route-id="${route.id}">
        <div class="route-header">
          <span class="route-icon">${route.icon}</span>
          <div>
            <h3>${route.name}</h3>
            <p>${route.description}</p>
          </div>
        </div>
        <div class="route-stops">
          ${route.stops.map((stop, i) => `
            <div class="route-stop">
              <img src="${stop.image}" alt="${stop.name}" class="route-stop-img">
              <span>${stop.name}</span>
              ${i < route.stops.length - 1 ? '<span class="route-arrow">→</span>' : ''}
            </div>
          `).join('')}
        </div>
        <div class="route-footer">
          <span class="route-days">📅 ${route.days} ${I18n.t('days')}</span>
          <span class="route-price">💰 ${I18n.t('from_price')} ${I18n.formatPrice(route.totalEstimate)}</span>
          <button class="btn-route-show" data-route-id="${route.id}">${I18n.t('show_on_map')}</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-route-show').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const routeId = btn.dataset.routeId;
        showOnMap(routeId);
        closeModal();
      });
    });
  }

  function showOnMap(routeId) {
    const route = routesData.find(r => r.id === routeId);
    if (!route) return;

    activeRoute = route;

    if (routePolyline) {
      MapModule.getMap().removeLayer(routePolyline);
    }

    const buenosAires = DestinationsModule.getAll().find(d => d.isOrigin);
    const points = [];
    if (buenosAires) points.push([buenosAires.lat, buenosAires.lng]);
    route.stops.forEach(stop => points.push([stop.lat, stop.lng]));
    if (buenosAires) points.push([buenosAires.lat, buenosAires.lng]);

    routePolyline = L.polyline(points, {
      color: '#1a56db',
      weight: 3,
      opacity: 0.7,
      dashArray: '10, 8',
      className: 'route-line'
    }).addTo(MapModule.getMap());

    MapModule.getMap().fitBounds(routePolyline.getBounds(), { padding: [50, 50] });

    const routeIds = route.stops.map(s => s.id);
    MapModule.highlightMarkers(routeIds);
  }

  function clearRoute() {
    if (routePolyline) {
      MapModule.getMap().removeLayer(routePolyline);
      routePolyline = null;
    }
    activeRoute = null;
  }

  return { load, init, openModal, closeModal, showOnMap, clearRoute };
})();
