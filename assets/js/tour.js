/* ─────────────────────────────────────────────────────────────────────────────
   tour.js  —  Site walkthrough  (chalk annotation style)
   Add to <head>:  <script defer src="assets/js/tour.js"></script>
   Arrow assets must exist at:  assets/images/arrow1.png  /  arrow2.png  /  arrow3.png
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
     STEPS
     pos:      where to place the annotation relative to the target
     gap:      distance (px) from target edge to annotation edge
     arrowImg: which PNG to use (1 / 2 / 3)
     baseAngle:natural pointing direction of that PNG in degrees
               0 = points RIGHT, 90 = points DOWN, 180 = points LEFT, etc.
               Adjust these if the arrows appear backwards on your machine.
  ───────────────────────────────────────────────────────────────────────────── */
  var STEPS = [
    {
      sel:        '#heroNameWrap',
      label:      '01  —  NAME',
      text:       'Click here for the pronunciation of my name',
      pos:        'right',
      gap:        200,        /* push into the empty right half of the hero */
      arrowImg:   1,
      baseAngle:  0,          /* arrow1 assumed to point right */
      curveDir:   -1,
    },
    {
      sel:        '.work-btn',
      label:      '02  —  ABOUT',
      text:       'Click here to learn more about me',
      pos:        'left',
      gap:        110,
      arrowImg:   2,
      baseAngle:  180,        /* arrow2 assumed to point right → flip for left-pointing */
      curveDir:   1,
    },
    {
      sel:        '.contact-btn',
      label:      '03  —  CONTACT',
      text:       'Click here to get in touch',
      pos:        'right',
      gap:        110,
      arrowImg:   3,
      baseAngle:  0,
      curveDir:   -1,
    },
    {
      sel:        '#navigation ul',
      label:      '04  —  NAVIGATION',
      text:       'Navigate to different sections',
      pos:        'above',
      gap:        50,
      arrowImg:   1,
      baseAngle:  -90,        /* rotate arrow1 so it points downward */
      curveDir:   1,
    },
    {
      sel:        '.left-bar',
      label:      '05  —  SOCIALS',
      text:       'Find me by email, on LinkedIn, or explore my work on GitHub.',
      pos:        'right',
      gap:        30,         /* very close — sits right next to the icons */
      arrowImg:   2,
      baseAngle:  180,        /* points left toward the icons */
      curveDir:   -1,
    },
    {
      sel:        '#settingsGearBtn',
      label:      '06  —  SETTINGS',
      text:       'Customise the site, switch colours, toggle grain or the lattice.',
      pos:        'above-left',
      gap:        50,
      arrowImg:   3,
      baseAngle:  30,         /* tilted down-right toward the gear */
      curveDir:   1,
    },
  ];

  var ANN_W = 270;   /* annotation width (px)  */
  var ANN_H = 138;   /* estimated height — used only for positioning maths */
  var ARR   = 88;    /* arrow image bounding square (px) */

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

    /* ── Tour ? button — exact same box as .settings-gear-btn ── */
    '#tourBtn {',
    '  width:32px; height:32px;',
    '  border-radius:4px;',
    '  border:2px solid rgba(0,0,0,0.3);',
    '  background:transparent;',
    '  color:rgb(var(--black));',
    '  font-size:1.05rem;',
    '  font-family:"InterRegular",sans-serif;',
    '  font-weight:500;',
    '  line-height:1;',
    '  cursor:pointer;',
    '  display:flex; align-items:center; justify-content:center;',
    '  flex-shrink:0;',
    '  margin-left:auto; margin-right:13px;',
    '  padding:0;',
    '  transition:background 0.2s ease, color 0.2s ease,',
    '             border-color 0.2s ease, opacity 0.35s ease;',
    '}',
    '#tourBtn:hover { border-color:rgba(0,0,0,0.55); }',
    '#tourBtn.t-active {',
    '  background:rgb(var(--black));',
    '  color:rgb(var(--primary));',
    '  border-color:rgb(var(--black));',
    '}',
    '#tourBtn.t-faded { opacity:0 !important; pointer-events:none; }',

    /* ── Arrow image ── */
    '#tourArrow {',
    '  position:fixed;',
    '  z-index:9001;',
    '  width:' + ARR + 'px;',
    '  height:' + ARR + 'px;',
    '  object-fit:contain;',
    '  object-position:center;',
    '  pointer-events:none;',
    '  opacity:0;',
    '  transform-origin:center center;',
    '  transition:opacity 0.35s ease 0.1s;',
    '}',
    '#tourArrow.t-on { opacity:1; }',

    /* ── Annotation ── */
    '#tourAnn {',
    '  position:fixed;',
    '  z-index:9002;',
    '  width:' + ANN_W + 'px;',
    '  pointer-events:none;',
    '  opacity:0;',
    '  font-family:"ChalkBoard","InterRegular",cursive;',
    '  transition:',
    '    opacity 0.35s ease,',
    '    left 0.38s cubic-bezier(0.4,0,0.2,1),',
    '    top  0.38s cubic-bezier(0.4,0,0.2,1);',
    '}',
    '#tourAnn.t-on { opacity:1; pointer-events:auto; }',

    /* Label — full opacity */
    '.tan-label {',
    '  font-size:0.68rem;',
    '  letter-spacing:0.2em;',
    '  text-transform:uppercase;',
    '  color:rgba(0,0,0,0.88);',
    '  font-weight:700;',
    '  margin-bottom:6px;',
    '  font-family:"InterRegular",sans-serif;',
    '}',
    '.tan-rule {',
    '  width:100%; height:1px;',
    '  background:rgba(0,0,0,0.18);',
    '  margin-bottom:9px;',
    '}',
    /* Main text — ChalkBoard font, large and readable */
    '.tan-text {',
    '  font-size:1.15rem;',
    '  line-height:1.45;',
    '  color:rgba(0,0,0,0.88);',
    '  margin:0 0 11px;',
    '  font-family:"ChalkBoard","InterRegular",cursive;',
    '  letter-spacing:0.01em;',
    '}',
    /* Nav row */
    '.tan-nav {',
    '  display:flex; align-items:center; gap:5px;',
    '}',
    '.tan-btn {',
    '  background:none; border:none; outline:none;',
    '  cursor:pointer; padding:0;',
    '  font-size:0.82rem;',
    '  color:rgba(0,0,0,0.75);',
    '  line-height:1;',
    '  font-family:"InterRegular",sans-serif;',
    '  transition:color 0.15s;',
    '}',
    '.tan-btn:hover     { color:rgba(0,0,0,1); }',
    '.tan-btn:disabled  { opacity:0.2; cursor:default; pointer-events:none; }',
    '.tan-close         { margin-left:4px; opacity:0.55; }',
    '.tan-close:hover   { opacity:1 !important; }',
    /* Counter — full opacity */
    '.tan-count {',
    '  flex:1; text-align:center;',
    '  font-size:0.7rem;',
    '  letter-spacing:0.1em;',
    '  color:rgba(0,0,0,0.82);',
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

    /* ── Tour button — plain ? character, no icon font ── */
    var btn = document.createElement('button');
    btn.id        = 'tourBtn';
    btn.title     = 'Site guide';
    btn.setAttribute('aria-label', 'Open site guide');
    btn.className = 'd-none d-xl-flex';
    btn.textContent = '?';
    settingsBar.style.marginLeft = '0';
    nav.insertBefore(btn, settingsBar);

    /* ── Arrow image (single reusable element) ── */
    var arrImg = document.createElement('img');
    arrImg.id  = 'tourArrow';
    arrImg.alt = '';
    arrImg.setAttribute('aria-hidden', 'true');
    document.body.appendChild(arrImg);

    /* ── Annotation ── */
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
    var arr = document.getElementById('tourArrow');
    if (b)   b.classList.remove('t-active');
    if (ann) { ann.classList.remove('t-on'); }
    if (arr) {
      arr.classList.remove('t-on');
      /* Clear src after fade so no ghost image lingers */
      setTimeout(function () {
        if (!tourActive) arr.removeAttribute('src');
      }, 400);
    }
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

    /* ── Annotation position ── */
    var ax, ay;
    switch (step.pos) {
      case 'right':
        ax = tRect.right + g;
        ay = tCY - ANN_H * 0.5;
        break;
      case 'left':
        ax = tRect.left - ANN_W - g;
        ay = tCY - ANN_H * 0.5;
        break;
      case 'above':
        ax = tCX - ANN_W * 0.5;
        ay = tRect.top - ANN_H - g;
        break;
      case 'above-left':
        ax = tCX - ANN_W + 20;
        ay = tRect.top - ANN_H - g;
        break;
      default:
        ax = tRect.right + g;
        ay = tCY - ANN_H * 0.5;
    }
    ax = Math.max(14, Math.min(ax, vW - ANN_W - 14));
    ay = Math.max(14, Math.min(ay, vH - ANN_H - 14));

    /* ── Update annotation ── */
    var ann = document.getElementById('tourAnn');
    ann.style.left = ax + 'px';
    ann.style.top  = ay + 'px';
    document.getElementById('tanLabel').textContent = step.label;
    document.getElementById('tanText').textContent  = step.text;
    document.getElementById('tanCount').textContent = (idx + 1) + ' \/ ' + STEPS.length;
    document.getElementById('tanPrev').disabled     = (idx === 0);
    document.getElementById('tanNext').textContent  = (idx === STEPS.length - 1) ? '\u2713' : '\u2192';
    ann.classList.add('t-on');

    /* ── Position & rotate the PNG arrow ── */
    var arr = document.getElementById('tourArrow');

    /* Temporarily hide while repositioning to avoid flash */
    arr.classList.remove('t-on');
    arr.style.transition = 'none';

    /* Load the correct PNG */
    arr.src = 'assets/images/arrow' + step.arrowImg + '.png';

    /* Annotation center and edge nearest to target */
    var annCX  = ax + ANN_W * 0.5;
    var annCY  = ay + ANN_H * 0.5;
    var edgePt = rectEdge({ left: ax, top: ay, width: ANN_W, height: ANN_H }, tCX, tCY);

    /* Direction vector from annotation edge toward target */
    var dx     = tCX - edgePt.x;
    var dy     = tCY - edgePt.y;
    var dist   = Math.sqrt(dx * dx + dy * dy);
    var ux     = dist > 0 ? dx / dist : 1;
    var uy     = dist > 0 ? dy / dist : 0;

    /* Angle the arrow must rotate to point toward the target,
       accounting for the image's natural pointing direction.       */
    var targetAngle = Math.atan2(uy, ux) * 180 / Math.PI;
    var rotation    = targetAngle - (step.baseAngle || 0);

    /* Place arrow just outside the annotation edge,
       offset toward the target so it "emerges" from the annotation. */
    var EDGE_OFFSET = 10;  /* px past the annotation edge */
    var imgCX = edgePt.x + ux * (EDGE_OFFSET + ARR * 0.45);
    var imgCY = edgePt.y + uy * (EDGE_OFFSET + ARR * 0.45);

    arr.style.left            = (imgCX - ARR * 0.5) + 'px';
    arr.style.top             = (imgCY - ARR * 0.5) + 'px';
    arr.style.transform       = 'rotate(' + rotation.toFixed(1) + 'deg)';
    arr.style.transformOrigin = 'center center';

    /* Fade arrow in after a short delay */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        arr.style.transition = 'opacity 0.4s ease 0.12s';
        arr.classList.add('t-on');
      });
    });
  }

  /* ── Nearest point on a rect's edge facing outward toward (fx, fy) ────── */
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

  /* ── Boot ───────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
