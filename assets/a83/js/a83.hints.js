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
