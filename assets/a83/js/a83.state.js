export const State = (() => {
  let s = 'closed';
  const html = document.documentElement;
  const set = (next) => { s = next; html.setAttribute('data-nav-state', next); };
  const get = () => s;
  return { get, set, html };
})();
