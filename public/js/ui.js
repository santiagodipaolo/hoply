// UI module - sidebar, modals, interactions
const UI = (() => {
  let currentDestination = null;
  const isMobile = () => window.innerWidth <= 768;

  function init() {
    document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
    document.getElementById('mobile-bar-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // Default dates (7 days from now + 5 nights)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const returnDay = new Date(tomorrow);
    returnDay.setDate(returnDay.getDate() + 5);
    document.getElementById('departure-date').value = formatDate(tomorrow);
    document.getElementById('return-date').value = formatDate(returnDay);
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  function openSidebar(destination) {
    currentDestination = destination;

    document.querySelector('.sidebar-placeholder').style.display = 'none';
    document.getElementById('sidebar-content').style.display = 'block';

    // Populate info
    document.getElementById('dest-name').textContent = destination.name;
    document.getElementById('dest-iata').textContent = destination.iata;
    document.getElementById('dest-image').src = destination.image;
    document.getElementById('dest-image').alt = destination.name;
    document.getElementById('dest-description').textContent = destination.description;
    document.getElementById('dest-season').textContent = destination.bestSeason;
    document.getElementById('dest-activities').textContent = destination.activities.join(', ');

    // Reset state
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('package-summary').style.display = 'none';

    // Origin can't fly to itself
    document.getElementById('date-selector').style.display = destination.isOrigin ? 'none' : 'block';

    // Load weather for this destination
    WeatherModule.loadForDestination(destination.id).then(() => {
      WeatherModule.showInSidebar(destination.id);
    });

    // Load price calendar
    if (!destination.isOrigin) {
      loadPriceCalendar(destination.id);
    } else {
      document.getElementById('price-calendar').style.display = 'none';
    }

    // Load reviews
    ReviewsModule.loadForDestination(destination.id);

    // Mobile
    if (isMobile()) {
      document.getElementById('sidebar').classList.add('open');
      document.getElementById('mobile-bar').style.display = 'block';
      document.getElementById('mobile-bar-name').textContent = destination.name;
    }

    document.getElementById('sidebar').scrollTop = 0;
    MapModule.setActiveMarker(destination.id);
    if (!destination.isOrigin) {
      MapModule.flyTo(destination.lat, destination.lng, 7);
    }
  }

  function closeSidebar() {
    currentDestination = null;
    document.querySelector('.sidebar-placeholder').style.display = 'flex';
    document.getElementById('sidebar-content').style.display = 'none';

    if (isMobile()) {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('mobile-bar').style.display = 'none';
    }

    MapModule.setActiveMarker(null);
    MapModule.resetView();
    RoutesModule.clearRoute();
  }

  async function loadPriceCalendar(destId) {
    try {
      const res = await fetch(`/api/price-calendar/${destId}`);
      const data = await res.json();

      const grid = document.getElementById('calendar-grid');
      const prices = data.calendar.map(m => m.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      grid.innerHTML = data.calendar.map(m => {
        const pct = maxPrice > minPrice ? (m.price - minPrice) / (maxPrice - minPrice) : 0.5;
        let cls = '';
        if (m.isCheap) cls = 'cal-month-cheap';
        else if (m.isExpensive) cls = 'cal-month-expensive';

        return `<div class="cal-month ${cls}" title="${I18n.formatPrice(m.price)}">
          <span class="cal-month-name">${m.month}</span>
          <div class="cal-bar" style="height: ${20 + pct * 30}px"></div>
          <span class="cal-month-price">${I18n.formatPrice(m.price)}</span>
        </div>`;
      }).join('');

      document.getElementById('price-calendar').style.display = 'block';
    } catch (e) {
      document.getElementById('price-calendar').style.display = 'none';
    }
  }

  function showLoading() {
    const btn = document.getElementById('search-package');
    btn.disabled = true;
    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.btn-loading').style.display = 'inline';
    btn.querySelector('.btn-loading').innerHTML = `<span class="spinner"></span> ${I18n.t('searching')}`;
  }

  function hideLoading() {
    const btn = document.getElementById('search-package');
    btn.disabled = false;
    btn.querySelector('.btn-text').style.display = 'inline';
    btn.querySelector('.btn-loading').style.display = 'none';
  }

  function showResults() {
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
  }

  function showError(message) {
    document.getElementById('error-message').style.display = 'block';
    document.getElementById('error-text').textContent = message;
  }

  function renderFlights(flights) {
    const container = document.getElementById('flights-list');
    if (!flights || flights.length === 0) {
      container.innerHTML = `<p class="no-results">${I18n.t('no_flights')}</p>`;
      return;
    }

    container.innerHTML = flights.map((flight, i) => `
      <div class="flight-card fade-in ${i === 0 ? 'selected' : ''}" data-index="${i}" style="animation-delay: ${i * 0.08}s">
        <div class="card-top">
          <span class="card-airline">${flight.airline || flight.outbound?.airline || I18n.t('flight_label')} ${flight.outbound?.stops === 0 ? `(${I18n.t('direct')})` : ''}</span>
          <span class="card-price">${I18n.formatPrice(flight.price)}</span>
        </div>
        <div class="card-details">
          <span class="card-detail">🛫 ${formatDateTime(flight.outbound?.departure)}</span>
          <span class="card-detail">⏱️ ${formatDuration(flight.outbound?.duration)}</span>
          ${flight.outbound?.stops > 0 ? `<span class="card-detail">🔄 ${flight.outbound.stops} ${I18n.t('stops')}</span>` : ''}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.flight-card').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.flight-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        PackagesModule.updatePackage();
      });
    });
  }

  function renderHotels(hotels) {
    const container = document.getElementById('hotels-list');
    if (!hotels || hotels.length === 0) {
      container.innerHTML = `<p class="no-results">${I18n.t('no_hotels')}</p>`;
      return;
    }

    const allOffers = [];
    hotels.forEach(hotel => {
      hotel.offers?.forEach(offer => {
        allOffers.push({ ...offer, hotelName: hotel.name, rating: hotel.rating });
      });
    });

    if (allOffers.length === 0) {
      container.innerHTML = `<p class="no-results">${I18n.t('no_availability')}</p>`;
      return;
    }

    allOffers.sort((a, b) => a.price - b.price);

    container.innerHTML = allOffers.slice(0, 6).map((offer, i) => `
      <div class="hotel-card fade-in ${i === 0 ? 'selected' : ''}" data-index="${i}" data-price="${offer.price}" style="animation-delay: ${i * 0.08}s">
        <div class="hotel-name">${offer.hotelName}</div>
        ${offer.rating ? `<div class="hotel-rating">${'★'.repeat(parseInt(offer.rating))}${'☆'.repeat(5 - parseInt(offer.rating))}</div>` : ''}
        <div class="hotel-room">${offer.room}</div>
        <div class="card-top">
          <span class="card-detail">${boardTypeLabel(offer.boardType)}</span>
          <span class="card-price">${I18n.formatPrice(offer.price)}</span>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.hotel-card').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.hotel-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        PackagesModule.updatePackage();
      });
    });
  }

  function getCurrentDestination() {
    return currentDestination;
  }

  function formatNumber(num) {
    return I18n.formatNumber(num);
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const locale = I18n.getLang() === 'en' ? 'en-US' : 'es-AR';
    return d.toLocaleDateString(locale, { day: '2-digit', month: 'short' }) + ' ' +
           d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }

  function formatDuration(dur) {
    if (!dur) return '-';
    return dur.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  }

  function boardTypeLabel(type) {
    return I18n.t(type) || I18n.t('ROOM_ONLY');
  }

  return {
    init, openSidebar, closeSidebar,
    showLoading, hideLoading, showResults, showError,
    renderFlights, renderHotels, getCurrentDestination,
    formatNumber
  };
})();
