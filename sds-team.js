/* =============================================================
   SUDDEN SNAIL - WHOLE PAGE

   Draws all of suddensnail.com from team.txt: the logo, one card
   per person, and a footer. The Carrd page itself stays empty.

       (logo)   Sudden Snail AB · makers of Esoteric Ebb
                [card] [card] [card]
                email                        © line
                          [ v ]
       ---------------- second screen ----------------
                      Collaborators
                      ( ) Studio (Person)
                          role · links
                      ...
                                    [ESOTERIC EBB Full list ->]

   Adding someone is adding a "## Name" block to team.txt; blocks after
   the "=== Collaborators ===" line become collaborators instead. The
   grids, the phone layout and each wobbly outline all follow the
   number of people, so nothing here needs touching.

   The two screens snap: a scroll, a swipe or the round arrow buttons
   glide from one to the other. The buttons scroll the page themselves
   rather than linking to #anchors, because Carrd uses the address bar's
   hash for its own sections.

   Every card and portrait ring gets its own warble (its own SVG
   turbulence seed), so no two outlines are scratched the same way,
   like the hand-inked edge of the logo's speech bubble.

   The round button in the bottom right swaps paper and ink for a
   dark mode. The logo and portraits are recoloured by a filter rather
   than swapped for other files, so they follow whatever the two
   colours in OPTS are.

   INSTALL
   On suddensnail.com remove everything, and add one Embed
   (Type: Code, Style: Inline) containing only:

      <script defer src="https://glitch951.github.io/CB_Site/sds-team.js"></script>

   An element with id ss-team, id sds-team or a data-team-widget
   attribute is used as the mount if there is one; otherwise the
   script makes its own. Either way the page covers the viewport,
   so Carrd's own padding and colours never show through.
   ============================================================= */

(function () {
  'use strict';
  if (window.__ssTeam) return;
  window.__ssTeam = true;

  var OPTS = {
    source:    'https://glitch951.github.io/CB_Site/team.txt',
    imageBase: 'https://glitch951.github.io/CB_Site/images/',

    /* Used when team.txt does not set them in its header */
    site: {
      logo:      'sudden-snail-logo.png',
      intro:     'Sudden Snail AB · makers of Esoteric Ebb',
      email:     'christofferbodegard@suddensnail.com',
      copyright: '© 2026 Sudden Snail AB',
      collabTitle: 'Collaborators',
      collabLink:  'https://esotericebb.com/#collaborators',
      collabLogo:  'esoteric-ebb-logo-small.png'
    },

    /* Esoteric Ebb palette */
    paper: '#DAE5CF',   // Ebb Paper
    ink:   '#020E16',   // Esoteric Black
    hover: '#C13B51',   // Strength Red
    hoverDark: '#E93C3C', // Special Choice Red; Strength Red is too dark on black

    /* Dark mode swaps paper and ink. A visitor's choice is remembered;
       until they make one, their system setting decides. */
    themeKey: 'ss-theme',

    fontHref: 'https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700' +
              '&family=Fraunces:opsz,wght,SOFT,WONK@9..144,100..900,0..100,0..1&display=swap',
    cacheKey: 'ss-page-txt'
  };

  /* ---------------- styles ---------------- */
  function font() {
    if (document.getElementById('ss-page-font')) return;
    var l = document.createElement('link');
    l.id = 'ss-page-font'; l.rel = 'stylesheet'; l.href = OPTS.fontHref;
    document.head.appendChild(l);
  }

  /* The card with the portrait beside the text instead of above it:
     used on portrait screens, and wherever there are many people. */
  function compact(scope) {
    return `
${scope} .ssp-card{display:grid; grid-template-columns:calc(var(--u)*13) minmax(0,1fr);
  column-gap:calc(var(--u)*2.4); row-gap:calc(var(--u)*.4); align-items:center;
  padding:calc(var(--u)*2)}
${scope} .ssp-card > *{grid-column:2}
/* auto lines make an absolutely placed grid child span the whole card */
${scope} .ssp-card > .ssp-card-bg{grid-column:auto; grid-row:auto}
${scope} .ssp-card > .ssp-por{grid-column:1; grid-row:1 / span 4; margin:0}
${scope} .ssp-name{font-size:calc(var(--u)*2.8)}`;
  }

  function styles() {
    if (document.getElementById('ss-page-css')) return;
    var s = document.createElement('style');
    s.id = 'ss-page-css';
    /* --u is the one unit everything is sized in. It tracks the viewport's
       height on landscape screens and its width on portrait ones, which is
       what lets the whole page fit on one screen without scrolling. */
    s.textContent = `
:root{--ss-paper:${OPTS.paper}; --ss-ink:${OPTS.ink}; --ss-hover:${OPTS.hover}}
:root[data-ss-theme="dark"]{--ss-paper:${OPTS.ink}; --ss-ink:${OPTS.paper}; --ss-hover:${OPTS.hoverDark}}
html,body{background:var(--ss-paper)}
.ssp,.ssp *{box-sizing:border-box}
.ssp{
  --vh:1vh;
  --u:min(var(--vh), .62vw);
  position:fixed; inset:0; z-index:2147483000;
  overflow:auto; -webkit-overflow-scrolling:touch;
  scroll-snap-type:y mandatory; scroll-behavior:smooth;
  scrollbar-width:none;
  background:var(--ss-paper); color:var(--ss-ink);
  font-family:"Averia Serif Libre",Georgia,serif;
  text-align:left;
}
@supports (height:1dvh){ .ssp{--vh:1dvh} }
.ssp::-webkit-scrollbar{display:none}
/* each screen is at least the viewport tall and is a snap stop */
.ssp-screen{position:relative; display:grid; min-height:calc(var(--vh) * 100);
  scroll-snap-align:start; scroll-snap-stop:always}
.ssp a{color:var(--ss-ink)}
.ssp a:hover{color:var(--ss-hover)}
.ssp a:focus-visible,.ssp button:focus-visible{outline:2px solid var(--ss-hover); outline-offset:3px}

.ssp-wrap{
  display:grid; grid-template-columns:auto minmax(0,1fr);
  align-items:center; gap:calc(var(--u)*7);
  padding:calc(var(--u)*7) calc(var(--u)*8);
}
.ssp-logo{margin:0; justify-self:center; line-height:0}
.ssp-logo img{height:calc(var(--u)*76); width:auto; display:block; filter:url(#ssp-tint-light)}

.ssp-main{display:flex; flex-direction:column; gap:calc(var(--u)*3); min-width:0}
.ssp-intro{margin:0; font-size:max(13px, calc(var(--u)*1.7)); letter-spacing:.02em}

.ssp-cards{
  list-style:none; margin:0; padding:0;
  display:grid; grid-template-columns:repeat(var(--cols), minmax(0,1fr));
  gap:calc(var(--u)*3);
}
.ssp-card{
  position:relative;
  padding:calc(var(--u)*2.4) calc(var(--u)*2.4) calc(var(--u)*2);
  display:flex; flex-direction:column; gap:calc(var(--u)*1);
}
.ssp-card > *{position:relative}
.ssp-card > .ssp-card-bg{
  position:absolute; inset:0;
  background:var(--ss-paper); border:3px solid var(--ss-ink);
  border-radius:calc(var(--u)*2.4);
}
.ssp-por{width:100%; aspect-ratio:1; margin:calc(var(--u)*.6) 0}
/* The portraits (and the logo) are black lines on white. The line-art
   filter keeps only the lines, in the ink colour, and makes the white
   see-through, so the card shows behind them in either theme and any
   portrait dropped into images/ matches without being re-exported. */
.ssp-por img{position:absolute; inset:4%; width:92%; height:92%; display:block;
  object-fit:cover; border-radius:50%; filter:url(#ssp-tint-light)}
:root[data-ss-theme="dark"] .ssp-logo img,
:root[data-ss-theme="dark"] .ssp-por img{filter:url(#ssp-tint-dark)}
.ssp-por .ssp-initials{position:absolute; inset:0; display:grid; place-items:center;
  font-family:"Fraunces",Georgia,serif; font-weight:900;
  font-variation-settings:"SOFT" 100,"WONK" 0; font-size:calc(var(--u)*7)}
.ssp-ring{position:absolute; inset:0; border:3px solid var(--ss-ink); border-radius:50%}

.ssp-name{margin:0; font-family:"Fraunces",Georgia,serif; font-weight:800;
  font-variation-settings:"SOFT" 100,"WONK" 0;
  font-size:calc(var(--u)*3.2); line-height:1.05}
.ssp-name{position:relative}
.ssp-name a{text-decoration:none}
.ssp-name a:hover{text-decoration:underline}

/* A name too long for one line does not wrap: its last letters are
   squashed up against the card's wall instead, each one narrower and a
   little taller than the one before. The script sets each letter. */
[data-name].is-squish{white-space:nowrap}
.ssp-ch{display:inline-block; white-space:pre; transform-origin:0 80%}
.ssp-role{margin:0; font-weight:700; font-size:max(13px, calc(var(--u)*1.5)); letter-spacing:.03em}
.ssp-tag{margin:0; font-style:italic; font-weight:300; font-size:max(14px, calc(var(--u)*1.8)); line-height:1.35;
  overflow-wrap:anywhere}
.ssp-links{display:flex; flex-wrap:wrap; column-gap:calc(var(--u)*1.8)}
.ssp-links a{display:inline-flex; align-items:center; min-height:44px;
  font-weight:700; font-size:max(13px, calc(var(--u)*1.5))}

.ssp-foot{display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;
  gap:0 calc(var(--u)*3); font-size:max(12px, calc(var(--u)*1.4))}
.ssp-foot a{display:inline-flex; align-items:center; min-height:44px; font-weight:700}

.ssp-sk .ssp-card-bg,.ssp-sk .ssp-ring{opacity:.25}

/* --- the arrows between the two screens --- */
.ssp.has-collab .ssp-wrap{padding-bottom:max(calc(var(--u)*7), 108px)}
.ssp-next,.ssp-prev{position:absolute; left:50%; transform:translateX(-50%);
  display:flex; flex-direction:column; align-items:center; gap:6px;
  padding:0; border:0; background:none; cursor:pointer; color:var(--ss-ink);
  font:inherit; font-weight:700; font-size:max(12px, calc(var(--u)*1.4)); letter-spacing:.04em;
  -webkit-tap-highlight-color:transparent}
.ssp-next{bottom:max(14px, calc(var(--u)*2.4))}
.ssp-prev{top:max(12px, calc(var(--u)*2.4))}
.ssp-round{position:relative; display:grid; place-items:center; width:52px; height:52px}
.ssp-prev .ssp-round{width:44px; height:44px}
.ssp-round-bg{position:absolute; inset:0; border-radius:50%;
  background:var(--ss-paper); border:3px solid var(--ss-ink)}
.ssp-round svg{position:relative; width:22px; height:22px; transition:transform .25s ease}
.ssp-prev .ssp-round svg{width:20px; height:20px}
.ssp-next .ssp-round{animation:ssp-bob 2.4s ease-in-out infinite}
.ssp-next:hover .ssp-round svg{transform:translateY(3px)}
.ssp-prev:hover .ssp-round svg{transform:translateY(-3px)}
@keyframes ssp-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}

/* --- collaborators: one centred credits frame, titled in its first row --- */
.ssp-cwrap{display:flex; align-items:center; justify-content:center;
  padding:calc(var(--u)*9) calc(var(--u)*8) calc(var(--u)*4)}
.ssp-cin{width:100%; max-width:calc(var(--u)*86); display:flex; flex-direction:column; gap:calc(var(--u)*1.6)}
.ssp-clist{position:relative; list-style:none; margin:0; padding:calc(var(--u)*1.6) calc(var(--u)*3.6)}
.ssp-clist > .ssp-clist-bg{position:absolute; inset:0; background:var(--ss-paper);
  border:3px solid var(--ss-ink); border-radius:calc(var(--u)*2.4)}
.ssp-ctitle{position:relative; padding:calc(var(--u)*2.2) 0 calc(var(--u)*1.8)}
.ssp-ch2{margin:0; font-family:"Fraunces",Georgia,serif; font-weight:900;
  font-variation-settings:"SOFT" 100,"WONK" 0; font-size:calc(var(--u)*5.6); line-height:1}
.ssp-crow{position:relative; display:grid; grid-template-columns:calc(var(--u)*12) minmax(0,1fr);
  align-items:center; column-gap:calc(var(--u)*3); padding:calc(var(--u)*2) 0}
/* each row's rule sits along its top edge, lifted out of the grid */
.ssp-crule{position:absolute; left:0; right:0; top:0; height:0; border-top:2px solid var(--ss-ink)}
.ssp-cpic{position:relative; width:100%; aspect-ratio:1}
.ssp-cpic img{position:absolute; inset:5%; width:90%; height:90%; display:block;
  border-radius:50%; object-fit:cover; filter:url(#ssp-tint-light)}
.ssp-cpic.is-logo img{inset:9%; width:82%; height:82%; border-radius:0; object-fit:contain}
:root[data-ss-theme="dark"] .ssp-cpic img{filter:url(#ssp-tint-dark)}
.ssp-cpic .ssp-initials{position:absolute; inset:0; display:grid; place-items:center;
  font-family:"Fraunces",Georgia,serif; font-weight:900; font-size:calc(var(--u)*4)}
.ssp-ctext{min-width:0}
.ssp-cname{position:relative; margin:0; font-family:"Fraunces",Georgia,serif; font-weight:800;
  font-variation-settings:"SOFT" 100,"WONK" 0; font-size:calc(var(--u)*2.75); line-height:1.08}
.ssp-cname a{text-decoration:none}
.ssp-cname a:hover{text-decoration:underline}
.ssp-cmeta{display:flex; flex-wrap:wrap; align-items:center; column-gap:calc(var(--u)*2); margin-top:calc(var(--u)*.5)}
.ssp-crole{font-weight:700; font-size:max(13px, calc(var(--u)*1.7))}
.ssp-clinks{display:flex; flex-wrap:wrap; column-gap:calc(var(--u)*1.3)}
.ssp-clinks a{display:inline-flex; align-items:center; min-height:36px; font-weight:700; font-size:max(13px, calc(var(--u)*1.7))}
/* the rows ease up one after another the first time the screen shows */
.ssp-collab.is-armed .ssp-crow{opacity:0; transform:translateY(14px)}
.ssp-collab.is-in .ssp-crow{opacity:1; transform:none;
  transition:opacity .5s ease, transform .6s cubic-bezier(.2,.8,.3,1);
  transition-delay:calc(var(--i) * 80ms + 120ms)}

/* the way out to the full list: a small inverted link button */
.ssp a.ssp-all{position:relative; align-self:flex-end; display:inline-flex; align-items:center;
  gap:calc(var(--u)*1.2); min-height:44px; padding:calc(var(--u)*.8) calc(var(--u)*1.8);
  text-decoration:none; color:var(--ss-paper)}
.ssp-all > *{position:relative}
.ssp-all-bg{position:absolute; inset:0; background:var(--ss-ink); border-radius:999px}
.ssp-all img{height:max(14px, calc(var(--u)*1.8)); width:auto; display:block; filter:url(#ssp-letters-light)}
:root[data-ss-theme="dark"] .ssp-all img{filter:url(#ssp-letters-dark)}
.ssp-all-go{display:flex; align-items:center; gap:calc(var(--u)*.8); font-weight:700;
  font-size:max(13px, calc(var(--u)*1.4)); white-space:nowrap}
.ssp-all-go svg{width:calc(var(--u)*2.4); height:calc(var(--u)*1.6); transition:transform .2s ease}
.ssp-all:hover .ssp-all-go svg{transform:translateX(4px)}

/* --- light/dark switch --- */
.ssp-mode{
  position:fixed; right:max(16px, calc(var(--u)*3)); bottom:max(16px, calc(var(--u)*3));
  width:56px; height:56px; padding:0; border:0; background:none; cursor:pointer;
  color:var(--ss-ink); display:grid; place-items:center; z-index:2;
  -webkit-tap-highlight-color:transparent;
}
.ssp-mode-bg{position:absolute; inset:0; border-radius:50%;
  background:var(--ss-paper); border:3px solid var(--ss-ink)}
.ssp-mode svg{position:relative; width:28px; height:28px; overflow:visible}
.ssp-mode svg *{transform-box:fill-box; transform-origin:center}
.ssp-mode .ssp-core{transition:transform .6s cubic-bezier(.34,1.56,.64,1)}
.ssp-mode .ssp-bite{transform:translate(9px,-9px); transition:transform .6s cubic-bezier(.34,1.56,.64,1)}
.ssp-mode .ssp-rays{transform-box:view-box; transform-origin:12px 12px;
  transition:transform .6s cubic-bezier(.34,1.56,.64,1), opacity .3s ease}
.ssp-mode:hover .ssp-rays{transform:rotate(45deg)}
:root[data-ss-theme="dark"] .ssp-mode .ssp-core{transform:scale(1.55)}
:root[data-ss-theme="dark"] .ssp-mode .ssp-bite{transform:translate(0,0)}
:root[data-ss-theme="dark"] .ssp-mode .ssp-rays{transform:rotate(-120deg) scale(.2); opacity:0}
:root[data-ss-theme="dark"] .ssp-mode:hover svg{transform:rotate(-14deg)}
.ssp-mode svg{transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.ssp-mode.is-boing{animation:ssp-boing .62s cubic-bezier(.3,.7,.4,1)}
@keyframes ssp-boing{
  0%{transform:scale(1)}
  18%{transform:scale(.78,1.14) rotate(-10deg)}
  42%{transform:scale(1.16,.88) rotate(7deg)}
  66%{transform:scale(.95,1.05) rotate(-3deg)}
  100%{transform:scale(1)}
}
/* Light pours out of the button as a growing circle; dark is the light
   being sucked back into it. Both are CSS animations with a fill of
   "both", so the very first frame is already clipped. (Starting them
   from script left one frame where the new colours showed full-screen,
   which was the flash.) The script sets --ssp-x/y/r on <html>. */
::view-transition-old(root),::view-transition-new(root){animation:none; mix-blend-mode:normal}
html.ssp-to-light::view-transition-old(root){z-index:1}
html.ssp-to-light::view-transition-new(root){z-index:2;
  animation:ssp-pour .7s cubic-bezier(.65,0,.35,1) both}
html.ssp-to-dark::view-transition-new(root){z-index:1}
html.ssp-to-dark::view-transition-old(root){z-index:2;
  animation:ssp-pour .7s cubic-bezier(.65,0,.35,1) both reverse}
@keyframes ssp-pour{
  from{clip-path:circle(0px at var(--ssp-x) var(--ssp-y))}
  to{clip-path:circle(var(--ssp-r) at var(--ssp-x) var(--ssp-y))}
}
@media (prefers-reduced-motion:reduce){
  .ssp{scroll-behavior:auto}
  .ssp-mode *,.ssp-mode svg{transition:none !important}
  .ssp-mode.is-boing,.ssp-next .ssp-round{animation:none}
  .ssp-collab.is-armed .ssp-crow{opacity:1; transform:none}
}

@media (orientation:portrait){
  .ssp{--u:min(calc(var(--vh)*.8), 2.3vw)}
  .ssp-wrap{grid-template-columns:minmax(0,1fr); align-content:center; align-items:start;
    gap:calc(var(--u)*3); padding:calc(var(--u)*4) calc(var(--u)*3.5)}
  .ssp-logo img{height:calc(var(--u)*18)}
  .ssp-main{gap:calc(var(--u)*2)}
  .ssp-cards{grid-template-columns:minmax(0,1fr); gap:calc(var(--u)*2)}
  ${compact('.ssp')}
  .ssp.has-collab .ssp-wrap{padding-bottom:calc(var(--u)*1.6 + 76px)}
  /* on a phone the arrow and its label sit side by side, to save height */
  .ssp-next{flex-direction:row-reverse; gap:10px}
  .ssp-next .ssp-round{width:44px; height:44px}
  .ssp-cwrap{padding:calc(var(--u)*10) calc(var(--u)*3.5) calc(var(--u)*4)}
  .ssp-cin{max-width:none}
  .ssp-clist{padding:calc(var(--u)*.6) calc(var(--u)*2.2)}
  .ssp-ch2{font-size:calc(var(--u)*4.6)}
  .ssp-ctitle{padding:calc(var(--u)*1.6) 0 calc(var(--u)*1.2)}
  .ssp-crow{grid-template-columns:calc(var(--u)*8.5) minmax(0,1fr); column-gap:calc(var(--u)*2); padding:calc(var(--u)*1.4) 0}
  .ssp-cname{font-size:calc(var(--u)*2.4)}
  .ssp-crole,.ssp-clinks a{font-size:max(12px, calc(var(--u)*1.4))}
}
/* More than three people will not fit side by side as tall cards, so
   they turn into the compact cards two across. */
.ssp.is-many .ssp-cards{grid-template-columns:repeat(2, minmax(0,1fr)); gap:calc(var(--u)*2)}
${compact('.ssp.is-many')}
@media (orientation:portrait) and (max-width:599px){
  .ssp.is-many .ssp-cards{grid-template-columns:minmax(0,1fr)}
}`;
    document.head.appendChild(s);
  }

  /* One warble per card. Seed, frequency and strength all vary, so each
     outline is scratched differently; the ring shares its card's filter
     so a person's card and portrait read as drawn by the same hand. */
  function filters(n) {
    var defs = '';
    for (var i = 0; i < n; i++) {
      var freq  = (0.022 + (i * 0.0071) % 0.02).toFixed(4);
      var scale = (5 + (i * 1.3) % 3).toFixed(1);
      var oct   = 1 + (i % 2);
      defs += '<filter id="ssp-wob-' + i + '" x="-5%" y="-5%" width="110%" height="110%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="' + oct +
        '" seed="' + (i * 7 + 3) + '" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="' + scale +
        '" xChannelSelector="R" yChannelSelector="G"/></filter>';
    }
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' + defs + '</defs></svg>';
  }

  /* ---------------- theme ---------------- */
  function rgb(hex) {
    var n = parseInt(String(hex).replace('#', ''), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  /* A colour matrix that paints every pixel in one colour and sets how
     opaque it is by how dark it was: black lines stay, white goes fully
     see-through. Opacity is "alpha minus lightness", so pixels that were
     already transparent (outside a portrait's disc) stay transparent.
     K lifts the logo's slightly-grey black to fully opaque. */
  var K = 1.06, LUM = [0.2126, 0.7152, 0.0722];
  function lineArtValues(hex) {
    var c = rgb(hex);
    return [
      '0 0 0 0 ' + c[0].toFixed(4),
      '0 0 0 0 ' + c[1].toFixed(4),
      '0 0 0 0 ' + c[2].toFixed(4),
      [-LUM[0] * K, -LUM[1] * K, -LUM[2] * K, K, 0].map(function (v) { return v.toFixed(4); }).join(' ')
    ].join('  ');
  }

  /* For the Esoteric Ebb logo, which is light letters on a dark panel with
     coloured art behind them: keep only pixels that are light in both
     green and blue (the letters), in one colour, and drop the rest. */
  function lettersValues(hex) {
    var c = rgb(hex);
    return [
      '0 0 0 0 ' + c[0].toFixed(4),
      '0 0 0 0 ' + c[1].toFixed(4),
      '0 0 0 0 ' + c[2].toFixed(4),
      '0 6 6 12 -19.4'
    ].join('  ');
  }

  function isDark() { return document.documentElement.getAttribute('data-ss-theme') === 'dark'; }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-ss-theme', theme);
    var dark = theme === 'dark';
    var b = document.querySelector('.ssp-mode');
    if (b) b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function startTheme() {
    var saved = read(OPTS.themeKey);
    if (saved !== 'dark' && saved !== 'light') {
      saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    applyTheme(saved);
  }

  /* The line-art filters and the switch live outside the part that gets
     repainted when team.txt arrives, so they are built once. There is
     one fixed filter per theme rather than one rewritten on each switch:
     rewriting it made the browser re-render the large images mid-swap. */
  function chrome(root) {
    var rays = '';
    for (var a = 0; a < 360; a += 45) {
      var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
      rays += '<line x1="' + (12 + 8 * c).toFixed(2) + '" y1="' + (12 + 8 * s).toFixed(2) +
        '" x2="' + (12 + 10.5 * c).toFixed(2) + '" y2="' + (12 + 10.5 * s).toFixed(2) + '"/>';
    }
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
        '<filter id="ssp-tint-light" color-interpolation-filters="sRGB">' +
          '<feColorMatrix type="matrix" values="' + lineArtValues(OPTS.ink) + '"/></filter>' +
        '<filter id="ssp-tint-dark" color-interpolation-filters="sRGB">' +
          '<feColorMatrix type="matrix" values="' + lineArtValues(OPTS.paper) + '"/></filter>' +
        '<filter id="ssp-letters-light" color-interpolation-filters="sRGB">' +
          '<feColorMatrix type="matrix" values="' + lettersValues(OPTS.paper) + '"/></filter>' +
        '<filter id="ssp-letters-dark" color-interpolation-filters="sRGB">' +
          '<feColorMatrix type="matrix" values="' + lettersValues(OPTS.ink) + '"/></filter>' +
        '<filter id="ssp-wob-frame" x="-5%" y="-5%" width="110%" height="110%">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.0304" numOctaves="1" seed="31" result="n"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>' +
        '<filter id="ssp-wob-rule" x="-2%" y="-300%" width="104%" height="700%">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="60" result="n"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>' +
        '<filter id="ssp-wob-mode" x="-10%" y="-10%" width="120%" height="120%">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="41" result="n"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs></svg>' +
      '<div class="ssp-content"></div>' +
      '<button class="ssp-mode" type="button" aria-label="Switch to dark mode">' +
        '<span class="ssp-mode-bg" style="filter:url(#ssp-wob-mode)"></span>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<mask id="ssp-moon" maskUnits="userSpaceOnUse" x="-6" y="-6" width="36" height="36">' +
            '<rect x="-6" y="-6" width="36" height="36" fill="#fff"/>' +
            '<circle class="ssp-bite" cx="18.5" cy="5.5" r="6.5" fill="#000"/></mask>' +
          '<circle class="ssp-core" cx="12" cy="12" r="5" fill="currentColor" mask="url(#ssp-moon)"/>' +
          '<g class="ssp-rays" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' + rays + '</g>' +
        '</svg>' +
      '</button>';
    while (wrap.firstChild) root.appendChild(wrap.firstChild);

    var btn = root.querySelector('.ssp-mode');
    btn.addEventListener('click', function () { flip(btn); });
    btn.addEventListener('animationend', function () { btn.classList.remove('is-boing'); });
    return root.querySelector('.ssp-content');
  }

  /* The button squashes and springs, the sun's rays spin away as the
     moon's bite slides in, and the light either pours out of the button
     or drains back into it (where the browser can do view transitions;
     elsewhere the colours simply swap). */
  var busy = false;
  function flip(btn) {
    /* A second transition started mid-way would cut the first one off
       and jump straight to its end, which reads as a flash. */
    if (busy) return;
    var next = isDark() ? 'light' : 'dark';
    write(OPTS.themeKey, next);
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    btn.classList.remove('is-boing');
    void btn.offsetWidth;                      // restart the bounce on quick repeat clicks
    btn.classList.add('is-boing');

    if (reduce || !document.startViewTransition) { applyTheme(next); return; }
    var b = btn.getBoundingClientRect(), html = document.documentElement;
    var x = b.left + b.width / 2, y = b.top + b.height / 2;
    html.style.setProperty('--ssp-x', x + 'px');
    html.style.setProperty('--ssp-y', y + 'px');
    html.style.setProperty('--ssp-r', Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 'px');
    html.classList.add(next === 'light' ? 'ssp-to-light' : 'ssp-to-dark');
    busy = true;
    var vt = document.startViewTransition(function () { applyTheme(next); });
    /* A browser that stops drawing frames (a hidden or throttled window)
       can leave a transition waiting forever, which would lock the button.
       Skipping it still applies the new theme, just without the animation. */
    var guard = setTimeout(function () { vt.skipTransition(); }, 2000);
    vt.finished.catch(function () {}).then(function () {
      clearTimeout(guard);
      html.classList.remove('ssp-to-light', 'ssp-to-dark');
      busy = false;
    });
  }

  /* ---------------- content ---------------- */
  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* team.txt is ours, but a typo there should not be able to put a
     javascript: link on the page */
  function safeHref(h) {
    h = String(h || '').trim();
    return /^(https?:|mailto:|#|\/)/i.test(h) ? esc(h) : '';
  }

  /* Lines before the first "## Name" may set the page's own details:
     logo, intro, email, copyright. A line "=== Collaborators ===" starts
     the second list; right after it, "title:" and "full-list:" set that
     screen's heading and where its link button goes. */
  var COLLAB_KEYS = { title: 'collabTitle', 'full-list': 'collabLink' };
  function parse(txt) {
    var site = {}, people = [], collabs = [], list = people, cur = null, buf = [];
    function flush() {
      if (cur) {
        if (!cur.tag) cur.tag = buf.join(' ').trim();
        list.push(cur);
      }
      cur = null; buf = [];
    }
    txt.replace(/\r/g, '').split('\n').forEach(function (line) {
      var t = line.trim();
      if (/^={3,}\s*collaborators\b/i.test(t)) { flush(); list = collabs; return; }
      var m = /^##\s+(.*)$/.exec(t);
      if (m) { flush(); cur = { name: m[1].trim(), role: '', image: '', href: '', tag: '', logo: false, links: [] }; return; }
      if (/^#(?!#)/.test(t)) return;              // comment
      if (!cur) {
        var sk;
        if (list === people) {
          sk = /^(logo|intro|email|copyright):\s*(.*)$/i.exec(t);
          if (sk) site[sk[1].toLowerCase()] = sk[2].trim();
        } else {
          sk = /^(title|full-list):\s*(.*)$/i.exec(t);
          if (sk) site[COLLAB_KEYS[sk[1].toLowerCase()]] = sk[2].trim();
        }
        return;
      }
      var kv = /^(role|image|avatar|href|url|tagline|logo|link):\s*(.*)$/i.exec(t);
      if (kv) {
        var k = kv[1].toLowerCase(), v = kv[2].trim();
        if (k === 'role') cur.role = v;
        else if (k === 'logo') cur.logo = /^(yes|true|1)$/i.test(v);
        else if (k === 'image' || k === 'avatar') cur.image = v;
        else if (k === 'href' || k === 'url') cur.href = v;
        else if (k === 'tagline') cur.tag = v;
        else {
          var b = v.split('|');
          if (b.length >= 2) cur.links.push({ label: b[0].trim(), href: b.slice(1).join('|').trim() });
        }
        return;
      }
      if (t) buf.push(t);
    });
    flush();
    var named = function (p) { return p.name; };
    return { site: site, people: people.filter(named), collabs: collabs.filter(named) };
  }

  function url(src) {
    if (!src) return '';
    return /^https?:|^data:/i.test(src) ? src : OPTS.imageBase + src.replace(/^\//, '');
  }
  function initials(n) {
    return n.split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }

  function cardHtml(p, i) {
    var f = ' style="filter:url(#ssp-wob-' + i + ')"';
    var img = url(p.image);
    var face = img
      ? '<img src="' + esc(img) + '" alt="Portrait of ' + esc(p.name) + '" decoding="async">'
      : '<span class="ssp-initials" aria-hidden="true">' + esc(initials(p.name)) + '</span>';
    var href = safeHref(p.href);
    var label = '<span class="ssp-name-t">' + esc(p.name) + '</span>';
    var name = href ? '<a href="' + href + '">' + label + '</a>' : label;
    var links = linksHtml(p.links);
    return '<li class="ssp-card">' +
      '<div class="ssp-card-bg"' + f + '></div>' +
      '<div class="ssp-por">' + face + '<div class="ssp-ring"' + f + '></div></div>' +
      '<h2 class="ssp-name" data-name="' + esc(p.name) + '">' + name + '</h2>' +
      (p.role ? '<p class="ssp-role">' + esc(p.role) + '</p>' : '') +
      (p.tag ? '<p class="ssp-tag">“' + esc(p.tag) + '”</p>' : '') +
      (links ? '<div class="ssp-links">' + links + '</div>' : '') +
    '</li>';
  }

  function linksHtml(links) {
    return links.map(function (l) {
      var h = safeHref(l.href);
      if (!h) return '';
      var ext = /^https?:/i.test(l.href) ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + h + '"' + ext + '>' + esc(l.label) + '</a>';
    }).join('');
  }

  var ARROW_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg>';
  var ARROW_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 15l7-7 7 7"/></svg>';
  var ARROW_RIGHT = '<svg viewBox="0 0 30 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 10h24M18 3l8 7-8 7"/></svg>';

  /* A collaborator is one credit line: the name as written in team.txt,
     then role and links beneath it. */
  function collabHtml(p, i, wob) {
    var img = url(p.image);
    var face = img
      ? '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" decoding="async" loading="lazy">'
      : '<span class="ssp-initials" aria-hidden="true">' + esc(initials(p.name)) + '</span>';
    var href = safeHref(p.href);
    var label = '<span class="ssp-name-t">' + esc(p.name) + '</span>';
    var name = href ? '<a href="' + href + '" target="_blank" rel="noopener">' + label + '</a>' : label;
    var links = linksHtml(p.links);
    return '<li class="ssp-crow" style="--i:' + i + '">' +
      '<span class="ssp-crule" aria-hidden="true" style="filter:url(#ssp-wob-rule)"></span>' +
      '<div class="ssp-cpic' + (p.logo ? ' is-logo' : '') + '">' + face +
        '<div class="ssp-ring" style="filter:url(#ssp-wob-' + wob + ')"></div></div>' +
      '<div class="ssp-ctext">' +
        '<h3 class="ssp-cname" data-name="' + esc(p.name) + '" data-max-squeeze="0.45">' + name + '</h3>' +
        '<div class="ssp-cmeta">' +
          (p.role ? '<span class="ssp-crole">' + esc(p.role) + '</span>' : '') +
          (links ? '<span class="ssp-clinks">' + links + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</li>';
  }

  function collabScreenHtml(s, collabs, first) {
    var link = safeHref(s.collabLink);
    return '<section class="ssp-screen ssp-collab" aria-label="' + esc(s.collabTitle) + '">' +
      '<button class="ssp-prev" type="button" data-go="0">' +
        '<span class="ssp-round"><span class="ssp-round-bg" style="filter:url(#ssp-wob-mode)"></span>' + ARROW_UP + '</span>' +
        '<span>The team</span></button>' +
      '<div class="ssp-cwrap"><div class="ssp-cin">' +
        '<ul class="ssp-clist">' +
          '<li class="ssp-clist-bg" aria-hidden="true" style="filter:url(#ssp-wob-frame)"></li>' +
          '<li class="ssp-ctitle"><h2 class="ssp-ch2">' + esc(s.collabTitle) + '</h2></li>' +
          collabs.map(function (p, i) { return collabHtml(p, i, first + i); }).join('') +
        '</ul>' +
        (link
          ? '<a class="ssp-all" href="' + link + '" target="_blank" rel="noopener" aria-label="The full Esoteric Ebb collaborator list">' +
              '<span class="ssp-all-bg" style="filter:url(#ssp-wob-mode)"></span>' +
              '<img src="' + esc(url(s.collabLogo)) + '" alt="">' +
              '<span class="ssp-all-go">Full list' + ARROW_RIGHT + '</span>' +
            '</a>'
          : '') +
      '</div></div>' +
    '</section>';
  }

  function pageHtml(site, people, collabs, skeleton) {
    var s = {
      logo: site.logo || OPTS.site.logo,
      intro: site.intro || OPTS.site.intro,
      email: site.email || OPTS.site.email,
      copyright: site.copyright || OPTS.site.copyright,
      collabTitle: site.collabTitle || OPTS.site.collabTitle,
      collabLink: site.collabLink || OPTS.site.collabLink,
      collabLogo: OPTS.site.collabLogo
    };
    var cards = skeleton
      ? [0, 1, 2].map(function (i) {
          return '<li class="ssp-card"><div class="ssp-card-bg" style="filter:url(#ssp-wob-' + i + ')"></div>' +
            '<div class="ssp-por"><div class="ssp-ring" style="filter:url(#ssp-wob-' + i + ')"></div></div></li>';
        }).join('')
      : people.map(cardHtml).join('');
    var mail = s.email
      ? '<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>'
      : '<span></span>';
    var team = skeleton ? 3 : people.length;
    var more = !skeleton && collabs.length > 0;
    return filters(team + (more ? collabs.length : 0)) +
      '<section class="ssp-screen" aria-label="The team">' +
      '<div class="ssp-wrap">' +
        '<h1 class="ssp-logo"><img src="' + esc(url(s.logo)) + '" alt="Sudden Snail"></h1>' +
        '<main class="ssp-main' + (skeleton ? ' ssp-sk' : '') + '">' +
          '<p class="ssp-intro">' + esc(s.intro) + '</p>' +
          '<ul class="ssp-cards">' + cards + '</ul>' +
          '<footer class="ssp-foot">' + mail + '<span>' + esc(s.copyright) + '</span></footer>' +
        '</main>' +
      '</div>' +
      (more
        ? '<button class="ssp-next" type="button" data-go="1">' +
            '<span>' + esc(s.collabTitle) + '</span>' +
            '<span class="ssp-round"><span class="ssp-round-bg" style="filter:url(#ssp-wob-mode)"></span>' + ARROW_DOWN + '</span>' +
          '</button>'
        : '') +
      '</section>' +
      (more ? collabScreenHtml(s, collabs, team) : '');
  }

  var watcher = null;
  function paint(root, content, data, skeleton) {
    var n = skeleton ? 3 : data.people.length;
    var collabs = data.collabs || [];
    root.style.setProperty('--cols', Math.max(1, Math.min(n, 3)));
    root.classList.toggle('is-many', n > 3);
    root.classList.toggle('has-collab', !skeleton && collabs.length > 0);
    content.innerHTML = pageHtml(data.site, data.people, collabs, skeleton);
    squishAll(content);

    /* the arrows glide to their screen; the CSS decides smooth or instant */
    var screens = content.querySelectorAll('.ssp-screen');
    Array.prototype.forEach.call(content.querySelectorAll('[data-go]'), function (b) {
      b.addEventListener('click', function () {
        var to = screens[+b.getAttribute('data-go')];
        if (to) root.scrollTo({ top: to.offsetTop });
      });
    });

    /* The collaborator rows wait out of sight until their screen is
       mostly showing, then ease in. Without IntersectionObserver they
       are simply there. */
    if (watcher) { watcher.disconnect(); watcher = null; }
    var collab = content.querySelector('.ssp-collab');
    if (collab && 'IntersectionObserver' in window) {
      collab.classList.add('is-armed');
      watcher = new IntersectionObserver(function (seen) {
        if (!seen[0].isIntersecting) return;
        collab.classList.add('is-in');
        watcher.disconnect(); watcher = null;
      }, { root: root, threshold: 0.35 });
      watcher.observe(collab);
    }
  }

  /* ---------------- squashed names ---------------- */
  var SQUEEZE_CURVES = [1.6, 1.1, 0.7];  // steepest first: squash kept near the wall if it can be
  var MAX_SQUEEZE = 0.62;   // the last letter keeps at least 38% of its width
  var MAX_STRETCH = 1.22;   // how much taller a squashed letter may get

  function unSquish(h) {
    var t = h.querySelector('.ssp-name-t');
    t.textContent = h.getAttribute('data-name');
    t.removeAttribute('aria-hidden');
    (t.parentNode.tagName === 'A' ? t.parentNode : h).removeAttribute('aria-label');
    h.classList.remove('is-squish');
  }

  function squishName(h) {
    unSquish(h);
    var t = h.querySelector('.ssp-name-t');
    var name = h.getAttribute('data-name');
    h.classList.add('is-squish');
    var avail = h.clientWidth;
    var over = t.getBoundingClientRect().width - avail + 1;
    if (!avail || over <= 0) { h.classList.remove('is-squish'); return; }

    /* each letter in its own box, so each can be measured and squashed */
    var chars = Array.from(name);
    t.innerHTML = chars.map(function (c) { return '<span class="ssp-ch">' + esc(c) + '</span>'; }).join('');
    t.setAttribute('aria-hidden', 'true');
    (t.parentNode.tagName === 'A' ? t.parentNode : h).setAttribute('aria-label', name);
    var spans = t.querySelectorAll('.ssp-ch');
    var w = Array.prototype.map.call(spans, function (s) { return s.getBoundingClientRect().width; });
    over = t.getBoundingClientRect().width - avail + 1;

    /* Squash as few letters as will do. Over the last n letters the
       squeeze ramps up towards the wall; d is how hard the last one is
       squeezed to win back exactly the missing width. */
    /* a credit line gives up sooner and wraps, rather than crush a long name */
    var limit = parseFloat(h.getAttribute('data-max-squeeze')) || MAX_SQUEEZE;
    var n, d, ramp, curve, ci, i, found = false;
    for (ci = 0; ci < SQUEEZE_CURVES.length && !found; ci++) {
      curve = SQUEEZE_CURVES[ci];
      for (n = Math.min(3, chars.length); n <= chars.length; n++) {
        ramp = 0;
        for (i = 0; i < n; i++) ramp += w[chars.length - n + i] * Math.pow((i + 1) / n, curve);
        d = over / ramp;
        if (d <= limit) { found = true; break; }
      }
    }
    if (!found) { unSquish(h); return; }  // too long even squashed: let it wrap

    for (i = 0; i < n; i++) {
      var j = chars.length - n + i;
      var sx = 1 - d * Math.pow((i + 1) / n, curve);
      var sy = Math.min(MAX_STRETCH, 1 / Math.sqrt(sx));
      spans[j].style.width = (w[j] * sx).toFixed(2) + 'px';
      spans[j].style.transform = 'scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
    }
  }

  function squishAll(root) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-name]'), squishName);
  }

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function init() {
    var root = document.getElementById('ss-team')
            || document.getElementById('sds-team')
            || document.querySelector('[data-team-widget]');
    if (!root) {
      root = document.createElement('div');
      root.id = 'ss-team';
      document.body.appendChild(root);
    }
    root.classList.add('ssp');
    root.innerHTML = '';
    font(); styles();
    var content = chrome(root);
    startTheme();

    var cached = read(OPTS.cacheKey), painted = false;
    if (cached) {
      var old = parse(cached);
      if (old.people.length) { paint(root, content, old, false); painted = true; }
    }
    if (!painted) paint(root, content, { site: {}, people: [], collabs: [] }, true);

    /* The squash is measured, so it is redone when the width or the
       font changes (Fraunces usually arrives after the first paint). */
    var queued = false;
    function resquish() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; squishAll(content); });
    }
    window.addEventListener('resize', resquish, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resquish);

    fetch(OPTS.source + '?v=' + Math.floor(Date.now() / 300000), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        if (painted && txt === cached) return;
        var fresh = parse(txt);
        if (!fresh.people.length) return;
        paint(root, content, fresh, false);
        write(OPTS.cacheKey, txt);
      })
      /* Leave the skeleton up rather than a blank page if team.txt
         cannot be reached; the logo and footer still show. */
      .catch(function (e) { if (window.console) console.warn('Sudden Snail: could not load team.txt', e); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
