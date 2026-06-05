// Sticky header background on scroll
const header = document.getElementById('siteHeader');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const setMenu = (open) => {
  hamburger.setAttribute('aria-expanded', String(open));
  mobileNav.classList.toggle('open', open);
};
hamburger.addEventListener('click', () => {
  setMenu(hamburger.getAttribute('aria-expanded') !== 'true');
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Scroll reveal with optional stagger — uses scroll/resize checks (robust everywhere)
const revealEls = [...document.querySelectorAll('.reveal, .reveal-stagger')];
const showEl = (el) => {
  if (el.classList.contains('in')) return;
  const delay = parseInt(el.dataset.delay || '0', 10);
  el.style.transitionDelay = delay + 'ms';
  if (el.classList.contains('reveal-stagger')) {
    [...el.children].forEach((child, i) => {
      child.style.transitionDelay = (delay + i * 90) + 'ms';
    });
  }
  el.classList.add('in');
};
const revealCheck = () => {
  const trigger = window.innerHeight * 0.92;
  for (let k = revealEls.length - 1; k >= 0; k--) {
    const el = revealEls[k];
    const top = el.getBoundingClientRect().top;
    if (top < trigger) {
      showEl(el);
      revealEls.splice(k, 1);
    }
  }
};
revealCheck();
window.addEventListener('scroll', revealCheck, { passive: true });
window.addEventListener('resize', revealCheck, { passive: true });
window.addEventListener('load', revealCheck);
// Failsafe: never leave content hidden if something goes wrong
setTimeout(() => revealEls.splice(0).forEach(showEl), 2500);

// Animated elapsed timers (count up every second)
const pad = n => String(n).padStart(2, '0');
const fmt = s => `${pad(Math.floor(s/3600))}<i class="t-colon">:</i>${pad(Math.floor((s%3600)/60))}<i class="t-colon">:</i>${pad(s%60)}`;

const heroTimer = document.getElementById('elapsedTimer');
const workerTimer = document.getElementById('elapsedTimer2');
let heroSecs = 4 * 3600 + 21 * 60 + 19;   // hero starts at 04:21:19
let workerSecs = 4 * 3600 + 21 * 60 + 19;
let heroRunning = true;
const renderTimers = () => {
  if (heroTimer) heroTimer.innerHTML = fmt(heroSecs);
  if (workerTimer) workerTimer.innerHTML = fmt(workerSecs);
};
renderTimers();
setInterval(() => {
  if (heroRunning) heroSecs++;
  workerSecs++;
  renderTimers();
}, 1000);

// Interactive hero phone — Stop shift → start screen, Start shift → live shift
const heroDevice = document.querySelector('.hero-media .device');
if (heroDevice) {
  const activeScreen = heroDevice.querySelector('.screen-active');
  const homeScreen = heroDevice.querySelector('.screen-home');
  const stopBtn = document.getElementById('heroStop');
  const startBtn = document.getElementById('heroStart');
  const hint = heroDevice.parentElement.querySelector('.device-hint');
  const hintIcon = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 5v13M6 12.5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const handIcon = '<span class="hint-pointer">👇</span> ';
  // Set hint immediately on load
  if (hint) hint.innerHTML = handIcon + 'Tap <strong>Stop shift</strong> to try it';
  const show = (screen) => {
    [activeScreen, homeScreen].forEach(s => { s.hidden = (s !== screen); });
    screen.style.animation = 'none'; void screen.offsetWidth; screen.style.animation = '';
    if (hint) hint.innerHTML = (screen === homeScreen)
      ? handIcon + 'Now tap <strong>Start shift</strong>'
      : handIcon + 'Tap <strong>Stop shift</strong> to try it';
  };
  let interacted = false;
  const markInteracted = () => {
    if (interacted) return;
    interacted = true;
    heroDevice.classList.add('tapped');  // stop the looping tap-cue + button pulse
  };
  stopBtn?.addEventListener('click', () => {
    markInteracted();
    heroRunning = false;
    show(homeScreen);
  });
  startBtn?.addEventListener('click', () => {
    markInteracted();
    heroSecs = 0;
    heroRunning = true;
    renderTimers();
    show(activeScreen);
  });
}

// Dynamic notes — typewriter that types, pauses, erases, rewrites (loops forever)
const noteEl = document.getElementById('noteText');
if (noteEl) {
  const notes = [
    'Formwork inspection · crew of 6',
    'Poured 12m³ concrete, Block C',
    'Rebar delivery received at 09:15',
    'Scaffold check done · no issues'
  ];
  let n = 0, i = 0, deleting = false;
  const tick = () => {
    const txt = notes[n];
    noteEl.textContent = deleting ? txt.slice(0, i--) : txt.slice(0, i++);
    let delay = deleting ? 34 : 58;
    if (!deleting && i > txt.length) {        // finished typing
      deleting = true; i = txt.length; delay = 2000;
    } else if (deleting && i < 0) {           // finished erasing
      deleting = false; i = 0; n = (n + 1) % notes.length; delay = 420;
    }
    setTimeout(tick, delay);
  };
  tick();
}

// Demo video modal
const modal = document.getElementById('demoModal');
const demoVideo = document.getElementById('demoVideo');
const openDemo = () => {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (demoVideo) { demoVideo.currentTime = 0; demoVideo.play().catch(() => {}); }
};
const closeDemo = () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (demoVideo) demoVideo.pause();
};
document.getElementById('watchDemo')?.addEventListener('click', openDemo);
document.getElementById('demoClose')?.addEventListener('click', closeDemo);
modal?.querySelector('[data-close]')?.addEventListener('click', closeDemo);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeDemo(); });
