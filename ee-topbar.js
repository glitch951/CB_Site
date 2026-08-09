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
   Carrd, add a Header section, add an Embed element
   (Type: Code, Style: Inline):

     <script defer src="https://glitch951.github.io/CB_Site/ee-topbar.js"></script>
   ============================================================= */

(function () {
  'use strict';
  if (window.__eeTopbar) return;
  window.__eeTopbar = true;

  var IMG = 'https://glitch951.github.io/CB_Site/images/';

  var CONFIG = {
    logo:     IMG + 'EE_Logo_Horizontal.png',
    logoAlt:  'Esoteric Ebb',
    homeHref: '#home',

    nav: [
      { label: 'Devlogs',       href: 'https://christofferbodegard.com/', external: true },
      { label: 'Ask Chris',     href: '#askchris' },
      { label: 'Wiki',          href: 'https://esotericebb.wiki.gg/wiki/Esoteric_Ebb', external: true },
      { label: 'FAQ',           href: '#faq' },
      { label: 'Soundtrack',    href: '#ost' },
      { label: 'Collaborators', href: '#collaborators' }
    ],

    cta: {
      label: 'Buy Now',
      href:  'https://store.steampowered.com/app/2057760/Esoteric_Ebb/?utm_source=eewebsite&utm_medium=topbar&utm_campaign=buy'
    },

    /* The other sites. Logos only, never text. This site is not
       listed, the logo in the corner covers it. */
    sites: [
      { name: 'Esoteric Era',         url: 'https://esoteric-era.com/',        logo: IMG + 'ERA_Logo_Horizontal.png' },
      { name: 'Christoffer Bodegård', url: 'https://christofferbodegard.com/', logo: IMG + 'CB_Logo.png' }
    ],

    /* To use the sans cut of the same superfamily, change both of
       these to Averia Sans Libre / Averia+Sans+Libre. */
    font:     "'Averia Serif Libre'",
    fontHref: 'https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,400&display=swap',

    bg:       '#020E16',
    height:   74,
    heightSm: 58,
    logoH:    34,    // px, logo height in the bar
    slotW:    230,   // px, dropdown slot width
    slotH:    72,    // px, dropdown slot height. Tall enough for the CB logo
    slotPadX: 16,
    slotPadY: 10,

    /* false means the bar floats over the page and takes up no
       layout space at all, so a full bleed splash stays full bleed.
       true pushes the page down by the bar's height instead. */
    offsetBody:   false,
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
.ee-tb.is-hidden{transform:translateY(-100%)}
.ee-tb-inner{
  max-width:1400px; height:100%; margin:0 auto; padding:0 clamp(14px,3vw,30px);
  display:flex; align-items:center; gap:clamp(10px,2vw,26px);
}

/* brand: arrow, then logo, both on the nav baseline */
.ee-brand{position:relative; display:flex; flex-direction:row; align-items:center; gap:6px; flex:0 0 auto}
.ee-caret{
  padding:0; width:20px; height:20px; border:0; background:none; cursor:pointer;
  color:#DAE5CF; opacity:.5; display:grid; place-items:center;
  transition:transform .25s ease;
}
.ee-caret:hover,.ee-caret[aria-expanded="true"]{opacity:1; color:#DB5B2C}
.ee-caret[aria-expanded="true"]{transform:rotate(180deg)}
.ee-caret svg{width:11px; height:7px; display:block}

.ee-brand-link{
  display:block; line-height:0; padding:5px 9px;
  border:1px solid transparent; border-radius:11px;
}
.ee-brand-link:hover,.ee-brand-link:focus-visible{border-color:#DB5B2C}
.ee-brand-link img{height:${CONFIG.logoH}px; width:auto; display:block}

/* dropdown: logos only, rounded, orange outline on hover */
.ee-sites{
  position:absolute; top:calc(100% + 12px); left:0; z-index:20;
  padding:10px; display:grid; gap:8px;
  background:${CONFIG.bg}; border:1px solid rgba(218,229,207,.20); border-radius:18px;
  box-shadow:0 20px 44px rgba(0,0,0,.6);
  opacity:0; visibility:hidden; transform:translateY(-6px);
  transition:opacity .18s ease, transform .18s ease, visibility .18s;
}
.ee-sites.is-open{opacity:1; visibility:visible; transform:none}
.ee-site{
  display:grid; place-items:center; width:${CONFIG.slotW}px; height:${CONFIG.slotH}px;
  padding:${CONFIG.slotPadY}px ${CONFIG.slotPadX}px; text-decoration:none; line-height:0;
  border:1px solid transparent; border-radius:12px;
}
/* px limits rather than percentages: a percentage height does not
   resolve against a centred grid area, so a tall logo overflowed */
.ee-site img{
  max-width:${CONFIG.slotW - CONFIG.slotPadX * 2}px;
  max-height:${CONFIG.slotH - CONFIG.slotPadY * 2}px;
  width:auto; height:auto; object-fit:contain; display:block;
}
.ee-site:hover,.ee-site:focus-visible{border-color:#DB5B2C}

/* section links: colour switches instantly, no fade */
.ee-nav{display:flex; align-items:center; gap:clamp(8px,1.6vw,24px); margin-left:clamp(8px,2vw,28px)}
.ee-link{
  padding:6px 0; text-decoration:none; white-space:nowrap; color:#DAE5CF;
  font-size:clamp(13px,1.05vw,16px); letter-spacing:.1em; font-variant:small-caps;
  transition:none;
}
.ee-link:hover,.ee-link:focus-visible,.ee-link.is-active{color:#DB5B2C}

.ee-right{display:flex; align-items:center; gap:clamp(10px,1.4vw,18px); margin-left:auto}
.ee-cta{
  display:inline-flex; align-items:center; height:38px; padding:0 clamp(16px,1.6vw,24px);
  background:#E93C3C; color:#fff; text-decoration:none; border-radius:8px;
  font-size:clamp(13px,1.05vw,16px); letter-spacing:.12em; font-variant:small-caps;
  transition:background .2s ease;
}
.ee-cta:hover{background:#f25151}

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
@media (max-width:520px){ .ee-tb .ee-cta{display:none} .ee-sheet .ee-cta{display:inline-flex} }
@media (prefers-reduced-motion:reduce){ .ee-tb,.ee-sheet,.ee-sites,.ee-caret{transition:none} }`;

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

  function navHtml(cls) {
    return CONFIG.nav.map(function (n) {
      var t = n.external ? ' target="_blank" rel="noopener"' : '';
      return '<a class="' + cls + '" href="' + n.href + '"' + t + ' data-href="' + n.href + '">' + n.label + '</a>';
    }).join('');
  }

  function sitesHtml() {
    return CONFIG.sites.map(function (s) {
      return '<a class="ee-site" href="' + s.url + '" aria-label="' + s.name + '">' +
        '<img src="' + s.logo + '" alt="' + s.name + '" loading="lazy"></a>';
    }).join('');
  }

  function init() {
    loadFont();
    styles();

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
        '<nav class="ee-nav">' + navHtml('ee-link') + '</nav>' +
        '<div class="ee-right">' +
          '<a class="ee-cta" href="' + CONFIG.cta.href + '" target="_blank" rel="noopener">' + CONFIG.cta.label + '</a>' +
          '<button class="ee-burger" aria-label="Open menu" aria-expanded="false">' + ICON.burger + '</button>' +
        '</div>' +
      '</div>';

    var sheet = document.createElement('div');
    sheet.className = 'ee-sheet';
    sheet.innerHTML = navHtml('ee-sheet-link') +
      '<a class="ee-cta" href="' + CONFIG.cta.href + '" target="_blank" rel="noopener">' + CONFIG.cta.label + '</a>' +
      '<div class="ee-sheet-sites">' + sitesHtml() + '</div>';

    document.body.appendChild(bar);
    document.body.appendChild(sheet);

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
