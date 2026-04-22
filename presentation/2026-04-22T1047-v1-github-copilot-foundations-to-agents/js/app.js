import { transitionSlide, animateSlideContent } from './transitions.js';
import { initAdmin, getHiddenSlides } from './admin.js';

const TOTAL_SLIDES = 85;
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

const container = document.getElementById('slide-container');
const scaler = document.getElementById('slide-scaler');
const counter = document.getElementById('slide-counter');
const sectionLabel = document.getElementById('section-label');
const progress = document.getElementById('progress-bar');

let slides = [];
let currentIndex = 0;
let isTransitioning = false;

/* ---------- Scaling ---------- */
let lastScale = -1;
function fitToViewport() {
  const scaleX = window.innerWidth / DESIGN_WIDTH;
  const scaleY = window.innerHeight / DESIGN_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  if (scale !== lastScale) {
    scaler.style.transform = `translate(-50%, -50%) scale(${scale})`;
    lastScale = scale;
  }
}
window.addEventListener('resize', () => requestAnimationFrame(fitToViewport));

/* ---------- Load slides ---------- */
async function loadAllSlides() {
  const base = import.meta.env.BASE_URL;
  const promises = [];
  for (let i = 1; i <= TOTAL_SLIDES; i++) {
    const padded = String(i).padStart(3, '0');
    promises.push(fetch(`${base}slides/slide-${padded}.html`).then(r => r.text()));
  }
  const htmls = await Promise.all(promises);
  container.innerHTML = htmls.join('\n');
  slides = Array.from(container.querySelectorAll('.slide'));
  slides.forEach((s) => {
    s.style.opacity = '0';
    s.style.visibility = 'hidden';
  });
}

/* ---------- Visibility filtering ---------- */
function getVisibleSlides() {
  const hidden = getHiddenSlides();
  return slides.filter((_, i) => !hidden.has(i));
}
function getVisibleIndex() {
  const hidden = getHiddenSlides();
  let count = 0;
  for (let i = 0; i < currentIndex; i++) if (!hidden.has(i)) count++;
  return count;
}
function clampToVisible(idx) {
  const hidden = getHiddenSlides();
  if (!hidden.has(idx)) return idx;
  // search forward
  for (let i = idx + 1; i < slides.length; i++) if (!hidden.has(i)) return i;
  // then backward
  for (let i = idx - 1; i >= 0; i--) if (!hidden.has(i)) return i;
  return idx;
}

/* ---------- Navigation ---------- */
function goToSlide(newIdx, direction) {
  if (isTransitioning) return;
  newIdx = Math.max(0, Math.min(slides.length - 1, newIdx));
  newIdx = clampToVisible(newIdx);
  if (newIdx === currentIndex && slides[currentIndex]?.classList.contains('active')) return;
  const dir = direction || (newIdx > currentIndex ? 'right' : 'left');
  const oldSlide = slides[currentIndex];
  const newSlide = slides[newIdx];
  isTransitioning = true;
  transitionSlide(oldSlide, newSlide, dir, () => {
    currentIndex = newIdx;
    animateSlideContent(newSlide);
    updateUI();
    localStorage.setItem('pres-current-slide', String(currentIndex));
    setTimeout(() => { isTransitioning = false; }, 80);
  });
  // also update UI instantly for responsiveness
  currentIndex = newIdx;
  updateUI();
}

function nextSlide() {
  const hidden = getHiddenSlides();
  for (let i = currentIndex + 1; i < slides.length; i++) {
    if (!hidden.has(i)) { goToSlide(i, 'right'); return; }
  }
}
function prevSlide() {
  const hidden = getHiddenSlides();
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (!hidden.has(i)) { goToSlide(i, 'left'); return; }
  }
}
function firstSlide() { goToSlide(clampToVisible(0), 'left'); }
function lastSlide() { goToSlide(clampToVisible(slides.length - 1), 'right'); }

/* ---------- UI updates ---------- */
function updateUI() {
  const totalVisible = getVisibleSlides().length;
  const visIdx = getVisibleIndex();
  if (counter) counter.textContent = `${visIdx + 1} / ${totalVisible}`;
  const active = slides[currentIndex];
  if (active && sectionLabel) {
    sectionLabel.textContent = active.dataset.section || '';
  }
  if (progress && totalVisible > 0) {
    progress.style.width = `${((visIdx + 1) / totalVisible) * 100}%`;
  }
}

/* ---------- Keyboard ---------- */
window.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea, select')) return;
  const k = e.key;
  if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') {
    e.preventDefault(); nextSlide();
  } else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') {
    e.preventDefault(); prevSlide();
  } else if (k === 'Home') { e.preventDefault(); firstSlide(); }
  else if (k === 'End') { e.preventDefault(); lastSlide(); }
  else if (k === 'f' || k === 'F') {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }
});

/* ---------- Touch ---------- */
let touchStartX = null;
window.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
window.addEventListener('touchend', (e) => {
  if (touchStartX == null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) { if (dx < 0) nextSlide(); else prevSlide(); }
  touchStartX = null;
});

/* ---------- Init ---------- */
async function init() {
  fitToViewport();
  await loadAllSlides();
  fitToViewport();

  // Restore current slide
  const savedIdx = parseInt(localStorage.getItem('pres-current-slide') || '0', 10);
  currentIndex = Math.max(0, Math.min(slides.length - 1, isNaN(savedIdx) ? 0 : savedIdx));
  currentIndex = clampToVisible(currentIndex);

  // Show first slide immediately
  const first = slides[currentIndex];
  first.style.visibility = 'visible';
  first.style.opacity = '1';
  first.classList.add('active');
  updateUI();

  initAdmin({
    goToSlide: (i) => goToSlide(i),
    getSlideCount: () => slides.length,
    getVisibleSlides
  });

  window.addEventListener('hidden-slides-changed', () => {
    currentIndex = clampToVisible(currentIndex);
    updateUI();
  });
}

init().catch(err => {
  console.error('Failed to init presentation:', err);
  container.innerHTML = `<div style="color:#fff;padding:40px;font-family:sans-serif">Failed to load presentation: ${err.message}</div>`;
});
