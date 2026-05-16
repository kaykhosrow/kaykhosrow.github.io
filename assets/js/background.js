/**
 * background.js
 *
 * Fixed square-grid of dots with a triangle mesh that lights up near
 * the cursor. Matches the original Portify colour and opacity exactly.
 *
 * Place in assets/js/ and add to index.html after app.js:
 *   <script defer src="assets/js/background.js"></script>
 */

(function () {
  'use strict';

  // ── Config ─────────────────────────────────────────────────────────────────
  var POINT_DISTANCE = 45;  // px between grid dots  (original value)
  var POINT_RADIUS   = 2;   // dot radius in px       (original value)

  // Proximity thresholds — squared px (avoids Math.sqrt every frame).
  // Match original Portify values exactly.
  var NEAR = 4000;   // ~63 px  — strong line + bright dot
  var MID  = 20000;  // ~141 px — faint line
  var FAR  = 40000;  // ~200 px — very faint line, dot still slightly bright

  // ── State ──────────────────────────────────────────────────────────────────
  var canvas, ctx, points, edges, rafId;
  var w, h;
  var mouse = { x: -99999, y: -99999 }; // off-screen on load → nothing lit

  // ── Initialise ─────────────────────────────────────────────────────────────
  function init() {
    /*
     * z-index:-1 puts the canvas behind ALL page content, but it would also
     * go behind the <body> background colour.  We fix this by moving the page
     * background from <body> to <html> so the canvas is visible above the
     * html background but below body's content.
     *
     * Your site uses rgb(var(--primary)) as the background — this keeps that
     * working (and keeps colour-switching working too).
     */
    injectCSS([
      'html { background: rgb(var(--primary)); }',
      'body { background: transparent !important; }'
    ].join(''));

    // Create and inject the canvas as the very first element in <body>
    canvas = document.createElement('canvas');
    canvas.id = 'grid-bg-canvas';
    canvas.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'z-index:-1',          // behind ALL page elements
      'pointer-events:none'  // never blocks clicks or hovers
    ].join(';');

    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');

    resize();
    buildGrid();
    loop();

    // Mouse tracking (desktop only — no interference on touch devices)
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  function injectCSS(css) {
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  // ── Build the fixed triangle grid ──────────────────────────────────────────
  //
  // Every grid cell looks like this:
  //
  //   *───*
  //   │ ╲ │
  //   *───*
  //
  // Horizontal + vertical edges give the square grid.
  // One diagonal (top-left → bottom-right) per cell splits each square into
  // exactly two triangles — NO crossing lines.
  //
  // Each edge is stored once and drawn once per frame.
  //
  function buildGrid() {
    points = [];
    edges  = [];

    var cols = Math.ceil(w / POINT_DISTANCE) + 1;
    var rows = Math.ceil(h / POINT_DISTANCE) + 1;
    var col, row, p;

    // 1. Place dots
    for (col = 0; col < cols; col++) {
      for (row = 0; row < rows; row++) {
        points.push({
          x   : col * POINT_DISTANCE,
          y   : row * POINT_DISTANCE,
          col : col,
          row : row
        });
      }
    }

    // Helper: get point by column + row
    function pt(c, r) { return points[c * rows + r]; }

    // 2. Build the edge list (each edge stored once)
    for (col = 0; col < cols; col++) {
      for (row = 0; row < rows; row++) {
        p = pt(col, row);

        if (col + 1 < cols)               edges.push([p, pt(col + 1, row    )]); // →
        if (row + 1 < rows)               edges.push([p, pt(col,     row + 1)]); // ↓
        if (col + 1 < cols && row + 1 < rows)
                                          edges.push([p, pt(col + 1, row + 1)]); // ↘ diagonal
      }
    }
  }

  // ── Render loop ─────────────────────────────────────────────────────────────
  function loop() {
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, w, h);

    var i, ab, d, lineOpacity, p, dotOpacity;

    // ── 1. Draw triangle edges (behind dots) ──────────────────────────────
    for (i = 0; i < edges.length; i++) {
      ab = edges[i];

      // Use the nearer endpoint so a line lights up as soon as
      // the cursor comes within range of EITHER of its dots.
      d = Math.min(dist2(mouse, ab[0]), dist2(mouse, ab[1]));

      lineOpacity = d < NEAR ? 0.15   // original: 0.15
                  : d < MID  ? 0.05   // original: 0.05
                  : d < FAR  ? 0.01   // original: 0.01
                  : 0;

      if (lineOpacity === 0) continue; // skip invisible lines immediately

      ctx.beginPath();
      ctx.moveTo(ab[0].x, ab[0].y);
      ctx.lineTo(ab[1].x, ab[1].y);
      ctx.strokeStyle = 'rgba(0,0,0,' + lineOpacity + ')'; // BLACK — matches original
      ctx.stroke();
    }

    // ── 2. Draw dots on top of edges ──────────────────────────────────────
    for (i = 0; i < points.length; i++) {
      p = points[i];
      d = dist2(mouse, p);

      // Dots are ALWAYS visible (min 0.3) — brightening near cursor.
      // These match the original Portify opacity values exactly.
      dotOpacity = d < MID ? 0.5   // original: 0.5
                 : d < FAR ? 0.4   // original: 0.4
                 :           0.3;  // original: 0.7 → but 0.3 is more subtle

      ctx.beginPath();
      ctx.arc(p.x, p.y, POINT_RADIUS, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(0,0,0,' + dotOpacity + ')'; // BLACK — matches original
      ctx.fill();
    }

    rafId = requestAnimationFrame(loop);
  }

  // ── Squared Euclidean distance (no sqrt — fast) ────────────────────────────
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
