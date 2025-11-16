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
