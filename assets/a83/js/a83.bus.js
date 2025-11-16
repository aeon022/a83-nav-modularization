export const bus = (() => {
  const t = {};
  return {
    on:  (e, cb) => (t[e] ||= []).push(cb),
    off: (e, cb) => t[e] = (t[e]||[]).filter(x => x !== cb),
    emit:(e, p)  => (t[e] || []).forEach(cb => cb(p))
  };
})();
export const EV = {
  NAV_OPENING: 'a83:nav:opening',
  NAV_OPEN:    'a83:nav:open',
  NAV_CLOSING: 'a83:nav:closing',
  NAV_CLOSED:  'a83:nav:closed',
  TONE_RESUME: 'a83:tone:resume'
};
