/* ─────────────────────────────────────────────────────────────────────────────
   tour.js  —  Site walkthrough  (chalk annotation style)
   Add to <head>:  <script defer src="assets/js/tour.js"></script>
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Steps ─────────────────────────────────────────────────────────────── */
  var STEPS = [
    {
      sel:      '#heroNameWrap',
      label:    '01  —  NAME',
      text:     'Click here for the pronunciation of my name',
      pos:      'right',
      gap:      170,
      curveDir: -1,
    },
    {
      sel:      '.work-btn',
      label:    '02  —  ABOUT',
      text:     'Click here to learn more about me',
      pos:      'right',
      gap:      110,
      curveDir:  1,
    },
    {
      sel:      '.contact-btn',
      label:    '03  —  CONTACT',
      text:     'Click here to get in touch',
      pos:      'right',
      gap:      110,
      curveDir: -1,
    },
    {
      sel:      '#navigation ul',
      label:    '04  —  NAVIGATION',
      text:     'Navigate to different sections',
      pos:      'above',
      gap:       55,
      curveDir:  1,
    },
    {
      sel:      '.left-bar',
      label:    '05  —  SOCIALS',
      text:     'Find me by email, on LinkedIn, or explore my work on GitHub.',
      pos:      'right',
      gap:       80,
      curveDir: -1,
    },
    {
      sel:      '#settingsGearBtn',
      label:    '06  —  SETTINGS',
      text:     'Customise the site, switch colours, toggle grain or the lattice.',
      pos:      'above-left',
      gap:       55,
      curveDir:  1,
    },
  ];

  var ANN_W = 200;
  var ANN_H = 130;

  /* ── State ─────────────────────────────────────────────────────────────── */
  var tourActive  = false;
  var currentStep = -1;

  /* ── Inject CSS ─────────────────────────────────────────────────────────── */
  var styleEl = document.createElement('style');
  styleEl.textContent = [

    '@font-face {',
    '  font-family:"ChalkBoard";',
    '  src:url("assets/fonts/Chalk-Board.otf") format("opentype");',
    '}',

    '#tourBtn {',
    '  width:32px; height:32px;',
    '  border-radius:4px;',
    '  border:2px solid rgba(0,0,0,0.3);',
    '  background:transparent;',
    '  color:rgb(var(--black));',
    '  font-size:1rem;',
    '  cursor:pointer;',
    '  display:flex; align-items:center; justify-content:center;',
    '  flex-shrink:0;',
    '  margin-left:auto; margin-right:13px;',
    '  padding:0;',
    '  transition:background 0.2s ease, color 0.2s ease,',
    '             border-color 0.2s ease, opacity 0.3s ease;',
    '}',
    '#tourBtn:hover { border-color:rgba(0,0,0,0.55); }',
    '#tourBtn.t-active {',
    '  background:rgb(var(--black));',
    '  color:rgb(var(--primary));',
    '  border-color:rgb(var(--black));',
    '}',
    '#tourBtn.t-faded { opacity:0 !important; pointer-events:none; }',

    '#tourSvg {',
    '  position:fixed; inset:0;',
    '  width:100vw; height:100vh;',
    '  pointer-events:none;',
    '  z-index:9000;',
    '  overflow:visible;',
    '}',

    '#tourAnn {',
    '  position:fixed;',
    '  z-index:9001;',
    '  width:' + ANN_W + 'px;',
    '  pointer-events:none;',
    '  opacity:0;',
    '  transition:',
    '    opacity 0.35s ease,',
    '    left 0.42s cubic-bezier(0.4,0,0.2,1),',
    '    top  0.42s cubic-bezier(0.4,0,0.2,1);',
    '}',
    '#tourAnn.t-on { opacity:1; pointer-events:auto; }',

    '.tan-label {',
    '  font-size:0.62rem;',
    '  letter-spacing:0.18em;',
    '  text-transform:uppercase;',
    '  color:rgba(0,0,0,0.42);',
    '  font-weight:700;',
    '  margin-bottom:5px;',
    '  font-family:"InterRegular",sans-serif;',
    '}',
    '.tan-rule {',
    '  width:100%; height:1px;',
    '  background:rgba(0,0,0,0.12);',
    '  margin-bottom:8px;',
    '}',
    '.tan-text {',
    '  font-size:1.05rem;',
    '  line-height:1.5;',
    '  color:rgba(0,0,0,0.80);',
    '  margin:0 0 10px;',
    '  font-family:"ChalkBoard","InterRegular",cursive;',
    '}',
    '.tan-nav {',
    '  display:flex; align-items:center; gap:4px;',
    '}',
    '.tan-btn {',
    '  background:none; border:none; outline:none;',
    '  cursor:pointer; padding:0;',
    '  font-size:0.78rem;',
    '  color:rgba(0,0,0,0.38);',
    '  line-height:1;',
    '  font-family:"InterRegular",sans-serif;',
    '  transition:color 0.15s;',
    '}',
    '.tan-btn:hover     { color:rgba(0,0,0,0.85); }',
    '.tan-btn:disabled  { opacity:0.18; cursor:default; pointer-events:none; }',
    '.tan-close         { margin-left:3px; opacity:0.4; }',
    '.tan-close:hover   { opacity:0.9 !important; }',
    '.tan-count {',
    '  flex:1; text-align:center;',
    '  font-size:0.63rem;',
    '  letter-spacing:0.08em;',
    '  color:rgba(0,0,0,0.26);',
    '  font-family:"InterRegular",sans-serif;',
    '}',

  ].join('\n');
  document.head.appendChild(styleEl);

  /* ── Build DOM ──────────────────────────────────────────────────────────── */
  function init() {
    var nav = document.getElementById('navigation');
    if (!nav) return;
    var settingsBar = nav.querySelector('.settings-bar');
    if (!settingsBar) return;

    /* Tour button */
    var btn = document.createElement('button');
    btn.id        = 'tourBtn';
    btn.title     = 'Site guide';
    btn.setAttribute('aria-label', 'Open site guide');
    btn.className = 'd-none d-xl-flex';
    btn.innerHTML = '<i class="ph ph-question"></i>';
    settingsBar.style.marginLeft = '0';
    nav.insertBefore(btn, settingsBar);

    /* SVG layer */
    var NS  = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.id = 'tourSvg';
    svg.setAttribute('aria-hidden', 'true');

    /* Chalk displacement filter */
    var defs   = document.createElementNS(NS, 'defs');
    var filter = document.createElementNS(NS, 'filter');
    filter.id  = 'tChalk';
    filter.setAttribute('x', '-8%');
    filter.setAttribute('y', '-30%');
    filter.setAttribute('width',  '116%');
    filter.setAttribute('height', '160%');

    var turb = document.createElementNS(NS, 'feTurbulence');
    turb.setAttribute('type',          'fractalNoise');
    turb.setAttribute('baseFrequency', '0.025 0.06');
    turb.setAttribute('numOctaves',    '2');
    turb.setAttribute('result',        'noise');
    turb.setAttribute('seed',          '5');

    var disp = document.createElementNS(NS, 'feDisplacementMap');
    disp.setAttribute('in',               'SourceGraphic');
    disp.setAttribute('in2',              'noise');
    disp.setAttribute('scale',            '2.8');
    disp.setAttribute('xChannelSelector', 'R');
    disp.setAttribute('yChannelSelector', 'G');

    filter.appendChild(turb);
    filter.appendChild(disp);
    defs.appendChild(filter);
    svg.appendChild(defs);

    /* Arc path */
    var arcPath = document.createElementNS(NS, 'path');
    arcPath.id = 'tArc';
    arcPath.setAttribute('fill',            'none');
    arcPath.setAttribute('stroke',          'rgba(0,0,0,0.68)');
    arcPath.setAttribute('stroke-width',    '2.1');
    arcPath.setAttribute('stroke-linecap',  'round');
    arcPath.setAttribute('stroke-linejoin', 'round');
    arcPath.setAttribute('filter',          'url(#tChalk)');
    svg.appendChild(arcPath);

    /* Arrowhead */
    var headPath = document.createElementNS(NS, 'path');
    headPath.id = 'tHead';
    headPath.setAttribute('fill',            'none');
    headPath.setAttribute('stroke',          'rgba(0,0,0,0.68)');
    headPath.setAttribute('stroke-width',    '2.1');
    headPath.setAttribute('stroke-linecap',  'round');
    headPath.setAttribute('stroke-linejoin', 'round');
    headPath.setAttribute('filter',          'url(#tChalk)');
    headPath.style.opacity = '0';
    svg.appendChild(headPath);

    document.body.appendChild(svg);

    /* Annotation */
    var ann = document.createElement('div');
    ann.id = 'tourAnn';
    ann.innerHTML = [
      '<div class="tan-label" id="tanLabel"></div>',
      '<div class="tan-rule"></div>',
      '<p  class="tan-text"  id="tanText"></p>',
      '<div class="tan-nav">',
      '  <button class="tan-btn"           id="tanPrev" disabled>&#8592;</button>',
      '  <span   class="tan-count"         id="tanCount">1 / 6</span>',
      '  <button class="tan-btn"           id="tanNext">&#8594;</button>',
      '  <button class="tan-btn tan-close" id="tanClose">&#215;</button>',
      '</div>',
    ].join('');
    document.body.appendChild(ann);

    /* Events */
    btn.addEventListener('click', function () {
      tourActive ? endTour() : startTour();
    });

    document.getElementById('tanPrev').addEventListener('click', function () {
      if (currentStep > 0) goToStep(currentStep - 1);
    });
    document.getElementById('tanNext').addEventListener('click', function () {
      if (currentStep < STEPS.length - 1) goToStep(currentStep + 1);
      else endTour();
    });
    document.getElementById('tanClose').addEventListener('click', endTour);

    document.addEventListener('keydown', function (e) {
      if (!tourActive) return;
      if (e.key === 'Escape')     { endTour(); return; }
      if (e.key === 'ArrowRight') {
        if (currentStep < STEPS.length - 1) goToStep(currentStep + 1);
        else endTour();
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        goToStep(currentStep - 1);
        e.preventDefault();
      }
    });

    window.addEventListener('scroll', function () {
      var away = window.scrollY > 40;
      btn.classList.toggle('t-faded', away);
      if (away && tourActive) endTour();
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (tourActive && currentStep >= 0) goToStep(currentStep);
    }, { passive: true });
  }

  /* ── Start / end ─────────────────────────────────────────────────────────── */
  function startTour() {
    tourActive = true;
    var b = document.getElementById('tourBtn');
    if (b) b.classList.add('t-active');
    goToStep(0);
  }

  function endTour() {
    tourActive  = false;
    currentStep = -1;
    var b   = document.getElementById('tourBtn');
    var ann = document.getElementById('tourAnn');
    var arc = document.getElementById('tArc');
    var hd  = document.getElementById('tHead');
    if (b)   b.classList.remove('t-active');
    if (ann) ann.classList.remove('t-on');
    if (arc) { arc.style.transition = 'none'; arc.style.strokeDashoffset = '9999px'; }
    if (hd)  { hd.style.transition  = 'none'; hd.style.opacity = '0'; }
  }

  /* ── goToStep ───────────────────────────────────────────────────────────── */
  function goToStep(idx) {
    if (idx < 0 || idx >= STEPS.length) return;
    currentStep = idx;

    var step   = STEPS[idx];
    var target = document.querySelector(step.sel);
    if (!target) return;

    var tRect = target.getBoundingClientRect();
    var vW    = window.innerWidth;
    var vH    = window.innerHeight;
    var tCX   = tRect.left + tRect.width  * 0.5;
    var tCY   = tRect.top  + tRect.height * 0.5;
    var g     = step.gap || 80;

    /* Annotation position */
    var ax, ay;
    switch (step.pos) {
      case 'right':
        ax = tRect.right + g;
        ay = tCY - ANN_H * 0.5;
        break;
      case 'above':
        ax = tCX - ANN_W * 0.5;
        ay = tRect.top - ANN_H - g;
        break;
      case 'above-left':
        ax = tCX - ANN_W + 30;
        ay = tRect.top - ANN_H - g;
        break;
      default:
        ax = tRect.right + g;
        ay = tCY - ANN_H * 0.5;
    }
    ax = Math.max(14, Math.min(ax, vW - ANN_W - 14));
    ay = Math.max(14, Math.min(ay, vH - ANN_H - 14));

    /* Update annotation content */
    var ann = document.getElementById('tourAnn');
    ann.style.left = ax + 'px';
    ann.style.top  = ay + 'px';
    document.getElementById('tanLabel').textContent = step.label;
    document.getElementById('tanText').textContent  = step.text;
    document.getElementById('tanCount').textContent = (idx + 1) + ' \/ ' + STEPS.length;
    document.getElementById('tanPrev').disabled     = (idx === 0);
    document.getElementById('tanNext').textContent  = (idx === STEPS.length - 1) ? '\u2713' : '\u2192';
    ann.classList.add('t-on');

    /* Arrow endpoints */
    var annCX   = ax + ANN_W * 0.5;
    var annCY   = ay + ANN_H * 0.5;
    var startPt = rectEdge({ left: ax, top: ay, width: ANN_W, height: ANN_H }, tCX, tCY);
    var endPt   = rectEdge(tRect, annCX, annCY);

    /* Pull wave endpoint back so the arrowhead sits on the edge */
    var edx = endPt.x - startPt.x;
    var edy = endPt.y - startPt.y;
    var el  = Math.sqrt(edx*edx + edy*edy);
    var pb  = 3;
    var wex = el > pb ? endPt.x - (edx/el)*pb : endPt.x;
    var wey = el > pb ? endPt.y - (edy/el)*pb : endPt.y;

    var curve = makeCurve(startPt.x, startPt.y, wex, wey, step.curveDir || 1);
    var headD = makeHead(curve.tx, curve.ty, endPt.x, endPt.y);

    /* Reset SVG paths instantly */
    var arcEl  = document.getElementById('tArc');
    var headEl = document.getElementById('tHead');
    arcEl.style.transition       = 'none';
    arcEl.style.strokeDasharray  = '';
    arcEl.style.strokeDashoffset = '';
    headEl.style.transition      = 'none';
    headEl.style.opacity         = '0';
    arcEl.setAttribute('d',  curve.path);
    headEl.setAttribute('d', headD);

    /* Animate: two rAFs ensure the reset is committed before we start */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var len = arcEl.getTotalLength ? arcEl.getTotalLength() : 200;
        if (len < 1) len = 200;
        arcEl.style.strokeDasharray  = len + 'px';
        arcEl.style.strokeDashoffset = len + 'px';
        arcEl.getBoundingClientRect(); /* force reflow */
        arcEl.style.transition       = 'stroke-dashoffset 0.68s cubic-bezier(0.38,0,0.2,1)';
        arcEl.style.strokeDashoffset = '0px';

        /* Arrowhead appears when arc is almost done */
        setTimeout(function () {
          headEl.style.transition = 'opacity 0.18s ease';
          headEl.style.opacity    = '1';
        }, 620);
      });
    });
  }

  /* ── Smooth cubic-bezier arc ─────────────────────────────────────────────── */
  function makeCurve(x1, y1, x2, y2, dir) {
    var dx  = x2 - x1, dy  = y2 - y1;
    var len = Math.sqrt(dx*dx + dy*dy);
    if (len < 4) return { path: 'M '+f(x1)+' '+f(y1)+' L '+f(x2)+' '+f(y2), tx: dx||1, ty: dy||0 };

    var ux = dx / len, uy = dy / len;
    var px = -uy * (dir || 1), py = ux * (dir || 1);
    var bulge = Math.min(Math.max(len * 0.42, 38), 180);

    var cp1x = x1 + ux * len * 0.28 + px * bulge;
    var cp1y = y1 + uy * len * 0.28 + py * bulge;
    var cp2x = x2 - ux * len * 0.22 + px * bulge;
    var cp2y = y2 - uy * len * 0.22 + py * bulge;

    /* Tangent at endpoint from cp2 → endpoint */
    var tx = x2 - cp2x, ty = y2 - cp2y;
    var tl = Math.sqrt(tx*tx + ty*ty) || 1;
    tx /= tl; ty /= tl;

    var path = 'M '+f(x1)+' '+f(y1)+
               ' C '+f(cp1x)+' '+f(cp1y)+','+f(cp2x)+' '+f(cp2y)+','+f(x2)+' '+f(y2);

    return { path: path, tx: tx, ty: ty };
  }

  /* ── V-shaped arrowhead at (ex,ey), tangent direction (tx,ty) ───────────── */
  function makeHead(tx, ty, ex, ey) {
    var tl = Math.sqrt(tx*tx + ty*ty) || 1;
    tx /= tl; ty /= tl;
    var px = -ty, py = tx;
    var sz = 10, sp = 4.2;
    return 'M '+f(ex - tx*sz + px*sp)+' '+f(ey - ty*sz + py*sp)+
           ' L '+f(ex)+' '+f(ey)+
           ' L '+f(ex - tx*sz - px*sp)+' '+f(ey - ty*sz - py*sp);
  }

  /* ── Nearest point on a rect's edge facing (fx, fy) ─────────────────────── */
  function rectEdge(rect, fx, fy) {
    var cx = rect.left + rect.width  * 0.5;
    var cy = rect.top  + rect.height * 0.5;
    var dx = fx - cx, dy = fy - cy;
    if (!dx && !dy) return { x: cx, y: cy };
    var sx = dx ? rect.width  * 0.5 / Math.abs(dx) : 1e9;
    var sy = dy ? rect.height * 0.5 / Math.abs(dy) : 1e9;
    var s  = Math.min(sx, sy);
    return { x: cx + dx * s, y: cy + dy * s };
  }

  function f(n) { return Math.round(n * 10) / 10; }

  /* ── Boot ───────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
