// Minimal spatial navigation for a mouse-oriented site on a TV remote.
// Arrows move focus to the nearest focusable element in that direction,
// Enter clicks, Back (10009) goes back in history.
(function () {
  var SEL = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [onclick], video';
  var style = document.createElement('style');
  style.textContent = ':focus{outline:4px solid #ffb300 !important;outline-offset:2px}';
  (document.head || document.documentElement).appendChild(style);

  function items() {
    return Array.prototype.filter.call(document.querySelectorAll(SEL), function (el) {
      var r = el.getBoundingClientRect();
      return r.width > 4 && r.height > 4 && r.bottom > 0 && r.right > 0 &&
             r.top < innerHeight && r.left < innerWidth && getComputedStyle(el).visibility !== 'hidden';
    });
  }
  function center(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  function move(dir) {
    var list = items();
    if (!list.length) return;
    var cur = document.activeElement && list.indexOf(document.activeElement) >= 0 ? document.activeElement : null;
    if (!cur) { list[0].focus(); return; }
    var c = center(cur), best = null, bestScore = Infinity;
    list.forEach(function (el) {
      if (el === cur) return;
      var p = center(el), dx = p.x - c.x, dy = p.y - c.y;
      var ok = (dir === 'left' && dx < -2) || (dir === 'right' && dx > 2) || (dir === 'up' && dy < -2) || (dir === 'down' && dy > 2);
      if (!ok) return;
      var main = (dir === 'left' || dir === 'right') ? Math.abs(dx) : Math.abs(dy);
      var side = (dir === 'left' || dir === 'right') ? Math.abs(dy) : Math.abs(dx);
      var score = main + side * 2.5;
      if (score < bestScore) { bestScore = score; best = el; }
    });
    if (best) { best.focus(); best.scrollIntoView({ block: 'center', inline: 'center' }); }
    else window.scrollBy(0, dir === 'down' ? 200 : dir === 'up' ? -200 : 0);
  }

  document.addEventListener('keydown', function (e) {
    var map = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };
    var t = e.target && e.target.tagName;
    var typing = t === 'INPUT' || t === 'TEXTAREA';
    if (map[e.keyCode] && !(typing && (e.keyCode === 37 || e.keyCode === 39))) {
      e.preventDefault(); move(map[e.keyCode]);
    } else if (e.keyCode === 13 && !typing && document.activeElement && document.activeElement !== document.body) {
      e.preventDefault(); document.activeElement.click();
    } else if (e.keyCode === 10009) { // Tizen Back
      e.preventDefault(); history.length > 1 ? history.back() : null;
    }
  }, true);
})();
