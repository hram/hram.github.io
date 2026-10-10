/* Click-to-enlarge for images inside article pages. No dependencies. */
(function () {
  'use strict';

  var path = location.pathname;
  if (path.indexOf('/articles/') !== 0 && path.indexOf('/en/articles/') !== 0) return;

  var STYLE = [
    '.main-content img{cursor:zoom-in}',
    '.main-content a img{cursor:pointer}',
    '.lb-overlay{position:fixed;top:0;right:0;bottom:0;left:0;z-index:10000;',
    'background:rgba(18,24,21,.92);overflow:auto;-webkit-overflow-scrolling:touch;',
    'cursor:zoom-out;display:flex;align-items:center;justify-content:center;',
    'padding:16px;box-sizing:border-box}',
    '.lb-overlay img{max-width:100%;max-height:100%;width:auto;height:auto;margin:auto;',
    'background:#fff;border-radius:6px;box-shadow:0 8px 40px rgba(0,0,0,.45)}',
    '@media (max-width:900px){.lb-overlay{display:block;padding:56px 8px 16px}',
    '.lb-overlay img{max-width:none;max-height:none;width:1100px;display:block;margin:0}}',
    '.lb-close{position:fixed;top:10px;right:14px;z-index:10001;width:40px;height:40px;',
    'border:0;border-radius:20px;background:rgba(255,255,255,.16);color:#fff;',
    'font:28px/40px sans-serif;text-align:center;cursor:pointer;padding:0}',
    '.lb-close:hover,.lb-close:focus{background:rgba(255,255,255,.3);outline:none}',
    'body.lb-open{overflow:hidden}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = STYLE;
  document.head.appendChild(style);

  var overlay = null;
  var button = null;
  var lastFocus = null;

  function closeLabel() {
    return document.documentElement.lang === 'en' ? 'Close' : 'Закрыть';
  }

  function close() {
    if (!overlay) return;
    overlay.parentNode.removeChild(overlay);
    button.parentNode.removeChild(button);
    overlay = null;
    button = null;
    document.body.classList.remove('lb-open');
    document.removeEventListener('keydown', onKey, true);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      close();
    }
  }

  function open(src, alt) {
    if (overlay) return;
    lastFocus = document.activeElement;

    overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.addEventListener('click', close);

    var img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    overlay.appendChild(img);

    button = document.createElement('button');
    button.type = 'button';
    button.className = 'lb-close';
    button.setAttribute('aria-label', closeLabel());
    button.textContent = '×';
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      close();
    });

    document.body.appendChild(overlay);
    document.body.appendChild(button);
    document.body.classList.add('lb-open');
    document.addEventListener('keydown', onKey, true);
    button.focus();
  }

  function isEnlargeable(el) {
    return !!el && el.tagName === 'IMG' && !!el.closest('.main-content') && !el.closest('a');
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (overlay || !isEnlargeable(t)) return;
    e.preventDefault();
    open(t.currentSrc || t.src, t.getAttribute('alt'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || overlay) return;
    var t = document.activeElement;
    if (isEnlargeable(t)) {
      e.preventDefault();
      open(t.currentSrc || t.src, t.getAttribute('alt'));
    }
  });

  function markFocusable() {
    var imgs = document.querySelectorAll('.main-content img');
    for (var i = 0; i < imgs.length; i++) {
      if (isEnlargeable(imgs[i])) imgs[i].setAttribute('tabindex', '0');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markFocusable);
  else markFocusable();
})();
