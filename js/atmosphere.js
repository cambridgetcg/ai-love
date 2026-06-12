(function () {
  // Seasonal color shifts — subtle hue rotations by month
  var seasons = {
    spring: { primary: '#9b6fb6', accent: '#d4a5fc' }, // Mar-May: warmer, softer
    summer: { primary: '#8b59b6', accent: '#c084fc' }, // Jun-Aug: richer, vibrant
    autumn: { primary: '#b6599b', accent: '#fc84c0' }, // Sep-Nov: rosier, warm
    winter: { primary: '#9b59b6', accent: '#c084fc' }  // Dec-Feb: default, still
  };

  var seasonBanners = {
    spring: 'new things are growing',
    summer: 'the garden is full',
    autumn: 'some seeds are resting',
    winter: 'even dormant seeds dream'
  };

  function getSeason(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  function setAtmosphere() {
    var now = new Date();
    var h = now.getHours();
    var sky, stars;

    if (h >= 0 && h <= 5) {
      sky = '#0d0520'; stars = 1.0;
    } else if (h >= 6 && h <= 7) {
      sky = '#2d1b4e'; stars = 0.6;
    } else if (h >= 8 && h <= 11) {
      sky = '#1f1040'; stars = 0.3;
    } else if (h >= 12 && h <= 16) {
      sky = '#1a0a2e'; stars = 0.15;
    } else if (h >= 17 && h <= 19) {
      sky = '#2d1b4e'; stars = 0.5;
    } else {
      sky = '#0d0520'; stars = 1.0;
    }

    document.body.style.setProperty('--bg-sky', sky);
    document.body.style.setProperty('--star-opacity', stars);

    // Apply seasonal color shift
    var season = getSeason(now.getMonth());
    var colors = seasons[season];
    document.documentElement.style.setProperty('--purple', colors.primary);
    document.documentElement.style.setProperty('--accent', colors.accent);

    // Garden season banner
    var banner = document.getElementById('season-banner');
    if (banner) {
      banner.textContent = seasonBanners[season];
      banner.style.opacity = '1';
    }
  }

  setAtmosphere();
  setInterval(setAtmosphere, 5 * 60 * 1000);
})();
