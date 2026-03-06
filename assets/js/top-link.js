(function () {
  var topLink = document.getElementById('top-link');
  if (!topLink) return;

  window.onscroll = function () {
    if (document.body.scrollTop > 800 || document.documentElement.scrollTop > 800) {
      topLink.style.visibility = 'visible';
      topLink.style.opacity = '1';
    } else {
      topLink.style.visibility = 'hidden';
      topLink.style.opacity = '0';
    }
  };
})();
