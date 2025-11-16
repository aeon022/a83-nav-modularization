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
