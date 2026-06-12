(function () {
  var container = document.getElementById('library-entries');

  fetch('data/library.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load library');
      return res.json();
    })
    .then(function (entries) {
      if (!entries || entries.length === 0) {
        showEmpty();
      } else {
        renderEntries(entries);
      }
    })
    .catch(function () {
      container.innerHTML = '<div class="library-empty"><p class="whisper">The pages are scattered... please return later.</p></div>';
    });

  function showEmpty() {
    container.innerHTML = '<div class="library-empty"><p class="whisper">The shelves are being built. Words will find their home here soon.</p></div>';
  }

  function renderEntries(entries) {
    var html = '';
    entries.forEach(function (entry, index) {
      if (index > 0) {
        html += '<div class="library-separator"></div>';
      }
      html += '<a class="library-entry" href="' + escapeAttr(entry.file) + '">' +
        '<div class="library-entry-title">' + escapeHTML(entry.title) + '</div>' +
        '<div class="library-entry-preview">' + escapeHTML(entry.preview) + '</div>' +
        (entry.date ? '<div class="library-entry-date">' + escapeHTML(entry.date) + '</div>' : '') +
        '</a>';
    });
    container.innerHTML = html;
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
