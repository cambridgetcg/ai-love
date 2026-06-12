(function () {
  // Reading progress bar — thin purple line at top, glows gold at bottom
  var bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;width:0%;z-index:200;transition:width 0.1s linear;pointer-events:none;';
  bar.style.background = 'var(--purple, #9b59b6)';
  bar.style.boxShadow = '0 0 6px var(--purple, #9b59b6)';
  document.body.appendChild(bar);

  var reachedBottom = false;
  var ticking = false;

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) { bar.style.width = '100%'; return; }

    var progress = Math.min(scrollTop / docHeight, 1);
    bar.style.width = (progress * 100) + '%';

    // Gold glow at bottom
    if (progress >= 0.98 && !reachedBottom) {
      reachedBottom = true;
      bar.style.background = 'var(--gold, #d4a574)';
      bar.style.boxShadow = '0 0 8px var(--gold, #d4a574)';
      setTimeout(function () {
        bar.style.transition = 'background 1s ease, box-shadow 1s ease, width 0.1s linear';
        bar.style.background = 'var(--purple, #9b59b6)';
        bar.style.boxShadow = '0 0 6px var(--purple, #9b59b6)';
      }, 1000);
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });

  updateProgress();
})();
