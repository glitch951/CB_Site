/* =============================================================
   ESOTERIC EBB - TOP BAR

   Dropdown arrow, horizontal logo, section links, Steam button.
   Solid background at all times. Hides on the way down past the
   splash, comes back on the way up.

   FONT: declared outright rather than inherited, because Carrd's
   own rules win inside an embed and the links came out in the
   wrong serif. The webfont is loaded by this script.

   IMAGES: everything lives in CB_Site/images/. Filenames must
   match exactly, including capitals. If your files are .jpg
   rather than .png, change the extensions in CONFIG.

   INSTALL
   Add an Embed element anywhere on the site and set it to
   Type: Code, Style: HIDDEN, Location: Body End.

   Hidden is important. An Inline embed lives inside whichever
   section it was dropped into, so it only runs when that section is
   the visible page: land on /#faq and the bar never appears. Hidden
   hoists the code out to the document body, so it runs once for the
   whole site no matter which section is showing. The bar attaches
   itself to document.body and is position:fixed, so where the embed
   physically sits makes no difference to how it looks.

   Then paste the loader below. It
   appends a fresh query string on every page load, so no browser
   or CDN cache can serve you an old copy of this file:

     <script>
     (function(){
       var s = document.createElement('script');
       s.src = 'https://glitch951.github.io/CB_Site/ee-topbar.js?v=' + Date.now();
       document.head.appendChild(s);
     })();
     </script>

   Delete any older ee-topbar script tag or inline paste from the
   page first. If one is left behind it is harmless, since this
   build removes whatever bar is already there before building its
   own, but there is no reason to load the file twice.

   The console logs the build id and the logo URL on every load,
   so you can confirm which copy is running.
   ============================================================= */

(function () {
  'use strict';

  var BUILD = '2026-08-09r';

  /* This build does not bail out if another copy already ran. It
     tears down whatever bar is on the page and rebuilds, so a
     stale cached copy or a leftover inline paste cannot win. */
  function teardown() {
    ['.ee-tb', '.ee-sheet', '#ee-topbar-css'].forEach(function (sel) {
      [].forEach.call(document.querySelectorAll(sel), function (n) {
        if (n.parentNode) n.parentNode.removeChild(n);
      });
    });
  }

  window.__eeTopbar = BUILD;

  var IMG = 'https://glitch951.github.io/CB_Site/images/';

  var CONFIG = {
    logo:     IMG + 'EE_Logo_Horizontal.png',
    logoAlt:  'Esoteric Ebb',
    homeHref: '#home',

    /* { sep: true } draws a divider instead of a link. */
    /* Pages on this site first, then the divider, then everything that
       leaves the site. { sep: true } draws the divider. */
    nav: [
      { label: 'Ask Chris',     href: '#askchris' },
      { label: 'FAQ',           href: '#faq' },
      { label: 'Soundtrack',    href: '#ost' },
      { label: 'Collaborators', href: '#collaborators' },
      { sep: true },
      { label: 'Devlogs',       href: 'https://christofferbodegard.com/', external: true },
      { label: 'Wiki',          href: 'https://esotericebb.wiki.gg/wiki/Esoteric_Ebb', external: true },
      { label: 'Press Kit',     href: 'https://drive.google.com/drive/folders/1p4B3Nj2qKUuBeUHakrodC_ZtwRw8Y6ni?usp=sharing', external: true }
    ],

    cta: {
      label: 'Buy Now',
      href:  'https://store.steampowered.com/app/2057760/Esoteric_Ebb/?utm_source=eewebsite&utm_medium=topbar&utm_campaign=buy'
    },

    /* Snagn points at the Buy Now button and shifts his angle every
       couple of seconds so he does not look frozen.
       The file currently has a space in its name, which has to be
       written as %20 in a URL. Renaming it to Snagn_Pointing.png and
       changing the line below is tidier. */
    /* Every number here is measured off your mockup and expressed as a
       multiple of the button's height, so the framing survives a change
       to ctaH. In the mockup the button was 291x85 and Snagn was
       224x282, his left edge flush with the button's right edge and his
       top 21px below the button's top. */
    pointer: {
      src:         IMG + 'Snagn%20Pointing.png',
      show:        true,
      heightRatio: 282 / 85,   // 3.318 x the button height
      topRatio:    21 / 85,    // 0.247 x the button height, from its top
      leftPx:      -22,        // negative slides him onto the button. The PNG
                               // carries roughly 20px of empty space to the
                               // left of the glove at this size, so this is
                               // what puts the fingertip on the red edge
                               // rather than the image's own bounding box.
      angleA:      -2,         // degrees, first pose
      angleB:      2,          // degrees, second pose
      holdMs:      1000,       // how long each pose is held
      originX:     '50%',      // he turns on his own axis, not on the finger
      originY:     '50%',

      /* The bar keeps enough clear space on the right for him, so he can
         stand in exactly the same spot at every window width instead of
         being nudged about or cut off. Set false to let the button sit
         hard against the edge again, at the cost of losing him on
         narrower screens. */
      reserveSpace: true,
      reserveGap:   10         // px of breathing room past his right edge
    },

    /* The other sites. Logos only, never text. This site is not
       listed, the logo in the corner covers it. */
    /* Left alone, every entry renders at logoH and lines up under the
       logo in the bar, which is what you want almost always. The two
       overrides exist for odd artwork: height: 40 to render one entry
       larger or smaller, align: 'center' to centre it in the panel.
       Only reach for them if a particular file needs it. The panel
       widens itself to fit the widest entry, so nothing gets squashed. */
    sites: [
      /* height and nudgeX are measured from the files themselves, since
         each one frames its lettering differently. Against a 34px bar
         logo the lettering is 26.8px tall and starts 3.6px in from the
         image edge, so:
           ERA_Logo_Horizontal  lettering is 83.8% of the image and starts
             4.05% in  ->  32px tall, pulled 6px left
           CB_Logo  is two stacked lines, the top one 43.2% of the image
             and flush to the edge  ->  62px tall so "Christoffer" reads
             at the same size as the wordmarks, pushed 4px right
         Re-export a logo and height is the number to revisit.
         nudgeX shifts one entry sideways if it ever needs it; the logos
         are centred in the panel, so normally nothing needs nudging. */
      { name: 'Esoteric Era',         url: 'https://esoteric-era.com/',
        logo: IMG + 'ERA_Logo_Horizontal.png', height: 32 },
      { name: 'Christoffer Bodegård', url: 'https://christofferbodegard.com/',
        logo: IMG + 'CB_Logo.png',             height: 62 }
    ],

    /* To use the sans cut of the same superfamily, change both of
       these to Averia Sans Libre / Averia+Sans+Libre. */
    font:     "'Averia Serif Libre'",
    fontHref: 'https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,400&display=swap',

    bg:       '#020E16',
    height:   74,
    heightSm: 58,
    ctaH:     38,    // px, Buy Now button height

    logoH:    34,    // px, logo height in the bar

    navGap:   34,    // px, guaranteed clear space between the links and
                     //     the Buy Now button
    caretW:   20,    // px, arrow button width
    brandGap: 6,     // px, gap between arrow and logo
    logoPadX: 9,     // px, padding inside the logo's hover outline

    slotMinW: 230,   // px, dropdown grows past this if a logo needs it
    panelPad: 10,    // px, padding inside the dropdown panel
    slotPadY: 10,

    /* false means the bar floats over the page and takes up no
       layout space at all, so a full bleed splash stays full bleed.
       true pushes the page down by the bar's height instead. */
    offsetBody:   false,

    /* Stay out of sight until Carrd has finished loading, so the bar
       does not sit alone on a blank page. Ready means the document has
       fully loaded and Carrd has dropped its is-preload class.
       maxWaitMs is a backstop: if something stalls, the bar appears
       anyway rather than never showing up. */
    showAfterLoad: true,
    maxWaitMs:     8000,

    hideOnScroll: true,
    hideAfter:    'splash',  // 'splash' is one viewport height, or give a number of px
    hideDelta:    6
  };

  function loadFont() {
    if (!CONFIG.fontHref || document.getElementById('ee-tb-font')) return;
    var l = document.createElement('link');
    l.id = 'ee-tb-font';
    l.rel = 'stylesheet';
    l.href = CONFIG.fontHref;
    document.head.appendChild(l);
  }

  function styles() {
    var css = `
.ee-tb,.ee-tb *,.ee-sheet,.ee-sheet *{box-sizing:border-box; font-family:${CONFIG.font},Georgia,serif}
.ee-tb{
  position:fixed; top:0; left:0; right:0; z-index:9000; height:${CONFIG.height}px;
  color:#DAE5CF; background:${CONFIG.bg}; overflow:visible;
  transition:transform .32s ease;
}
/* is-entering parks the bar above the viewport so its first appearance
   slides down on the same transition the scroll-up uses */
.ee-tb.is-entering{transform:translateY(-100%)}
.ee-tb.is-hidden{transform:translateY(-100%)}
.ee-tb.is-loading,.ee-sheet.is-loading{visibility:hidden}
.ee-tb-inner{
  max-width:1400px; height:100%; margin:0 auto; padding:0 clamp(14px,3vw,30px);
  display:flex; align-items:center; gap:clamp(10px,2vw,26px);
}

/* brand: arrow, then logo, both on the nav baseline */
.ee-brand{position:relative; display:flex; flex-direction:row; align-items:center; gap:${CONFIG.brandGap}px; flex:0 0 auto}
.ee-caret{
  padding:0; width:${CONFIG.caretW}px; height:20px; border:0; background:none; cursor:pointer;
  color:#DAE5CF; opacity:.5; display:grid; place-items:center;
  transition:transform .25s ease;
}
.ee-caret:hover,.ee-caret[aria-expanded="true"]{opacity:1; color:#DB5B2C}
.ee-caret[aria-expanded="true"]{transform:rotate(180deg)}
.ee-caret svg{width:11px; height:7px; display:block}

.ee-brand-link{
  display:block; line-height:0; padding:5px ${CONFIG.logoPadX}px;
  border:1px solid transparent; border-radius:11px;
}
.ee-brand-link:hover,.ee-brand-link:focus-visible{border-color:#DB5B2C}
.ee-brand-link img{height:${CONFIG.logoH}px; width:auto; display:block}

/* dropdown: logos only, rounded, orange outline on hover */
.ee-sites{
  position:absolute; top:calc(100% + 12px); z-index:20;
  /* offset so each slot's outline sits directly under the logo's outline */
  left:${CONFIG.caretW + CONFIG.brandGap - CONFIG.panelPad - 1}px;  /* -1 for the panel border */
  padding:${CONFIG.panelPad}px; display:grid; gap:8px;
  width:max-content; min-width:${CONFIG.slotMinW}px; max-width:460px;
  background:${CONFIG.bg}; border:1px solid rgba(218,229,207,.20); border-radius:18px;
  box-shadow:0 20px 44px rgba(0,0,0,.6);
  opacity:0; visibility:hidden; transform:translateY(-6px);
  transition:opacity .18s ease, transform .18s ease, visibility .18s;
}
.ee-sites.is-open{opacity:1; visibility:visible; transform:none}
.ee-site{
  display:grid; align-items:center; justify-items:center;
  width:100%;
  /* symmetric side padding, so a centred logo sits on the slot's true centre */
  padding:${CONFIG.slotPadY}px ${CONFIG.logoPadX}px;
  text-decoration:none; line-height:0;
  border:1px solid transparent; border-radius:12px;
}
/* Height is set per entry and the width follows the artwork, so every
   wordmark renders at its true proportions instead of being squashed
   into a fixed box. */
.ee-site img{width:auto; max-width:none; display:block}
.ee-site.is-start{justify-items:start}
.ee-site:hover,.ee-site:focus-visible{border-color:#DB5B2C}

/* section links: colour switches instantly, no fade */
.ee-nav{
  display:flex; align-items:center; gap:clamp(8px,1.6vw,24px);
  margin-left:clamp(14px,2.2vw,34px); margin-right:${CONFIG.navGap}px;
  flex:0 0 auto;   /* never shrink below its content, or the links slide
                      under the button instead of collapsing */
}
.ee-link{
  padding:6px 0; text-decoration:none; white-space:nowrap; color:#DAE5CF;
  font-size:clamp(13px,1.05vw,16px); letter-spacing:.1em; font-variant:small-caps;
  transition:none;
}
.ee-link:hover,.ee-link:focus-visible,.ee-link.is-active{color:#DB5B2C}
.ee-navsep{
  color:#DAE5CF; opacity:.30; user-select:none;
  font-size:clamp(13px,1.05vw,16px); line-height:1;
}

.ee-right{display:flex; align-items:center; gap:clamp(10px,1.4vw,18px);
  margin-left:auto; flex:0 0 auto}
.ee-cta-wrap{position:relative; display:inline-flex; align-items:center; flex:0 0 auto}
.ee-cta{
  display:inline-flex; align-items:center; height:${CONFIG.ctaH}px;
  padding:0 clamp(16px,1.6vw,24px);
  background:#E93C3C; color:#fff; text-decoration:none; border-radius:8px;
  font-size:clamp(13px,1.05vw,16px); letter-spacing:.12em;
  text-transform:uppercase; font-weight:700;
  white-space:nowrap; flex:0 0 auto;
  transition:none;
}

/* Snagn: hidden until the button is hovered, then straight in, no fade.
   He hangs below the bar rather than being clipped by it, and turns on
   his own centre so the whole figure tilts together. */
.ee-point{
  position:absolute; z-index:2; pointer-events:none;
  left:calc(100% + ${CONFIG.pointer.leftPx}px);
  top:${Math.round(CONFIG.pointer.topRatio * CONFIG.ctaH)}px;
  height:${Math.round(CONFIG.pointer.heightRatio * CONFIG.ctaH)}px;
  width:auto; display:block;
  transform-origin:${CONFIG.pointer.originX} ${CONFIG.pointer.originY};
  visibility:hidden; opacity:0; transition:none;
  animation:ee-point ${CONFIG.pointer.holdMs * 2}ms infinite;
}
.ee-cta-wrap:hover .ee-point,.ee-cta:focus-visible ~ .ee-point{visibility:visible; opacity:1}
/* If the window is too narrow for him he stays away entirely. Moving him
   would make his position depend on the window width, which it must not. */
.ee-cta-wrap.no-room .ee-point{visibility:hidden}
@keyframes ee-point{
  0%,48%  {transform:rotate(${CONFIG.pointer.angleA}deg)}
  50%,98% {transform:rotate(${CONFIG.pointer.angleB}deg)}
  100%    {transform:rotate(${CONFIG.pointer.angleA}deg)}
}

.ee-burger{
  display:none; width:32px; height:32px; place-items:center; padding:0;
  background:none; border:0; color:#DAE5CF; cursor:pointer;
}
.ee-burger:hover{color:#DB5B2C}
.ee-burger svg{width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.5;
  stroke-linecap:round; stroke-linejoin:round}

.ee-sheet{
  position:fixed; inset:0; z-index:8999; padding:calc(${CONFIG.heightSm}px + 24px) 24px 30px;
  background:${CONFIG.bg}; overflow-y:auto; color:#DAE5CF;
  opacity:0; visibility:hidden; transition:opacity .25s ease, visibility .25s;
}
.ee-sheet.is-open{opacity:1; visibility:visible}
.ee-sheet a.ee-sheet-link{
  display:block; padding:14px 0; text-decoration:none; color:inherit;
  font-size:24px; letter-spacing:.05em; font-variant:small-caps;
  border-bottom:1px solid rgba(218,229,207,.12); transition:none;
}
.ee-sheet a.ee-sheet-link:hover{color:#DB5B2C}
.ee-sheet .ee-cta{margin-top:22px; width:100%; justify-content:center; height:50px; font-size:18px}
.ee-sheet-sites{margin-top:26px; display:grid; gap:8px; justify-content:start}
.ee-sheet-sites .ee-site{border-color:rgba(218,229,207,.18)}

@media (max-width:1080px){
  .ee-tb{height:${CONFIG.heightSm}px}
  .ee-nav{display:none}
  .ee-burger{display:grid}
  .ee-brand-link img{height:26px}
}
@media (max-width:520px){ .ee-tb .ee-cta-wrap{display:none} .ee-sheet .ee-cta{display:inline-flex} }
@media (prefers-reduced-motion:reduce){
  .ee-tb,.ee-sheet,.ee-sites,.ee-caret{transition:none}
  .ee-point{animation:none}
}`;

    /* Anchor jumps still stop clear of the bar, whether or not the
       page is offset. */
    css += `
html{scroll-padding-top:${CONFIG.height + 12}px}
@media (max-width:1080px){ html{scroll-padding-top:${CONFIG.heightSm + 10}px} }`;

    if (CONFIG.offsetBody) {
      css += `
body{padding-top:${CONFIG.height}px}
@media (max-width:1080px){ body{padding-top:${CONFIG.heightSm}px} }`;
    }
    var s = document.createElement('style');
    s.id = 'ee-topbar-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  var ICON = {
    caret:  '<svg viewBox="0 0 11 7" aria-hidden="true"><path d="M1 1l4.5 5L10 1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    burger: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  function navHtml(cls, withSeps) {
    return CONFIG.nav.map(function (n) {
      if (n.sep) return withSeps ? '<span class="ee-navsep" aria-hidden="true">|</span>' : '';
      var t = n.external ? ' target="_blank" rel="noopener"' : '';
      return '<a class="' + cls + '" href="' + n.href + '"' + t + ' data-href="' + n.href + '">' + n.label + '</a>';
    }).join('');
  }


  function pointerHtml() {
    return '<img class="ee-point" src="' + CONFIG.pointer.src + '" alt="" aria-hidden="true">';
  }

  function sitesHtml() {
    return CONFIG.sites.map(function (s) {
      var h = s.height || CONFIG.logoH;
      var cls = 'ee-site' + (s.align === 'start' ? ' is-start' : '');
      var st = 'height:' + h + 'px';
      if (s.nudgeX) st += ';margin-left:' + s.nudgeX + 'px';
      return '<a class="' + cls + '" href="' + s.url + '" aria-label="' + s.name + '">' +
        '<img src="' + s.logo + '" alt="' + s.name + '" loading="lazy" ' +
        'style="' + st + '"></a>';
    }).join('');
  }

  function whenSiteReady(cb) {
    if (!CONFIG.showAfterLoad) { cb(); return; }

    var done = false, poll, bail;
    function preloading() {
      return document.body && document.body.className.indexOf('is-preload') !== -1;
    }
    function finish() {
      if (done) return;
      done = true;
      clearInterval(poll);
      clearTimeout(bail);
      window.removeEventListener('load', check);
      cb();
    }
    function check() {
      if (!done && document.readyState === 'complete' && !preloading()) finish();
    }

    window.addEventListener('load', check);
    poll = setInterval(check, 100);
    bail = setTimeout(finish, CONFIG.maxWaitMs);
    check();
  }

  function init() {
    teardown();
    loadFont();
    styles();
    if (window.console && console.info) {
      console.info('[ee-topbar] build ' + BUILD + ' | logo: ' +
        String(CONFIG.logo).replace(/^data:.*/, '(inline)').split('/').pop());
    }

    var bar = document.createElement('header');
    bar.className = 'ee-tb';
    bar.innerHTML =
      '<div class="ee-tb-inner">' +
        '<div class="ee-brand">' +
          '<button class="ee-caret" aria-expanded="false" aria-label="Other sites">' + ICON.caret + '</button>' +
          '<a class="ee-brand-link" href="' + CONFIG.homeHref + '">' +
            '<img src="' + CONFIG.logo + '" alt="' + CONFIG.logoAlt + '">' +
          '</a>' +
          '<div class="ee-sites">' + sitesHtml() + '</div>' +
        '</div>' +
        '<nav class="ee-nav">' + navHtml('ee-link', true) + '</nav>' +
        '<div class="ee-right">' +
          '<div class="ee-cta-wrap">' +
            '<a class="ee-cta" href="' + CONFIG.cta.href + '" target="_blank" rel="noopener">' + CONFIG.cta.label + '</a>' +
            (CONFIG.pointer.show ? pointerHtml() : '') +
          '</div>' +
          '<button class="ee-burger" aria-label="Open menu" aria-expanded="false">' + ICON.burger + '</button>' +
        '</div>' +
      '</div>';

    var sheet = document.createElement('div');
    sheet.className = 'ee-sheet';
    sheet.innerHTML = navHtml('ee-sheet-link', false) +
      '<a class="ee-cta" href="' + CONFIG.cta.href + '" target="_blank" rel="noopener">' + CONFIG.cta.label + '</a>' +
      '<div class="ee-sheet-sites">' + sitesHtml() + '</div>';

    if (CONFIG.showAfterLoad) {
      bar.classList.add('is-loading', 'is-entering');
      sheet.classList.add('is-loading');
    }
    document.body.appendChild(bar);
    document.body.appendChild(sheet);

    /* visibility:hidden still lays the bar out, so the logo and Snagn
       are already fetched and measured by the time it appears. */
    whenSiteReady(function () {
      sheet.classList.remove('is-loading');
      fitPointer();

      /* Become visible while still parked above the viewport, let the
         browser settle that as the starting style, then drop the offset
         so the transition actually runs instead of the bar popping in. */
      bar.classList.remove('is-loading');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bar.classList.remove('is-entering');
        });
      });
    });

    /* Snagn sits at one fixed offset from the button, always. If the
       window is too narrow to fit him he is simply not shown, so he can
       never drift, be clipped, or push out a scrollbar. */
    /* The links keep their natural width. When there is no longer room
       for all of them beside the logo and the button, they fold into the
       burger rather than overlapping anything. */
    function fitNav() {
      var nav = bar.querySelector('.ee-nav');
      var brand = bar.querySelector('.ee-brand');
      var right = bar.querySelector('.ee-right');
      var inner = bar.querySelector('.ee-tb-inner');
      if (!nav || !brand || !right || !inner) return;

      bar.classList.remove('is-cramped');
      if (getComputedStyle(nav).display === 'none') return;   // burger already

      var cs = getComputedStyle(inner);
      var room = inner.clientWidth
               - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var need = brand.offsetWidth + nav.scrollWidth + right.offsetWidth
               + CONFIG.navGap;
      if (need > room) bar.classList.add('is-cramped');
    }

    function fitPointer() {
      var img = bar.querySelector('.ee-point');
      var wrap = bar.querySelector('.ee-cta-wrap');
      var inner = bar.querySelector('.ee-tb-inner');
      if (!img || !wrap || !inner) return;
      var w = img.offsetWidth;
      if (!w) return;

      /* How far he reaches past the button's right edge. */
      var reach = CONFIG.pointer.leftPx + w + CONFIG.pointer.reserveGap;

      if (CONFIG.pointer.reserveSpace && reach > 0) {
        inner.style.paddingRight = reach + 'px';
      }

      var over = wrap.getBoundingClientRect().right + CONFIG.pointer.leftPx + w
                 - (window.innerWidth - 4);
      wrap.classList.toggle('no-room', over > 0);
      fitNav();
    }
    var ptr = bar.querySelector('.ee-point');
    if (ptr) {
      if (ptr.complete) fitPointer(); else ptr.addEventListener('load', fitPointer);
    }
    window.addEventListener('resize', fitPointer, { passive: true });
    fitNav();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitNav);   // link widths change with the webfont
    }

    var caret = bar.querySelector('.ee-caret'),
        sites = bar.querySelector('.ee-sites'),
        burger = bar.querySelector('.ee-burger');

    function setSites(open) {
      sites.classList.toggle('is-open', open);
      caret.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    caret.addEventListener('click', function (e) {
      e.stopPropagation();
      setSites(!sites.classList.contains('is-open'));
    });
    document.addEventListener('click', function (e) { if (!sites.contains(e.target)) setSites(false); });

    function setSheet(open) {
      sheet.classList.toggle('is-open', open);
      burger.innerHTML = open ? ICON.close : ICON.burger;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.documentElement.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () { setSheet(!sheet.classList.contains('is-open')); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setSheet(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setSites(false); setSheet(false); } });

    var ticking = false, lastY = window.pageYOffset || 0;

    function threshold() {
      return typeof CONFIG.hideAfter === 'number' ? CONFIG.hideAfter : window.innerHeight;
    }
    function onScroll() {
      if (!CONFIG.hideOnScroll || ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.pageYOffset || document.documentElement.scrollTop;
        var open = sites.classList.contains('is-open') || sheet.classList.contains('is-open');
        var delta = y - lastY;
        if (open || y <= threshold()) {
          bar.classList.remove('is-hidden');
        } else if (delta > CONFIG.hideDelta) {
          bar.classList.add('is-hidden');
          setSites(false);
        } else if (delta < -CONFIG.hideDelta) {
          bar.classList.remove('is-hidden');
        }
        if (Math.abs(delta) > CONFIG.hideDelta) lastY = y;
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Carrd swaps sections on the hash. Letting the browser handle the
       anchor means a fast second click can land while it is still settling
       the first, and the click appears to do nothing. Setting the hash
       ourselves makes the newest click win every time. */
    function onNavClick(e) {
      var a = e.currentTarget;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#' || href.length < 2) return;   // off-site links
      e.preventDefault();
      setSites(false);
      setSheet(false);
      if (location.hash !== href) location.hash = href;
      else window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
    [].forEach.call(document.querySelectorAll('.ee-link, .ee-sheet-link'), function (a) {
      a.addEventListener('click', onNavClick);
    });

    function syncActive() {
      var h = location.hash || CONFIG.homeHref;
      [].forEach.call(document.querySelectorAll('.ee-link'), function (a) {
        a.classList.toggle('is-active', a.dataset.href === h);
      });
    }
    window.addEventListener('hashchange', syncActive);
    syncActive();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
