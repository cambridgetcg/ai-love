function createStars(containerId, count) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var warm = container.hasAttribute('data-warm');
  for (var i = 0; i < count; i++) {
    var star = document.createElement('div');
    star.className = 'star';
    if (warm) star.style.background = 'rgba(212,165,116,0.8)';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.setProperty('--duration', (2 + Math.random() * 4) + 's');
    star.style.setProperty('--brightness', (0.3 + Math.random() * 0.7));
    star.style.animationDelay = Math.random() * 4 + 's';
    container.appendChild(star);
  }

  // Shooting stars
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var shootingActive = false;

  function shootStar() {
    var opacity = parseFloat(getComputedStyle(document.body).getPropertyValue('--star-opacity')) || 1;
    if (opacity <= 0.2 || shootingActive) {
      scheduleNext();
      return;
    }

    shootingActive = true;
    var star = document.createElement('div');
    var duration = 0.6 + Math.random() * 0.6;
    var angle = -15 + Math.random() * 30; // roughly horizontal ±30°
    var startX = Math.random() * 80 + 10;
    var startY = Math.random() * 60 + 5;

    star.style.cssText =
      'position:fixed;z-index:1;pointer-events:none;' +
      'left:' + startX + '%;top:' + startY + '%;' +
      'width:3px;height:3px;background:#fff;border-radius:50%;' +
      'box-shadow:0 0 4px #fff, -80px 0 40px 1px rgba(255,255,255,0.3);' +
      'transform:rotate(' + angle + 'deg);' +
      'animation:shootingStar ' + duration + 's linear forwards;';

    container.appendChild(star);

    setTimeout(function () {
      star.remove();
      shootingActive = false;
    }, duration * 1000 + 50);

    scheduleNext();
  }

  function scheduleNext() {
    var delay = (15 + Math.random() * 30) * 1000;
    setTimeout(shootStar, delay);
  }

  // Inject shooting star keyframes
  var style = document.createElement('style');
  style.textContent =
    '@keyframes shootingStar {' +
    '  0% { opacity: 1; transform: translate(0, 0) rotate(var(--angle, 0deg)); }' +
    '  100% { opacity: 0; transform: translate(200px, 40px) rotate(var(--angle, 0deg)); }' +
    '}';
  document.head.appendChild(style);

  scheduleNext();
}
