// Map module - Leaflet initialization and controls
const MapModule = (() => {
  let map = null;
  let markers = [];
  let markerMap = {}; // id -> marker

  function init() {
    map = L.map('map', {
      center: [-38.5, -65.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 15,
      zoomControl: true
    });

    // Dark base with built-in subtle labels
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Cover "Falkland" text from tiles with dark ocean patch
    L.rectangle([[-53.5, -62], [-50.5, -56]], {
      color: 'transparent',
      fillColor: '#0e0e17',
      fillOpacity: 1,
      interactive: false
    }).addTo(map);

    // Islas Malvinas label on top
    L.marker([-51.75, -59.0], {
      icon: L.divIcon({
        className: 'malvinas-label',
        html: '<span>Islas Malvinas</span>',
        iconSize: [120, 20],
        iconAnchor: [60, 10]
      }),
      interactive: false,
      pane: 'overlayPane'
    }).addTo(map);

    map.zoomControl.setPosition('topright');
    return map;
  }

  function createMarkerIcon(isOrigin, isActive, isHighlighted, isDimmed) {
    let className = isOrigin ? 'origin' : (isActive ? 'active' : '');
    if (isHighlighted) className += ' highlighted';
    if (isDimmed) className += ' dimmed';
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-pin marker-animate ${className}"></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });
  }

  function addMarker(destination, onClick) {
    const icon = createMarkerIcon(destination.isOrigin, false, false, false);
    const marker = L.marker([destination.lat, destination.lng], { icon }).addTo(map);

    marker.bindTooltip(destination.name, {
      direction: 'top',
      offset: [0, -30],
      className: 'marker-label'
    });

    marker.on('click', () => onClick(destination, marker));

    marker.destinationId = destination.id;
    marker.isOrigin = destination.isOrigin || false;
    markers.push(marker);
    markerMap[destination.id] = marker;

    return marker;
  }

  function setActiveMarker(activeId) {
    markers.forEach(marker => {
      const isActive = marker.destinationId === activeId;
      marker.setIcon(createMarkerIcon(marker.isOrigin, isActive, false, false));
    });
  }

  function highlightMarkers(ids) {
    markers.forEach(marker => {
      const isHighlighted = ids.includes(marker.destinationId);
      const isDimmed = !isHighlighted && !marker.isOrigin;
      marker.setIcon(createMarkerIcon(marker.isOrigin, false, isHighlighted, isDimmed));
    });
  }

  function dimMarkersByBudget(maxBudget, destinations) {
    markers.forEach(marker => {
      if (marker.isOrigin) return;
      const dest = destinations.find(d => d.id === marker.destinationId);
      const isDimmed = dest && dest.flightEstimate > maxBudget;
      marker.setIcon(createMarkerIcon(false, false, false, isDimmed));
      // Update opacity
      marker.setOpacity(isDimmed ? 0.3 : 1);
    });
  }

  function resetMarkers() {
    markers.forEach(marker => {
      marker.setIcon(createMarkerIcon(marker.isOrigin, false, false, false));
      marker.setOpacity(1);
    });
  }

  function updateTooltip(destId, text) {
    const marker = markerMap[destId];
    if (marker) {
      marker.unbindTooltip();
      marker.bindTooltip(text, {
        direction: 'top',
        offset: [0, -30],
        className: 'marker-label'
      });
    }
  }

  function flyTo(lat, lng, zoom = 8) {
    map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }

  function resetView() {
    map.flyTo([-38.5, -65.0], 5, { duration: 1 });
  }

  function getMap() {
    return map;
  }

  return { init, addMarker, setActiveMarker, highlightMarkers, dimMarkersByBudget, resetMarkers, updateTooltip, flyTo, resetView, getMap };
})();
