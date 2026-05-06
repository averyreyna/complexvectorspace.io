(function () {
  var container = document.getElementById('post-nav');
  if (!container) return;

  var path = window.location.pathname;
  if (!path.endsWith('/')) path += '/';

  fetch('/index.json')
    .then(function (r) { return r.json(); })
    .then(function (posts) {
      var i = -1;
      for (var j = 0; j < posts.length; j++) {
        var p = posts[j].permalink || '';
        if (!p.endsWith('/')) p += '/';
        if (p === path) { i = j; break; }
      }
      if (i < 0) return;

      var prevPost = i + 1 < posts.length ? posts[i + 1] : null;
      var nextPost = i - 1 >= 0 ? posts[i - 1] : null;

      if (!prevPost && !nextPost) return;

      var html = '';
      if (prevPost) {
        html += '<a class="post-nav-prev" href="' + prevPost.permalink + '"><span aria-hidden="true">←</span> ' + escapeHtml(prevPost.title) + '</a>';
      } else {
        html += '<span class="post-nav-prev"></span>';
      }
      if (nextPost) {
        html += '<a class="post-nav-next" href="' + nextPost.permalink + '">' + escapeHtml(nextPost.title) + ' <span aria-hidden="true">→</span></a>';
      } else {
        html += '<span class="post-nav-next"></span>';
      }

      container.innerHTML = html;
      container.style.display = 'flex';
    })
    .catch(function () {});

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
