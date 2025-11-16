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
