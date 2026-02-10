// Group trip module - collaborative trip planning rooms
const GroupTripModule = (() => {
  let currentRoom = null;
  let selectedDests = [];
  let pollInterval = null;

  function init() {
    document.getElementById('btn-group-trip').addEventListener('click', openModal);
    document.getElementById('group-close').addEventListener('click', closeModal);
    document.getElementById('group-modal').addEventListener('click', (e) => {
      if (e.target.id === 'group-modal') closeModal();
    });
    document.getElementById('group-create-btn').addEventListener('click', createRoom);
    document.getElementById('group-join-btn').addEventListener('click', joinRoom);
    document.getElementById('group-vote-btn').addEventListener('click', submitVote);
    document.getElementById('group-copy-link').addEventListener('click', copyShareLink);
    document.getElementById('group-vote-again-btn').addEventListener('click', () => showStep('vote'));

    checkURLForRoom();
  }

  function openModal() {
    document.getElementById('group-modal').style.display = 'flex';
    showStep('create-join');
    document.getElementById('group-room-name').value = '';
    document.getElementById('group-room-code').value = '';
  }

  function closeModal() {
    document.getElementById('group-modal').style.display = 'none';
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    currentRoom = null;
    selectedDests = [];
  }

  function showStep(stepName) {
    document.querySelectorAll('.group-step').forEach(el => el.style.display = 'none');
    document.getElementById(`group-step-${stepName}`).style.display = 'block';
  }

  async function createRoom() {
    const name = document.getElementById('group-room-name').value.trim();
    if (!name) {
      alert(I18n.t('group_name_required'));
      return;
    }

    try {
      const res = await fetch('/api/group-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      currentRoom = await res.json();
      showVoteStep();
    } catch (e) {
      console.error('Create room error:', e);
    }
  }

  async function joinRoom() {
    const code = document.getElementById('group-room-code').value.trim().toUpperCase();
    if (!code) {
      alert(I18n.t('group_code_required'));
      return;
    }

    try {
      const res = await fetch(`/api/group-trip/${code}`);
      if (!res.ok) {
        alert(I18n.t('group_not_found'));
        return;
      }
      currentRoom = await res.json();
      showVoteStep();
    } catch (e) {
      alert(I18n.t('group_not_found'));
    }
  }

  function checkURLForRoom() {
    const hash = window.location.hash;
    if (!hash.startsWith('#group=')) return;
    const code = hash.replace('#group=', '').toUpperCase();
    if (code.length === 6) {
      setTimeout(async () => {
        try {
          const res = await fetch(`/api/group-trip/${code}`);
          if (res.ok) {
            currentRoom = await res.json();
            openModal();
            showVoteStep();
          }
        } catch (e) { /* ignore */ }
      }, 800);
    }
  }

  function showVoteStep() {
    showStep('vote');
    selectedDests = [];

    document.getElementById('group-vote-code').textContent = currentRoom.code;
    document.getElementById('group-vote-room-name').textContent = currentRoom.name;

    const shareURL = `${window.location.origin}${window.location.pathname}#group=${currentRoom.code}`;
    document.getElementById('group-share-url').textContent = shareURL;

    // Render destination chips
    renderDestSelector();

    // Pre-fill dates
    const depDate = document.getElementById('departure-date').value;
    const retDate = document.getElementById('return-date').value;
    if (depDate) document.getElementById('group-date-from').value = depDate;
    if (retDate) document.getElementById('group-date-to').value = retDate;

    document.getElementById('group-voter-name').value = '';
  }

  function renderDestSelector() {
    const container = document.getElementById('group-dest-chips');
    const dests = DestinationsModule.getAll().filter(d => !d.isOrigin);

    container.innerHTML = dests.map(d => `
      <button class="compare-chip" data-dest-id="${d.id}">${d.name}</button>
    `).join('');

    container.querySelectorAll('.compare-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const destId = chip.dataset.destId;
        if (chip.classList.contains('active')) {
          chip.classList.remove('active');
          selectedDests = selectedDests.filter(id => id !== destId);
        } else if (selectedDests.length < 3) {
          chip.classList.add('active');
          selectedDests.push(destId);
        }
      });
    });
  }

  async function submitVote() {
    const name = document.getElementById('group-voter-name').value.trim();
    const dateFrom = document.getElementById('group-date-from').value;
    const dateTo = document.getElementById('group-date-to').value;

    if (!name || selectedDests.length === 0 || !dateFrom || !dateTo) {
      alert(I18n.t('group_vote_validation'));
      return;
    }

    try {
      const res = await fetch(`/api/group-trip/${currentRoom.code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, destinations: selectedDests, dateFrom, dateTo })
      });

      if (res.ok) {
        currentRoom = await res.json();
        showResults();
      }
    } catch (e) {
      console.error('Vote submit error:', e);
    }
  }

  async function showResults() {
    showStep('results');

    // Stop previous polling
    if (pollInterval) clearInterval(pollInterval);

    await fetchAndRender();

    // Poll every 5s
    pollInterval = setInterval(fetchAndRender, 5000);
  }

  async function fetchAndRender() {
    try {
      const res = await fetch(`/api/group-trip/${currentRoom.code}/results`);
      const data = await res.json();
      renderResults(data);
    } catch (e) {
      console.error('Results fetch error:', e);
    }
  }

  function renderResults(data) {
    const container = document.getElementById('group-results-content');
    const maxVotes = data.ranking.length > 0 ? data.ranking[0].votes : 1;

    const memberBadge = `<div class="group-member-count">${data.memberCount} ${I18n.t('group_members_voted')}</div>`;

    const rankingHTML = data.ranking.map((item, i) => {
      const dest = DestinationsModule.getById(item.destId);
      const name = dest ? dest.name : item.destId;
      const image = dest ? dest.image : '';
      const pct = Math.round((item.votes / maxVotes) * 100);
      const isWinner = i === 0;

      return `
        <div class="group-rank-item ${isWinner ? 'group-rank-winner' : ''} fade-in" style="animation-delay: ${i * 0.08}s">
          <div class="group-rank-left">
            ${image ? `<img src="${image}" class="group-rank-img" alt="${name}">` : ''}
            <div>
              <strong>${name}</strong>
              <span>${item.votes} ${I18n.t('group_votes')}</span>
            </div>
          </div>
          <div class="group-rank-bar-bg">
            <div class="group-rank-bar" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');

    let overlapHTML = '';
    if (data.dateOverlap) {
      const locale = I18n.getLang() === 'en' ? 'en-US' : 'es-AR';
      const from = new Date(data.dateOverlap.from + 'T12:00:00').toLocaleDateString(locale, { day: '2-digit', month: 'short' });
      const to = new Date(data.dateOverlap.to + 'T12:00:00').toLocaleDateString(locale, { day: '2-digit', month: 'short' });
      overlapHTML = `<div class="group-date-ok">${I18n.t('group_overlap_found')}: <strong>${from} - ${to}</strong></div>`;
    } else if (data.memberCount >= 2) {
      overlapHTML = `<div class="group-date-fail">${I18n.t('group_no_overlap')}</div>`;
    }

    container.innerHTML = `
      ${memberBadge}
      <h3>${I18n.t('group_dest_ranking')}</h3>
      <div class="group-ranking">${rankingHTML}</div>
      <h3 style="margin-top: 20px;">${I18n.t('group_date_overlap')}</h3>
      ${overlapHTML}
    `;
  }

  function copyShareLink() {
    if (!currentRoom) return;
    const url = `${window.location.origin}${window.location.pathname}#group=${currentRoom.code}`;
    navigator.clipboard.writeText(url);
    const btn = document.getElementById('group-copy-link');
    const original = btn.textContent;
    btn.textContent = I18n.t('link_copied');
    setTimeout(() => { btn.textContent = original; }, 2000);
  }

  return { init };
})();
