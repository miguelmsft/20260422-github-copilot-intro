// Admin panel, speaker-notes toggle, slide checklist, PDF export
const THEMES = ['github-cosmos', 'warm', 'corporate', 'cyberpunk'];
const THEME_LABELS = {
  'github-cosmos': 'GitHub Cosmos (dark)',
  'warm': 'Warm & Welcoming',
  'corporate': 'Corporate Clean',
  'cyberpunk': 'Neon Cyberpunk'
};

let hiddenSlides = new Set();

function loadHidden() {
  try {
    const raw = localStorage.getItem('pres-hidden-slides');
    if (raw) hiddenSlides = new Set(JSON.parse(raw));
  } catch (_) {}
}
function saveHidden() {
  localStorage.setItem('pres-hidden-slides', JSON.stringify([...hiddenSlides]));
}
export function getHiddenSlides() { return hiddenSlides; }

function applyTheme(theme) {
  if (!THEMES.includes(theme)) theme = 'github-cosmos';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('pres-theme', theme);
}

function loadTheme() {
  const saved = localStorage.getItem('pres-theme');
  applyTheme(saved || 'github-cosmos');
}

// Speaker notes
function getNotesState() { return localStorage.getItem('pres-notes') === '1'; }
function setNotesState(on) {
  localStorage.setItem('pres-notes', on ? '1' : '0');
  document.body.classList.toggle('notes-visible', on);
  const overlay = document.getElementById('speaker-notes-overlay');
  const btn = document.getElementById('notes-toggle');
  const chk = document.getElementById('admin-notes-toggle');
  if (overlay) overlay.classList.toggle('visible', on);
  if (btn) btn.classList.toggle('active', on);
  if (chk) chk.checked = on;
  if (on) updateNotesOverlay();
}
function toggleSpeakerNotes() { setNotesState(!getNotesState()); }

function updateNotesOverlay() {
  const overlay = document.getElementById('speaker-notes-overlay');
  if (!overlay) return;
  const active = document.querySelector('.slide.active');
  if (!active) { overlay.innerHTML = ''; return; }
  const notes = active.querySelector('.speaker-notes');
  overlay.innerHTML = notes ? notes.innerHTML : '<em>No speaker notes.</em>';
}

export function initAdmin({ goToSlide, getSlideCount, getVisibleSlides }) {
  loadTheme();
  loadHidden();

  // Build panel DOM
  const panel = document.getElementById('admin-panel');
  if (!panel) return;

  const themeOptions = THEMES
    .map(t => `<option value="${t}">${THEME_LABELS[t]}</option>`)
    .join('');

  panel.innerHTML = `
    <button class="admin-close" aria-label="Close" title="Close (Esc)">×</button>
    <h2>⚙ Presentation Settings</h2>

    <h3>Theme</h3>
    <select id="admin-theme-select">${themeOptions}</select>

    <h3>Speaker Notes</h3>
    <label><input type="checkbox" id="admin-notes-toggle"> Show speaker notes overlay (N)</label>

    <h3>Go to slide</h3>
    <div class="admin-row">
      <input type="number" id="admin-goto-input" min="1" />
      <button id="admin-goto-btn">Go</button>
    </div>

    <h3>PDF Export</h3>
    <div class="admin-row">
      <button id="admin-pdf-btn">Export / Print to PDF</button>
    </div>
    <div class="admin-hint">Prints with current theme. Hidden slides are skipped.</div>

    <h3>Slides</h3>
    <div class="admin-slide-list" id="admin-slide-list"></div>
    <div class="admin-hint">Uncheck to hide a slide from the deck & PDF. Click ▶ to jump.</div>

    <h3>Keyboard</h3>
    <div class="admin-hint" style="line-height:1.5">
      →/Space/PgDn = next · ←/PgUp = prev · Home/End = first/last<br>
      F = fullscreen · N = toggle notes · A = admin · Esc = close
    </div>
  `;

  const themeSelect = document.getElementById('admin-theme-select');
  themeSelect.value = document.documentElement.getAttribute('data-theme') || 'github-cosmos';
  themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));

  const notesChk = document.getElementById('admin-notes-toggle');
  notesChk.checked = getNotesState();
  notesChk.addEventListener('change', () => setNotesState(notesChk.checked));

  document.getElementById('admin-goto-btn').addEventListener('click', () => {
    const n = parseInt(document.getElementById('admin-goto-input').value, 10);
    if (!isNaN(n) && n >= 1) { goToSlide(n - 1); closeAdmin(); }
  });
  document.getElementById('admin-goto-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('admin-goto-btn').click();
  });

  document.getElementById('admin-pdf-btn').addEventListener('click', exportPdf);

  // Slide list
  const list = document.getElementById('admin-slide-list');
  const slides = Array.from(document.querySelectorAll('.slide'));
  slides.forEach((slide, i) => {
    const title = (slide.querySelector('.slide-title')?.textContent || '').trim();
    const display = title.length > 48 ? title.slice(0, 45) + '…' : title;
    const label = display ? `Slide ${i + 1}: ${display}` : `Slide ${i + 1}`;
    const row = document.createElement('div');
    row.className = 'admin-slide-row';
    row.innerHTML = `
      <label title="${label.replace(/"/g, '&quot;')}">
        <input type="checkbox" data-idx="${i}" ${hiddenSlides.has(i) ? '' : 'checked'}>
        ${label}
      </label>
      <button class="admin-goto" data-idx="${i}" title="Go to slide ${i + 1}">▶</button>
    `;
    list.appendChild(row);
  });
  list.addEventListener('change', (e) => {
    const cb = e.target.closest('input[type="checkbox"]');
    if (!cb) return;
    const idx = parseInt(cb.dataset.idx, 10);
    if (cb.checked) hiddenSlides.delete(idx); else hiddenSlides.add(idx);
    saveHidden();
    window.dispatchEvent(new CustomEvent('hidden-slides-changed'));
  });
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.admin-goto');
    if (!btn) return;
    goToSlide(parseInt(btn.dataset.idx, 10));
    closeAdmin();
  });

  // Panel open/close wiring
  const openBtn = document.getElementById('admin-toggle');
  const overlay = document.getElementById('admin-overlay');
  const closeBtn = panel.querySelector('.admin-close');
  openBtn.addEventListener('click', openAdmin);
  overlay.addEventListener('click', closeAdmin);
  closeBtn.addEventListener('click', closeAdmin);

  // Notes toggle button (persistent)
  const notesBtn = document.getElementById('notes-toggle');
  notesBtn.addEventListener('click', toggleSpeakerNotes);
  notesBtn.classList.toggle('active', getNotesState());
  if (getNotesState()) setNotesState(true); // force overlay sync

  // Observe slide changes to refresh overlay
  const container = document.getElementById('slide-container');
  if (container) {
    new MutationObserver(() => { if (getNotesState()) updateNotesOverlay(); })
      .observe(container, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  // Global keybinds
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    const k = e.key.toLowerCase();
    if (k === 'n') { toggleSpeakerNotes(); e.preventDefault(); }
    else if (k === 'a') { openAdmin(); e.preventDefault(); }
    else if (k === 'escape') { closeAdmin(); }
  });
}

function openAdmin() {
  document.getElementById('admin-panel')?.classList.add('visible');
  document.getElementById('admin-overlay')?.classList.add('visible');
}
function closeAdmin() {
  document.getElementById('admin-panel')?.classList.remove('visible');
  document.getElementById('admin-overlay')?.classList.remove('visible');
}

function exportPdf() {
  const slides = document.querySelectorAll('.slide');
  slides.forEach((el, i) => el.classList.toggle('print-hidden', hiddenSlides.has(i)));

  const stripped = [];
  slides.forEach((el) => {
    stripped.push({ el, style: el.getAttribute('style') });
    el.style.opacity = '';
    el.style.visibility = '';
    el.style.transform = '';
  });

  const restore = () => {
    stripped.forEach(({ el, style }) => {
      if (style) el.setAttribute('style', style); else el.removeAttribute('style');
    });
    document.querySelectorAll('.slide.print-hidden').forEach((el) => el.classList.remove('print-hidden'));
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);

  window.print();
}
