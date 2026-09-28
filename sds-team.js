/* =============================================================
   SUDDEN SNAIL - WHOLE PAGE

   Draws all of suddensnail.com from team.txt: the logo, one card
   per person, and a footer. The Carrd page itself stays empty.

       (logo)   Sudden Snail AB · makers of Esoteric Ebb
                [card] [card] [card]
                email                        © line

   Adding someone is adding a "## Name" block to team.txt. The grid,
   the phone layout and each card's wobbly outline all follow the
   number of people, so nothing here needs touching.

   Every card and portrait ring gets its own warble (its own SVG
   turbulence seed), so no two outlines are scratched the same way,
   like the hand-inked edge of the logo's speech bubble.

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
      copyright: '© 2026 Sudden Snail AB'
    },

    /* Esoteric Ebb palette */
    paper: '#DAE5CF',   // Ebb Paper
    ink:   '#020E16',   // Esoteric Black
    hover: '#C13B51',   // Strength Red

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
html,body{background:${OPTS.paper}}
.ssp,.ssp *{box-sizing:border-box}
.ssp{
  --vh:1vh;
  --u:min(var(--vh), .62vw);
  position:fixed; inset:0; z-index:2147483000;
  overflow:auto; -webkit-overflow-scrolling:touch;
  background:${OPTS.paper}; color:${OPTS.ink};
  font-family:"Averia Serif Libre",Georgia,serif;
  text-align:left;
}
@supports (height:1dvh){ .ssp{--vh:1dvh} }
.ssp a{color:${OPTS.ink}}
.ssp a:hover{color:${OPTS.hover}}
.ssp a:focus-visible{outline:2px solid ${OPTS.hover}; outline-offset:3px}

.ssp-wrap{
  min-height:100%;
  display:grid; grid-template-columns:auto minmax(0,1fr);
  align-items:center; gap:calc(var(--u)*7);
  padding:calc(var(--u)*7) calc(var(--u)*8);
}
.ssp-logo{margin:0; justify-self:center; line-height:0}
.ssp-logo img{height:calc(var(--u)*76); width:auto; display:block}

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
  background:${OPTS.paper}; border:3px solid ${OPTS.ink};
  border-radius:calc(var(--u)*2.4);
}
.ssp-por{width:100%; aspect-ratio:1; margin:calc(var(--u)*.6) 0}
/* The portraits are black lines on a white disc. Multiply turns the
   white into the page's paper colour, so any portrait dropped into
   images/ matches without being re-exported. */
.ssp-por img{position:absolute; inset:4%; width:92%; height:92%; display:block;
  object-fit:cover; border-radius:50%; mix-blend-mode:multiply}
.ssp-por .ssp-initials{position:absolute; inset:0; display:grid; place-items:center;
  font-family:"Fraunces",Georgia,serif; font-weight:900;
  font-variation-settings:"SOFT" 100,"WONK" 0; font-size:calc(var(--u)*7)}
.ssp-ring{position:absolute; inset:0; border:3px solid ${OPTS.ink}; border-radius:50%}

.ssp-name{margin:0; font-family:"Fraunces",Georgia,serif; font-weight:800;
  font-variation-settings:"SOFT" 100,"WONK" 0;
  font-size:calc(var(--u)*3.2); line-height:1.05}
.ssp-name a{text-decoration:none}
.ssp-name a:hover{text-decoration:underline}
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

@media (orientation:portrait){
  .ssp{--u:min(calc(var(--vh)*.8), 2.3vw)}
  .ssp-wrap{grid-template-columns:minmax(0,1fr); align-content:center; align-items:start;
    gap:calc(var(--u)*3); padding:calc(var(--u)*4) calc(var(--u)*3.5)}
  .ssp-logo img{height:calc(var(--u)*18)}
  .ssp-main{gap:calc(var(--u)*2)}
  .ssp-cards{grid-template-columns:minmax(0,1fr); gap:calc(var(--u)*2)}
  ${compact('.ssp')}
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
     logo, intro, email, copyright. Everything else is per person. */
  function parse(txt) {
    var site = {}, people = [], cur = null, buf = [];
    function flush() {
      if (cur) {
        if (!cur.tag) cur.tag = buf.join(' ').trim();
        people.push(cur);
      }
      cur = null; buf = [];
    }
    txt.replace(/\r/g, '').split('\n').forEach(function (line) {
      var t = line.trim();
      var m = /^##\s+(.*)$/.exec(t);
      if (m) { flush(); cur = { name: m[1].trim(), role: '', image: '', href: '', tag: '', links: [] }; return; }
      if (/^#(?!#)/.test(t)) return;              // comment
      if (!cur) {
        var sk = /^(logo|intro|email|copyright):\s*(.*)$/i.exec(t);
        if (sk) site[sk[1].toLowerCase()] = sk[2].trim();
        return;
      }
      var kv = /^(role|image|avatar|href|url|tagline|link):\s*(.*)$/i.exec(t);
      if (kv) {
        var k = kv[1].toLowerCase(), v = kv[2].trim();
        if (k === 'role') cur.role = v;
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
    return { site: site, people: people.filter(function (p) { return p.name; }) };
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
    var name = href ? '<a href="' + href + '">' + esc(p.name) + '</a>' : esc(p.name);
    var links = p.links.map(function (l) {
      var h = safeHref(l.href);
      if (!h) return '';
      var ext = /^https?:/i.test(l.href) ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + h + '"' + ext + '>' + esc(l.label) + '</a>';
    }).join('');
    return '<li class="ssp-card">' +
      '<div class="ssp-card-bg"' + f + '></div>' +
      '<div class="ssp-por">' + face + '<div class="ssp-ring"' + f + '></div></div>' +
      '<h2 class="ssp-name">' + name + '</h2>' +
      (p.role ? '<p class="ssp-role">' + esc(p.role) + '</p>' : '') +
      (p.tag ? '<p class="ssp-tag">“' + esc(p.tag) + '”</p>' : '') +
      (links ? '<div class="ssp-links">' + links + '</div>' : '') +
    '</li>';
  }

  function pageHtml(site, people, skeleton) {
    var s = {
      logo: site.logo || OPTS.site.logo,
      intro: site.intro || OPTS.site.intro,
      email: site.email || OPTS.site.email,
      copyright: site.copyright || OPTS.site.copyright
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
    return filters(skeleton ? 3 : people.length) +
      '<div class="ssp-wrap">' +
        '<h1 class="ssp-logo"><img src="' + esc(url(s.logo)) + '" alt="Sudden Snail"></h1>' +
        '<main class="ssp-main' + (skeleton ? ' ssp-sk' : '') + '">' +
          '<p class="ssp-intro">' + esc(s.intro) + '</p>' +
          '<ul class="ssp-cards">' + cards + '</ul>' +
          '<footer class="ssp-foot">' + mail + '<span>' + esc(s.copyright) + '</span></footer>' +
        '</main>' +
      '</div>';
  }

  function paint(root, data, skeleton) {
    var n = skeleton ? 3 : data.people.length;
    root.style.setProperty('--cols', Math.max(1, Math.min(n, 3)));
    root.classList.toggle('is-many', n > 3);
    root.innerHTML = pageHtml(data.site, data.people, skeleton);
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
    font(); styles();

    var cached = read(OPTS.cacheKey), painted = false;
    if (cached) {
      var old = parse(cached);
      if (old.people.length) { paint(root, old, false); painted = true; }
    }
    if (!painted) paint(root, { site: {}, people: [] }, true);

    fetch(OPTS.source + '?v=' + Math.floor(Date.now() / 300000), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        if (painted && txt === cached) return;
        var fresh = parse(txt);
        if (!fresh.people.length) return;
        paint(root, fresh, false);
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
