// Gift a trip module
const GiftModule = (() => {
  function init() {
    document.getElementById('btn-gift').addEventListener('click', openModal);
    document.getElementById('gift-close').addEventListener('click', closeModal);
    document.getElementById('gift-modal').addEventListener('click', (e) => {
      if (e.target.id === 'gift-modal') closeModal();
    });
    document.getElementById('gift-generate').addEventListener('click', generateCard);
  }

  function openModal() {
    document.getElementById('gift-modal').style.display = 'flex';
    populateDestinations();
    document.getElementById('gift-card-result').style.display = 'none';
    // Re-apply translations for dynamic content
    document.getElementById('gift-to').value = '';
    document.getElementById('gift-from').value = '';
    document.getElementById('gift-message').value = '';
  }

  function closeModal() {
    document.getElementById('gift-modal').style.display = 'none';
  }

  function populateDestinations() {
    const select = document.getElementById('gift-dest-select');
    const dests = DestinationsModule.getAll().filter(d => !d.isOrigin);
    select.innerHTML = dests.map(d =>
      `<option value="${d.id}">${d.name}</option>`
    ).join('');
  }

  function generateCard() {
    const to = document.getElementById('gift-to').value.trim();
    const from = document.getElementById('gift-from').value.trim();
    const destId = document.getElementById('gift-dest-select').value;
    const message = document.getElementById('gift-message').value.trim();

    if (!to || !from || !destId || !message) {
      alert(I18n.t('gift_validation'));
      return;
    }

    const dest = DestinationsModule.getById(destId);
    if (!dest) return;

    const estimatedPrice = I18n.formatPrice(dest.flightEstimate);

    const result = document.getElementById('gift-card-result');
    const card = document.getElementById('gift-card-visual');

    card.innerHTML = `
      <div class="gift-card-inner">
        <div class="gift-card-bg" style="background-image: url('${dest.image}')"></div>
        <div class="gift-card-content">
          <div class="gift-card-badge">${I18n.t('gift_card_header')}</div>
          <h3>${dest.name}</h3>
          <p class="gift-card-message">"${escapeHtml(message)}"</p>
          <div class="gift-card-names">
            <span>${I18n.t('gift_to')} <strong>${escapeHtml(to)}</strong></span>
            <span>${I18n.t('gift_from')} <strong>${escapeHtml(from)}</strong></span>
          </div>
          <div class="gift-card-estimate">${I18n.t('gift_estimated')} ${estimatedPrice}</div>
          <div class="gift-card-footer">
            <span>🥕 Hoply</span>
            <span>${I18n.t('gift_enjoy')}</span>
          </div>
        </div>
      </div>
    `;

    // WhatsApp share
    document.getElementById('gift-whatsapp').onclick = () => {
      const text = `🎁 *${I18n.t('gift_card_header')} - Hoply*\n\n` +
        `${I18n.t('gift_to')} ${to}\n` +
        `${I18n.t('gift_from')} ${from}\n\n` +
        `✈️ ${I18n.t('destination_label')}: ${dest.name}\n` +
        `💌 "${message}"\n` +
        `💰 ${I18n.t('gift_estimated')} ${estimatedPrice}\n\n` +
        `${I18n.t('gift_enjoy')} 🗺️`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    // Copy text
    document.getElementById('gift-copy').onclick = () => {
      const text = `🎁 ${I18n.t('gift_card_header')} - Hoply\n\n` +
        `${I18n.t('gift_to')} ${to}\n` +
        `${I18n.t('gift_from')} ${from}\n\n` +
        `✈️ ${I18n.t('destination_label')}: ${dest.name}\n` +
        `💌 "${message}"\n` +
        `💰 ${I18n.t('gift_estimated')} ${estimatedPrice}\n\n` +
        `${I18n.t('gift_enjoy')} 🗺️`;
      navigator.clipboard.writeText(text);
      const btn = document.getElementById('gift-copy');
      const original = btn.textContent;
      btn.textContent = I18n.t('gift_copied');
      setTimeout(() => { btn.textContent = I18n.t('gift_copy'); }, 2000);
    };

    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth' });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init };
})();
