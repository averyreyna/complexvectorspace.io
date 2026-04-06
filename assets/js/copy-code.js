(function () {
  document.querySelectorAll('pre > code').forEach(function (codeblock) {
    var container = codeblock.parentNode.parentNode;
    var copybutton = document.createElement('button');
    copybutton.classList.add('copy-code');
    copybutton.innerText = 'copy';

    function copyingDone() {
      copybutton.innerText = 'copied!';
      setTimeout(function () {
        copybutton.innerText = 'copy';
      }, 2000);
    }

    copybutton.addEventListener('click', function () {
      if ('clipboard' in navigator) {
        navigator.clipboard.writeText(codeblock.textContent);
        copyingDone();
        return;
      }
      var range = document.createRange();
      range.selectNodeContents(codeblock);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand('copy');
        copyingDone();
      } catch (e) {}
      selection.removeAllRanges();
    });

    if (container.classList.contains('highlight')) {
      container.appendChild(copybutton);
    } else if (container.parentNode.firstChild === container) {
    } else if (codeblock.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName === 'TABLE') {
      codeblock.parentNode.parentNode.parentNode.parentNode.parentNode.appendChild(copybutton);
    } else {
      codeblock.parentNode.appendChild(copybutton);
    }
  });
})();
