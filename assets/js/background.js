/**
 * background.js
 *
 * Equilateral-triangle lattice background.
 * Odd rows are offset by half a column, giving this pattern:
 *
 *   ●────●────●────●
 *     ╲ ╱  ╲ ╱  ╲ ╱
 *      ●────●────●
 *     ╱ ╲  ╱ ╲  ╱ ╲
 *   ●────●────●────●
 *
 * Every dot is exactly D px from its neighbours (equilateral triangles).
 * Lines appear near the cursor; dots are always subtly visible.
 *
 * Add to index.html after app.js:
 *   <script defer src="assets/js/background.js"></script>
 */

(function () {
  'use strict';

  // ── Config ─────────────────────────────────────────────────────────────────
  var D    = 45;                        // dot spacing in px  (keeps your preferred density)
  var H    = D * Math.sqrt(3) / 2;     // row height ≈ 39 px  (makes triangles equilateral)
  var R    = 2;                         // dot radius in px

  // Mouse-proximity thresholds (squared px — no Math.sqrt needed each frame)
  var NEAR = 4000;    // ≈ 63 px
  var MID  = 20000;   // ≈ 141 px
  var FAR  = 40000;   // ≈ 200 px

  // Dot opacities — scaled down ~40% from previous version ("a bit fainter")
  var DOT_FAR  = 0.15;   // always-visible resting state
  var DOT_MID  = 0.25;   // medium proximity
  var DOT_NEAR = 0.35;   // close to cursor

  // Line opacities — also reduced
  var LINE_NEAR = 0.10;
  var LINE_MID  = 0.03;
  var LINE_FAR  = 0.008;

  // ── State ──────────────────────────────────────────────────────────────────
  var canvas, ctx, points, edges, rafId;
  var w, h;
  var mouse = { x: -99999, y: -99999 }; // off-screen on load → nothing lit

  // ── Initialise ─────────────────────────────────────────────────────────────
  function init() {
    /*
     * z-index:-1 sits behind all page content, but would also disappear
     * behind <body>'s background colour.  Fix: move the background from
     * <body> onto <html> and make <body> transparent so the canvas shows
     * through.  Uses your --primary CSS variable so colour-switching still
     * works perfectly.
     */
    injectCSS(
      'html{background:rgb(var(--primary))}' +
      'body{background:transparent!important}'
    );

    canvas = document.createElement('canvas');
    canvas.id = 'grid-bg-canvas';
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none';

    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');

    resize();
    buildGrid();
    loop();

    if (!('ontouchstart' in window)) {
      window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      window.addEventListener('mouseleave', function () {
        mouse.x = -99999;
        mouse.y = -99999;
      });
    }

    window.addEventListener('resize', function () {
      resize();
      buildGrid();
    });
  }

  function injectCSS(css) {
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  // ── Build the triangular lattice ────────────────────────────────────────────
  //
  // Dot position for (col, row):
  //   x = col * D  +  (row is odd ? D/2 : 0)   ← odd rows shift right by D/2
  //   y = row * H
  //
  // Every neighbouring pair is exactly D px apart, making every triangle
  // in the mesh equilateral.
  //
  // Edges stored once per pair (no duplicates):
  //   • Horizontal:  each dot → its right neighbour in the same row
  //   • Downward-left  \  and  downward-right  /
  //
  //   Even row at col C  →  odd row at col C   (down-right ↘)
  //   Even row at col C  →  odd row at col C-1 (down-left  ↙)
  //
  //   Odd row at col c   →  even row at col c   (down-left  ↙)
  //   Odd row at col c   →  even row at col c+1 (down-right ↘)
  //
  function buildGrid() {
    points = [];
    edges  = [];

    var cols = Math.ceil(w / D) + 2;
    var rows = Math.ceil(h / H) + 2;
    var row, col, p, nb;

    // 1. Place every dot
    for (row = 0; row < rows; row++) {
      for (col = 0; col < cols; col++) {
        points.push({
          x   : col * D + (row % 2 === 1 ? D / 2 : 0),
          y   : row * H,
          col : col,
          row : row
        });
      }
    }

    // Helper: retrieve a dot by grid address (returns null if out of range)
    function pt(c, r) {
      if (c < 0 || c >= cols || r < 0 || r >= rows) return null;
      return points[r * cols + c];
    }

    // 2. Build the edge list — each edge stored exactly once
    for (row = 0; row < rows; row++) {
      for (col = 0; col < cols; col++) {
        p = pt(col, row);

        // ── Horizontal edge (→) ─────────────────────────────────────
        nb = pt(col + 1, row);
        if (nb) edges.push([p, nb]);

        // ── Downward diagonal edges (to the next row) ────────────────
        if (row + 1 < rows) {
          if (row % 2 === 0) {
            // Even row: odd row below is shifted right, so this dot's two
            // downward neighbours are at col (↘) and col-1 (↙) in the odd row
            nb = pt(col,     row + 1);  if (nb) edges.push([p, nb]);  // ↘
            nb = pt(col - 1, row + 1);  if (nb) edges.push([p, nb]);  // ↙
          } else {
            // Odd row: even row below has no shift, so this dot's two
            // downward neighbours are at col (↙) and col+1 (↘) in even row
            nb = pt(col,     row + 1);  if (nb) edges.push([p, nb]);  // ↙
            nb = pt(col + 1, row + 1);  if (nb) edges.push([p, nb]);  // ↘
          }
        }
      }
    }
  }

  // ── Render loop ─────────────────────────────────────────────────────────────
  function loop() {
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, w, h);

    var i, ab, d, opacity;

    // ── Draw triangle edges first (behind the dots) ──────────────────────
    for (i = 0; i < edges.length; i++) {
      ab = edges[i];

      // Line opacity driven by the nearer of its two endpoints to the cursor.
      // This means a line lights up as soon as EITHER of its dots is approached.
      d = Math.min(dist2(mouse, ab[0]), dist2(mouse, ab[1]));

      opacity = d < NEAR ? LINE_NEAR
              : d < MID  ? LINE_MID
              : d < FAR  ? LINE_FAR
              : 0;

      if (opacity === 0) continue;  // skip invisible lines quickly

      ctx.beginPath();
      ctx.moveTo(ab[0].x, ab[0].y);
      ctx.lineTo(ab[1].x, ab[1].y);
      ctx.strokeStyle = 'rgba(0,0,0,' + opacity + ')';
      ctx.stroke();
    }

    // ── Draw dots on top ─────────────────────────────────────────────────
    for (i = 0; i < points.length; i++) {
      p = points[i];
      d = dist2(mouse, p);

      opacity = d < MID ? DOT_NEAR
              : d < FAR ? DOT_MID
              : DOT_FAR;

      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(0,0,0,' + opacity + ')';
      ctx.fill();
    }

    rafId = requestAnimationFrame(loop);
  }

  // ── Squared Euclidean distance (avoids Math.sqrt each frame) ───────────────
  function dist2(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  }

  // ── Start when DOM is ready ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
