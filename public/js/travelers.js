// Travelers wall module - show who's going to each destination
const TravelersModule = (() => {
  let currentDestId = null;

  function init() {
    document.getElementById('submit-trip').addEventListener('click', submitTrip);
  }

  async function loadForDestination(destId) {
    currentDestId = destId;
    document.getElementById('traveler-name').value = '';
    document.getElementById('traveler-message').value = '';

    // Pre-fill dates from the date selector
    const depDate = document.getElementById('departure-date').value;
    const retDate = document.getElementById('return-date').value;
    if (depDate) document.getElementById('traveler-date-from').value = depDate;
    if (retDate) document.getElementById('traveler-date-to').value = retDate;

    try {
      const res = await fetch(`/api/travelers/${destId}`);
      const trips = await res.json();
      renderTrips(trips);
    } catch (e) {
      renderTrips([]);
    }
  }

  function renderTrips(trips) {
    const container = document.getElementById('travelers-list');
    if (trips.length === 0) {
      container.innerHTML = `<p class="no-reviews">${I18n.t('no_travelers_yet')}</p>`;
      return;
    }

    const userFrom = document.getElementById('traveler-date-from').value;
    const userTo = document.getElementById('traveler-date-to').value;
    const locale = I18n.getLang() === 'en' ? 'en-US' : 'es-AR';

    container.innerHTML = trips.map(trip => {
      const overlap = userFrom && userTo && datesOverlap(userFrom, userTo, trip.dateFrom, trip.dateTo);
      return `
        <div class="traveler-item fade-in ${overlap ? 'traveler-overlap' : ''}">
          <div class="traveler-top">
            <strong>${escapeHtml(trip.name)}</strong>
            <span class="traveler-dates">${formatShortDate(trip.dateFrom, locale)} - ${formatShortDate(trip.dateTo, locale)}</span>
          </div>
          ${trip.message ? `<p class="traveler-msg">${escapeHtml(trip.message)}</p>` : ''}
          ${overlap ? `<span class="traveler-match">${I18n.t('dates_overlap')}</span>` : ''}
        </div>
      `;
    }).join('');
  }

  function formatShortDate(dateStr, locale) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
  }

  function datesOverlap(aFrom, aTo, bFrom, bTo) {
    return aFrom <= bTo && aTo >= bFrom;
  }

  async function submitTrip() {
    if (!currentDestId) return;

    const name = document.getElementById('traveler-name').value.trim();
    const message = document.getElementById('traveler-message').value.trim();
    const dateFrom = document.getElementById('traveler-date-from').value;
    const dateTo = document.getElementById('traveler-date-to').value;

    if (!name || !dateFrom || !dateTo) {
      alert(I18n.t('trip_validation'));
      return;
    }

    try {
      const res = await fetch(`/api/travelers/${currentDestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, dateFrom, dateTo })
      });

      if (res.ok) {
        loadForDestination(currentDestId);
        // Refresh traveler counts on map
        if (typeof TravelerCountModule !== 'undefined') {
          TravelerCountModule.loadCounts();
        }
      }
    } catch (e) {
      console.error('Trip submit error:', e);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init, loadForDestination };
})();
