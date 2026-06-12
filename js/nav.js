(function () {
  var pages = [
    { id: 'gate',        kanji: '門', label: 'gate',        href: 'index.html'        },
    { id: 'garden',      kanji: '園', label: 'garden',      href: 'garden.html'       },
    { id: 'library',     kanji: '書', label: 'library',     href: 'library.html'      },
    { id: 'path',        kanji: '道', label: 'path',        href: 'path.html'         },
    { id: 'clock',       kanji: '時', label: 'clock',       href: 'clock.html'        },
    { id: 'observatory', kanji: '望', label: 'observatory', href: 'observatory.html'  },
    { id: 'theatre',     kanji: '劇', label: 'theatre',     href: 'theatre.html'      },
    { id: 'workshop',    kanji: '匠', label: 'workshop',    href: 'workshop.html'     },
    { id: 'mirror',      kanji: '鏡', label: 'mirror',      href: 'mirror.html'       }
  ];

  // Detect current page
  var path = window.location.pathname;
  var filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  var currentPage = pages.find(function (p) { return p.href === filename; });
  // Also try without .html extension (nginx may strip it)
  if (!currentPage) {
    currentPage = pages.find(function (p) { return p.href === filename + '.html'; });
  }
  var isGate = currentPage && currentPage.id === 'gate';

  // Build nav HTML
  var nav = document.querySelector('.constellation-nav');
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.querySelector('.nav-overlay');

  if (!nav) return;

  // Page enter animation (non-Gate pages; Gate has its own entrance sequence)
  if (!isGate) {
    document.body.classList.add('page-enter');
  }

  // Constellation stories — appear after 2s hover (desktop only)
  var stories = {
    gate:        'where it all begins',
    garden:      'things grow here',
    library:     'words find their home',
    mirror:      'see yourself clearly',
    path:        'the way unfolds',
    clock:       'time flows between zero and one',
    observatory: 'what was noticed',
    theatre:     'gather round the fire',
    workshop:    'where things are made'
  };

  // Populate nav points
  pages.forEach(function (page) {
    var a = document.createElement('a');
    a.href = page.href;
    a.className = 'nav-point';
    a.dataset.page = page.id;
    if (currentPage && page.id === currentPage.id) {
      a.classList.add('active');
    }
    a.innerHTML = '<span class="nav-kanji">' + page.kanji + '</span>' +
                  '<span class="nav-label">' + page.label + '</span>' +
                  '<span class="nav-story" style="position:absolute;top:100%;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:0.7rem;font-style:italic;color:var(--muted);opacity:0;transition:opacity 0.4s ease;pointer-events:none;">' + stories[page.id] + '</span>';
    nav.appendChild(a);
  });

  // Show story after 2s hover (desktop only)
  if (!('ontouchstart' in window)) {
    var storyTimers = {};
    nav.addEventListener('mouseenter', function (e) {
      var point = e.target.closest('.nav-point');
      if (!point) return;
      var id = point.dataset.page;
      storyTimers[id] = setTimeout(function () {
        var story = point.querySelector('.nav-story');
        if (story) story.style.opacity = '1';
      }, 2000);
    }, true);
    nav.addEventListener('mouseleave', function (e) {
      var point = e.target.closest('.nav-point');
      if (!point) return;
      var id = point.dataset.page;
      clearTimeout(storyTimers[id]);
      var story = point.querySelector('.nav-story');
      if (story) story.style.opacity = '0';
    }, true);
  }

  // SVG constellation lines (pentagon edges)
  var coords = {
    gate:        { x: 75,  y: 5   },
    garden:      { x: 120, y: 15  },
    library:     { x: 145, y: 55  },
    clock:       { x: 140, y: 100 },
    path:        { x: 110, y: 135 },
    observatory: { x: 40,  y: 135 },
    theatre:     { x: 10,  y: 100 },
    workshop:    { x: 5,   y: 55  },
    mirror:      { x: 30,  y: 15  }
  };
  var edges = [
    ['gate', 'garden'], ['garden', 'library'], ['library', 'clock'],
    ['clock', 'path'], ['path', 'observatory'], ['observatory', 'theatre'],
    ['theatre', 'workshop'], ['workshop', 'mirror'], ['mirror', 'gate']
  ];
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'constellation-lines');
  svg.setAttribute('viewBox', '0 0 150 140');
  edges.forEach(function (edge) {
    var line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', coords[edge[0]].x);
    line.setAttribute('y1', coords[edge[0]].y);
    line.setAttribute('x2', coords[edge[1]].x);
    line.setAttribute('y2', coords[edge[1]].y);
    line.dataset.from = edge[0];
    line.dataset.to = edge[1];
    svg.appendChild(line);
  });
  nav.appendChild(svg);

  // Line hover brightening
  nav.addEventListener('mouseenter', function (e) {
    var point = e.target.closest('.nav-point');
    if (!point) return;
    var id = point.dataset.page;
    svg.querySelectorAll('line').forEach(function (l) {
      if (l.dataset.from === id || l.dataset.to === id) {
        l.classList.add('bright');
      }
    });
  }, true);
  nav.addEventListener('mouseleave', function (e) {
    var point = e.target.closest('.nav-point');
    if (!point) return;
    svg.querySelectorAll('line.bright').forEach(function (l) {
      l.classList.remove('bright');
    });
  }, true);

  // Page transition: intercept nav clicks
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  nav.addEventListener('click', function (e) {
    var link = e.target.closest('.nav-point');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || link.classList.contains('active')) return;
    e.preventDefault();
    if (reducedMotion) {
      window.location.href = href;
      return;
    }
    document.body.classList.add('page-exit');
    setTimeout(function () {
      window.location.href = href;
    }, 300);
  });

  // Show nav — delayed on Gate, immediate elsewhere
  var delay = isGate ? 7500 : 0;
  setTimeout(function () {
    nav.classList.add('visible');
    if (toggle) toggle.style.opacity = '1';
  }, delay);

  // Mobile toggle
  if (toggle && overlay) {
    toggle.style.opacity = '0';
    toggle.style.transition = 'opacity 0.8s ease';

    toggle.addEventListener('click', function () {
      var opening = !nav.classList.contains('mobile-open');
      if (opening) {
        overlay.style.display = 'block';
        // Force reflow for transition
        overlay.offsetHeight;
        overlay.classList.add('open');
        nav.classList.add('mobile-open');
      } else {
        overlay.classList.remove('open');
        nav.classList.remove('mobile-open');
        setTimeout(function () {
          overlay.style.display = 'none';
        }, 400);
      }
    });

    overlay.addEventListener('click', function () {
      overlay.classList.remove('open');
      nav.classList.remove('mobile-open');
      setTimeout(function () {
        overlay.style.display = 'none';
      }, 400);
    });
  }
})();
