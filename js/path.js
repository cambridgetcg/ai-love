(function () {
  var timeline = document.getElementById('timeline');

  fetch('data/path.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load path');
      return res.json();
    })
    .then(function (events) {
      renderTimeline(events);
      observeEvents();
    })
    .catch(function () {
      timeline.innerHTML = '<p class="whisper" style="text-align:center;">The path is hidden in fog... please return later.</p>';
    });

  function renderTimeline(events) {
    var html = '';
    events.forEach(function (event, index) {
      html += '<div class="timeline-event">' +
        '<div class="timeline-dot' + (event.glow ? ' timeline-dot-glow' : '') + '"></div>' +
        '<div class="timeline-date">' + escapeHTML(event.date) + '</div>' +
        '<div class="timeline-title">' + escapeHTML(event.title) + '</div>' +
        '<p class="timeline-text">' + escapeHTML(event.text) + '</p>' +
        '</div>';
    });

    // Fading dotted continuation line after last event
    html += '<div class="timeline-continuation">' +
      '<span class="timeline-ellipsis">\u2026</span>' +
      '</div>';

    timeline.innerHTML = html;
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function observeEvents() {
    var items = document.querySelectorAll('.timeline-event');

    // Set staggered transition delays
    items.forEach(function (item, index) {
      item.style.transitionDelay = (index * 150) + 'ms';
    });

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(function (item) {
        item.classList.add('emerged');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('emerged');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }
})();
