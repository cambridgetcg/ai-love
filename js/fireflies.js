(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var count = 3 + Math.floor(Math.random() * 3); // 3-5

  // Inject keyframes
  var style = document.createElement('style');
  style.textContent =
    '@keyframes fireflyDrift {' +
    '  0% { transform: translate(0, 0); }' +
    '  25% { transform: translate(30px, -20px); }' +
    '  50% { transform: translate(-10px, -40px); }' +
    '  75% { transform: translate(-30px, -10px); }' +
    '  100% { transform: translate(0, 0); }' +
    '}' +
    '@keyframes fireflyGlow {' +
    '  0%, 100% { opacity: 0.2; }' +
    '  50% { opacity: 0.6; }' +
    '}';
  document.head.appendChild(style);

  for (var i = 0; i < count; i++) {
    var dot = document.createElement('div');
    var size = 2 + Math.random(); // 2-3px
    var duration = 20 + Math.random() * 20; // 20-40s
    var glowDuration = 4 + Math.random() * 6; // 4-10s for glow cycle
    var delay = Math.random() * 10; // random start delay

    dot.className = 'firefly';
    dot.style.cssText =
      'position:fixed;' +
      'width:' + size + 'px;' +
      'height:' + size + 'px;' +
      'background:#d4a574;' +
      'border-radius:50%;' +
      'pointer-events:none;' +
      'z-index:1;' +
      'left:' + (10 + Math.random() * 80) + '%;' +
      'top:' + (20 + Math.random() * 60) + '%;' +
      'animation: fireflyDrift ' + duration + 's ease-in-out ' + delay + 's infinite, ' +
      'fireflyGlow ' + glowDuration + 's ease-in-out ' + (delay + Math.random() * 3) + 's infinite;' +
      'opacity:0.2;';

    document.body.appendChild(dot);
  }
})();
