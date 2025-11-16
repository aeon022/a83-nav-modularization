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
