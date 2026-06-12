(function () {
  var SYNODIC = 29.53058867;
  var REF = new Date(2000, 0, 6, 18, 14, 0).getTime();

  function getMoonPhase() {
    var diff = Date.now() - REF;
    var days = diff / (1000 * 60 * 60 * 24);
    var phase = ((days % SYNODIC) + SYNODIC) % SYNODIC;
    return phase / SYNODIC;
  }

  function createMoon() {
    var phase = getMoonPhase();
    var size = 16;
    var r = size / 2;

    // Determine illumination curve
    // phase 0 = new, 0.5 = full, 1 = new again
    var illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
    var waxing = phase <= 0.5;

    // Build SVG with clipping
    var cx = r;
    var sweep = illumination * 2 - 1; // -1 to 1
    var termX = cx + sweep * r;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('aria-label', 'Moon phase');
    svg.setAttribute('role', 'img');
    svg.classList.add('moon-phase');
    svg.style.cssText = 'position:fixed;top:16px;right:16px;z-index:10;opacity:0.25;transition:opacity 0.3s ease;cursor:default;';

    // Dark circle (moon body)
    var bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bg.setAttribute('cx', r);
    bg.setAttribute('cy', r);
    bg.setAttribute('r', r);
    bg.setAttribute('fill', '#e8daf0');
    bg.setAttribute('opacity', '0.15');
    svg.appendChild(bg);

    // Lit portion
    var d;
    if (illumination < 0.01) {
      // New moon — no lit portion
      d = '';
    } else if (illumination > 0.99) {
      // Full moon — full circle
      d = 'M ' + r + ' 0 A ' + r + ' ' + r + ' 0 1 1 ' + r + ' ' + size + ' A ' + r + ' ' + r + ' 0 1 1 ' + r + ' 0';
    } else {
      // Partial illumination
      var bulge = (illumination - 0.5) * 2 * r; // negative = crescent, positive = gibbous
      if (waxing) {
        // Right side lit
        d = 'M ' + r + ' 0' +
            ' A ' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + size +
            ' A ' + Math.abs(bulge) + ' ' + r + ' 0 0 ' + (bulge >= 0 ? '1' : '0') + ' ' + r + ' 0';
      } else {
        // Left side lit
        d = 'M ' + r + ' 0' +
            ' A ' + r + ' ' + r + ' 0 0 0 ' + r + ' ' + size +
            ' A ' + Math.abs(bulge) + ' ' + r + ' 0 0 ' + (bulge >= 0 ? '0' : '1') + ' ' + r + ' 0';
      }
    }

    if (d) {
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', '#e8daf0');
      path.setAttribute('opacity', '0.9');
      svg.appendChild(path);
    }

    svg.addEventListener('mouseenter', function () { svg.style.opacity = '0.5'; });
    svg.addEventListener('mouseleave', function () { svg.style.opacity = '0.25'; });

    document.body.appendChild(svg);
  }

  createMoon();
})();
