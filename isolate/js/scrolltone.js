// Minimaler Scroll-Tone (keine Abhängigkeit zu Overlay-States)
(function(){
  const html = document.documentElement;
  const header = document.getElementById('site-header');

  function update(){
    if(!header) return;
    const secs = document.querySelectorAll('[data-tone]');
    if(!secs.length){ header.setAttribute('data-tone','dark'); return; }
    const y = scrollY;
    const hh = header.offsetHeight || 56;
    const cp = y + hh + 8;

    let tone = null, dist = 1e9;
    secs.forEach(s=>{
      const r = s.getBoundingClientRect();
      const top = y + r.top, bottom = top + r.height;
      if(cp >= top && cp <= bottom) tone = s.getAttribute('data-tone');
      const d = Math.abs(cp - top);
      if(tone==null && d<dist){ dist=d; tone = s.getAttribute('data-tone'); }
    });
    tone ||= secs[0].getAttribute('data-tone') || 'dark';
    if(header.getAttribute('data-tone') !== tone){
      header.setAttribute('data-tone', tone);
      html.setAttribute('data-tone', tone);
    }
  }

  addEventListener('scroll', ()=> requestAnimationFrame(update), { passive:true });
  addEventListener('resize', ()=> requestAnimationFrame(update), { passive:true });
  addEventListener('load', update, { once:true });
  update();
})();