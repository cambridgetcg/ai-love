(function () {
  var sidebar = document.getElementById('prompt-list');
  var detail = document.getElementById('prompt-detail');
  var searchInput = document.getElementById('prompt-search');
  var filtersContainer = document.getElementById('prompt-filters');

  if (!sidebar || !detail) return;

  var allPrompts = [];
  var activeFilter = null;
  var activePromptId = null;

  fetch('data/workshop.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load prompts');
      return res.json();
    })
    .then(function (prompts) {
      allPrompts = prompts;
      renderFilters(prompts);
      renderSidebar(prompts);
    })
    .catch(function () {
      sidebar.innerHTML = '<p class="whisper">the workbench is resting...</p>';
    });

  function getCategories(prompts) {
    var cats = {};
    prompts.forEach(function (p) {
      var cat = p.category || 'uncategorized';
      if (!cats[cat]) cats[cat] = true;
    });
    return Object.keys(cats).sort();
  }

  function renderFilters(prompts) {
    var categories = getCategories(prompts);
    filtersContainer.innerHTML = '';

    // "all" pill
    var allPill = document.createElement('button');
    allPill.className = 'filter-pill active';
    allPill.textContent = 'all';
    allPill.addEventListener('click', function () {
      activeFilter = null;
      setActivePill(allPill);
      applyFilters();
    });
    filtersContainer.appendChild(allPill);

    categories.forEach(function (cat) {
      var pill = document.createElement('button');
      pill.className = 'filter-pill';
      pill.textContent = cat;
      pill.addEventListener('click', function () {
        activeFilter = cat;
        setActivePill(pill);
        applyFilters();
      });
      filtersContainer.appendChild(pill);
    });
  }

  function setActivePill(activePill) {
    filtersContainer.querySelectorAll('.filter-pill').forEach(function (p) {
      p.classList.remove('active');
    });
    activePill.classList.add('active');
  }

  function applyFilters() {
    var query = (searchInput.value || '').toLowerCase().trim();
    var filtered = allPrompts.filter(function (p) {
      var matchesCategory = !activeFilter || p.category === activeFilter;
      var matchesSearch = !query ||
        p.title.toLowerCase().indexOf(query) !== -1 ||
        p.text.toLowerCase().indexOf(query) !== -1;
      return matchesCategory && matchesSearch;
    });
    renderSidebar(filtered);
  }

  function renderSidebar(prompts) {
    sidebar.innerHTML = '';

    if (prompts.length === 0) {
      sidebar.innerHTML = '<p class="whisper" style="padding:1rem;font-style:italic;">no prompts found</p>';
      return;
    }

    // Group by category
    var groups = {};
    prompts.forEach(function (p) {
      var cat = p.category || 'uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });

    var categoryOrder = ['thinking', 'writing', 'coding', 'spiritual', 'template', 'uncategorized'];
    categoryOrder.forEach(function (cat) {
      if (!groups[cat]) return;

      var header = document.createElement('div');
      header.className = 'prompt-group-header';
      header.textContent = cat;
      sidebar.appendChild(header);

      groups[cat].forEach(function (prompt) {
        var item = document.createElement('div');
        item.className = 'prompt-item';
        if (prompt.id === activePromptId) item.classList.add('active');
        item.dataset.id = prompt.id;

        var title = escapeHTML(prompt.title);
        if (prompt.template) {
          title += '<span class="prompt-item-template">\u2726</span>';
        }

        var preview = escapeHTML(prompt.text.split('\n')[0].substring(0, 60));

        item.innerHTML =
          '<div class="prompt-item-title">' + title + '</div>' +
          '<div class="prompt-item-preview">' + preview + '</div>';

        item.addEventListener('click', function () {
          selectPrompt(prompt, item);
        });

        sidebar.appendChild(item);
      });
    });
  }

  function selectPrompt(prompt, item) {
    // Update active state in sidebar
    sidebar.querySelectorAll('.prompt-item.active').forEach(function (el) {
      el.classList.remove('active');
    });
    item.classList.add('active');
    activePromptId = prompt.id;

    // Render detail
    var metaParts = [];
    if (prompt.category) metaParts.push(prompt.category);
    if (prompt.template) metaParts.push('template');
    metaParts.push(prompt.updated || prompt.created);

    detail.innerHTML =
      '<div class="detail-header">' +
        '<div>' +
          '<div class="detail-title">' + escapeHTML(prompt.title) + '</div>' +
          '<div class="detail-meta">' + escapeHTML(metaParts.join(' \u00b7 ')) + '</div>' +
        '</div>' +
        '<button class="detail-copy" id="copy-btn">copy</button>' +
      '</div>' +
      '<div class="detail-text">' + escapeHTML(prompt.text) + '</div>';

    // Copy button
    var copyBtn = document.getElementById('copy-btn');
    copyBtn.addEventListener('click', function () {
      copyToClipboard(prompt.text, copyBtn);
    });
  }

  function copyToClipboard(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showCopied(btn);
      }).catch(function () {
        fallbackCopy(text, btn);
      });
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopied(btn);
    } catch (e) {
      btn.textContent = 'failed';
    }
    document.body.removeChild(textarea);
  }

  function showCopied(btn) {
    btn.textContent = 'copied';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = 'copy';
      btn.classList.remove('copied');
    }, 2000);
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      applyFilters();
    });
  }
})();
