/* ─────────────────────────────────────────────────────────────────────────────
   tour.js  —  Site walkthrough
   <script defer src="assets/js/tour.js"></script>
   Arrows: assets/images/arrow1.png / arrow2.png / arrow3.png

   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Annotation definitions ─────────────────────────────────────────────── */
  var NOTES = [
    {
      sel:           '#heroName',
      text:          'Click here for pronounciation',
      approachAngle: 180,
      tailDist:      115,
      textSide:      'above',
      tilt:          0,
      arrowImg:      1,
      baseAngle:     2.5,
      arrowOffsetX:  -175,   /* nudge: negative = left,  positive = right */
      arrowOffsetY:  -35,  /* nudge: negative = up,    positive = down  */
      textOffsetY:   -58.5,    /* additional text-only nudge */
      textOffsetX:   -5,
    },
     {
      sel:           '.work-btn',
      text:          'Click here to learn more',
      approachAngle: 150,
      tailDist:      140,
      textSide:      'above',
      tilt:          270,
      arrowImg:      1,
      baseAngle:     340,
      flipX:         true,
      arrowOffsetX:  -245,
      arrowOffsetY:  20,
      textOffsetY:   -107.5,
      textOffsetX:   -106.5,
    },
      {
      sel:           '.contact-btn',
      text:          'Click here to connect',
      approachAngle: 0,
      tailDist:      140,
      textSide:      'above',
      tilt:          0,
      arrowImg:      1,
      baseAngle:     5,
      flipX:         true,
      arrowOffsetX:  275,
      arrowOffsetY:  38.5,
      textOffsetY:   113.75,
      textOffsetX:   130,
    },
    {
      sel:           '#settingsGearBtn',
      text:          'Customise the site',
      approachAngle: 90,
      tailDist:      100,
      textSide:      'left',
      tilt:          0,
      arrowImg:      1,
      baseAngle:     12.5,
      arrowOffsetX:  -45,
      arrowOffsetY:  0,
      textOffsetY:   5.75,
      textOffsetX:   -70,
      zIndex:        55,   /* above nav (z-index:49) */
    },
  ];

  /* ── Constants ─────────────────────────────────────────────────────────── */
  var ARR     = 115;
  var GAP     = 12;
  var TIP_CLR = 8;
  var FADE_MS = 380;

  /* ── State ─────────────────────────────────────────────────────────────── */
  var tourActive = false;
  var pairs      = [];

  /* ── CSS ────────────────────────────────────────────────────────────────── */
  var styleEl = document.createElement('style');
  styleEl.textContent = [

    '@font-face{font-family:"Scribble";src:url("assets/fonts/Scribble.otf") format("opentype");}',

    /* ── Tour button — lives in .left-bar, sized to match social icon links ── */
    '#tourBtn{',
    '  width:44px; height:44px; border-radius:4px;',
    '  border:2px solid rgba(0,0,0,0.35); background:transparent;',
    '  color:rgb(var(--black)); font-size:1.1rem;',
    '  font-family:"InterRegular",sans-serif; font-weight:500; line-height:1;',
    '  cursor:pointer; display:flex; align-items:center; justify-content:center;',
    '  flex-shrink:0; padding:0; margin:0 auto;',
    '  transition:background .2s,color .2s,border-color .2s,opacity .35s;',
    '}',
    '#tourBtn:hover   { border-color:rgba(0,0,0,0.55); }',
    '#tourBtn.t-on    { background:rgb(var(--black)); color:rgb(var(--primary)); border-color:rgb(var(--black)); }',
    '#tourBtn.t-faded { opacity:0!important; pointer-events:none; }',

    /* fixed: stays put in the viewport; slides under nav naturally via z-index */
    '.tour-arrow {',
    '  position:fixed;',
    '  z-index:40;',
    '  width:' + ARR + 'px; height:' + ARR + 'px;',
    '  object-fit:contain; object-position:center;',
    '  pointer-events:none;',
    '  transform-origin:center center;',
    '  opacity:0;',
    '  transition:opacity ' + FADE_MS + 'ms ease;',
    '  filter:drop-shadow(1px 1px 3px rgba(0,0,0,0.25));',
    '}',
    '.tour-arrow.t-on { opacity:1; }',

    '.tour-note {',
    '  position:fixed;',
    '  z-index:40;',
    '  pointer-events:none;',
    '  white-space:nowrap;',
    '  opacity:0;',
    '  transition:opacity ' + FADE_MS + 'ms ease;',
    '}',
    '.tour-note.t-on { opacity:1; }',

    '.tn-text {',
    '  font-family:"Scribble","InterRegular",cursive;',
    '  font-size:1.38rem; line-height:1.4;',
    '  color:rgba(0,0,0,0.88);',
    '  text-shadow:0.1px 0.1px 1.5px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.12);',
    '  white-space:nowrap; display:block;',
    '}',

  ].join('\n');
  document.head.appendChild(styleEl);

  /* ── Build DOM ──────────────────────────────────────────────────────────── */
  function init() {
    /* Target the left-bar instead of the nav settings-bar */
    var leftBar = document.querySelector('.left-bar');
    if (!leftBar) return;

    var btn = document.createElement('button');
    btn.id        = 'tourBtn';
    btn.title     = 'Site guide';
    btn.setAttribute('aria-label', 'Toggle site guide');
    btn.textContent = '?';

    /* Insert at the very top of .left-bar, before the social icons <ul> */
    leftBar.insertBefore(btn, leftBar.firstChild);

    NOTES.forEach(function (note) {
      var arrowEl = document.createElement('img');
      arrowEl.className = 'tour-arrow';
      arrowEl.alt = '';
      arrowEl.setAttribute('aria-hidden', 'true');
      arrowEl.src = 'assets/images/arrow' + note.arrowImg + '.png';
      document.body.appendChild(arrowEl);

      var textEl = document.createElement('div');
      textEl.className = 'tour-note';
      var span = document.createElement('span');
      span.className   = 'tn-text';
      span.textContent = note.text;
      textEl.appendChild(span);
      textEl.style.transform = 'rotate(' + note.tilt + 'deg)';
      document.body.appendChild(textEl);

      pairs.push({ arrow: arrowEl, text: textEl });
    });

    btn.addEventListener('click', function () {
      tourActive ? hideAll() : showAll();
    });

    window.addEventListener('scroll', function () {
      var away = window.scrollY > 25;
      btn.classList.toggle('t-faded', away);
      if (away && tourActive) hideAll();
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (tourActive) positionAll();
    }, { passive: true });
  }

  /* ── Show / hide ─────────────────────────────────────────────────────────── */
  function showAll() {
    tourActive = true;
    document.getElementById('tourBtn').classList.add('t-on');
    positionAll();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        pairs.forEach(function (p) {
          p.arrow.classList.add('t-on');
          p.text.classList.add('t-on');
        });
      });
    });
  }

  function hideAll() {
    tourActive = false;
    document.getElementById('tourBtn').classList.remove('t-on');
    pairs.forEach(function (p) {
      p.arrow.classList.remove('t-on');
      p.text.classList.remove('t-on');
    });
  }

  /* ── Position all pairs ─────────────────────────────────────────────────── */
  function positionAll() {
    NOTES.forEach(function (note, i) {
      positionPair(pairs[i].arrow, pairs[i].text, note);
    });
  }

  function positionPair(arrowEl, textEl, note) {
    var target = document.querySelector(note.sel);
    if (!target) return;

    /* Use viewport-relative rect directly — no scroll offsets needed with
       position:fixed.  The annotations stay exactly where they were set
       regardless of scroll or resize reflow. */
    var pr = target.getBoundingClientRect();

    var tCX = pr.left + pr.width  * 0.5;
    var tCY = pr.top  + pr.height * 0.5;

    var rad = note.approachAngle * Math.PI / 180;
    var ux  = Math.cos(rad);
    var uy  = Math.sin(rad);

    var tipPt = rectEdge(pr, tCX - ux * 2000, tCY - uy * 2000);
    var tipX  = tipPt.x - ux * TIP_CLR;
    var tipY  = tipPt.y - uy * TIP_CLR;

    var tailX = tipX - ux * note.tailDist;
    var tailY = tipY - uy * note.tailDist;

    var arrCX    = (tipX + tailX) * 0.5;
    var arrCY    = (tipY + tailY) * 0.5;
    var rotation = note.approachAngle - (note.baseAngle || 0);

    arrowEl.style.left = (arrCX - ARR * 0.5 + (note.arrowOffsetX || 0)) + 'px';
    arrowEl.style.top  = (arrCY - ARR * 0.5 + (note.arrowOffsetY || 0)) + 'px';

    /* ── per-note z-index override ── */
    if (note.zIndex) {
      arrowEl.style.zIndex = note.zIndex;
      textEl.style.zIndex  = note.zIndex;
    }

    /* ── flipX / flipY support ── */
    var flip = (note.flipX ? 'scaleX(-1) ' : '') + (note.flipY ? 'scaleY(-1) ' : '');
    arrowEl.style.transform = flip + 'rotate(' + rotation.toFixed(1) + 'deg)';

    var nW  = textEl.offsetWidth  || 240;
    var nH  = textEl.offsetHeight || 36;
    var ox  = note.arrowOffsetX || 0;
    var oy  = note.arrowOffsetY || 0;
    var tox = note.textOffsetX  || 0;
    var toy = note.textOffsetY  || 0;
    var ax, ay;

    switch (note.textSide) {
      case 'above': ax = tailX - nW * 0.5 + ox + tox; ay = tailY - nH - GAP + oy + toy; break;
      case 'below': ax = tailX - nW * 0.5 + ox + tox; ay = tailY + GAP       + oy + toy; break;
      case 'left':  ax = tailX - nW - GAP  + ox + tox; ay = tailY - nH * 0.5 + oy + toy; break;
      case 'right': ax = tailX + GAP       + ox + tox; ay = tailY - nH * 0.5 + oy + toy; break;
      default:      ax = tailX - nW * 0.5 + ox + tox; ay = tailY - nH - GAP  + oy + toy;
    }

    textEl.style.left = ax + 'px';
    textEl.style.top  = ay + 'px';
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

  /* ── Boot ───────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
