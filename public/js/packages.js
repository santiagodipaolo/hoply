// Packages module - flight + hotel package logic + WhatsApp sharing
const PackagesModule = (() => {
  let lastFlights = [];
  let lastHotels = [];
  let lastDestName = '';

  async function search(destination) {
    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value;
    const adults = document.getElementById('adults-count').value;

    if (!departureDate || !returnDate) {
      UI.showError(I18n.t('error_dates'));
      return;
    }
    if (new Date(returnDate) <= new Date(departureDate)) {
      UI.showError(I18n.t('error_dates_order'));
      return;
    }

    lastDestName = destination.name;
    const origin = document.getElementById('origin-city').value || 'EZE';
    UI.showLoading();

    try {
      const params = new URLSearchParams({ departureDate, returnDate, adults, origin });
      const res = await fetch(`/api/package/${destination.iata}?${params}`);
      const data = await res.json();

      if (!res.ok && !data.flights && !data.hotels) {
        throw new Error(data.error || I18n.t('error_search'));
      }

      // Update flights header with origin city name
      const originNames = { EZE: 'Buenos Aires', COR: 'Cordoba', MDZ: 'Mendoza', SLA: 'Salta', ROS: 'Rosario' };
      const originName = originNames[origin] || origin;
      document.getElementById('flights-header').textContent = `${I18n.t('flights_from')} ${originName}`;

      lastFlights = data.flights || [];
      lastHotels = data.hotels || [];

      UI.showResults();
      UI.renderFlights(lastFlights);
      UI.renderHotels(lastHotels);

      if (lastFlights.length > 0 || lastHotels.length > 0) {
        updatePackage();
      }
    } catch (error) {
      console.error('Package search error:', error);
      UI.showError(error.message || I18n.t('error_search'));
    } finally {
      UI.hideLoading();
    }
  }

  function updatePackage() {
    const selectedFlight = document.querySelector('.flight-card.selected');
    const selectedHotel = document.querySelector('.hotel-card.selected');

    if (!selectedFlight && !selectedHotel) {
      document.getElementById('package-summary').style.display = 'none';
      return;
    }

    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value;
    const nights = Math.ceil((new Date(returnDate) - new Date(departureDate)) / (1000 * 60 * 60 * 24));

    let flightPrice = 0;
    let hotelPrice = 0;
    let hotelDesc = '';

    if (selectedFlight) {
      const flightIdx = parseInt(selectedFlight.dataset.index);
      if (lastFlights[flightIdx]) {
        flightPrice = lastFlights[flightIdx].price;
      }
    }

    if (selectedHotel) {
      hotelPrice = parseFloat(selectedHotel.dataset.price) || 0;
      const hotelName = selectedHotel.querySelector('.hotel-name')?.textContent || 'Hotel';
      hotelDesc = `${hotelName} (${nights} ${I18n.t('nights')})`;
    }

    const total = flightPrice + hotelPrice;

    if (total > 0) {
      document.getElementById('pkg-flight-price').textContent = flightPrice > 0 ? I18n.formatPrice(flightPrice) : '-';
      document.getElementById('pkg-hotel-desc').textContent = hotelDesc || 'Hotel';
      document.getElementById('pkg-hotel-price').textContent = hotelPrice > 0 ? I18n.formatPrice(hotelPrice) : '-';
      document.getElementById('pkg-total-price').textContent = I18n.formatPrice(total);
      document.getElementById('package-summary').style.display = 'block';

      // Setup WhatsApp share
      document.getElementById('share-whatsapp').onclick = () => shareWhatsApp(total, flightPrice, hotelPrice, hotelDesc, nights);
    }
  }

  function shareWhatsApp(total, flightPrice, hotelPrice, hotelDesc, nights) {
    const dep = document.getElementById('departure-date').value;
    const ret = document.getElementById('return-date').value;
    const adults = document.getElementById('adults-count').value;
    const originNames = { EZE: 'Buenos Aires', COR: 'Cordoba', MDZ: 'Mendoza', SLA: 'Salta', ROS: 'Rosario' };
    const origin = document.getElementById('origin-city').value || 'EZE';
    const originName = originNames[origin] || origin;

    const text = `✈️ *Hoply - ${lastDestName}*

📍 ${I18n.getLang() === 'en' ? 'From' : 'Salida desde'} ${originName}
📅 ${dep} → ${ret} (${nights} ${I18n.t('nights')})
👥 ${adults} ${I18n.getLang() === 'en' ? 'adult(s)' : 'adulto(s)'}

🛫 ${I18n.t('round_trip')}: ${I18n.formatPrice(flightPrice)}
🏨 ${hotelDesc}: ${I18n.formatPrice(hotelPrice)}

💰 *${I18n.t('total_estimated')}: ${I18n.formatPrice(total)}*

${I18n.getLang() === 'en' ? 'Plan your trip at' : 'Arma tu viaje en'} Hoply 🗺️`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }

  return { search, updatePackage };
})();
