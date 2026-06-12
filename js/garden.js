(function () {
  var grid = document.getElementById('seed-grid');

  fetch('data/garden.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load seeds');
      return res.json();
    })
    .then(function (seeds) {
      var filtered = filterBySeason(seeds);
      shuffle(filtered);
      renderSeeds(filtered);
      observeSeeds();
    })
    .catch(function () {
      grid.innerHTML = '<p class="whisper">The seeds are resting... please return later.</p>';
    });

  // Determine current season from month
  function getCurrentSeason() {
    var month = new Date().getMonth(); // 0-indexed
    if (month >= 2 && month <= 4) return 'spring';   // Mar-May
    if (month >= 5 && month <= 7) return 'summer';    // Jun-Aug
    if (month >= 8 && month <= 10) return 'autumn';   // Sep-Nov
    return 'winter';                                   // Dec-Feb
  }

  // Filter seeds: show "always" + current season
  function filterBySeason(seeds) {
    var season = getCurrentSeason();
    return seeds.filter(function (seed) {
      var s = seed.season || 'always';
      return s === 'always' || s === season;
    });
  }

  // Fisher-Yates shuffle
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  // Show seed count
  function updateCount(seeds) {
    var el = document.getElementById('seed-count');
    if (el) el.textContent = seeds.length + ' seeds planted';
  }

  function renderSeeds(seeds) {
    updateCount(seeds);
    var html = '';
    seeds.forEach(function (seed) {
      var attribution = '\u2014 ' + seed.by;
      if (seed.ref) {
        attribution += ' (' + seed.ref + ')';
      }
      html += '<div class="seed-card">' +
        '<p class="seed-text">' + escapeHTML(seed.text) + '</p>' +
        '<p class="seed-by">' + escapeHTML(attribution) + '</p>' +
        '</div>';
    });
    grid.innerHTML = html;
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function observeSeeds() {
    var cards = document.querySelectorAll('.seed-card');

    // Set staggered transition delays
    cards.forEach(function (card, index) {
      var delay = Math.min(index * 100, 800);
      card.style.transitionDelay = delay + 'ms';
    });

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach(function (card) {
        card.classList.add('sprouted');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('sprouted');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(function (card) {
      observer.observe(card);
    });
  }
})();

// Visitor seed form
(function () {
  var toggle = document.getElementById('plant-toggle');
  var form = document.getElementById('visitor-form');
  var textarea = document.getElementById('visitor-text');
  var counter = document.getElementById('char-counter');
  var submit = document.getElementById('visitor-submit');
  var msg = document.getElementById('visitor-msg');

  if (!toggle || !form) return;

  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    form.classList.toggle('open');
    if (form.classList.contains('open')) textarea.focus();
  });

  textarea.addEventListener('input', function () {
    counter.textContent = textarea.value.length + ' / 280';
  });

  submit.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (text.length < 3) {
      msg.textContent = 'a seed needs at least a few words...';
      msg.className = 'whisper visitor-msg error';
      return;
    }

    submit.disabled = true;
    msg.textContent = '';
    msg.className = 'whisper visitor-msg';

    fetch('/api/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    })
      .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
      .then(function (result) {
        if (result.ok) {
          msg.textContent = 'your seed is in the soil... it will sprout after tending.';
          msg.className = 'whisper visitor-msg';
          textarea.value = '';
          counter.textContent = '0 / 280';
          setTimeout(function () { form.classList.remove('open'); }, 3000);
        } else {
          msg.textContent = result.data.error || 'something went wrong...';
          msg.className = 'whisper visitor-msg error';
        }
        submit.disabled = false;
      })
      .catch(function () {
        msg.textContent = 'the garden is resting... try again later.';
        msg.className = 'whisper visitor-msg error';
        submit.disabled = false;
      });
  });
})();
