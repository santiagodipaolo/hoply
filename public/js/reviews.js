// Reviews module - user reviews per destination
const ReviewsModule = (() => {
  let currentDestId = null;
  let selectedRating = 0;

  function init() {
    const starsContainer = document.getElementById('review-stars');
    starsContainer.querySelectorAll('span').forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.rating);
        updateStars();
      });
      star.addEventListener('mouseenter', () => {
        highlightStars(parseInt(star.dataset.rating));
      });
    });
    starsContainer.addEventListener('mouseleave', () => updateStars());

    document.getElementById('submit-review').addEventListener('click', submitReview);
  }

  function highlightStars(upTo) {
    document.querySelectorAll('#review-stars span').forEach(star => {
      const r = parseInt(star.dataset.rating);
      star.textContent = r <= upTo ? '★' : '☆';
      star.style.color = r <= upTo ? '#f59e0b' : '#cbd5e1';
    });
  }

  function updateStars() {
    highlightStars(selectedRating);
  }

  async function loadForDestination(destId) {
    currentDestId = destId;
    selectedRating = 0;
    updateStars();
    document.getElementById('review-name').value = '';
    document.getElementById('review-comment').value = '';

    try {
      const res = await fetch(`/api/reviews/${destId}`);
      const reviews = await res.json();
      renderReviews(reviews);
    } catch (e) {
      renderReviews([]);
    }
  }

  function renderReviews(reviews) {
    const container = document.getElementById('reviews-list');
    if (reviews.length === 0) {
      container.innerHTML = `<p class="no-reviews">${I18n.t('first_review')}</p>`;
      return;
    }

    const locale = I18n.getLang() === 'en' ? 'en-US' : 'es-AR';
    container.innerHTML = reviews.map(r => `
      <div class="review-item fade-in">
        <div class="review-top">
          <strong>${escapeHtml(r.name)}</strong>
          <span class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        </div>
        <p>${escapeHtml(r.comment)}</p>
        <span class="review-date">${new Date(r.date).toLocaleDateString(locale)}</span>
      </div>
    `).join('');
  }

  async function submitReview() {
    if (!currentDestId) return;

    const name = document.getElementById('review-name').value.trim();
    const comment = document.getElementById('review-comment').value.trim();

    if (!name || !comment || selectedRating === 0) {
      alert(I18n.t('review_validation'));
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${currentDestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating: selectedRating, comment })
      });

      if (res.ok) {
        loadForDestination(currentDestId);
      }
    } catch (e) {
      console.error('Review submit error:', e);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init, loadForDestination };
})();
