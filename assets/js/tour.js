/* ─────────────────────────────────────────────────────────────────────────────
   tour.js  —  Site walkthrough
   Add one line to <head>:  <script defer src="assets/js/tour.js"></script>

   ? button appears in the nav bar (same box as the gear icon).
   Click it → all annotations fade in simultaneously.
   Click again / scroll down → all fade out.
   No arrows. No navigation controls. Just text on the page.
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Annotation definitions ─────────────────────────────────────────────
     sel:  CSS selector for the element the note refers to
     text: the annotation text (kept short so it fits on one line)
     pos:  where to place the note relative to the element
           'right'  → to the right of the element
           'above'  → centred above the element
           'left'   → to the left of the element
           'below'  → centred below the element
     gap:  extra breathing room between element edge and note (px)
     tilt: subtle rotation on the text block (degrees)
  ───────────────────────────────────────────────────────────────────────── */
  var NOTES = [
    {
      sel:  '#heroName',
      text: 'Click here for the pronunciation',
      pos:  'right',
      gap:  22,
      tilt: -1.4,
    },
    {
      sel:  '.work-btn',
      text: 'Click here to learn more about me',
      pos:  'above',
      gap:  14,
      tilt:  1.1,
    },
    {
      sel:  '.contact-btn',
      text: 'Click here to get in touch',
      pos:  'right',
      gap:  18,
      tilt: -0.9,
    },
    {
      sel:  '#navigation ul',
      text: 'Navigate to different sections',
      pos:  'above',
      gap:  14,
      tilt:  0.8,
    },
    {
      sel:  '.left-bar ul',
      text: 'Email, LinkedIn, GitHub',
      pos:  'right',
      gap:  16,
      tilt: -1.1,
    },
    {
      sel:  '#settingsGearBtn',
      text: 'Customise the site',
      pos:  'above',
      gap:  14,
      tilt:  0.6,
    },
  ];

  /* ── State ─────────────────────────────────────────────────────────────── */
  var tourActive = false;
  var noteEls    = [];   /* one <div> per annotation, created in init() */

  /* ── CSS ────────────────────────────────────────────────────────────────── */
  var styleEl = document.createElement('style');
  styleEl.textContent = [

    '@font-face{font-family:"Scribble";src:url("assets/fonts/Scribble.otf") format("opentype");}',

    /* ── ? button ── same box as the gear */
    '#tourBtn{',
    '  width:32px;height:32px;border-radius:4px;',
    '  border:2px solid rgba(0,0,0,0.3);background:transparent;',
    '  color:rgb(var(--black));font-size:1.05rem;',
    '  font-family:"InterRegular",sans-serif;font-weight:500;line-height:1;',
    '  cursor:pointer;display:flex;align-items:center;justify-content:center;',
    '  flex-shrink:0;margin-left:auto;margin-right:13px;padding:0;',
    '  transition:background .2s,color .2s,border-color .2s,opacity .35s;',
    '}',
    '#tourBtn:hover   { border-color:rgba(0,0,0,0.55); }',
    '#tourBtn.t-on    { background:rgb(var(--black)); color:rgb(var(--primary)); border-color:rgb(var(--black)); }',
    '#tourBtn.t-faded { opacity:0!important; pointer-events:none; }',

    /* ── Individual annotation notes ── */
    '.tour-note {',
    '  position:fixed;',
    '  z-index:9001;',
    '  pointer-events:none;',
    '  white-space:nowrap;',
    '  opacity:0;',
    '  transition:opacity 0.45s ease;',
    '}',
    '.tour-note.t-on { opacity:1; }',

    /* ── Note text ── */
    '.tn-text {',
    '  font-family:"Scribble","InterRegular",cursive;',
    '  font-size:1.38rem;',
    '  line-height:1.4;',
    '  color:rgba(0,0,0,0.88);',
    '  text-shadow:',
    '    0.1px 0.1px 1.5px rgba(0,0,0,0.45),',
    '    0 2px 8px rgba(0,0,0,0.12);',
    '  white-space:nowrap;',
    '  display:block;',
    '}',

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
    btn.setAttribute('aria-label', 'Toggle site guide');
    btn.className   = 'd-none d-xl-flex';
    btn.textContent = '?';
    bar.style.marginLeft = '0';
    nav.insertBefore(btn, bar);

    /* One annotation div per note — appended to body, opacity:0 */
    NOTES.forEach(function (note) {
      var div  = document.createElement('div');
      div.className = 'tour-note';
      var span = document.createElement('span');
      span.className   = 'tn-text';
      span.textContent = note.text;
      div.appendChild(span);
      div.style.transform = 'rotate(' + note.tilt + 'deg)';
      document.body.appendChild(div);
      noteEls.push(div);
    });

    /* ── Events ── */
    btn.addEventListener('click', function () {
      tourActive ? hideAll() : showAll();
    });

    /* Fade button + notes when user scrolls away from the top */
    window.addEventListener('scroll', function () {
      var away = window.scrollY > 40;
      btn.classList.toggle('t-faded', away);
      if (away && tourActive) hideAll();
    }, { passive: true });

    /* Reposition on resize */
    window.addEventListener('resize', function () {
      if (tourActive) positionAll();
    }, { passive: true });
  }

  /* ── Show / hide ─────────────────────────────────────────────────────────── */
  function showAll() {
    tourActive = true;
    document.getElementById('tourBtn').classList.add('t-on');
    positionAll();
    /* Small rAF delay so position is applied before opacity transition fires */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        noteEls.forEach(function (el) { el.classList.add('t-on'); });
      });
    });
  }

  function hideAll() {
    tourActive = false;
    document.getElementById('tourBtn').classList.remove('t-on');
    noteEls.forEach(function (el) { el.classList.remove('t-on'); });
  }

  /* ── Position all notes based on current element rects ──────────────────── */
  function positionAll() {
    noteEls.forEach(function (noteEl, i) {
      positionNote(noteEl, NOTES[i]);
    });
  }

  function positionNote(noteEl, note) {
    var target = document.querySelector(note.sel);
    if (!target) return;

    var r    = target.getBoundingClientRect();
    var vW   = window.innerWidth;
    var vH   = window.innerHeight;
    var gap  = note.gap || 14;

    /* Measure the note's rendered size (element is in DOM, opacity:0) */
    var nW   = noteEl.offsetWidth  || 200;
    var nH   = noteEl.offsetHeight || 32;

    var ax, ay;

    switch (note.pos) {
      case 'right':
        ax = r.right + gap;
        ay = r.top + r.height * 0.5 - nH * 0.5;
        break;
      case 'left':
        ax = r.left - nW - gap;
        ay = r.top + r.height * 0.5 - nH * 0.5;
        break;
      case 'above':
        ax = r.left + r.width * 0.5 - nW * 0.5;
        ay = r.top - nH - gap;
        break;
      case 'below':
        ax = r.left + r.width * 0.5 - nW * 0.5;
        ay = r.bottom + gap;
        break;
      default:
        ax = r.right + gap;
        ay = r.top + r.height * 0.5 - nH * 0.5;
    }

    /* Clamp to viewport */
    ax = Math.max(12, Math.min(ax, vW - nW - 12));
    ay = Math.max(10, Math.min(ay, vH - nH - 10));

    noteEl.style.left = ax + 'px';
    noteEl.style.top  = ay + 'px';
  }

  /* ── Boot ───────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
