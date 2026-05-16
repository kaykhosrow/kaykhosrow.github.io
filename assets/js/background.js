/**
 * background.js
 *
 * Draws a fixed square-grid of dots on a self-created canvas.
 * When the mouse moves near dots, lines appear between them
 * forming a triangle / grid mesh — dots never drift.
 *
 * Drop this file into assets/js/ and add ONE line to index.html
 * (see updated index.html). No other HTML changes needed —
 * the canvas is created and injected by this script.
 *
 * Customise the constants below to taste.
 */

(function () {

  // ─── Config ────────────────────────────────────────────────────────────────
  var POINT_DISTANCE = 45;             // px gap between grid dots
  var POINT_RADIUS   = 1.75;           // dot radius in px
  var DOT_COLOR      = '85, 230, 165'; // RGB — change to match your palette

  // Mouse-proximity thresholds (squared px — avoids sqrt each frame).
  // Roughly: NEAR ≈ 63 px, MID ≈ 141 px, FAR ≈ 200 px from cursor.
  var NEAR = 4000;
  var MID  = 20000;
  var FAR  = 40000;

  // ─── State ─────────────────────────────────────────────────────────────────
  var canvas, ctx, points, rafId;
  var w, h;
  var mouse = { x: -99999, y: -99999 }; // off-screen → no glow on page load

  // ─── Dot class ─────────────────────────────────────────────────────────────
  function Circle(pos) {
    this.pos     = pos;
    this.opacity = 0.3;
  }

  Circle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, POINT_RADIUS, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(' + DOT_COLOR + ',' + this.opacity + ')';
    ctx.fill();
  };

  // ─── Initialise ────────────────────────────────────────────────────────────
  function init() {
    // Create the canvas and inject it as the very first child of <body>
    // so it sits behind all page content naturally.
    canvas = document.createElement('canvas');
    canvas.id = 'grid-bg-canvas';
    canvas.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'z-index:0',
      'pointer-events:none'  // never blocks clicks on real content
    ].join(';');

    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');

    resize();
    buildGrid();
    loop();

    // Mouse tracking (desktop only)
    if (!('ontouchstart' in window)) {
      window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      // Return to off-screen when cursor leaves the window
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

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  // ─── Build the fixed square grid ───────────────────────────────────────────
  // Uses column/row indices for neighbour lookup — no expensive sort needed.
  function buildGrid() {
    points = [];

    var cols = Math.ceil(w / POINT_DISTANCE) + 1;
    var rows = Math.ceil(h / POINT_DISTANCE) + 1;

    // 1. Create every dot at its fixed grid position
    for (var col = 0; col < cols; col++) {
      for (var row = 0; row < rows; row++) {
        var p = {
          x   : col * POINT_DISTANCE,
          y   : row * POINT_DISTANCE,
          col : col,
          row : row
        };
        p.circle = new Circle(p);
        points.push(p); // stored at predictable index: col * rows + row
      }
    }

    // 2. Wire up all 8 surrounding neighbours for each dot.
    //    Orthogonal pairs → square grid lines.
    //    Diagonals → triangle / mesh subdivisions when lit by hover.
    points.forEach(function (p) {
      p.neighbours = [];
      for (var dc = -1; dc <= 1; dc++) {
        for (var dr = -1; dr <= 1; dr++) {
          if (dc === 0 && dr === 0) continue; // skip self
          var nc = p.col + dc;
          var nr = p.row + dr;
          if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
            p.neighbours.push(points[nc * rows + nr]);
          }
        }
      }
    });
  }

  // ─── Render loop ───────────────────────────────────────────────────────────
  function loop() {
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, w, h);

    points.forEach(function (point) {
      var d = dist2(mouse, point);

      // Line opacity — driven purely by mouse proximity
      var lineOpacity = d < NEAR ? 0.15
                      : d < MID  ? 0.05
                      : d < FAR  ? 0.01
                      : 0;

      // Dot opacity — always subtly visible, brighter near cursor
      point.circle.opacity = d < MID ? 0.5
                           : d < FAR ? 0.4
                           : 0.3;

      drawLines(point, lineOpacity);
      point.circle.draw();
    });

    rafId = requestAnimationFrame(loop);
  }

  // ─── Draw lines from a dot to each of its neighbours ──────────────────────
  function drawLines(p, opacity) {
    if (opacity === 0) return;
    p.neighbours.forEach(function (nb) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = 'rgba(' + DOT_COLOR + ',' + opacity + ')';
      ctx.stroke();
    });
  }

  // ─── Squared Euclidean distance — avoids sqrt each frame ──────────────────
  function dist2(p1, p2) {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
  }

  // ─── Start when DOM is ready ───────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
