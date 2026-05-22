/* ─────────────────────────────────────────────────────────────────────────────
   tour.js  —  Site walkthrough
   <script defer src="assets/js/tour.js"></script>
   Arrows: assets/images/arrow1.png / arrow2.png / arrow3.png

   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var NOTES = [];

  var ARR     = 115;
  var GAP     = 12;
  var TIP_CLR = 8;
  var FADE_MS = 380;

  var STACK_W        = 500;
  var STACK_LEFT_PAD = 150;
  var STACK_W3       = 360;

  var tourActive  = false;
  var pendingShow = false;
  var pairs      = [];
  var stackEl    = null;
  var stackEl2   = null;
  var stackEl3   = null;
  var stackElC   = null;
  var stackElC   = null;

  var styleEl = document.createElement('style');
  styleEl.textContent = [

    '@font-face{font-family:"Scribble";src:url("assets/fonts/Scribble.otf") format("opentype");}',

    '#tourBtn{',
    '  width:32px;height:32px;border-radius:4px;',
    '  border:2px solid rgba(0,0,0,0.3);background:transparent;',
    '  color:rgb(var(--black));font-size:0.9rem;',
    '  font-family:"InterRegular",sans-serif;font-weight:500;line-height:1;',
    '  cursor:pointer;display:flex;align-items:center;justify-content:center;',
    '  flex-shrink:0;margin-left:auto;margin-right:13px;padding:0;',
    '  transition:border-color .2s,opacity .35s;',
    '  user-select:none;',
    '}',
    '#tourBtn.t-on    { border-color:rgba(0,0,0,0.5); }',
    '#tourBtn.t-faded { opacity:0!important; pointer-events:none; }',

    '.tour-arrow {',
    '  position:absolute;',
    '  top:0; left:-9999px;',
    '  width:' + ARR + 'px; height:' + ARR + 'px;',
    '  object-fit:contain; object-position:center;',
    '  pointer-events:none;',
    '  transform-origin:center center;',
    '  opacity:0;',
    '  transition:opacity ' + FADE_MS + 'ms ease;',
    '  filter:drop-shadow(1px 1px 3px rgba(0,0,0,0.25));',
    '}',
    '.tour-arrow.t-on { opacity:0.875; }',

    '.tour-note {',
    '  position:absolute;',
    '  top:0; left:-9999px;',
    '  pointer-events:none;',
    '  white-space:nowrap;',
    '  opacity:0;',
    '  transition:opacity ' + FADE_MS + 'ms ease;',
    '}',
    '.tour-note.t-on { opacity:0.875; }',

    '.tn-text {',
    '  font-family:"Scribble","InterRegular",cursive;',
    '  font-size:1.38rem; line-height:1.4;',
    '  color:rgba(0,0,0,0.88);',
    '  text-shadow:0.1px 0.1px 1.5px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.12);',
    '  white-space:nowrap; display:block;',
    '}',

    '.tour-stack {',
    '  position:absolute;',
    '  top:0; left:-9999px;',
    '  width:' + STACK_W + 'px;',
    '  font-family:"Scribble",cursive;',
    '  font-size:1.5rem;',
    '  line-height:1.25;',
    '  color:rgba(0,0,0,0.88);',
    '  text-align:justify;',
    '  text-align-last:left;',
    '  text-shadow:0.1px 0.1px 1.5px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.12);',
    '  pointer-events:none;',
    '  user-select:none;',
    '  opacity:0;',
    '  transition:opacity ' + FADE_MS + 'ms ease;',
    '}',
    '.tour-stack.t-on { opacity:1; }',


  ].join('\n');
  document.head.appendChild(styleEl);

  function init() {
    var nav = document.getElementById('navigation');
    if (!nav) return;
    var bar = nav.querySelector('.settings-bar');
    if (!bar) return;

    var btn = document.createElement('button');
    btn.id          = 'tourBtn';
    btn.title       = 'Site guide';
    btn.setAttribute('aria-label', 'Toggle site guide');
    btn.className   = 'd-none d-xl-flex';
    btn.innerHTML   = '<i class="ph ph-info" style="font-size:1rem;"></i>';
    bar.style.marginLeft = '0';
    nav.insertBefore(btn, bar);

    stackElC = document.createElement('div');
    stackElC.id        = 'tourStackC';
    stackElC.className = 'tour-stack';
    stackElC.style.width = '230px';
    stackElC.innerHTML = '<span style="display:inline-block;line-height:1.25;opacity:0.75;border:3px solid rgba(0,0,0,0.625);border-radius:4px;padding:0px 9px;box-shadow:1px 1px 2.5px rgba(0,0,0,0.25);font-size:1.5rem;letter-spacing:0.025em;">COPYRIGHT <i class="ph ph-copyright" style="font-size:0.85em;vertical-align:-0.1em;"></i> ' + new Date().getFullYear() + '</span>';
    document.body.appendChild(stackElC);

    stackEl = document.createElement('div');
    stackEl.id        = 'tourStack';
    stackEl.className = 'tour-stack';
    stackEl.innerHTML = '<span style="display:inline-block;font-size:1.5rem;margin-bottom:0.45em;opacity:0.75;letter-spacing:0.025em;text-transform:uppercase;border:3px solid rgba(0,0,0,0.625);border-radius:4px;padding:0px 9px;box-shadow:1px 1px 2.5px rgba(0,0,0,0.25);line-height:1.25;position:relative;top:-10px;left:-1px;">Page Overview</span><span style="display:block;line-height:1.5;position:relative;top:2.5px;">Welcome to my page. Here you can explore my research, teaching, and conference activity, as well as selected code, cinematography, and contact details for any enquiries or potential collaboration.</span>';
    document.body.appendChild(stackEl);

    stackEl2 = document.createElement('div');
    stackEl2.id        = 'tourStack2';
    stackEl2.className = 'tour-stack';
    stackEl2.innerHTML = '<span style="display:inline-block;font-size:1.5rem;margin-bottom:0.45em;opacity:0.75;letter-spacing:0.025em;text-transform:uppercase;border:3px solid rgba(0,0,0,0.625);border-radius:4px;padding:0px 9px;box-shadow:1px 1px 2.5px rgba(0,0,0,0.25);line-height:1.25;position:relative;top:-17.5px;left:-1px;">Core languages</span><span style="display:block;line-height:1.5;position:relative;top:-5px;">This page was built in HTML, CSS and JavaScript. The layout and styling are handled in CSS, whereas JavaScript takes care of all the animations, navigation and interactions you see across the site.</span>';
    document.body.appendChild(stackEl2);

    stackEl3 = document.createElement('div');
    stackEl3.id        = 'tourStack3';
    stackEl3.className = 'tour-stack';
    stackEl3.style.width = STACK_W3 + 'px';
    stackEl3.innerHTML = '<span style="display:inline-block;font-size:1.5rem;margin-bottom:0.45em;opacity:0.75;letter-spacing:0.025em;text-transform:uppercase;border:3px solid rgba(0,0,0,0.625);border-radius:4px;padding:0px 9px;box-shadow:1px 1px 2.5px rgba(0,0,0,0.25);line-height:1.25;position:relative;top:-10px;left:-1px;">Optimal Viewing</span><span style="display:block;line-height:1.5;position:relative;top:2.5px;">Designed for desktop. For an optimal experience, view at full screen width. Some elements might not display as intended on narrower windows.</span>';
    document.body.appendChild(stackEl3);

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

    document.addEventListener('click', function (e) {
      if (!tourActive) return;
      if (e.target.closest('#tourBtn, .tour-stack, .tour-arrow, .tour-note')) return;
      if (e.target.closest('#heroNameWrap, #pronounceBtn, #pronText, #pronProgressBar')) return;
      if (e.target.closest('.settings-bar')) return;
      if (e.target.closest('.left-bar li')) return;
      hideAll();
    });

    window.addEventListener('scroll', function () {
      if (pendingShow && window.scrollY < 1) {
        pendingShow = false;
        showAll();
        return;
      }
      if (!pendingShow && window.scrollY > 25 && tourActive) hideAll();
    }, { passive: true });

    btn.addEventListener('click', function () {
      if (window.scrollY > 25) {
        pendingShow = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        tourActive ? hideAll() : showAll();
      }
    });

    window.addEventListener('resize', function () {
      if (tourActive && window.innerWidth >= 1200) positionAll();
    }, { passive: true });

  }

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
        if (stackElC) stackElC.classList.add('t-on');
        if (stackEl)  stackEl.classList.add('t-on');
        if (stackEl2) stackEl2.classList.add('t-on');
        if (stackEl3) stackEl3.classList.add('t-on');
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
    if (stackElC) stackElC.classList.remove('t-on');
    if (stackEl)  stackEl.classList.remove('t-on');
    if (stackEl2) stackEl2.classList.remove('t-on');
    if (stackEl3) stackEl3.classList.remove('t-on');
  }

  function positionAll() {
    NOTES.forEach(function (note, i) {
      positionPair(pairs[i].arrow, pairs[i].text, note);
    });
    positionStackC();
    positionStack();
    positionStack2();
    positionStack3();
  }

  function positionStackC() {
    if (!stackElC) return;
    var content = document.querySelector('.hero-content');
    var btnRow  = document.querySelector('.hero-content .d-flex');
    if (!content || !btnRow) return;

    var rr  = btnRow.getBoundingClientRect();
    var cr  = content.getBoundingClientRect();
    var sy  = window.scrollY;
    var sx  = window.scrollX;

    var top  = rr.top + sy - stackEl.offsetHeight - 50;
    var left = cr.right + sx + 105 - 230 - 27.5;

    stackElC.style.top  = top  + 'px';
    stackElC.style.left = left + 'px';
  }


  function positionStack3() {
    if (!stackEl3) return;
    var content = document.querySelector('.hero-content');
    var btnRow  = document.querySelector('.hero-content .d-flex');
    if (!content || !btnRow) return;

    var rr  = btnRow.getBoundingClientRect();
    var cr  = content.getBoundingClientRect();
    var sy  = window.scrollY;
    var sx  = window.scrollX;

    var top  = rr.top + sy - stackEl2.offsetHeight + 165;
    var left = cr.right + sx + 104 - STACK_W3 - 70;

    stackEl3.style.top  = top  + 'px';
    stackEl3.style.left = left + 'px';
  }

  function positionStack2() {
    if (!stackEl2) return;
    var content = document.querySelector('.hero-content');
    var btnRow  = document.querySelector('.hero-content .d-flex');
    if (!content || !btnRow) return;

    var rr  = btnRow.getBoundingClientRect();
    var cr  = content.getBoundingClientRect();
    var sy  = window.scrollY;
    var sx  = window.scrollX;

    var top  = rr.top + sy - stackEl2.offsetHeight + 172.5;
    var left = cr.right + sx + 104;

    stackEl2.style.top  = top  + 'px';
    stackEl2.style.left = left + 'px';
  }

  function positionStack() {
    if (!stackEl) return;
    var content = document.querySelector('.hero-content');
    var btnRow  = document.querySelector('.hero-content .d-flex');
    if (!content || !btnRow) return;

    var rr  = btnRow.getBoundingClientRect();
    var cr  = content.getBoundingClientRect();
    var sy  = window.scrollY;
    var sx  = window.scrollX;

    var top  = rr.top + sy - stackEl.offsetHeight + -40;
    var left = cr.right + sx + 104;

    stackEl.style.top  = top  + 'px';
    stackEl.style.left = left + 'px';
  }

  function positionPair(arrowEl, textEl, note) {
    var target = document.querySelector(note.sel);
    if (!target) return;

    var pr  = target.getBoundingClientRect();
    var sx  = window.scrollX;
    var sy  = window.scrollY;

    var tCX = pr.left + pr.width  * 0.5 + sx;
    var tCY = pr.top  + pr.height * 0.5 + sy;

    var rad = note.approachAngle * Math.PI / 180;
    var ux  = Math.cos(rad);
    var uy  = Math.sin(rad);

    var shiftedPr = {
      left:   pr.left   + sx,
      top:    pr.top    + sy,
      right:  pr.right  + sx,
      bottom: pr.bottom + sy,
      width:  pr.width,
      height: pr.height
    };

    var tipPt = rectEdge(shiftedPr, tCX - ux * 2000, tCY - uy * 2000);
    var tipX  = tipPt.x - ux * TIP_CLR;
    var tipY  = tipPt.y - uy * TIP_CLR;

    var tailX = tipX - ux * note.tailDist;
    var tailY = tipY - uy * note.tailDist;

    var arrCX    = (tipX + tailX) * 0.5;
    var arrCY    = (tipY + tailY) * 0.5;
    var rotation = note.approachAngle - (note.baseAngle || 0);

    arrowEl.style.left = (arrCX - ARR * 0.5 + (note.arrowOffsetX || 0)) + 'px';
    arrowEl.style.top  = (arrCY - ARR * 0.5 + (note.arrowOffsetY || 0)) + 'px';

    if (note.zIndex) {
      arrowEl.style.zIndex = note.zIndex;
      textEl.style.zIndex  = note.zIndex;
    }

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
