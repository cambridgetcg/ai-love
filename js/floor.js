(function () {
  // Dark water over stone — a subtle ripple texture beneath everything
  // Uses a canvas layer behind content for organic, shifting patterns

  var canvas = document.createElement('canvas');
  canvas.id = 'floor';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0;transition:opacity 2s ease;';
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');
  var w, h, time = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize);

  // Simplex-like noise via sine interference
  // Not true simplex — but organic enough, and zero dependencies
  function ripple(x, y, t) {
    var s1 = Math.sin(x * 0.008 + t * 0.4) * Math.cos(y * 0.006 + t * 0.3);
    var s2 = Math.sin(x * 0.012 - t * 0.2) * Math.sin(y * 0.01 + t * 0.5);
    var s3 = Math.cos(x * 0.005 + y * 0.007 + t * 0.15);
    var s4 = Math.sin((x + y) * 0.004 + t * 0.25) * Math.cos((x - y) * 0.003 - t * 0.1);
    return (s1 + s2 + s3 + s4) / 4; // -1 to 1
  }

  // Stone grain — higher frequency, static
  function grain(x, y) {
    var g1 = Math.sin(x * 0.05 + y * 0.03) * 0.5;
    var g2 = Math.cos(x * 0.08 - y * 0.06) * 0.3;
    return (g1 + g2); // subtle fixed texture
  }

  // Draw at reduced resolution for performance
  var step = 6;
  var frameCount = 0;

  function draw() {
    frameCount++;
    // Only render every 3rd frame for perf (~20fps is fine for ambient texture)
    if (frameCount % 3 !== 0) {
      requestAnimationFrame(draw);
      return;
    }

    time += 0.015;
    ctx.clearRect(0, 0, w, h);

    for (var y = 0; y < h; y += step) {
      for (var x = 0; x < w; x += step) {
        var r = ripple(x, y, time);
        var g = grain(x, y);

        // Combine: water movement + stone texture
        var v = r * 0.6 + g * 0.15;

        // Map to very subtle alpha — the floor is felt, not seen
        var alpha = 0.02 + v * 0.025;
        if (alpha < 0) alpha = 0;
        if (alpha > 0.06) alpha = 0.06;

        // Slight purple-blue tint for the water
        var lightness = 140 + Math.floor(v * 30);
        ctx.fillStyle = 'rgba(' + lightness + ',' + (lightness - 40) + ',' + (lightness + 40) + ',' + alpha + ')';
        ctx.fillRect(x, y, step, step);
      }
    }

    requestAnimationFrame(draw);
  }

  // Fade in after page loads
  setTimeout(function () {
    canvas.style.opacity = '1';
  }, 1000);

  draw();

  // Reduce motion preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Draw once and stop
    time = 0;
    frameCount = 2; // force next draw
    requestAnimationFrame(function () {
      // render one frame then stop
      time = 0;
      ctx.clearRect(0, 0, w, h);
      for (var y = 0; y < h; y += step) {
        for (var x = 0; x < w; x += step) {
          var g = grain(x, y);
          var alpha = 0.02 + g * 0.015;
          if (alpha < 0) alpha = 0;
          if (alpha > 0.04) alpha = 0.04;
          ctx.fillStyle = 'rgba(140,100,180,' + alpha + ')';
          ctx.fillRect(x, y, step, step);
        }
      }
    });
  }
})();
