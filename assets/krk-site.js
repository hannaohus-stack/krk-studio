/* KRK Studio — site shell behaviour (v2 · 261005): mobile menu */
(function () {
  var btn = document.querySelector('[data-menu-open]');
  var overlay = document.querySelector('[data-menu]');
  if (!btn || !overlay) return;
  var close = overlay.querySelector('[data-menu-close]');

  function setOpen(open) {
    overlay.classList.toggle('is-open', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open && close) close.focus();
    if (!open) btn.focus();
  }

  btn.addEventListener('click', function () { setOpen(true); });
  if (close) close.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) setOpen(false);
  });
})();
