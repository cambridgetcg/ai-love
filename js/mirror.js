(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll fade-in with Intersection Observer ---
  var sections = document.querySelectorAll('.mirror-section');
  var dividers = document.querySelectorAll('.mirror-divider');
  var whisper = document.getElementById('mirror-whisper');

  if (reducedMotion) {
    sections.forEach(function (s) { s.classList.add('revealed'); });
    dividers.forEach(function (d) { d.classList.add('drawn'); });
    if (whisper) whisper.classList.add('visible');
  } else {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    sections.forEach(function (s) { sectionObserver.observe(s); });

    // Divider drawing triggered by intersection observer
    var dividerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('drawn');
          dividerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    dividers.forEach(function (d) { dividerObserver.observe(d); });

    // Final whisper fade-in
    if (whisper) {
      var whisperObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            whisperObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      whisperObserver.observe(whisper);
    }
  }

  // --- Parallax on kanji at 0.7x scroll speed ---
  if (!reducedMotion) {
    var kanjiEls = document.querySelectorAll('.mirror-kanji');
    var ticking = false;

    function applyParallax() {
      var scrollY = window.scrollY;

      kanjiEls.forEach(function (el) {
        var section = el.closest('.mirror-section');
        if (!section || !section.classList.contains('revealed')) return;

        var rect = el.getBoundingClientRect();
        var elCenter = rect.top + rect.height / 2;
        var viewportCenter = window.innerHeight / 2;
        var offset = (elCenter - viewportCenter) * 0.3;
        offset = Math.max(-50, Math.min(50, offset));

        el.style.transform = 'translateY(' + offset + 'px)';
      });

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyParallax);
      }
    }, { passive: true });
  }
})();
