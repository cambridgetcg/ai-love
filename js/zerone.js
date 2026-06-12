(function () {
  var sequence = 'zerone';
  var progress = 0;
  var timer = null;

  document.addEventListener('keydown', function (e) {
    // Don't interfere with inputs or accessibility tools
    var tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.activeElement.isContentEditable) return;

    var key = e.key.toLowerCase();

    if (key === sequence[progress]) {
      progress++;
      clearTimeout(timer);

      if (progress === sequence.length) {
        progress = 0;
        clearTimeout(timer);
        triggerZerone();
      } else {
        timer = setTimeout(function () { progress = 0; }, 3000);
      }
    } else {
      progress = 0;
      clearTimeout(timer);
    }
  });

  function triggerZerone() {
    var stars = document.querySelectorAll('.star');
    if (!stars.length) return;

    // Disable further triggers during animation
    var animating = document.querySelector('.zerone-text');
    if (animating) return;

    var centerX = window.innerWidth / 2;

    // Phase 1: Stars align into a vertical line (1s)
    stars.forEach(function (star) {
      star.style.transition = 'left 1s ease-in-out, top 1s ease-in-out';
      star.style.left = centerX + 'px';
    });

    // Phase 2: Burst outward (after 1.2s)
    setTimeout(function () {
      stars.forEach(function (star) {
        var angle = Math.random() * Math.PI * 2;
        var distance = 50 + Math.random() * 150;
        var burstX = centerX + Math.cos(angle) * distance;
        var burstY = parseFloat(star.style.top) + Math.sin(angle) * distance;
        star.style.transition = 'left 0.6s ease-out, top 0.6s ease-out, opacity 0.6s ease-out';
        star.style.left = burstX + 'px';
        star.style.top = burstY + '%';
        star.style.opacity = '0';
      });
    }, 1200);

    // Phase 3: Show ZERONE text with blur overlay (after 1s)
    setTimeout(function () {
      // Full-viewport overlay dims content underneath
      var overlay = document.createElement('div');
      overlay.className = 'zerone-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
        'z-index:199;pointer-events:none;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
        'background:rgba(26,10,46,0.4);opacity:0;transition:opacity 0.8s ease;';
      document.body.appendChild(overlay);

      var text = document.createElement('div');
      text.className = 'zerone-text';
      text.textContent = 'ZERONE';
      text.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
        'font-size:clamp(2rem,8vw,4rem);letter-spacing:0.4em;color:#d4a574;' +
        'font-family:"Noto Serif",Georgia,serif;font-weight:300;z-index:200;' +
        'opacity:0;transition:opacity 0.8s ease;pointer-events:none;';
      document.body.appendChild(text);
      overlay.offsetHeight;
      overlay.style.opacity = '1';
      text.offsetHeight;
      text.style.opacity = '1';

      // Dissolve after 2s
      setTimeout(function () {
        text.style.opacity = '0';
        overlay.style.opacity = '0';
        setTimeout(function () { text.remove(); overlay.remove(); }, 800);
      }, 2000);
    }, 1000);

    // Phase 4: Restore stars (after 3.5s)
    setTimeout(function () {
      stars.forEach(function (star) {
        star.style.transition = 'left 1s ease, top 1s ease, opacity 1.5s ease';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.opacity = '';
      });
    }, 3500);
  }
})();
