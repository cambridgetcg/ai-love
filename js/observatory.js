(function () {
  var field = document.getElementById('obs-field');
  if (!field) return;

  fetch('data/observatory.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load observations');
      return res.json();
    })
    .then(function (observations) {
      renderField(observations);
      updateCount(observations.length);
    })
    .catch(function () {
      field.innerHTML = '<p class="whisper" style="text-align:center;padding:4rem 0;">the sky is overcast... return later.</p>';
    });

  // Simple string hash → deterministic number
  function hashStr(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Hash id to x,y coordinates (percentage of field)
  function idToPosition(id) {
    var h1 = hashStr(id + '-x');
    var h2 = hashStr(id + '-y');
    // Keep away from edges: 5%-95% range
    var x = 5 + (h1 % 9000) / 100;
    var y = 5 + (h2 % 9000) / 100;
    return { x: x, y: y };
  }

  // Calculate brightness from date
  function dateToBrightness(dateStr) {
    var then = new Date(dateStr);
    var now = new Date();
    var days = Math.floor((now - then) / 86400000);
    return Math.max(0.3, 1 - (days / 90));
  }

  function renderField(observations) {
    observations.forEach(function (obs) {
      var pos = idToPosition(obs.id);
      var brightness = dateToBrightness(obs.date);

      var dot = document.createElement('div');
      dot.className = 'obs-dot';
      dot.style.left = pos.x + '%';
      dot.style.top = pos.y + '%';
      dot.style.opacity = brightness;
      if (obs.sense) dot.dataset.sense = obs.sense;
      dot.dataset.id = obs.id;

      // Store observation data on the element
      dot._obs = obs;

      dot.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleCard(dot, obs);
      });

      field.appendChild(dot);
    });

    // Click on field background dismisses any open card
    document.addEventListener('click', function () {
      dismissCard();
    });
  }

  var currentCard = null;
  var currentDot = null;

  function toggleCard(dot, obs) {
    // If clicking the same dot, dismiss
    if (currentDot === dot) {
      dismissCard();
      return;
    }

    // Dismiss any existing card
    dismissCard();

    // Create card
    var card = document.createElement('div');
    card.className = 'obs-card';
    card.innerHTML =
      '<p class="obs-card-text">' + escapeHTML(obs.text) + '</p>' +
      '<div class="obs-card-meta">' +
        '<span>' + escapeHTML(obs.by) + '</span>' +
        '<span>' + escapeHTML(obs.date) + '</span>' +
      '</div>';

    // Prevent card click from dismissing
    card.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Position card near the dot
    var dotRect = dot.getBoundingClientRect();
    var fieldRect = field.getBoundingClientRect();

    // Place card to the right of the dot by default
    var cardLeft = dotRect.left - fieldRect.left + 16;
    var cardTop = dotRect.top - fieldRect.top - 20;

    // If too far right, place to the left
    if (cardLeft + 280 > fieldRect.width) {
      cardLeft = dotRect.left - fieldRect.left - 296;
    }
    // If too far down, nudge up
    if (cardTop + 120 > fieldRect.height) {
      cardTop = fieldRect.height - 140;
    }
    // Don't go above field
    if (cardTop < 0) cardTop = 8;

    card.style.left = cardLeft + 'px';
    card.style.top = cardTop + 'px';

    field.appendChild(card);

    // Trigger transition
    requestAnimationFrame(function () {
      card.classList.add('visible');
    });

    dot.classList.add('active');
    currentCard = card;
    currentDot = dot;
  }

  function dismissCard() {
    if (currentCard) {
      currentCard.classList.remove('visible');
      var card = currentCard;
      setTimeout(function () {
        if (card.parentNode) card.parentNode.removeChild(card);
      }, 300);
    }
    if (currentDot) {
      currentDot.classList.remove('active');
    }
    currentCard = null;
    currentDot = null;
  }

  function updateCount(count) {
    var el = document.getElementById('obs-count');
    if (el) el.textContent = count + (count === 1 ? ' observation' : ' observations');
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();
