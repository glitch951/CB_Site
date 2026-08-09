/* =============================================================
   ESOTERIC EBB - TOP BAR

   Horizontal logo on the left with a dropdown arrow to its left,
   section links, and the Steam button on the right.

   FONT: no font family is declared for the bar itself, so the
   logo link and the section links inherit Carrd's typeface,
   which is Averia Serif Libre. The only exception is the
   dropdown, where sites without a horizontal logo are set in
   Figtree. That one webfont is loaded by this script.

   INSTALL
   1. Upload this file, plus logo-horizontal.png and any site
      logos, to the CB_Site repo.
   2. Carrd, add a Header section, add an Embed element
      (Type: Code, Style: Inline):

      <script defer src="https://glitch951.github.io/CB_Site/ee-topbar.js"></script>
   ============================================================= */

(function () {
  'use strict';
  if (window.__eeTopbar) return;
  window.__eeTopbar = true;

  var CONFIG = {
    logo:     'https://glitch951.github.io/CB_Site/logo-horizontal.png',
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

    /* The other sites. This site is not listed, the logo covers it.
       An entry with no logo is set in Figtree instead. */
    sites: [
      { name: 'Esoteric Era',         url: 'https://esoteric-era.com/',        logo: 'https://glitch951.github.io/CB_Site/logo-era.png' },
      { name: 'Christoffer Bodegård', url: 'https://christofferbodegard.com/', logo: '' }
    ],

    loadFigtree: true,   // set false if Carrd already serves Figtree

    height:     70,
    heightSm:   56,
    offsetBody: true,

    /* The bar sits over the splash, then gets out of the way.
       Scrolling up brings it back at any point. */
    hideOnScroll: true,
    hideAfter:    'splash',  // 'splash' means one viewport height, or give a number of px
    hideDelta:    6          // px of movement before it reacts, stops it twitching
  };

  function figtree() {
    if (!CONFIG.loadFigtree || document.getElementById('ee-figtree')) return;
    var l = document.createElement('link');
    l.id = 'ee-figtree';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Figtree:wght@500;600&display=swap';
    document.head.appendChild(l);
  }

  function styles() {
    var css = `
.ee-tb,.ee-tb *{box-sizing:border-box}
.ee-tb{
  position:fixed; top:0; left:0; right:0; z-index:9000; height:${CONFIG.height}px;
  color:#DAE5CF; background:rgba(2,14,22,0);
  transition:background .35s ease, transform .32s ease;
}
.ee-tb.is-hidden{transform:translateY(-100%)}
.ee-tb.is-stuck{background:rgba(2,14,22,.92); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px)}
.ee-tb-inner{
  max-width:1400px; height:100%; margin:0 auto; padding:0 clamp(14px,3vw,30px);
  display:flex; align-items:center; gap:clamp(10px,2vw,26px);
}

/* brand: arrow first, then the logo, both on the nav baseline */
.ee-brand{position:relative; display:flex; flex-direction:row; align-items:center; gap:8px; flex:0 0 auto}
.ee-caret{
  padding:0; width:18px; height:18px; border:0; background:none; cursor:pointer;
  color:#DAE5CF; opacity:.45; display:grid; place-items:center;
  transition:transform .25s ease;
}
.ee-caret:hover,.ee-caret[aria-expanded="true"]{opacity:1; color:#DB5B2C}
.ee-caret[aria-expanded="true"]{transform:rotate(180deg)}
.ee-caret svg{width:11px; height:7px; display:block}
.ee-brand-link{display:block; line-height:0}
.ee-brand-link img{height:clamp(20px,2.2vw,30px); width:auto; display:block}

.ee-sites{
  position:absolute; top:calc(100% + 10px); left:0; min-width:230px; padding:8px 0; z-index:20;
  background:rgba(2,14,22,.96); -webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px);
  opacity:0; visibility:hidden; transform:translateY(-6px);
  transition:opacity .2s ease, transform .2s ease, visibility .2s;
}
.ee-sites.is-open{opacity:1; visibility:visible; transform:none}
.ee-site{display:block; padding:10px 18px 10px 26px; text-decoration:none; line-height:0}
.ee-site img{height:22px; width:auto; max-width:190px; object-fit:contain; display:block; opacity:.85}
.ee-site:hover img{opacity:1}
.ee-site-name{
  font-family:"Figtree",-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
  font-weight:600; font-size:15px; letter-spacing:.01em; line-height:1.3;
  color:#DAE5CF; opacity:.85; white-space:nowrap;
}
.ee-site:hover .ee-site-name{opacity:1; color:#DB5B2C}

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
  display:inline-flex; align-items:center; height:36px; padding:0 clamp(16px,1.6vw,24px);
  background:#E93C3C; color:#fff; text-decoration:none; border-radius:6px;
  font-size:clamp(13px,1.05vw,16px); letter-spacing:.12em; font-variant:small-caps;
  transition:background .2s ease;
}
.ee-cta:hover{background:#f25151}

.ee-burger{
  display:none; width:30px; height:30px; place-items:center; padding:0;
  background:none; border:0; color:#DAE5CF; cursor:pointer;
}
.ee-burger:hover{color:#DB5B2C}
.ee-burger svg{width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.5;
  stroke-linecap:round; stroke-linejoin:round}

.ee-sheet{
  position:fixed; inset:0; z-index:8999; padding:calc(${CONFIG.heightSm}px + 24px) 24px 30px;
  background:#020E16; overflow-y:auto; color:#DAE5CF;
  opacity:0; visibility:hidden; transition:opacity .25s ease, visibility .25s;
}
.ee-sheet.is-open{opacity:1; visibility:visible}
.ee-sheet a.ee-sheet-link{
  display:block; padding:14px 0; text-decoration:none; color:inherit;
  font-size:24px; letter-spacing:.05em; font-variant:small-caps;
  border-bottom:1px solid rgba(218,229,207,.12); transition:none;
}
.ee-sheet a.ee-sheet-link:hover{color:#DB5B2C}
.ee-sheet .ee-cta{margin-top:22px; width:100%; justify-content:center; height:48px; font-size:18px}
.ee-sheet-sites{margin-top:26px}
.ee-sheet-sites .ee-site{padding:12px 0}

@media (max-width:1080px){
  .ee-tb{height:${CONFIG.heightSm}px}
  .ee-nav{display:none}
  .ee-burger{display:grid}
}
@media (max-width:520px){ .ee-tb .ee-cta{display:none} .ee-sheet .ee-cta{display:inline-flex} }
@media (prefers-reduced-motion:reduce){ .ee-tb,.ee-sheet,.ee-sites,.ee-caret{transition:none} }`;

    if (CONFIG.offsetBody) {
      css += `
body{padding-top:${CONFIG.height}px}
html{scroll-padding-top:${CONFIG.height + 12}px}
@media (max-width:1080px){
  body{padding-top:${CONFIG.heightSm}px}
  html{scroll-padding-top:${CONFIG.heightSm + 10}px}
}`;
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
      var inner = s.logo
        ? '<img src="' + s.logo + '" alt="' + s.name + '" loading="lazy">'
        : '<span class="ee-site-name">' + s.name + '</span>';
      return '<a class="ee-site" href="' + s.url + '">' + inner + '</a>';
    }).join('');
  }

  function init() {
    figtree();
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
      if (typeof CONFIG.hideAfter === 'number') return CONFIG.hideAfter;
      return window.innerHeight;   // 'splash'
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.pageYOffset || document.documentElement.scrollTop;
        bar.classList.toggle('is-stuck', y > 10);

        if (CONFIG.hideOnScroll) {
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
        }
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
