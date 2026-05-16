/**
 * background.js — equilateral-triangle lattice with hexagonal cursor highlight.
 *
 * How the hexagon effect works:
 *   Every edge in the triangle mesh has 1-2 "ring centres" — dots that are
 *   adjacent to BOTH of the edge's endpoints.  When the cursor is near one of
 *   those ring-centre dots, that edge belongs to the hexagonal ring around it
 *   and lights up.  Spoke edges (which only share one endpoint with the
 *   nearest dot) have that dot as an endpoint, not a ring centre, so they
 *   stay dark → you get a hexagon, not a star.
 */

(function () {

  // ── Config ─────────────────────────────────────────────────────────────────
  var D = 75;                      // dot spacing in px
  var H = D * Math.sqrt(3) / 2;   // row height ≈ 65 px  (equilateral triangles)
  var R = 2;                       // dot radius in px

  // Grid origin offset — aligns the top-left vertex with the right edge of
  // the left icon panel (81 px) and the very top of the browser (y = 0).
  var OFFSET_X = 80;
  var OFFSET_Y = 0;

  // Proximity thresholds (squared px)
  var NEAR = 4000;   // ≈  63 px — strong ring glow
  var MID  = 20000;  // ≈ 141 px — faint ring glow
  var FAR  = 40000;  // ≈ 200 px — dot brightening range

  // Line opacities
  var LINE_BG       = 0.03;   // always-visible background grid
  var LINE_RING_MID = 0.038;  // ring highlight — medium distance
  var LINE_RING     = 0.085;  // ring highlight — near cursor

  // Dot opacities (slightly reduced)
  var DOT_FAR  = 0.09;
  var DOT_MID  = 0.16;
  var DOT_NEAR = 0.19;

  // ── State ──────────────────────────────────────────────────────────────────
  var canvas, ctx, points, edges, rafId;
  var w, h;
  var mouse = { x: -99999, y: -99999 };

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    var s = document.createElement('style');
    s.textContent = 'html{background:rgb(var(--primary))}body{background:transparent!important}';
    document.head.appendChild(s);

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
        mouse.x = e.clientX; mouse.y = e.clientY;
      });

      // Clear hover effect as soon as the cursor leaves the viewport.
      // Using document mouseout with a relatedTarget check is more reliable
      // than window mouseleave, which can fail to fire in some browsers.
      document.addEventListener('mouseout', function (e) {
        if (!e.relatedTarget && !e.toElement) {
          mouse.x = -99999; mouse.y = -99999;
        }
      });
    }
    window.addEventListener('resize', function () { resize(); buildGrid(); });
  }

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  // ── Build triangular lattice ────────────────────────────────────────────────
  function buildGrid() {
    points = [];
    edges  = [];

    var cols = Math.ceil(w / D) + 2;
    var rows = Math.ceil(h / H) + 2;
    var row, col, p, nb, i, j;

    // 1. Create dots
    for (row = 0; row < rows; row++) {
      for (col = 0; col < cols; col++) {
        points.push({
          x      : col * D + (row % 2 === 1 ? D / 2 : 0) + OFFSET_X,
          y      : row * H + OFFSET_Y,
          idx    : row * cols + col,
          adjIdx : []           // filled in step 3
        });
      }
    }

    function pt(c, r) {
      if (c < 0 || c >= cols || r < 0 || r >= rows) return null;
      return points[r * cols + c];
    }

    // 2. Build edge list
    for (row = 0; row < rows; row++) {
      for (col = 0; col < cols; col++) {
        p = pt(col, row);

        nb = pt(col + 1, row);
        if (nb) edges.push({ a: p, b: nb, rc: [] });

        if (row + 1 < rows) {
          if (row % 2 === 0) {
            nb = pt(col,     row + 1); if (nb) edges.push({ a: p, b: nb, rc: [] });
            nb = pt(col - 1, row + 1); if (nb) edges.push({ a: p, b: nb, rc: [] });
          } else {
            nb = pt(col,     row + 1); if (nb) edges.push({ a: p, b: nb, rc: [] });
            nb = pt(col + 1, row + 1); if (nb) edges.push({ a: p, b: nb, rc: [] });
          }
        }
      }
    }

    // 3. Build adjacency lists (needed to find ring centres)
    for (i = 0; i < edges.length; i++) {
      edges[i].a.adjIdx.push(edges[i].b.idx);
      edges[i].b.adjIdx.push(edges[i].a.idx);
    }

    // 4. For each edge A-B, find their common neighbours.
    //    A common neighbour C means: C is adjacent to both A and B,
    //    so the edge A-B sits on the hexagonal ring around C.
    //    Stored as edge.rc (ring centres).
    for (i = 0; i < edges.length; i++) {
      var aAdj = edges[i].a.adjIdx;
      var bAdj = edges[i].b.adjIdx;
      for (j = 0; j < aAdj.length; j++) {
        if (bAdj.indexOf(aAdj[j]) !== -1) {
          edges[i].rc.push(points[aAdj[j]]);
        }
      }
    }
  }

  // ── Render loop ─────────────────────────────────────────────────────────────
  function loop() {
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, w, h);

    var i, k, e, d, dd, opacity, p;

    // ── Draw edges ────────────────────────────────────────────────────────
    for (i = 0; i < edges.length; i++) {
      e = edges[i];

      // Find distance to the nearest ring centre of this edge.
      // When cursor is near ring centre C, this edge is part of C's hexagon.
      d = Infinity;
      for (k = 0; k < e.rc.length; k++) {
        dd = dist2(mouse, e.rc[k]);
        if (dd < d) d = dd;
      }

      // Ring edges belonging to the nearest hexagon light up;
      // everything else stays at the faint background opacity.
      opacity = d < NEAR ? LINE_RING
              : d < MID  ? LINE_RING_MID
              : LINE_BG;

      ctx.beginPath();
      ctx.moveTo(e.a.x, e.a.y);
      ctx.lineTo(e.b.x, e.b.y);
      ctx.strokeStyle = 'rgba(0,0,0,' + opacity + ')';
      ctx.stroke();
    }

    // ── Draw dots ─────────────────────────────────────────────────────────
    for (i = 0; i < points.length; i++) {
      p = points[i];
      d = dist2(mouse, p);

      // Dot at the hexagon centre brightens when cursor is near
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

  // ── Squared distance ────────────────────────────────────────────────────────
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
