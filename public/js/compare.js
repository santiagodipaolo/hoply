// Compare module - side-by-side destination comparison
const CompareModule = (() => {
  let selected = [];

  function init() {
    document.getElementById('btn-compare').addEventListener('click', openModal);
    document.getElementById('compare-close').addEventListener('click', closeModal);
    document.getElementById('compare-modal').addEventListener('click', (e) => {
      if (e.target.id === 'compare-modal') closeModal();
    });
  }

  function openModal() {
    const modal = document.getElementById('compare-modal');
    modal.style.display = 'flex';
    renderSelector();
    renderTable();
  }

  function closeModal() {
    document.getElementById('compare-modal').style.display = 'none';
  }

  function renderSelector() {
    const container = document.getElementById('compare-select');
    const dests = DestinationsModule.getAll().filter(d => !d.isOrigin);

    container.innerHTML = dests.map(d => {
      const isSelected = selected.includes(d.id);
      return `<button class="compare-chip ${isSelected ? 'active' : ''}" data-id="${d.id}">${d.name}</button>`;
    }).join('');

    container.querySelectorAll('.compare-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.dataset.id;
        if (selected.includes(id)) {
          selected = selected.filter(s => s !== id);
        } else if (selected.length < 3) {
          selected.push(id);
        }
        renderSelector();
        renderTable();
      });
    });
  }

  function renderTable() {
    const container = document.getElementById('compare-table');
    if (selected.length < 2) {
      container.innerHTML = `<p class="compare-hint">${I18n.t('compare_hint')}</p>`;
      return;
    }

    const dests = selected.map(id => DestinationsModule.getById(id)).filter(Boolean);

    const rows = [
      { label: I18n.t('est_flight'), fn: d => I18n.formatPrice(d.flightEstimate) },
      { label: I18n.t('hotel_eco_night'), fn: d => {
        const est = getHotelEst(d.id, 'economico');
        return est ? I18n.formatPrice(est) : '-';
      }},
      { label: I18n.t('hotel_premium_night'), fn: d => {
        const est = getHotelEst(d.id, 'premium');
        return est ? I18n.formatPrice(est) : '-';
      }},
      { label: I18n.t('pkg_5_nights'), fn: d => {
        const hotel = getHotelEst(d.id, 'economico');
        return hotel ? I18n.formatPrice(d.flightEstimate + hotel * 5) : '-';
      }},
      { label: I18n.t('best_season_label'), fn: d => d.bestSeason },
      { label: I18n.t('weather_now_label'), fn: d => {
        const w = WeatherModule.get(d.id);
        return w && w.temp !== null ? `${w.icon} ${w.temp}°C` : '-';
      }},
      { label: I18n.t('top_activity'), fn: d => d.activities[0] || '-' }
    ];

    let html = '<table><thead><tr><th></th>';
    dests.forEach(d => {
      html += `<th><img src="${d.image}" class="compare-img"><br>${d.name}</th>`;
    });
    html += '</tr></thead><tbody>';

    rows.forEach(row => {
      html += `<tr><td class="row-label">${row.label}</td>`;
      dests.forEach(d => {
        html += `<td>${row.fn(d)}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function getHotelEst(destId, category) {
    const estimates = {
      'bariloche': { economico: 35000, premium: 180000 },
      'mendoza': { economico: 28000, premium: 155000 },
      'iguazu': { economico: 30000, premium: 200000 },
      'ushuaia': { economico: 32000, premium: 220000 },
      'salta': { economico: 22000, premium: 140000 },
      'calafate': { economico: 30000, premium: 165000 },
      'cordoba': { economico: 22000, premium: 120000 },
      'puerto-madryn': { economico: 25000, premium: 130000 },
      'jujuy': { economico: 20000, premium: 110000 }
    };
    return estimates[destId]?.[category] || null;
  }

  return { init, openModal, closeModal };
})();
