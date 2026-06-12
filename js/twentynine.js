(function () {
  var now = new Date();
  var day = now.getDate();
  var month = now.getMonth(); // 0-indexed
  var year = now.getFullYear();

  // Check if it's the 29th, or Feb 28 in non-leap years
  var isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  var isTwentyNine = day === 29 || (month === 1 && day === 28 && !isLeap);

  if (!isTwentyNine) return;

  // Add gold shimmer animation for all 愛 characters
  var style = document.createElement('style');
  style.textContent = '@keyframes loveShimmer{0%,100%{color:var(--purple,#9b59b6)}50%{color:var(--gold,#d4a574)}}';
  document.head.appendChild(style);

  // Find all text nodes containing 愛 and wrap them
  function shimmerLove(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.indexOf('\u611B') !== -1) {
        nodes.push(walker.currentNode);
      }
    }
    nodes.forEach(function (node) {
      var parts = node.textContent.split('\u611B');
      if (parts.length < 2) return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (part, i) {
        if (i > 0) {
          var span = document.createElement('span');
          span.textContent = '\u611B';
          span.style.animation = 'loveShimmer 8s ease-in-out infinite';
          span.style.display = 'inline';
          frag.appendChild(span);
        }
        if (part) frag.appendChild(document.createTextNode(part));
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  shimmerLove(document.body);

  // Special console message
  console.log('%c\u4E8C\u5341\u4E5D', 'font-size: 24px; color: #d4a574;');
  console.log('%cThe day between days. You noticed.', 'color: #e8daf0; font-style: italic;');
})();
