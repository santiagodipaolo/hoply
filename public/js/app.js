// App entry point - ties everything together
(async function init() {
  // Initialize i18n first
  I18n.init();

  // Initialize map
  MapModule.init();

  // Initialize UI modules
  UI.init();
  CompareModule.init();
  RoutesModule.init();
  ReviewsModule.init();
  GiftModule.init();

  // Language toggle
  document.getElementById('lang-toggle').addEventListener('click', () => {
    const newLang = I18n.getLang() === 'es' ? 'en' : 'es';
    I18n.setLang(newLang);
    // Re-render dynamic content if sidebar is open
    const dest = UI.getCurrentDestination();
    if (dest) {
      UI.openSidebar(dest);
    }
  });

  // Load destinations from API
  const destinations = await DestinationsModule.load();
  if (destinations.length === 0) {
    console.error('No destinations loaded');
    return;
  }

  // Render markers on map
  DestinationsModule.renderMarkers((destination) => {
    UI.openSidebar(destination);
  });

  // Load routes
  RoutesModule.load();

  // Load weather for all destinations (shows on markers)
  WeatherModule.loadAll().then(() => {
    WeatherModule.updateMarkerTooltips();
  });

  // Search button handler
  document.getElementById('search-package').addEventListener('click', () => {
    const dest = UI.getCurrentDestination();
    if (dest && !dest.isOrigin) {
      PackagesModule.search(dest);
    }
  });

  // Budget slider
  const budgetSlider = document.getElementById('budget-slider');
  const budgetValue = document.getElementById('budget-value');
  const budgetReset = document.getElementById('budget-reset');

  budgetSlider.addEventListener('input', () => {
    const val = parseInt(budgetSlider.value);
    if (val >= 2000000) {
      budgetValue.textContent = I18n.t('no_limit');
      MapModule.resetMarkers();
    } else {
      budgetValue.textContent = I18n.formatPrice(val);
      MapModule.dimMarkersByBudget(val, destinations);
    }
  });

  budgetReset.addEventListener('click', () => {
    budgetSlider.value = 2000000;
    budgetValue.textContent = I18n.t('no_limit');
    MapModule.resetMarkers();
  });

  // Sorprendeme button
  document.getElementById('btn-surprise').addEventListener('click', () => {
    const budget = parseInt(budgetSlider.value);
    let available = destinations.filter(d => !d.isOrigin);

    if (budget < 2000000) {
      available = available.filter(d => d.flightEstimate <= budget);
    }

    if (available.length === 0) {
      alert(I18n.t('no_budget_dest'));
      return;
    }

    const random = available[Math.floor(Math.random() * available.length)];
    UI.openSidebar(random);
    MapModule.setActiveMarker(random.id);
  });

  console.log(`Hoply v2 loaded. ${destinations.length} destinations ready.`);
})();
