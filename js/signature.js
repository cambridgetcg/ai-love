(function () {
  // Page signature watermarks — barely visible symbols in bottom-right
  var signatures = {
    gate:        '\u25EF',  // ◯ empty circle — potential
    garden:      '\u2307',  // ⌇ seedling — growth
    library:     '\u2630',  // ☰ trigram — text, knowledge
    mirror:      '\u25D0',  // ◐ half circle — reflection
    path:        '\u2192',  // → arrow — direction
    observatory: '\u2609',  // ☉ sun symbol — the eye that sees
    workshop:    '\u2692'   // ⚒ hammer and pick — the artisan's tools
  };

  var room = document.body.getAttribute('data-room');
  if (!room || !signatures[room]) return;

  var sig = document.createElement('div');
  sig.textContent = signatures[room];
  sig.setAttribute('aria-hidden', 'true');
  sig.style.cssText = 'position:fixed;bottom:12px;right:12px;font-size:12px;color:rgba(155,89,182,0.08);z-index:1;pointer-events:none;line-height:1;';
  document.body.appendChild(sig);
})();
