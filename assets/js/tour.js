/* ─────────────────────────────────────────────────────────────────────────────
   tour.js  —  Site walkthrough  (blackboard / annotation style)
   Drop in assets/js/tour.js and add one line to <head>:
     <script defer src="assets/js/tour.js"></script>
   Nothing else touches the original HTML.
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Tour steps ─────────────────────────────────────────────────────────── */
  var STEPS = [
    {
      sel:   '#heroNameWrap',
      label: '01  —  NAME',
      text:  'Click my name to reveal its pronunciation — then tap the speaker icon to hear it spoken aloud.',
      pos:   'upper-right',
    },
    {
      sel:   '.work-btn',
      label: '02  —  ABOUT',
      text:  'Start here to learn about my background, research, and academic career.',
      pos:   'mid-right',
    },
    {
      sel:   '.contact-btn',
      label: '03  —  CONTACT',
      text:  'Have a question or want to collaborate? Send me a message here.',
      pos:   'mid-right',
    },
    {
      sel:   '#navigation ul',
      label: '04  —  NAVIGATION',
      text:  'Jump between sections — research, teaching, conferences, code, gallery, and more.',
      pos:   'above-center',
    },
    {
      sel:   '.left-bar',
      label: '05  —  SOCIALS',
      text:  'Find me by email, on LinkedIn, or explore my work on GitHub.',
      pos:   'right',
    },
    {
      sel:   '#settingsGearBtn',
      label: '06  —  SETTINGS',
      text:  'Personalise the site — switch background colours, toggle grain or the lattice.',
      pos:   'above-right',
    },
  ];

  var ANN_W = 192;  /* annotation width (matches CSS) */
  var ANN_H = 152;  /* estimated annotation height (for positioning only) */

  /* ── State ─────────────────────────────────────────────────────────────── */
  var tourActive  = false;
  var currentStep = -1;

  /* ── Inject CSS ─────────────────────────────────────────────────────────── */
  var css = [
    /* ── Tour ? button ── */
    '#tourBtn {',
    '  width:32px; height:32px;',
    '  background:transparent; border:none; outline:none;',
    '  cursor:pointer;',
    '  display:flex; align-items:center; justify-content:center;',
    '  font-size:1.05rem;',
    '  color:rgb(var(--black));',
    '  flex-shrink:0;',
    '  margin-left:auto; margin-right:13px;',
    '  opacity:0.7;',
    '  padding:0;',
    '  transition:opacity 0.25s ease;',
    '}',
    '#tourBtn:hover  { opacity:1; }',
    '#tourBtn.t-active { opacity:1; }',
    '#tourBtn.t-faded  { opacity:0 !important; pointer-events:none; }',

    /* ── Arrow SVG layer ── */
    '#tourSvg {',
    '  position:fixed; inset:0;',
    '  width:100vw; height:100vh;',
    '  pointer-events:none;',
    '  z-index:9000;',
    '  overflow:visible;',
    '  opacity:0;',
    '  transition:opacity 0.32s ease 0.08s;',
    '}',
    '#tourSvg.t-on { opacity:1; }',

    /* ── Annotation ── */
    '#tourAnn {',
    '  position:fixed;',
    '  z-index:9001;',
    '  width:' + ANN_W + 'px;',
    '  pointer-events:none;',
    '  opacity:0;',
    '  font-family:"InterRegular",sans-serif;',
    '  transition:',
    '    opacity 0.3s ease,',
    '    left    0.42s cubic-bezier(0.4,0,0.2,1),',
    '    top     0.42s cubic-bezier(0.4,0,0.2,1);',
    '}',
    '#tourAnn.t-on { opacity:1; pointer-events:auto; }',

    '.tan-label {',
    '  font-size:0.57rem;',
    '  letter-spacing:0.2em;',
    '  text-transform:uppercase;',
    '  color:rgba(0,0,0,0.35);',
    '  font-weight:700;',
    '  margin-bottom:5px;',
    '  font-family:"InterRegular",sans-serif;',
    '}',
    '.tan-rule {',
    '  width:100%;',
    '  height:1px;',
    '  background:rgba(0,0,0,0.1);',
    '  margin-bottom:9px;',
    '}',
    '.tan-text {',
    '  font-size:0.82rem;',
    '  line-height:1.68;',
    '  color:rgba(0,0,0,0.58);',
    '  font-style:italic;',
    '  margin:0 0 11px;',
    '  font-family:"InterRegular",sans-serif;',
    '}',
    '.tan-nav {',
    '  display:flex;',
    '  align-items:center;',
    '  gap:4px;',
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
    '.tan-btn:hover       { color:rgba(0,0,0,0.82); }',
    '.tan-btn:disabled    { opacity:0.2; cursor:default; pointer-events:none; }',
    '.tan-close           { margin-left:3px; opacity:0.45; }',
    '.tan-close:hover     { opacity:1 !important; }',
    '.tan-count {',
    '  flex:1; text-align:center;',
    '  font-size:0.63rem;',
    '  letter-spacing:0.09em;',
    '  color:rgba(0,0,0,0.26);',
    '  font-family:"InterRegular",sans-serif;',
    '}',
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── Build DOM ──────────────────────────────────────────────────────────── */
  function init() {
    var nav = document.getElementById('navigation');
    if (!nav) return;
    var settingsBar = nav.querySelector('.settings-bar');
    if (!settingsBar) return;

    /* ── Tour button (bare ? icon, same 32×32 hit-area as gear) ── */
    var btn = document.createElement('button');
    btn.id        = 'tourBtn';
    btn.title     = 'Site guide';
    btn.setAttribute('aria-label', 'Open site guide');
    btn.className = 'd-none d-xl-flex';
    btn.innerHTML = '<i class="ph ph-question"></i>';

    /* Pull the tour btn left of the divider; settings-bar loses its auto margin */
    settingsBar.style.marginLeft = '0';
    nav.insertBefore(btn, settingsBar);

    /* ── SVG layer (arrows) ── */
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'tourSvg';
    svg.setAttribute('aria-hidden', 'true');

    var wavePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    wavePath.id = 'tWave';
    wavePath.setAttribute('fill',            'none');
    wavePath.setAttribute('stroke',          'rgba(0,0,0,0.38)');
    wavePath.setAttribute('stroke-width',    '1.35');
    wavePath.setAttribute('stroke-linecap',  'round');
    wavePath.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(wavePath);

    var arrowV = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowV.id = 'tArrowV';
    arrowV.setAttribute('fill',            'none');
    arrowV.setAttribute('stroke',          'rgba(0,0,0,0.38)');
    arrowV.setAttribute('stroke-width',    '1.35');
    arrowV.setAttribute('stroke-linecap',  'round');
    arrowV.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(arrowV);

    document.body.appendChild(svg);

    /* ── Annotation div ── */
    var ann = document.createElement('div');
    ann.id = 'tourAnn';
    ann.innerHTML = [
      '<div class="tan-label" id="tanLabel"></div>',
      '<div class="tan-rule"></div>',
      '<p  class="tan-text"  id="tanText"></p>',
      '<div class="tan-nav">',
      '  <button class="tan-btn"             id="tanPrev"  disabled>&#8592;</button>',
      '  <span   class="tan-count"           id="tanCount">1 / 6</span>',
      '  <button class="tan-btn"             id="tanNext">&#8594;</button>',
      '  <button class="tan-btn tan-close"   id="tanClose">&#215;</button>',
      '</div>',
    ].join('');
    document.body.appendChild(ann);

    /* ── Events ── */
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
      if (e.key === 'Escape') { endTour(); return; }
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
    var b = document.getElementById('tourBtn');
    if (b) b.classList.remove('t-active');
    hide('tourSvg', 't-on');
    hide('tourAnn',  't-on');
  }

  function hide(id, cls) {
    var el = document.getElementById(id);
    if (el) el.classList.remove(cls);
  }

  /* ── goToStep ────────────────────────────────────────────────────────────── */
  function goToStep(idx) {
    if (idx < 0 || idx >= STEPS.length) return;
    currentStep = idx;

    var step   = STEPS[idx];
    var target = document.querySelector(step.sel);
    if (!target) return;

    var tRect = target.getBoundingClientRect();
    var vW    = window.innerWidth;
    var vH    = window.innerHeight;

    /* ── Annotation position ── */
    var ax, ay;
    var tCX = tRect.left + tRect.width  * 0.5;
    var tCY = tRect.top  + tRect.height * 0.5;

    switch (step.pos) {
      case 'upper-right':
        ax = vW * 0.56;
        ay = vH * 0.18;
        break;
      case 'mid-right':
        ax = vW * 0.54;
        ay = tCY - ANN_H * 0.38;
        break;
      case 'right':
        ax = tRect.right + 48;
        ay = tCY - ANN_H * 0.5;
        break;
      case 'above-center':
        ax = tCX - ANN_W * 0.5;
        ay = tRect.top - ANN_H - 46;
        break;
      case 'above-right':
        ax = tCX - ANN_W * 0.75;
        ay = tRect.top - ANN_H - 42;
        break;
      default:
        ax = tCX + 55;
        ay = tCY - ANN_H * 0.5;
    }

    /* Clamp inside viewport */
    ax = Math.max(14, Math.min(ax, vW - ANN_W - 14));
    ay = Math.max(14, Math.min(ay, vH - ANN_H - 14));

    /* Apply annotation position */
    var ann = document.getElementById('tourAnn');
    ann.style.left = ax + 'px';
    ann.style.top  = ay + 'px';

    /* Update text */
    document.getElementById('tanLabel').textContent = step.label;
    document.getElementById('tanText').textContent  = step.text;
    document.getElementById('tanCount').textContent = (idx + 1) + ' \/ ' + STEPS.length;
    document.getElementById('tanPrev').disabled     = (idx === 0);
    document.getElementById('tanNext').textContent  = (idx === STEPS.length - 1) ? '\u2713' : '\u2192';
    ann.classList.add('t-on');

    /* ── Arrow ── */
    /*  Start: edge of annotation nearest to target center
        End:   edge of target rect nearest to annotation center      */
    var annCX = ax + ANN_W * 0.5;
    var annCY = ay + ANN_H * 0.5;

    var startPt = rectEdge({ left: ax, top: ay, width: ANN_W, height: ANN_H }, tCX, tCY);
    var endPt   = rectEdge(tRect, annCX, annCY);

    /* Pull the wave endpoint back a touch so the arrowhead sits cleanly */
    var dx  = endPt.x - startPt.x;
    var dy  = endPt.y - startPt.y;
    var len = Math.sqrt(dx * dx + dy * dy);
    var pullBack = 2;
    var waveEndX = len > pullBack ? endPt.x - (dx / len) * pullBack : endPt.x;
    var waveEndY = len > pullBack ? endPt.y - (dy / len) * pullBack : endPt.y;

    document.getElementById('tWave').setAttribute('d',
      squiggle(startPt.x, startPt.y, waveEndX, waveEndY));

    document.getElementById('tArrowV').setAttribute('d',
      arrowhead(startPt.x, startPt.y, endPt.x, endPt.y));

    document.getElementById('tourSvg').classList.add('t-on');
  }

  /* ── Nearest point on rect edge facing (fx, fy) ────────────────────────── */
  function rectEdge(rect, fx, fy) {
    var cx = rect.left + rect.width  * 0.5;
    var cy = rect.top  + rect.height * 0.5;
    var dx = fx - cx, dy = fy - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    var hw = rect.width  * 0.5;
    var hh = rect.height * 0.5;
    var sx = dx !== 0 ? hw / Math.abs(dx) : 1e9;
    var sy = dy !== 0 ? hh / Math.abs(dy) : 1e9;
    var s  = Math.min(sx, sy);
    return { x: cx + dx * s, y: cy + dy * s };
  }

  /* ── Squiggly path between two points ───────────────────────────────────── */
  function squiggle(x1, y1, x2, y2) {
    var dx  = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return 'M ' + f(x1) + ' ' + f(y1) + ' L ' + f(x2) + ' ' + f(y2);

    /* Perpendicular unit vector */
    var px = -dy / len, py = dx / len;

    /* Wave amplitude tapers to 0 at both ends (so arrowhead looks clean) */
    var amp  = Math.min(5.5, Math.max(2.5, len * 0.038));
    var segs = Math.max(4, Math.round(len / 30));

    var d = 'M ' + f(x1) + ' ' + f(y1);

    for (var i = 0; i < segs; i++) {
      var t1    = (i + 0.5) / segs;
      var t2    = (i + 1)   / segs;
      var taper = Math.sin(t1 * Math.PI);          /* peaks in middle, 0 at ends */
      var side  = (i % 2 === 0) ? 1 : -1;

      var cx = x1 + t1 * dx + px * side * amp * taper;
      var cy = y1 + t1 * dy + py * side * amp * taper;
      var ex = (t2 >= 1) ? x2 : x1 + t2 * dx;
      var ey = (t2 >= 1) ? y2 : y1 + t2 * dy;

      d += ' Q ' + f(cx) + ' ' + f(cy) + ' ' + f(ex) + ' ' + f(ey);
    }

    return d;
  }

  /* ── V-shape arrowhead at (toX, toY) pointing from (fromX, fromY) ────────── */
  function arrowhead(fromX, fromY, toX, toY) {
    var dx  = toX - fromX, dy = toY - fromY;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return '';
    var ux = dx / len, uy = dy / len;
    var px = -uy,       py =  ux;
    var sz = 7.5, sp = 3.2;
    var ax = toX - ux * sz + px * sp;
    var ay = toY - uy * sz + py * sp;
    var bx = toX - ux * sz - px * sp;
    var by = toY - uy * sz - py * sp;
    return 'M ' + f(ax) + ' ' + f(ay) + ' L ' + f(toX) + ' ' + f(toY) + ' L ' + f(bx) + ' ' + f(by);
  }

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  function f(n) { return Math.round(n * 10) / 10; }

  /* ── Boot ───────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
