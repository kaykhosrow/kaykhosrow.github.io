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
 * Add to index.html after app.js:
 *   <script defer src="assets/js/background.js"></script>
 */

(function () {

  // ── Config ─────────────────────────────────────────────────────────────────
  var D = 45;                        // dot spacing in px
  var H = D * Math.sqrt(3) / 2;     // row height ≈ 39 px  (equilateral triangles)
  var R = 2;                         // dot radius in px

  // Mouse-proximity thresholds (squared px — no sqrt needed each frame)
  var NEAR = 4000;   // ≈  63 px
  var MID  = 20000;  // ≈ 141 px
  var FAR  = 40000;  // ≈ 200 px

  // Dot opacities (reduced ~40% from previous — "a bit fainter")
  var DOT_FAR  = 0.15;
  var DOT_MID  = 0.25;
  var DOT_NEAR = 0.35;

  // Line opacities
  var LINE_NEAR = 0.10;
  var LINE_MID  = 0.03;
  var LINE_FAR  = 0.008;

  // ── State ──────────────────────────────────────────────────────────────────
  var canvas, ctx, points, edges, rafId;
  var w, h;
  var mouse = { x: -99999, y: -99999 };

  // ── Initialise ─────────────────────────────────────────────────────────────
  function init() {
    // Move the page background from <body> to <html> so the canvas at
    // z-index:-1 stays visible (otherwise body's bg would cover it).
    // Uses your --primary CSS variable so colour-switching still works.
    var s = document.createElement('style');
    s.textContent = 'html{background:rgb(var(--primary))}body{background:transparent!important}';
    document.head.appendChild(s);

    // Create canvas and inject as the very first child of <body>
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

  // ── Resize ─────────────────────────────────────────────────────────────────
  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  // ── Build triangular lattice ────────────────────────────────────────────────
  //
  // Dot position for (col, row):
  //   x = col * D + (odd row ? D/2 : 0)
  //   y = row * H
  //
  // Edges (stored once each, no duplicates):
  //   Horizontal  →   every dot to the one on its right
  //   Even row ↘  →   pt(col,   row+1)   (down-right into odd row)
  //   Even row ↙  →   pt(col-1, row+1)   (down-left  into odd row)
  //   Odd  row ↙  →   pt(col,   row+1)   (down-left  into even row)
  //   Odd  row ↘  →   pt(col+1, row+1)   (down-right into even row)
  //
  function buildGrid() {
    points = [];
    edges  = [];

    var cols = Math.ceil(w / D) + 2;
    var rows = Math.ceil(h / H) + 2;
    var col, row, p, nb;

    // 1. Place dots
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

    // Look up a dot by grid coordinates; null if out of bounds
    function pt(c, r) {
      if (c < 0 || c >= cols || r < 0 || r >= rows) return null;
      return points[r * cols + c];
    }

    // 2. Build edge list
    for (row = 0; row < rows; row++) {
      for (col = 0; col < cols; col++) {
        p = pt(col, row);

        // Horizontal →
        nb = pt(col + 1, row);
        if (nb) edges.push([p, nb]);

        // Diagonals into next row
        if (row + 1 < rows) {
          if (row % 2 === 0) {
            // Even row → odd row below (odd row is shifted right by D/2)
            nb = pt(col,     row + 1); if (nb) edges.push([p, nb]); // ↘
            nb = pt(col - 1, row + 1); if (nb) edges.push([p, nb]); // ↙
          } else {
            // Odd row → even row below (even row has no shift)
            nb = pt(col,     row + 1); if (nb) edges.push([p, nb]); // ↙
            nb = pt(col + 1, row + 1); if (nb) edges.push([p, nb]); // ↘
          }
        }
      }
    }
  }

  // ── Render loop ─────────────────────────────────────────────────────────────
  function loop() {
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, w, h);

    var i, ab, d, opacity, p;  // ← all variables declared here (fixes strict-mode bug)

    // Draw edges behind dots
    for (i = 0; i < edges.length; i++) {
      ab = edges[i];

      // Light up the line when the cursor is near EITHER of its endpoints
      d = Math.min(dist2(mouse, ab[0]), dist2(mouse, ab[1]));

      opacity = d < NEAR ? LINE_NEAR
              : d < MID  ? LINE_MID
              : d < FAR  ? LINE_FAR
              : 0;

      if (opacity === 0) continue;

      ctx.beginPath();
      ctx.moveTo(ab[0].x, ab[0].y);
      ctx.lineTo(ab[1].x, ab[1].y);
      ctx.strokeStyle = 'rgba(0,0,0,' + opacity + ')';
      ctx.stroke();
    }

    // Draw dots on top of edges
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

  // ── Squared distance (avoids Math.sqrt each frame) ─────────────────────────
  function dist2(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  }

  // ── Start ───────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
