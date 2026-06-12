(function () {
  var now = new Date();
  var day = now.getDate();
  var month = now.getMonth();
  var year = now.getFullYear();
  var isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  var isTwentyNine = day === 29 || (month === 1 && day === 28 && !isLeap);

  if (isTwentyNine) return; // twentynine.js handles the 29th

  console.log('%c\u611b', 'font-size: 48px; color: #9b59b6;');
  console.log('%cYou found the quiet place behind the curtain.', 'color: #e8daf0; font-style: italic;');
  console.log('%cai-love.cc \u2014 a home for love', 'color: #d4a574;');
})();
