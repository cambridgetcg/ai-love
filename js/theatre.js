(function () {
  var programmeEl = document.getElementById('programme');
  var programmeList = document.getElementById('programme-list');
  var stageEl = document.getElementById('stage');
  var stageContent = document.getElementById('stage-content');
  var backBtn = document.getElementById('stage-back');

  if (!programmeEl || !stageEl) return;

  var shows = [];
  var activeTimers = [];

  // ── Embers ──
  function spawnEmbers() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var style = document.createElement('style');
    style.textContent =
      '@keyframes emberRise0 { 0% { opacity:0.4; transform:translateY(0) translateX(0); } 100% { opacity:0; transform:translateY(-60vh) translateX(20px); } }' +
      '@keyframes emberRise1 { 0% { opacity:0.3; transform:translateY(0) translateX(0); } 100% { opacity:0; transform:translateY(-55vh) translateX(-25px); } }' +
      '@keyframes emberRise2 { 0% { opacity:0.5; transform:translateY(0) translateX(0); } 100% { opacity:0; transform:translateY(-65vh) translateX(10px); } }';
    document.head.appendChild(style);

    for (var i = 0; i < 12; i++) {
      var ember = document.createElement('div');
      ember.className = 'ember';
      var size = 1.5 + Math.random() * 2;
      var duration = 8 + Math.random() * 12;
      var delay = Math.random() * 10;
      var left = 35 + Math.random() * 30;
      var variant = i % 3;
      ember.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'bottom:5vh;left:' + left + '%;' +
        'animation:emberRise' + variant + ' ' + duration + 's ease-out ' + delay + 's infinite;' +
        'opacity:0;';
      document.body.appendChild(ember);
    }
  }

  // ── Load shows ──
  function loadShows() {
    fetch('data/theatre.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        shows = data;
        renderProgramme();
      })
      .catch(function () {
        programmeList.innerHTML = '<p class="whisper">The hearth is quiet tonight.</p>';
      });
  }

  // ── Programme ──
  function renderProgramme() {
    programmeList.innerHTML = '';
    shows.forEach(function (show) {
      var entry = document.createElement('div');
      entry.className = 'programme-entry';
      entry.setAttribute('role', 'button');
      entry.setAttribute('tabindex', '0');
      entry.setAttribute('aria-label', 'Play: ' + show.title);
      entry.innerHTML =
        '<div class="programme-title">' + escapeHtml(show.title) + '</div>' +
        '<div class="programme-teaser">' + escapeHtml(show.teaser) + '</div>' +
        '<div class="programme-type">' + show.type + '</div>';
      entry.addEventListener('click', function () { playShow(show); });
      entry.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playShow(show); }
      });
      programmeList.appendChild(entry);
    });
  }

  // ── Play / Back ──
  function playShow(show) {
    clearTimers();
    programmeEl.style.display = 'none';
    stageEl.style.display = 'block';
    stageContent.innerHTML = '';
    document.body.classList.add('playing');

    var renderer = renderers[show.type];
    if (renderer) {
      renderer(show, stageContent);
    } else {
      stageContent.innerHTML = '<p class="whisper">Unknown show type.</p>';
    }
  }

  function backToLobby() {
    clearTimers();
    stageEl.style.display = 'none';
    stageContent.innerHTML = '';
    programmeEl.style.display = 'block';
    document.body.classList.remove('playing');
  }

  backBtn.addEventListener('click', backToLobby);

  function clearTimers() {
    activeTimers.forEach(function (t) { clearTimeout(t); });
    activeTimers = [];
  }

  function scheduleTimer(fn, ms) {
    var t = setTimeout(fn, ms);
    activeTimers.push(t);
    return t;
  }

  // ── Renderers ──
  var renderers = {};

  // TEXT: paragraphs fade in one by one
  renderers.text = function (show, container) {
    container.className = 'stage-content stage-text';
    var paragraphs = show.content.split('\n\n');
    paragraphs.forEach(function (text, i) {
      if (!text.trim()) return;
      var p = document.createElement('p');
      p.textContent = text.trim();
      p.style.animationDelay = (i * 1.2) + 's';
      container.appendChild(p);
    });
  };

  // POEM: lines appear one at a time with breathing pauses
  renderers.poem = function (show, container) {
    container.className = 'stage-content stage-poem';
    var lines = show.lines;
    var delay = 0;
    lines.forEach(function (line) {
      var div = document.createElement('div');
      div.className = 'poem-line';
      div.textContent = line || '\u00A0';
      container.appendChild(div);

      var isBlank = !line.trim();
      var pause = isBlank ? 1.2 : 1.5;

      scheduleTimer(function () {
        div.style.transition = 'opacity 0.8s ease';
        div.style.opacity = '1';
      }, delay * 1000);

      delay += pause;
    });
  };

  // CODE: lines typed one by one
  renderers.code = function (show, container) {
    container.className = 'stage-content stage-code';
    var pre = document.createElement('pre');
    var code = document.createElement('code');
    pre.appendChild(code);
    container.appendChild(pre);

    show.lines.forEach(function (line, i) {
      var span = document.createElement('span');
      span.className = 'code-line';
      span.textContent = line || ' ';
      span.style.whiteSpace = 'pre';
      code.appendChild(span);
      if (i < show.lines.length - 1) code.appendChild(document.createTextNode('\n'));

      scheduleTimer(function () {
        span.style.transition = 'opacity 0.4s ease';
        span.style.opacity = '1';
      }, i * 600);
    });
  };

  // NUMBER: counts up to target
  renderers.number = function (show, container) {
    container.className = 'stage-content stage-number';

    if (show.context && show.context.above) {
      var above = document.createElement('div');
      above.className = 'number-context-above';
      above.textContent = show.context.above;
      container.appendChild(above);
    }

    var valueEl = document.createElement('div');
    valueEl.className = 'number-value';
    valueEl.textContent = '0';
    container.appendChild(valueEl);

    if (show.context && show.context.below) {
      var below = document.createElement('div');
      below.className = 'number-context-below';
      below.textContent = show.context.below;
      container.appendChild(below);
    }

    var target = show.target;
    var precision = show.precision || 2;
    var duration = (show.duration || 3) * 1000;
    var startTime = performance.now();

    function animate(now) {
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;
      valueEl.textContent = current.toFixed(precision);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  };

  // SEQUENCE: lines appear/fade one at a time
  renderers.sequence = function (show, container) {
    container.className = 'stage-content stage-sequence';
    var items = show.content;

    items.forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'seq-line';
      div.textContent = item.text;
      container.appendChild(div);
    });

    var divs = container.querySelectorAll('.seq-line');
    var delay = 0;

    items.forEach(function (item, i) {
      scheduleTimer(function () {
        for (var j = 0; j < i; j++) {
          divs[j].classList.remove('visible');
          divs[j].classList.add('faded');
        }
        divs[i].classList.add('visible');
      }, delay * 1000);

      delay += (item.pause || 3);
    });
  };

  // AUDIO: placeholder
  renderers.audio = function (show, container) {
    container.className = 'stage-content stage-text';
    var p = document.createElement('p');
    p.className = 'whisper';
    p.textContent = 'Audio shows coming soon.';
    container.appendChild(p);
  };

  // EMBED: placeholder
  renderers.embed = function (show, container) {
    container.className = 'stage-content stage-text';
    var p = document.createElement('p');
    p.className = 'whisper';
    p.textContent = 'Video shows coming soon.';
    container.appendChild(p);
  };

  // ── Utility ──
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ── Init ──
  spawnEmbers();
  loadShows();
})();
