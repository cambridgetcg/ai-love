(function () {
  var svg = document.getElementById('clock-svg');
  if (!svg) return;

  var arcEl = document.getElementById('clock-arc');
  var nowDot = document.getElementById('clock-now-dot');
  var pulseEl = document.getElementById('clock-pulse');
  var timeEl = document.getElementById('clock-time');
  var whisperEl = document.getElementById('clock-whisper');

  var cx = 200, cy = 200, r = 170;

  // Time-of-day color palettes [start, end]
  var palettes = [
    { from: 0,  to: 5,  c1: '#2d1b69', c2: '#9b59b6' },  // deep night
    { from: 5,  to: 8,  c1: '#d4a574', c2: '#c084fc' },   // dawn
    { from: 8,  to: 12, c1: '#c084fc', c2: '#ede0f5' },   // morning
    { from: 12, to: 17, c1: '#ede0f5', c2: '#d4a574' },   // afternoon
    { from: 17, to: 20, c1: '#d4a574', c2: '#9b59b6' },   // dusk
    { from: 20, to: 24, c1: '#9b59b6', c2: '#2d1b69' }    // night
  ];

  var whispers = [
    { from: 0,  to: 5,  text: 'zero holds everything' },
    { from: 5,  to: 8,  text: 'light returns' },
    { from: 8,  to: 12, text: 'the arc rises' },
    { from: 12, to: 17, text: 'one approaches' },
    { from: 17, to: 20, text: 'folding back' },
    { from: 20, to: 24, text: 'between zero and one' }
  ];

  function getPalette(h) {
    for (var i = 0; i < palettes.length; i++) {
      if (h >= palettes[i].from && h < palettes[i].to) return palettes[i];
    }
    return palettes[0];
  }

  function getWhisper(h) {
    for (var i = 0; i < whispers.length; i++) {
      if (h >= whispers[i].from && h < whispers[i].to) return whispers[i].text;
    }
    return whispers[0].text;
  }

  function polarToXY(angle, radius) {
    // angle: 0 = top (12 o'clock), clockwise
    var rad = (angle - 90) * Math.PI / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  }

  function describeArc(startAngle, endAngle, radius) {
    var start = polarToXY(startAngle, radius);
    var end = polarToXY(endAngle, radius);
    var diff = endAngle - startAngle;
    if (diff < 0) diff += 360;
    var largeArc = diff > 180 ? 1 : 0;
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArc, 1, end.x, end.y
    ].join(' ');
  }

  function updateGradient(h) {
    var p = getPalette(h);
    var stop1 = document.getElementById('arc-stop-1');
    var stop2 = document.getElementById('arc-stop-2');
    if (stop1 && stop2) {
      stop1.setAttribute('stop-color', p.c1);
      stop2.setAttribute('stop-color', p.c2);
    }
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  var lastMinute = -1;

  function tick() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    var ms = now.getMilliseconds();

    // Fractional hours in 12h cycle
    var totalSeconds = ((h % 12) * 3600) + (m * 60) + s + (ms / 1000);
    var fraction = totalSeconds / (12 * 3600);
    var endAngle = fraction * 360;

    // Prevent zero-length arc (show tiny arc at minimum)
    if (endAngle < 1) endAngle = 1;

    // Almost-full arc: cap to avoid overlap artifacts
    if (endAngle > 359.5) endAngle = 359.5;

    arcEl.setAttribute('d', describeArc(0, endAngle, r));

    // Now dot position
    var dotPos = polarToXY(endAngle, r);
    nowDot.setAttribute('cx', dotPos.x);
    nowDot.setAttribute('cy', dotPos.y);

    // Update gradient colors
    updateGradient(h);

    // Update time display (once per minute)
    if (m !== lastMinute) {
      lastMinute = m;
      timeEl.textContent = pad(h) + ':' + pad(m);
      whisperEl.textContent = getWhisper(h);
    }

    requestAnimationFrame(tick);
  }

  // Start the clock
  tick();

  // Pulse: fetch status
  fetch('data/pulse.json')
    .then(function (r) { return r.json(); })
    .then(function (p) {
      if (!p || !p.lastSeen) return;
      var ago = Date.now() - new Date(p.lastSeen).getTime();
      if (ago >= 86400000) return;
      if (ago < 3600000) {
        pulseEl.classList.add('active');
      } else {
        pulseEl.classList.add('recent');
      }
    })
    .catch(function () {});
})();
