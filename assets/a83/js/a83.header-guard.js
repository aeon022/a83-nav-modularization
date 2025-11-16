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
