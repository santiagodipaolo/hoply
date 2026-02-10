// Internationalization module - ES/EN with ARS/USD
const I18n = (() => {
  let lang = 'es';
  const USD_RATE = 1200;

  const translations = {
    es: {
      circuits: '🗺️ Circuitos',
      compare: '⚖️ Comparar',
      surprise: '🎲 Sorprendeme',
      gift_btn: '🎁 Regalar',
      departure_label: '📍 Salida:',
      budget_label: '💰 Presupuesto:',
      no_limit: 'Sin limite',
      choose_dest: 'Elegi un destino',
      choose_dest_desc: 'Hace click en un marcador del mapa para ver vuelos, hoteles y armar tu paquete de viaje.',
      best_season: 'Mejor epoca',
      activities: 'Actividades',
      weather_now: 'Clima ahora',
      price_calendar: '📊 Calendario de precios',
      cheap: 'Barato',
      expensive: 'Caro',
      build_package: 'Arma tu paquete',
      outbound: 'Ida',
      return_date: 'Vuelta',
      adults: 'Adultos',
      search_flights: 'Buscar vuelos y hoteles',
      searching: 'Buscando...',
      flights_from: '✈️ Vuelos desde',
      hotels: '🏨 Hoteles',
      direct: 'Directo',
      stops: 'escala(s)',
      no_flights: 'No se encontraron vuelos para estas fechas.',
      no_hotels: 'No se encontraron hoteles para estas fechas.',
      no_availability: 'No hay disponibilidad para estas fechas.',
      your_package: '📦 Tu Paquete',
      round_trip: 'Vuelo ida/vuelta',
      total_estimated: 'Total estimado',
      share_whatsapp: '📱 Compartir por WhatsApp',
      ROOM_ONLY: 'Solo habitacion',
      BREAKFAST: 'Con desayuno',
      HALF_BOARD: 'Media pension',
      FULL_BOARD: 'Pension completa',
      ALL_INCLUSIVE: 'All inclusive',
      reviews_title: '💬 Opiniones de viajeros',
      your_name: 'Tu nombre',
      your_experience: 'Conta tu experiencia...',
      submit_review: 'Enviar opinion',
      first_review: 'Se el primero en opinar sobre este destino.',
      review_validation: 'Completa tu nombre, rating y comentario.',
      compare_title: '⚖️ Comparar destinos',
      compare_subtitle: 'Selecciona 2 o 3 destinos para comparar',
      compare_hint: 'Selecciona al menos 2 destinos para comparar.',
      est_flight: 'Vuelo estimado (ida/vuelta)',
      hotel_eco_night: 'Hotel economico/noche',
      hotel_premium_night: 'Hotel premium/noche',
      pkg_5_nights: 'Paquete 5 noches (eco)',
      best_season_label: 'Mejor epoca',
      weather_now_label: 'Clima ahora',
      top_activity: 'Top actividad',
      routes_title: '🗺️ Circuitos sugeridos',
      routes_subtitle: 'Rutas multi-destino para explorar Argentina',
      days: 'dias',
      from_price: 'Desde',
      show_on_map: 'Ver en mapa',
      loading_routes: 'Cargando circuitos...',
      wind: 'Viento',
      humidity: 'Humedad',
      error_api: 'Verifica que las API keys de Amadeus esten configuradas en .env',
      error_dates: 'Selecciona fechas de ida y vuelta.',
      error_dates_order: 'La fecha de vuelta debe ser posterior a la de ida.',
      error_search: 'Error al buscar. Intenta de nuevo.',
      no_budget_dest: 'No hay destinos dentro de tu presupuesto. Subi el slider!',
      nights: 'noches',
      flight_label: 'Vuelo',
      destination_label: 'Destino',
      gift_title: '🎁 Regala un viaje',
      gift_subtitle: 'Sorprende a alguien especial con un viaje por Argentina',
      gift_to: 'Para:',
      gift_to_placeholder: 'Nombre del destinatario',
      gift_from: 'De:',
      gift_from_placeholder: 'Tu nombre',
      gift_destination: 'Destino:',
      gift_message: 'Mensaje personal:',
      gift_message_placeholder: 'Escribi un mensaje especial...',
      gift_generate: 'Generar tarjeta de regalo',
      gift_share_whatsapp: '📱 Enviar por WhatsApp',
      gift_download: '💾 Descargar imagen',
      gift_copy: '📋 Copiar texto',
      gift_copied: 'Copiado!',
      gift_card_header: 'TARJETA DE REGALO',
      gift_enjoy: 'Disfruta tu viaje!',
      gift_validation: 'Completa destinatario, tu nombre, destino y mensaje.',
      gift_estimated: 'Paquete estimado desde',
    },
    en: {
      circuits: '🗺️ Circuits',
      compare: '⚖️ Compare',
      surprise: '🎲 Surprise me',
      gift_btn: '🎁 Gift',
      departure_label: '📍 From:',
      budget_label: '💰 Budget:',
      no_limit: 'No limit',
      choose_dest: 'Choose a destination',
      choose_dest_desc: 'Click on a map marker to see flights, hotels and build your travel package.',
      best_season: 'Best season',
      activities: 'Activities',
      weather_now: 'Weather now',
      price_calendar: '📊 Price calendar',
      cheap: 'Cheap',
      expensive: 'Expensive',
      build_package: 'Build your package',
      outbound: 'Departure',
      return_date: 'Return',
      adults: 'Adults',
      search_flights: 'Search flights & hotels',
      searching: 'Searching...',
      flights_from: '✈️ Flights from',
      hotels: '🏨 Hotels',
      direct: 'Direct',
      stops: 'stop(s)',
      no_flights: 'No flights found for these dates.',
      no_hotels: 'No hotels found for these dates.',
      no_availability: 'No availability for these dates.',
      your_package: '📦 Your Package',
      round_trip: 'Round-trip flight',
      total_estimated: 'Estimated total',
      share_whatsapp: '📱 Share via WhatsApp',
      ROOM_ONLY: 'Room only',
      BREAKFAST: 'With breakfast',
      HALF_BOARD: 'Half board',
      FULL_BOARD: 'Full board',
      ALL_INCLUSIVE: 'All inclusive',
      reviews_title: '💬 Traveler reviews',
      your_name: 'Your name',
      your_experience: 'Share your experience...',
      submit_review: 'Submit review',
      first_review: 'Be the first to review this destination.',
      review_validation: 'Please fill in your name, rating and comment.',
      compare_title: '⚖️ Compare destinations',
      compare_subtitle: 'Select 2 or 3 destinations to compare',
      compare_hint: 'Select at least 2 destinations to compare.',
      est_flight: 'Estimated flight (round-trip)',
      hotel_eco_night: 'Budget hotel/night',
      hotel_premium_night: 'Premium hotel/night',
      pkg_5_nights: 'Package 5 nights (budget)',
      best_season_label: 'Best season',
      weather_now_label: 'Weather now',
      top_activity: 'Top activity',
      routes_title: '🗺️ Suggested circuits',
      routes_subtitle: 'Multi-destination routes to explore Argentina',
      days: 'days',
      from_price: 'From',
      show_on_map: 'Show on map',
      loading_routes: 'Loading circuits...',
      wind: 'Wind',
      humidity: 'Humidity',
      error_api: 'Check that Amadeus API keys are configured in .env',
      error_dates: 'Select departure and return dates.',
      error_dates_order: 'Return date must be after departure date.',
      error_search: 'Search error. Try again.',
      no_budget_dest: 'No destinations within your budget. Increase the slider!',
      nights: 'nights',
      flight_label: 'Flight',
      destination_label: 'Destination',
      gift_title: '🎁 Gift a trip',
      gift_subtitle: 'Surprise someone special with a trip across Argentina',
      gift_to: 'To:',
      gift_to_placeholder: 'Recipient name',
      gift_from: 'From:',
      gift_from_placeholder: 'Your name',
      gift_destination: 'Destination:',
      gift_message: 'Personal message:',
      gift_message_placeholder: 'Write a special message...',
      gift_generate: 'Generate gift card',
      gift_share_whatsapp: '📱 Send via WhatsApp',
      gift_download: '💾 Download image',
      gift_copy: '📋 Copy text',
      gift_copied: 'Copied!',
      gift_card_header: 'GIFT CARD',
      gift_enjoy: 'Enjoy your trip!',
      gift_validation: 'Please fill in recipient, your name, destination and message.',
      gift_estimated: 'Estimated package from',
    }
  };

  function init() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('lang') === 'en') lang = 'en';
    else if (params.get('lang') === 'es') lang = 'es';
    applyTranslations();
    updateToggle();
  }

  function t(key) {
    return translations[lang][key] || translations['es'][key] || key;
  }

  function setLang(newLang) {
    lang = newLang;
    applyTranslations();
    updateToggle();
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
  }

  function getLang() { return lang; }

  function formatPrice(arsPrice) {
    if (lang === 'en') {
      const usd = Math.round(arsPrice / USD_RATE);
      return `US$${usd.toLocaleString('en-US')}`;
    }
    return `$${Math.round(arsPrice).toLocaleString('es-AR')}`;
  }

  function formatNumber(num) {
    if (lang === 'en') {
      return Math.round(num / USD_RATE).toLocaleString('en-US');
    }
    return Math.round(num).toLocaleString('es-AR');
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
  }

  function updateToggle() {
    const btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = lang === 'es' ? '🌐 EN' : '🌐 ES';
    }
  }

  return { init, t, setLang, getLang, formatPrice, formatNumber, applyTranslations };
})();
