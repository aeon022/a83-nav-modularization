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
