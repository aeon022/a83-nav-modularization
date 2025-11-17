// isolate/js/nav.js — minimal + a11y/focus hardening
const html     = document.documentElement;
const overlay  = document.getElementById('nav-overlay');
const header   = document.getElementById('site-header');

let triggerBtn = null;            // für Fokus-Rückgabe
let lastFocus  = null;            // zuletzt fokussiertes Element

function focusablesWithin(root){
  return Array.from(root.querySelectorAll(
    'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input,select,textarea'
  )).filter(el => el.offsetParent !== null);
}

function placeCard(){
  if(!overlay) return;
  const card = overlay.querySelector('.nav-card');
  const slot = document.querySelector('.burger-slot, .burger-home-slot') || header;
  if(!card || !slot) return;

  const r = slot.getBoundingClientRect();
  const gutter  = 12;                       // Mindestabstand zum rechten Rand
  const headerH = header?.offsetHeight || 56;

  const top   = Math.max(r.bottom + 8, headerH + 8);
  const right = Math.max(gutter, innerWidth - r.right);

  // 1) Per CSS-Variablen (bevorzugter Weg)
  overlay.style.setProperty('--card-top',   `${top}px`);
  overlay.style.setProperty('--card-right', `${right}px`);

  // 2) Fallback: Inline-Styles mit !important -> überschreibt aggressive Fremd-CSS
  card.style.setProperty('top',  `${top}px`,   'important');
  card.style.setProperty('right',`${right}px`, 'important');
  card.style.setProperty('left', 'auto',       'important');

  card.style.transformOrigin = 'top right';

  card.style.top = `${top}px`;
  card.style.right = `${right}px`;
  card.style.left = 'auto';
  card.style.transformOrigin = 'top right';
}


function showOverlay(){
  placeCard();
  overlay?.setAttribute('aria-hidden','false');

  // Scrollbar-Breite kompensieren & Lock
  const sbw = innerWidth - document.documentElement.clientWidth;
  html.style.setProperty('--sbw', sbw + 'px');
  html.classList.add('nav-lock');

  // State
  html.setAttribute('data-nav-state','opening');
  setTimeout(()=> html.setAttribute('data-nav-state','open'), 10);

  // Fokus merken & in die Karte setzen
  lastFocus = document.activeElement;
  const f = focusablesWithin(overlay);
  (f[0] || overlay).focus({ preventScroll:true });
  overlay.addEventListener('keydown', trapTab, true);
  overlay.addEventListener('keydown', onEsc,   true);
}

function hideOverlay(){
  html.setAttribute('data-nav-state','closing');

  // Timeouts an CSS-Dauer angelehnt (t-card-out)
  const OUT = 320;
  setTimeout(()=>{
    overlay?.setAttribute('aria-hidden','true');
    html.classList.remove('nav-lock');
    html.style.removeProperty('--sbw');
    html.style.removeProperty('scroll-behavior');
    html.setAttribute('data-nav-state','closed');

    triggerBtn?.classList.add('is-recoiling');
setTimeout(()=> triggerBtn?.classList.remove('is-recoiling'), 420);

    // Event-Handler entfernen & Fokus zurück
    overlay.removeEventListener('keydown', trapTab, true);
    overlay.removeEventListener('keydown', onEsc,   true);
    (triggerBtn || lastFocus || header)?.focus?.({ preventScroll:true });
  }, OUT);
}

function trapTab(e){
  if(e.key !== 'Tab') return;
  const f = focusablesWithin(overlay);
  if(!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}
function onEsc(e){
  if(e.key === 'Escape'){ e.preventDefault(); hideOverlay(); }
}

function initBurger(){
  const host = document.querySelector('.burger-slot, .burger-home-slot') || header;
  const btn  = host?.querySelector('#nav-trigger, .a83-burger, .nav-toggle');
  if(!btn) return;
  triggerBtn = btn;

  // Falls <a href="#"> → Sprung verhindern
  const a = btn.closest('a');
  if(a){ a.removeAttribute('href'); a.setAttribute('role','button'); }

  btn.setAttribute('aria-controls','nav-overlay');
  btn.setAttribute('aria-expanded','false');

  btn.addEventListener('click', (e)=>{
    e.preventDefault(); e.stopImmediatePropagation();
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', expanded ? 'false':'true');
    expanded ? hideOverlay() : showOverlay();
  }, true);
}

function ensureCloseButton(){
  const slot = overlay?.querySelector('#nav-close-slot, .nav-close-slot');
  let close = slot?.querySelector('.nav-close-btn');
  if(!close){
    close = document.createElement('button');
    close.className = 'nav-close-btn';
    close.setAttribute('aria-label','Menü schließen');
    close.textContent = '✕';
    close.setAttribute('type','button');
    slot?.appendChild(close);
  }
  close.addEventListener('click', ()=> hideOverlay());
}

function guardHeader(){
  header?.addEventListener('click', (e)=>{
    const link = e.target.closest && e.target.closest('a');
    if(!link) return;
    const href = (link.getAttribute('href')||'').trim();
    if(href === '' || href === '#' || href.toLowerCase() === 'javascript:void(0)' || href.startsWith('#')){
      e.preventDefault();
    }
  }, true);
}

function enableBackdropClose(){
  // Klick auf den dunklen Bereich schließt
  overlay.addEventListener('mousedown', (e)=>{
    if(e.target === overlay){ hideOverlay(); }
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  html.setAttribute('data-nav-state','closed');
  overlay?.setAttribute('tabindex','-1'); // damit overlay selbst fokussierbar ist

  initBurger();
  ensureCloseButton();
  guardHeader();
  enableBackdropClose();
  placeCard();
addEventListener('resize', placeCard, { passive: true });
});