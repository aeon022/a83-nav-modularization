#!/usr/bin/env bash
set -euo pipefail
J="assets/a83/js"
mkdir -p "$J"

cat > "$J/a83.bus.js" <<'JS'
export const bus = (() => {
  const t = {};
  return {
    on:  (e, cb) => (t[e] ||= []).push(cb),
    off: (e, cb) => t[e] = (t[e]||[]).filter(x => x !== cb),
    emit:(e, p)  => (t[e] || []).forEach(cb => cb(p))
  };
})();
export const EV = {
  NAV_OPENING: 'a83:nav:opening',
  NAV_OPEN:    'a83:nav:open',
  NAV_CLOSING: 'a83:nav:closing',
  NAV_CLOSED:  'a83:nav:closed',
  TONE_RESUME: 'a83:tone:resume'
};
JS

cat > "$J/a83.state.js" <<'JS'
export const State = (() => {
  let s = 'closed';
  const html = document.documentElement;
  const set = (next) => { s = next; html.setAttribute('data-nav-state', next); };
  const get = () => s;
  return { get, set, html };
})();
JS

cat > "$J/a83.scroll-tone.js" <<'JS'
import { EV, bus } from './a83.bus.js';
(() => {
  const html = document.documentElement;
  let paused = false;

  function update() {
    const header = document.getElementById('site-header');
    if(!header) return;
    const sections = document.querySelectorAll('[data-tone]');
    if(!sections.length){ header.setAttribute('data-tone','light'); return; }

    const y  = scrollY;
    const hh = header.offsetHeight || 60;
    const cp = y + hh + 10;

    let tone = null, dmin = 1e9;
    sections.forEach(s=>{
      const r   = s.getBoundingClientRect();
      const top = y + r.top, bottom = top + r.height;
      if(cp >= top && cp <= bottom) tone ??= s.getAttribute('data-tone');
      const dist = Math.abs(cp - top);
      if(tone == null && dist < dmin){ dmin = dist; tone = s.getAttribute('data-tone'); }
    });
    tone ||= sections[0].getAttribute('data-tone') || 'light';
    if(header.getAttribute('data-tone') !== tone){
      header.setAttribute('data-tone', tone);
      html.setAttribute('data-tone', tone);
    }
  }
  const onScroll = () => { if(!paused) requestAnimationFrame(update); };

  bus.on(EV.NAV_OPENING, ()=> paused = true);
  bus.on(EV.NAV_CLOSED,  ()=> { paused = false; update(); });

  addEventListener('scroll', onScroll, { passive:true });
  addEventListener('resize', onScroll, { passive:true });
  addEventListener('load', update, { once:true });
  document.addEventListener('visibilitychange', ()=> !paused && update());

  update();
})();
JS

cat > "$J/a83.overlay.js" <<'JS'
import { EV, bus } from './a83.bus.js';
import { State }    from './a83.state.js';

const html    = document.documentElement;
const overlay = document.getElementById('nav-overlay');

function show(){
  overlay?.setAttribute('aria-hidden','false');
  const sbw = innerWidth - document.documentElement.clientWidth;
  html.style.setProperty('--sbw', sbw + 'px');
  html.classList.add('nav-lock');
  html.style.scrollBehavior = 'auto'; // smooth off while overlay active
}
function hide(){
  overlay?.setAttribute('aria-hidden','true');
  html.classList.remove('nav-lock');
  html.style.removeProperty('--sbw');
  html.style.removeProperty('scroll-behavior');
}

export function openOverlay(){
  if(State.get() !== 'closed') return;
  State.set('opening'); bus.emit(EV.NAV_OPENING);
  show();
  setTimeout(()=>{ State.set('open'); bus.emit(EV.NAV_OPEN); }, 10);
}
export function closeOverlay(){
  if(State.get() !== 'open' && State.get() !== 'opening') return;
  State.set('closing'); bus.emit(EV.NAV_CLOSING);
  const T = 420 + 320 + 60 + 40; // align with CSS tokens
  setTimeout(()=>{
    hide();
    State.set('closed'); bus.emit(EV.NAV_CLOSED); bus.emit(EV.TONE_RESUME);
  }, T);
}
JS

cat > "$J/a83.card.js" <<'JS'
import { State } from './a83.state.js';
import { openOverlay, closeOverlay } from './a83.overlay.js';

export function attachCard(){
  const overlay   = document.getElementById('nav-overlay');
  const card      = overlay?.querySelector('.nav-card');
  const slot      = document.querySelector('.burger-home-slot, .burger-slot');
  const closeSlot = overlay?.querySelector('#nav-close-slot, .nav-close-slot');

  // ensure close button
  let closeBtn = closeSlot?.querySelector('.nav-close-btn');
  if(!closeBtn){
    closeBtn = document.createElement('button');
    closeBtn.className = 'nav-close-btn';
    closeBtn.setAttribute('aria-label','Menu schließen');
    closeBtn.textContent = '✕';
    closeSlot?.appendChild(closeBtn);
  }
  closeBtn.addEventListener('click', ()=> (State.get()==='open'||State.get()==='opening') && closeOverlay());

  // geometry from trigger slot
  function setFrom(){
    if(!card || !slot) return;
    const s = slot.getBoundingClientRect(), c = card.getBoundingClientRect();
    card.style.setProperty('--from-x', (s.right - c.right) + 'px');
    card.style.setProperty('--from-y', (s.top   - c.top)   + 'px');
    card.style.setProperty('--from-scale', '.94');
  }
  addEventListener('resize', setFrom);
  setFrom();

  return { openOverlay, closeOverlay };
}
JS

cat > "$J/a83.burger.js" <<'JS'
import { openOverlay, closeOverlay } from './a83.overlay.js';

export function attachBurger(){
  const host   = document.querySelector('.burger-home-slot, .burger-slot');
  const target = host?.querySelector('#nav-trigger, .a83-burger, .nav-toggle');
  if(!target) return;

  // if <a>, neutralize "#" jumps
  const a = target.closest('a');
  if(a){ a.removeAttribute('href'); a.setAttribute('role','button'); }

  target.setAttribute('aria-controls','nav-overlay');
  target.setAttribute('aria-expanded','false');

  target.addEventListener('click', (e)=>{
    e.preventDefault(); e.stopImmediatePropagation();
    const expanded = target.getAttribute('aria-expanded') === 'true';
    target.setAttribute('aria-expanded', expanded ? 'false':'true');
    expanded ? closeOverlay() : openOverlay();
  }, true);
}
JS

cat > "$J/a83.hints.js" <<'JS'
export function attachHints(){
  const overlay = document.getElementById('nav-overlay');
  const menu    = overlay?.querySelector('.nav-menu');
  if(!overlay || !menu) return;

  let hint = overlay.querySelector('.nav-hint');
  if(!hint){
    hint = document.createElement('div');
    hint.className = 'nav-hint';
    overlay.appendChild(hint);
  }

  const CMD = t => `$ curl /${t}`;
  const slug = s=>(s||'').trim().toLowerCase().replace(/\s+/g,'');

  function show(el){
    const title = el?.getAttribute('data-title') || el?.dataset?.title || el?.textContent?.trim() || '';
    hint.innerHTML = `<i class="fa-solid fa-terminal" aria-hidden="true"></i>&nbsp;<span class="cmd">${CMD(slug(title))}</span>`;
    overlay.classList.add('hint-visible');
  }
  function hide(){ overlay.classList.remove('hint-visible'); }

  menu.addEventListener('mouseover', e=>{
    const a = e.target.closest('.nav-link, a'); if(a) show(a);
  });
  menu.addEventListener('focusin', e=>{
    const a = e.target.closest('.nav-link, a'); if(a) show(a);
  });
  menu.addEventListener('mouseleave', hide);
  menu.addEventListener('focusout', e=>{
    if(!menu.contains(e.relatedTarget)) hide();
  });
}
JS

cat > "$J/a83.effects.js" <<'JS'
export function triggerOpenEffects(){
  const overlay = document.getElementById('nav-overlay');
  const card    = overlay?.querySelector('.nav-card');
  const menu    = overlay?.querySelector('.nav-menu');
  card?.classList.add('glitch');
  setTimeout(()=> card?.classList.add('glitch-strong'), 180);
  setTimeout(()=> menu?.classList.add('glitch-strong'), 260);
  setTimeout(()=> menu?.classList.remove('glitch-strong'), 1000);
}
export function triggerCloseEffects(){
  const overlay = document.getElementById('nav-overlay');
  const card    = overlay?.querySelector('.nav-card');
  const menu    = overlay?.querySelector('.nav-menu');
  card?.classList.add('glitch-strong');
  setTimeout(()=> card?.classList.remove('glitch','glitch-strong'), 400);
  menu?.classList.add('glitch-once');
  setTimeout(()=> menu?.classList.remove('glitch-once','glitch-strong'), 600);
}
JS

cat > "$J/a83.header-guard.js" <<'JS'
// optional: kill "#" jumps inside header for non-real links
export function guardHeaderAnchors(){
  const header = document.getElementById('site-header');
  if(!header) return;
  header.addEventListener('click', (e)=>{
    const a = e.target.closest && e.target.closest('a');
    if(!a) return;
    const href = (a.getAttribute('href')||'').trim();
    if(href === '' || href === '#' || href.toLowerCase() === 'javascript:void(0)' || href.startsWith('#')){
      e.preventDefault();
    }
  }, true);
}
JS

cat > "$J/a83.init.js" <<'JS'
import { attachBurger } from './a83.burger.js';
import { attachCard }   from './a83.card.js';
import { attachHints }  from './a83.hints.js';
import { triggerOpenEffects, triggerCloseEffects } from './a83.effects.js';
import { guardHeaderAnchors } from './a83.header-guard.js';
import { bus, EV } from './a83.bus.js';

document.addEventListener('DOMContentLoaded', ()=>{
  attachBurger();
  attachCard();
  attachHints();
  guardHeaderAnchors();

  // Effekt-Hooks (optional)
  bus.on(EV.NAV_OPEN,    triggerOpenEffects);
  bus.on(EV.NAV_CLOSING, triggerCloseEffects);
});
JS
