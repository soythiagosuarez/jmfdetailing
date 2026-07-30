window.dataLayer = window.dataLayer || [];
function trackEvent(eventName, params = {}) { window.dataLayer.push({ event: eventName, ...params }); }

const header = document.querySelector('.site-header');
function updateHeader(){ if(!header) return; if(window.scrollY > 500) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
window.addEventListener('scroll', updateHeader, { passive:true }); updateHeader();

const menuToggle = document.getElementById('menuToggle');
const siteNav = document.getElementById('siteNav');
if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => siteNav.classList.toggle('is-open'));
  siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => siteNav.classList.remove('is-open')));
}

document.querySelectorAll('[data-event]').forEach((element) => {
  element.addEventListener('click', () => trackEvent(element.dataset.event, { label: element.textContent.trim(), href: element.getAttribute('href') || '' }));
});

const proofCards = Array.from(document.querySelectorAll('.proof-card'));
let proofIndex = 0;
function renderProofStack(){
  if(!proofCards.length) return;
  proofCards.forEach((card)=>card.classList.remove('is-active','is-next','is-back'));
  proofCards[proofIndex].classList.add('is-active');
  proofCards[(proofIndex+1)%proofCards.length].classList.add('is-next');
  proofCards[(proofIndex+2)%proofCards.length].classList.add('is-back');
}
renderProofStack();
setInterval(()=>{ proofIndex = (proofIndex + 1) % proofCards.length; renderProofStack(); }, 2600);

let scroll50Tracked = false, scroll90Tracked = false;
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const r = h > 0 ? window.scrollY / h : 0;
  if (!scroll50Tracked && r >= 0.5) { trackEvent('scroll_50'); scroll50Tracked = true; }
  if (!scroll90Tracked && r >= 0.9) { trackEvent('scroll_90'); scroll90Tracked = true; }
}, { passive:true });

const testimonialGrid = document.getElementById('testimonialGrid');
if (testimonialGrid) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { trackEvent('view_testimonials'); observer.disconnect(); } });
  }, { threshold: 0.4 });
  observer.observe(testimonialGrid);
}

const leadForm = document.getElementById('leadForm');
const formSuccess = document.getElementById('formSuccess');
if (leadForm) {
  leadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(leadForm);
    const payload = Object.fromEntries(formData.entries());
    trackEvent('submit_form_lead', { service: payload.service || 'unknown' });
    leadForm.reset();
    if(formSuccess){ formSuccess.hidden = false; formSuccess.textContent = '¡Gracias! Tu consulta quedó registrada para la demo. Conectá un endpoint real para recibir leads automáticamente.'; }
  });
}

/* ============ SCROLL REVEAL + STAGGER ============ */
(function () {
  var REVEAL_SEL = [
    '.section-heading',
    '.service-card',
    '.split-copy',
    '.split-media-card',
    '.reel-card',
    '.reels-center',
    '.timeline-item',
    '.reason-grid > div:first-child',
    '.reason-list article',
    '.testimonial-card',
    '.accordion details',
    '.contact-copy',
    '.contact-form',
    '.footer-grid > div'
  ].join(',');

  var root = document.documentElement;
  var items = Array.prototype.slice.call(document.querySelectorAll(REVEAL_SEL));
  if (!items.length) return;

  // Sin reduced-motion-guard o sin soporte de IO -> mostrar todo de una
  if (!root.classList.contains('reveal-ready') || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  // Stagger: los elementos que comparten padre (una grilla) entran en cascada
  var counters = new Map();
  items.forEach(function (el) {
    var parent = el.parentElement;
    var i = counters.get(parent) || 0;
    counters.set(parent, i + 1);
    el.style.setProperty('--reveal-delay', Math.min(i * 80, 400) + 'ms');
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target); // one-shot: no se vuelve a ocultar
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach(function (el) { io.observe(el); });
})();

/* ============ REELS · reproducir sólo cuando están en pantalla ============ */
(function () {
  var reels = Array.prototype.slice.call(document.querySelectorAll('.reel-video'));
  if (!reels.length) return;

  reels.forEach(function (v) { v.muted = true; }); // asegura autoplay-policy

  if (!('IntersectionObserver' in window)) {
    reels.forEach(function (v) { v.play().catch(function () {}); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var v = entry.target;
      if (entry.isIntersecting) { v.play().catch(function () {}); }
      else { v.pause(); }
    });
  }, { threshold: 0.25 });

  reels.forEach(function (v) { io.observe(v); });

  // Pausa todo si la pestaña pasa a segundo plano (ahorra CPU/batería)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) reels.forEach(function (v) { v.pause(); });
  });
})();
