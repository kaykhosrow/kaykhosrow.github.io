/* ─────────────────────────────────────────────────────────────────────────────
   tour.js  —  Site walkthrough  (chalk / annotation style)
   Add one line to <head>:  <script defer src="assets/js/tour.js"></script>
   Arrow PNGs:  assets/images/arrow1.png  /  arrow2.png  /  arrow3.png
   ─────────────────────────────────────────────────────────────────────────────

   POSITIONING MODEL
   • approachAngle — direction the arrowHEAD points (0°=→ 90°=↓ 180°=← 270°=↑)
   • tailDist      — arrow length (px from tip to tail)
   • textSide      — where annotation sits relative to the arrow TAIL
                     'above' | 'below' | 'left' | 'right'
   • textTilt      — subtle text rotation (degrees)
   • arrowImg      — PNG number (1 / 2 / 3)
   • baseAngle     — natural direction of that PNG (0 = points right).
                     If arrow appears backwards, change to 180.
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Steps ─────────────────────────────────────────────────────────────── */
  var STEPS = [
    {
      sel:           '#heroName',
      text:          'Click here for the pronunciation of my name',
      approachAngle: 180,
      tailDist:      210,
      textSide:      'above',
      textTilt:      -1.2,
      arrowImg:      1,
      baseAngle:     0,
    },
    {
      sel:           '.work-btn',
      text:          'Click here to learn more about me',
      approachAngle: 150,
      tailDist:      140,
      textSide:      'above',
      textTilt:       1.0,
      arrowImg:      2,
      baseAngle:     0,
    },
    {
      sel:           '.contact-btn',
      text:          'Click here to get in touch',
      approachAngle:  30,
      tailDist:      140,
      textSide:      'above',
      textTilt:      -0.8,
      arrowImg:      3,
      baseAngle:     0,
    },
    {
      sel:           '#navigation ul',
      text:          'Navigate to different sections',
      approachAngle:  90,
      tailDist:      105,
      textSide:      'right',
      textTilt:       0.7,
      arrowImg:      2,
      baseAngle:     0,
    },
    {
      sel:           '.left-bar ul',
      text:          'Find me by email, on LinkedIn, or explore my work on GitHub.',
      approachAngle: 180,
      tailDist:       95,
      textSide:      'above',
      textTilt:      -1.0,
      arrowImg:      3,
      baseAngle:     0,
    },
    {
      sel:           '#settingsGearBtn',
      text:          'Customise the site, switch colours, toggle grain or the lattice.',
      approachAngle:  90,
      tailDist:      105,
      textSide:      'left',
      textTilt:       0.5,
      arrowImg:      1,
      baseAngle:     0,
    },
  ];

  /* ── Constants ─────────────────────────────────────────────────────────── */
  var ANN_W   = 280;
  var ANN_H   = 120;
  var ARR     = 115;
  var FADE_MS = 300;
  var GAP     = 14;
  var TIP_CLR = 8;

  /* ── State ─────────────────────────────────────────────────────────────── */
  var tourActive    = false;
  var currentStep   = -1;
  var transitioning = false;

  /* ── CSS ────────────────────────────────────────────────────────────────── */
  var styleEl = document.createElement('style');
  styleEl.textContent = [

    '@font-face{font-family:"Scribble";src:url("assets/fonts/Scribble.otf") format("opentype");}',

    '@keyframes tWrite{from{clip-path:inset(0 100% 0 0);}to{clip-path:inset(0 0% 0 0);}}',

    /* ? button — same box as gear */
    '#tourBtn{',
    '  width:32px;height:32px;border-radius:4px;',
    '  border:2px solid rgba(0,0,0,0.3);background:transparent;',
    '  color:rgb(var(--black));font-size:1.05rem;',
    '  font-family:"InterRegular",sans-serif;font-weight:500;line-height:1;',
    '  cursor:pointer;display:flex;align-items:center;justify-content:center;',
    '  flex-shrink:0;margin-left:auto;margin-right:13px;padding:0;',
    '  transition:background .2s,color .2s,border-color .2s,opacity .35s;',
    '}',
    '#tourBtn:hover{border-color:rgba(0,0,0,0.55);}',
    '#tourBtn.t-active{background:rgb(var(--black));color:rgb(var(--primary));border-color:rgb(var(--black));}',
    '#tourBtn.t-faded{opacity:0!important;pointer-events:none;}',

    /* Arrow image */
    '#tourArrow{',
    '  position:fixed;z-index:9001;',
    '  width:' + ARR + 'px;height:' + ARR + 'px;',
    '  object-fit:contain;object-position:center;',
    '  pointer-events:none;opacity:0;transform-origin:center center;',
    '  transition:opacity ' + FADE_MS + 'ms ease;',
    '}',
    '#tourArrow.t-on{opacity:1;}',

    /* Annotation block */
    '#tourAnn{',
    '  position:fixed;z-index:9002;width:' + ANN_W + 'px;',
    '  pointer-events:none;opacity:0;',
    '  transition:opacity ' + FADE_MS + 'ms ease;',
    '}',
    '#tourAnn.t-on{opacity:1;pointer-events:auto;}',

    /* Text — Scribble, large, drop-shadow like nav */
    '.tan-text{',
    '  font-family:"Scribble","InterRegular",cursive;',
    '  font-size:1.45rem;line-height:1.4;',
    '  color:rgba(0,0,0,0.88);margin:0 0 12px;',
    '  text-shadow:0.1px 0.1px 1.5px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.12);',
    '  clip-path:inset(0 100% 0 0);',   /* hidden until writing animation */
    '}',
    '.tan-text.t-write{animation:tWrite .75s cubic-bezier(.4,0,.2,1) forwards;}',

    /* Nav row */
    '.tan-nav{display:flex;align-items:center;gap:6px;}',
    '.tan-btn{background:none;border:none;outline:none;cursor:pointer;padding:0;',
    '  font-size:.85rem;color:rgba(0,0,0,0.72);',
    '  font-family:"InterRegular",sans-serif;transition:color .15s;}',
    '.tan-btn:hover{color:rgba(0,0,0,1);}',
    '.tan-btn:disabled{opacity:.18;cursor:default;pointer-events:none;}',
    '.tan-close{margin-left:4px;opacity:.5;}',
    '.tan-close:hover{opacity:1!important;}',
    '.tan-count{flex:1;text-align:center;font-size:.72rem;letter-spacing:.1em;',
    '  color:rgba(0,0,0,0.8);font-family:"InterRegular",sans-serif;}',

  ].join('\n');
  document.head.appendChild(styleEl);

  /* ── Build DOM ──────────────────────────────────────────────────────────── */
  function init() {
    var nav = document.getElementById('navigation');
    if (!nav) return;
    var bar = nav.querySelector('.settings-bar');
    if (!bar) return;

    /* ? button */
    var btn = document.createElement('button');
    btn.id          = 'tourBtn';
    btn.title       = 'Site guide';
    btn.setAttribute('aria-label', 'Open site guide');
    btn.className   = 'd-none d-xl-flex';
    btn.textContent = '?';
    bar.style.marginLeft = '0';
    nav.insertBefore(btn, bar);

    /* Arrow image */
    var arrEl = document.createElement('img');
    arrEl.id  = 'tourArrow';
    arrEl.alt = '';
    arrEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(arrEl);

    /* Annotation */
    var ann = document.createElement('div');
    ann.id = 'tourAnn';
    ann.innerHTML =
      '<p class="tan-text" id="tanText"></p>' +
      '<div class="tan-nav">' +
      '<button class="tan-btn" id="tanPrev" disabled>&#8592;</button>' +
      '<span class="tan-count" id="tanCount"></span>' +
      '<button class="tan-btn" id="tanNext">&#8594;</button>' +
      '<button class="tan-btn tan-close" id="tanClose">&#215;</button>' +
      '</div>';
    document.body.appendChild(ann);

    /* ── Events ── */
    btn.addEventListener('click', function () { tourActive ? endTour() : startTour(); });

    document.getElementById('tanPrev').addEventListener('click', function () {
      if (!transitioning && currentStep > 0) goToStep(currentStep - 1);
    });
    document.getElementById('tanNext').addEventListener('click', function () {
      if (transitioning) return;
      if (currentStep < STEPS.length - 1) goToStep(currentStep + 1);
      else endTour();
    });
    document.getElementById('tanClose').addEventListener('click', endTour);

    document.addEventListener('keydown', function (e) {
      if (!tourActive || transitioning) return;
      if (e.key === 'Escape') { endTour(); return; }
      if (e.key === 'ArrowRight') {
        if (currentStep < STEPS.length - 1) goToStep(currentStep + 1); else endTour();
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' && currentStep > 0) { goToStep(currentStep - 1); e.preventDefault(); }
    });

    window.addEventListener('scroll', function () {
      var away = window.scrollY > 40;
      btn.classList.toggle('t-faded', away);
      if (away && tourActive) endTour();
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (tourActive && currentStep >= 0 && !transitioning) _applyStep(currentStep);
    }, { passive: true });
  }

  /* ── Tour lifecycle ─────────────────────────────────────────────────────── */
  function startTour() {
    tourActive = true;
    document.getElementById('tourBtn').classList.add('t-active');
    currentStep = 0;
    _applyStep(0);
  }

  function endTour() {
    tourActive    = false;
    currentStep   = -1;
    transitioning = false;
    document.getElementById('tourBtn').classList.remove('t-active');
    _fadeOut();
    /* Clear arrow src after fade so nothing lingers */
    setTimeout(function () {
      if (!tourActive) {
        var a = document.getElementById('tourArrow');
        if (a) a.removeAttribute('src');
      }
    }, FADE_MS + 50);
  }

  /* Fade current step out */
  function _fadeOut() {
    var ann = document.getElementById('tourAnn');
    var arr = document.getElementById('tourArrow');
    if (ann) ann.classList.remove('t-on');
    if (arr) arr.classList.remove('t-on');
  }

  /* Go to step: fade out → wait → apply new step */
  function goToStep(idx) {
    if (idx < 0 || idx >= STEPS.length || transitioning) return;
    transitioning = true;
    _fadeOut();
    setTimeout(function () {
      currentStep   = idx;
      transitioning = false;
      _applyStep(idx);
    }, FADE_MS + 40);
  }

  /* ── _applyStep ─────────────────────────────────────────────────────────── */
  function _applyStep(idx) {
    var step   = STEPS[idx];
    var target = document.querySelector(step.sel);
    if (!target) return;

    var tRect = target.getBoundingClientRect();
    var tCX   = tRect.left + tRect.width  * 0.5;
    var tCY   = tRect.top  + tRect.height * 0.5;
    var vW    = window.innerWidth;
    var vH    = window.innerHeight;

    /* Arrow direction unit vector */
    var rad = step.approachAngle * Math.PI / 180;
    var ux  = Math.cos(rad);
    var uy  = Math.sin(rad);

    /* Tip: on the target edge that faces the tail
       We call rectEdge with a point far in the OPPOSITE direction to get
       the correct edge (the one the arrow lands on).                       */
    var tipPt = rectEdge(tRect, tCX - ux * 2000, tCY - uy * 2000);
    var tipX  = tipPt.x - ux * TIP_CLR;
    var tipY  = tipPt.y - uy * TIP_CLR;

    /* Tail: tailDist back from tip */
    var tailX = tipX - ux * step.tailDist;
    var tailY = tipY - uy * step.tailDist;

    /* Arrow image centred between tip and tail */
    var arrCX    = (tipX + tailX) * 0.5;
    var arrCY    = (tipY + tailY) * 0.5;
    var rotation = step.approachAngle - (step.baseAngle || 0);

    /* Annotation anchored at tail */
    var ax, ay;
    switch (step.textSide) {
      case 'above': ax = tailX - ANN_W * 0.5;    ay = tailY - ANN_H - GAP;    break;
      case 'below': ax = tailX - ANN_W * 0.5;    ay = tailY + GAP;             break;
      case 'left':  ax = tailX - ANN_W - GAP;     ay = tailY - ANN_H * 0.5;   break;
      case 'right': ax = tailX + GAP;             ay = tailY - ANN_H * 0.5;   break;
      default:      ax = tailX - ANN_W * 0.5;    ay = tailY - ANN_H - GAP;
    }
    ax = Math.max(14, Math.min(ax, vW - ANN_W - 14));
    ay = Math.max(14, Math.min(ay, vH - ANN_H - 14));

    /* ── Apply annotation ── */
    var annEl  = document.getElementById('tourAnn');
    var textEl = document.getElementById('tanText');
    annEl.style.left      = ax + 'px';
    annEl.style.top       = ay + 'px';
    annEl.style.transform = 'rotate(' + (step.textTilt || 0) + 'deg)';
    textEl.textContent    = step.text;
    document.getElementById('tanCount').textContent = (idx + 1) + ' \/ ' + STEPS.length;
    document.getElementById('tanPrev').disabled     = (idx === 0);
    document.getElementById('tanNext').textContent  = idx === STEPS.length - 1 ? '\u2713' : '\u2192';

    /* ── Apply arrow ── */
    var arrImg = document.getElementById('tourArrow');
    arrImg.src             = 'assets/images/arrow' + step.arrowImg + '.png';
    arrImg.style.left      = (arrCX - ARR * 0.5) + 'px';
    arrImg.style.top       = (arrCY - ARR * 0.5) + 'px';
    arrImg.style.transform = 'rotate(' + rotation.toFixed(1) + 'deg)';

    /* ── Reset writing animation ── */
    textEl.classList.remove('t-write');
    textEl.style.clipPath = 'inset(0 100% 0 0)';
    void textEl.offsetWidth;   /* force reflow */

    /* ── Fade in, then start writing ── */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        annEl.classList.add('t-on');
        arrImg.classList.add('t-on');
        setTimeout(function () {
          textEl.classList.add('t-write');
        }, 200);
      });
    });
  }

  /* ── Nearest point on rect edge facing toward (fx, fy) ──────────────────── */
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
