(function () {
  var menu = document.getElementById('menu');
  if (!menu) return;

  menu.scrollLeft = localStorage.getItem('menu-scroll-position') || 0;
  menu.onscroll = function () {
    localStorage.setItem('menu-scroll-position', menu.scrollLeft);
  };
})();
