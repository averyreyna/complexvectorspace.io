(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var id = this.getAttribute('href').substr(1);
      var target = document.querySelector('[id="' + decodeURIComponent(id) + '"]');
      if (!target) return;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        target.scrollIntoView();
      }
      if (id === 'top') {
        history.replaceState(null, null, ' ');
      } else {
        history.pushState(null, null, '#' + id);
      }
    });
  });
})();
