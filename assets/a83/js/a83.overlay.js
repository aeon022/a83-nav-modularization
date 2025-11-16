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
