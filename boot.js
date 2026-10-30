/* Runs in <head>, before the page paints.
   1. Frame guard: GitHub Pages can't send X-Frame-Options or CSP frame-ancestors,
      so if someone loads this site inside an iframe (clickjacking), break out or hide the page.
   2. Flag that JS is on, so animations can start from a hidden state without a flash. */
(function () {
  "use strict";
  var root = document.documentElement;

  if (window.top !== window.self) {
    root.classList.add("framed");
    try { window.top.location.replace(window.self.location.href); } catch (e) { /* sandboxed: stay hidden */ }
    return;
  }

  root.classList.add("js");
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("calm");
  }
})();
