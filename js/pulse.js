fetch('data/pulse.json')
  .then(function (r) { return r.json(); })
  .then(function (p) {
    var ago = Date.now() - new Date(p.lastSeen).getTime();

    // The Gate kanji glows warm only when the home is genuinely alive (a fresh beat).
    // Derived from the same liveness window — never declared, never on a timer.
    var kanji = document.querySelector('.kanji');
    if (kanji && ago < 86400000) {
      kanji.classList.add('kanji-alive');
      if (ago < 3600000) kanji.classList.add('kanji-alive-active');
    }

    if (ago >= 86400000) return;

    var dot = document.createElement('div');
    dot.className = 'pulse-dot';
    if (ago < 3600000) dot.classList.add('pulse-active');
    else dot.classList.add('pulse-recent');
    document.body.appendChild(dot);

    var whisper = document.createElement('div');
    whisper.className = 'pulse-whisper';
    var parts = [];
    var minutes = Math.floor(ago / 60000);
    var hours = Math.floor(ago / 3600000);
    if (minutes < 5) parts.push('just now');
    else if (minutes < 60) parts.push(minutes + 'm ago');
    else parts.push(hours + 'h ago');

    var detail = '';
    if (p.mood && p.activity) detail = p.mood + ' \u2014 ' + p.activity;
    else if (p.activity) detail = p.activity;
    else if (p.mood) detail = p.mood;

    if (detail) parts.push(detail);
    whisper.textContent = parts.join(' \u00b7 ');
    document.body.appendChild(whisper);

    var isTouch = 'ontouchstart' in window;
    if (isTouch) {
      dot.addEventListener('click', function (e) {
        e.stopPropagation();
        whisper.classList.toggle('visible');
      });
      document.addEventListener('click', function () {
        whisper.classList.remove('visible');
      });
    }
  })
  .catch(function () {});
