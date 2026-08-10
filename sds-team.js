/* =============================================================
   SUDDEN SNAIL - TEAM WIDGET

   Replaces both the social icon row and the "Founded by /
   Christoffer Bodegård / tagline" block with one widget:

       (avatar)   icon row for this person
                  segmented timer bar
       Founded by
    <  Christoffer Bodegård  >
       tagline

   Each person carries their own links, so the icon row changes
   with them. The bar fills over the time each person is shown and
   drives the change, so bar and cycle can never drift apart.

   TYPE: no font-family, size, weight or colour is set on the three
   text lines. They render as the same p / h1 / h2 tags the block
   already uses, so Carrd's styling applies and the type matches
   the page exactly. Set inheritType to false for the fallbacks.

   INSTALL
   1. Upload ss-team.js and team.txt to CB_Site, avatars to
      CB_Site/images/.
   2. On suddensnail.com delete the icon row and the three text
      elements, and put one Embed in their place
      (Type: Code, Style: Inline):

      <div id="ss-team"></div>
      <script defer src="https://glitch951.github.io/CB_Site/ss-team.js"></script>
   ============================================================= */

(function () {
  'use strict';
  if (window.__ssTeam) return;
  window.__ssTeam = true;

  var OPTS = {
    source:    'https://glitch951.github.io/CB_Site/team.txt',
    imageBase: 'https://glitch951.github.io/CB_Site/images/',

    avatar:     120,   // px
    gap:        26,    // px between the avatar and the icon column
    iconSize:   26,    // px
    iconGap:    22,    // px between icons
    interval:   7000,  // ms each person is shown. 0 stops the cycling
    fadeMs:     280,   // cross-fade when the person changes
    arrowInset: 56,    // px the arrows sit outside the text
    barHeight:  3,     // px, the timer bar

    inheritType: true,
    fallback: { role: '15px', name: '44px', tag: '17px' },

    loadFont: true,
    fontHref: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap',
    cacheKey: 'ss-team-txt'
  };

  /* ---------------- icons ---------------- */
  var P = {
    linkedin:'M6.9 21H3.4V9.2h3.5zM5.1 7.6A2 2 0 1 1 7.2 5.5 2 2 0 0 1 5.1 7.6zM21 21h-3.5v-5.7c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3v5.8H9.9V9.2h3.4v1.6h.1a3.7 3.7 0 0 1 3.3-1.8c3.6 0 4.3 2.3 4.3 5.4z',
    twitter:'M22 5.8a8 8 0 0 1-2.4.7 4.1 4.1 0 0 0 1.8-2.3 8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5 4 4 0 0 1-1.9-.5v.1a4.1 4.1 0 0 0 3.3 4 4.2 4.2 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.9A8.3 8.3 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5A8.3 8.3 0 0 0 22 5.8z',
    x:'M17.5 3h3l-6.6 7.5L21.7 21h-6l-4.7-6.1L5.6 21h-3l7-8L2.6 3h6.2l4.2 5.6zM16.4 19.2h1.7L7.7 4.7H5.9z',
    threads:'M12.2 22h-.1c-3.4 0-6-1.1-7.8-3.3C2.7 16.9 2 14.6 2 12c0-2.6.7-4.9 2.3-6.7C6.1 3.1 8.7 2 12.1 2h.1c2.6 0 4.8.7 6.5 2 1.6 1.2 2.7 3 3.3 5.2l-2 .6c-1-3.6-3.5-5.5-7.8-5.5h-.1c-2.7 0-4.8.9-6.2 2.6C4.6 8.3 4 10 4 12c0 2 .6 3.8 1.9 5.2 1.4 1.7 3.5 2.6 6.2 2.6h.1c2.5 0 4.1-.6 5.5-1.9 1.6-1.5 1.6-3.4 1.1-4.5-.3-.7-.9-1.2-1.6-1.6-.2 1.2-.6 2.2-1.1 3-.8 1.1-2 1.8-3.5 1.9-1.2.1-2.3-.2-3.1-.8-1-.7-1.6-1.8-1.6-3 0-2.4 1.9-4.1 4.8-4.3.9-.1 1.8 0 2.5.1-.1-.7-.3-1.2-.7-1.6-.5-.5-1.2-.8-2.2-.8c-.8 0-1.8.2-2.5 1.2l-1.7-1.1c.9-1.3 2.4-2 4.1-2h.1c2.9 0 4.6 1.8 4.8 4.9 1.7.7 2.9 1.8 3.5 3.2.9 2 1 5.2-1.6 7.7-1.8 1.7-4 2.5-7 2.5zm-.4-11.2c-2.6.1-3.2 1.3-3.2 2.3 0 .9.9 1.9 2.6 1.8 1.9-.1 2.6-1.1 3-3.9-.6-.2-1.4-.3-2.3-.2h-.1z',

    mastodon:'M21 9.4c0-4-2.6-5.2-2.6-5.2C17 3.5 14.7 3.2 12.3 3.2h-.1c-2.4 0-4.7.3-6.1 1-.1 0-2.6 1.2-2.6 5.2 0 .9 0 2 .1 3.2.2 4 .9 8 4.7 9 1.7.5 3.2.6 4.4.5 2.2-.1 3.4-.8 3.4-.8l-.1-1.6s-1.6.5-3.3.4c-1.7-.1-3.5-.2-3.8-2.3l-.1-.7c3.4.8 6.3.4 7.1.3 2.2-.3 4.2-1.7 4.4-3 .4-2.1.4-5 .4-5zm-3.1 4.9h-2v-4.7c0-1-.4-1.5-1.3-1.5-.9 0-1.4.6-1.4 1.8v2.5h-1.9v-2.5c0-1.2-.5-1.8-1.4-1.8-.9 0-1.3.5-1.3 1.5v4.7h-2V9.5c0-1 .3-1.8.8-2.4.5-.6 1.2-.9 2.1-.9 1 0 1.8.4 2.3 1.2l.5.8.5-.8c.5-.8 1.3-1.2 2.3-1.2.9 0 1.6.3 2.1.9.5.6.8 1.4.8 2.4v4.8z',
    bluesky:'M12 10.8C10.9 8.6 7.9 4.6 5.2 3 2.6 1.4 1.6 2 1.6 4.4c0 1.3.7 5.7 1.2 6.4.6.9 2.3 1.1 3.9.9-2.5.4-3.1 1.9-1.8 3.4 2.5 2.8 3.6 1.1 5-1.4l.4-.7c.3.5.4.7.7 1.2 1.3 2.4 2.4 4.1 4.9 1.4 1.3-1.5.7-3-1.8-3.4 1.6.2 3.3 0 3.9-.9.5-.7 1.2-5.1 1.2-6.4C22.4 2 21.4 1.4 18.8 3c-2.7 1.6-5.7 5.6-6.8 7.8z',
    tiktok:'M16.6 5.8a4.8 4.8 0 0 1-1.1-2.8h-3v11.3a2.6 2.6 0 1 1-2.2-2.6V8.6a5.7 5.7 0 1 0 5.2 5.7V9.1a7.8 7.8 0 0 0 4.5 1.4V7.5a4.7 4.7 0 0 1-3.4-1.7z',
    discord:'M19.3 5.3A16.9 16.9 0 0 0 15.1 4l-.2.4a15.7 15.7 0 0 1 3.7 1.2 13.3 13.3 0 0 0-11.2 0 15.9 15.9 0 0 1 3.7-1.2L10.9 4a16.9 16.9 0 0 0-4.2 1.3C4.1 9.2 3.4 13 3.8 16.7a16.9 16.9 0 0 0 5.1 2.6l1.1-1.9a11 11 0 0 1-1.7-.8l.4-.3a12.1 12.1 0 0 0 10.4 0l.4.3a11 11 0 0 1-1.7.8l1.1 1.9a16.8 16.8 0 0 0 5.1-2.6c.5-4.3-.6-8.1-2.7-11.4zM9.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2-.8 2-1.8 2zm4.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2-.8 2-1.8 2z',
    email:'M3 5h18v14H3zm2 2v.3l7 4.7 7-4.7V7zm14 10v-7.3l-7 4.7-7-4.7V17z',
    info:'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z',
    home:'M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3z',
    instagram:'M12 7.4A4.6 4.6 0 1 0 16.6 12 4.6 4.6 0 0 0 12 7.4zm0 7.6A3 3 0 1 1 15 12a3 3 0 0 1-3 3zm5.8-7.8a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1zM21 8.9a5.3 5.3 0 0 0-1.5-3.8A5.3 5.3 0 0 0 15.7 3.6C14.2 3.5 9.8 3.5 8.3 3.6A5.3 5.3 0 0 0 4.5 5.1 5.3 5.3 0 0 0 3 8.9c-.1 1.5-.1 5.9 0 7.4a5.3 5.3 0 0 0 1.5 3.8 5.3 5.3 0 0 0 3.8 1.5c1.5.1 5.9.1 7.4 0a5.3 5.3 0 0 0 3.8-1.5 5.3 5.3 0 0 0 1.5-3.8c.1-1.5.1-5.9 0-7.4zm-1.9 9a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.4.4s-4.2.1-5.4-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-5.4s-.1-4.2.4-5.4A3 3 0 0 1 6.6 5.4C7.8 4.9 10.6 5 12 5s4.2-.1 5.4.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.4s.1 4.2-.4 5.4z',
    artstation:'M2.3 16.5l1.7 3a1.6 1.6 0 0 0 1.4.8h11.2l-2.2-3.8zM21.7 16.5a1.8 1.8 0 0 0-.2-1.4L14.9 3.7a1.6 1.6 0 0 0-1.4-.8h-3.2l8 13.9zM12 6.5l-5 8.6h9.9z',
    twitch:'M4.3 3L3 6.5v13h4.5V22h2.5l2.5-2.5h3.6L21 15V3zm15 11.2l-2.6 2.6h-4.1L10.3 19v-2.2H6.7V4.8h12.6zM15 8v4.4h1.7V8zm-4.5 0v4.4h1.8V8z',
    steam:'M12 2a10 10 0 0 0-10 9.3l5.4 2.2a2.8 2.8 0 0 1 1.6-.5h.1l2.4-3.4v-.1a3.8 3.8 0 1 1 3.8 3.8h-.1l-3.4 2.4v.1a2.8 2.8 0 0 1-5.6.6l-3.8-1.6A10 10 0 1 0 12 2zM7.2 17.2l-1.2-.5a2.1 2.1 0 0 0 3.9-.1 2.1 2.1 0 0 0-2.8-1.1l1.2.5a1.6 1.6 0 1 1-1.2 2.9zm11.3-5.9a2.5 2.5 0 1 0-2.5 2.5 2.5 2.5 0 0 0 2.5-2.5zm-4.4 0a1.9 1.9 0 1 1 1.9 1.9 1.9 1.9 0 0 1-1.9-1.9z',
    youtube:'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z',
    dot:'M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4z'
  };
  var LABEL = {
    linkedin:P.linkedin, twitter:P.twitter, x:P.x, threads:P.threads,
    mastodon:P.mastodon, bluesky:P.bluesky, tiktok:P.tiktok, discord:P.discord,
    email:P.email, mail:P.email, information:P.info, info:P.info,
    home:P.home, website:P.home, instagram:P.instagram, artstation:P.artstation,
    twitch:P.twitch, steam:P.steam, youtube:P.youtube
  };
  var HOSTS = [
    ['linkedin',P.linkedin],['threads',P.threads],['mastodon',P.mastodon],
    ['bsky',P.bluesky],['tiktok',P.tiktok],['discord',P.discord],
    ['twitter',P.twitter],['x.com',P.x],['mailto',P.email],
    ['instagram',P.instagram],['artstation',P.artstation],['twitch',P.twitch],
    ['steampowered',P.steam],['youtube',P.youtube]
  ];
  function iconFor(label, href) {
    var d = LABEL[(label || '').toLowerCase().trim()];
    if (!d && href) {
      var h = href.toLowerCase();
      for (var i = 0; i < HOSTS.length; i++) {
        if (h.indexOf(HOSTS[i][0]) !== -1) { d = HOSTS[i][1]; break; }
      }
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (d || P.dot) + '"/></svg>';
  }

  /* ---------------- styles ---------------- */
  function font() {
    if (!OPTS.loadFont || document.getElementById('ss-team-font')) return;
    var l = document.createElement('link');
    l.id = 'ss-team-font'; l.rel = 'stylesheet'; l.href = OPTS.fontHref;
    document.head.appendChild(l);
  }

  function styles() {
    var s = document.createElement('style');
    s.id = 'ss-team-css';
    s.textContent = `
#ss-team,#ss-team *{box-sizing:border-box}
#ss-team{text-align:center; padding:0 ${OPTS.arrowInset + 6}px}
.ss-inner{display:inline-block; text-align:left; position:relative}

/* --- avatar + icons + bar --- */
.ss-top{display:flex; align-items:center; gap:${OPTS.gap}px; margin-bottom:18px}
.ss-ava{
  flex:0 0 auto; position:relative;
  width:${OPTS.avatar}px; height:${OPTS.avatar}px; border-radius:50%;
  display:grid; place-items:center;
}
.ss-ava img{width:100%; height:100%; object-fit:cover; display:block; border-radius:50%}
.ss-ava::after{
  content:""; position:absolute; inset:0; border-radius:50%;
  border:1px solid currentColor; opacity:.35; pointer-events:none;
}
.ss-ava.is-empty{font-size:${Math.round(OPTS.avatar / 3.4)}px; opacity:.5}

.ss-side{min-width:0}
.ss-links{display:flex; align-items:center; gap:${OPTS.iconGap}px; flex-wrap:wrap}
.ss-links a{
  display:grid; place-items:center; color:inherit; line-height:0;
  opacity:.9; transition:opacity .18s ease, transform .18s ease;
}
.ss-links a:hover{opacity:1; transform:translateY(-2px)}
.ss-links svg{width:${OPTS.iconSize}px; height:${OPTS.iconSize}px; fill:currentColor}

/* one segment per person; the live one fills over the interval */
.ss-bar{display:flex; gap:6px; margin-top:16px}
.ss-seg{
  flex:1 1 0; height:${OPTS.barHeight}px; border-radius:${OPTS.barHeight}px;
  background:currentColor; opacity:.22; overflow:hidden; position:relative;
}
.ss-seg i{
  position:absolute; inset:0; transform-origin:left center; transform:scaleX(0);
  background:currentColor; border-radius:inherit; display:block;
}
.ss-seg.is-done i{transform:scaleX(1)}
.ss-seg.is-live i{animation:ss-fill linear forwards}
@keyframes ss-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}

/* --- text --- */
.ss-textwrap{position:relative}
.ss-text{transition:opacity ${OPTS.fadeMs}ms ease, transform ${OPTS.fadeMs}ms ease}
.ss-text.is-out{opacity:0; transform:translateY(6px)}
#ss-team .ss-role{margin:0 0 .1em}
#ss-team .ss-name{margin:0 0 .1em; line-height:1.04}
#ss-team .ss-name a{color:inherit; text-decoration:none}
#ss-team .ss-name a:hover{text-decoration:underline}
#ss-team .ss-tag{margin:0; min-height:1.35em}

.ss-arrow{
  position:absolute; top:50%; transform:translateY(-50%);
  width:34px; height:44px; padding:0; cursor:pointer;
  background:none; border:0; color:inherit; opacity:.4;
  display:grid; place-items:center; transition:opacity .18s ease;
}
.ss-arrow:hover,.ss-arrow:focus-visible{opacity:1}
.ss-arrow.is-prev{left:-${OPTS.arrowInset}px}
.ss-arrow.is-next{right:-${OPTS.arrowInset}px}
.ss-arrow svg{width:17px; height:17px; fill:none; stroke:currentColor;
  stroke-width:2; stroke-linecap:round; stroke-linejoin:round}

.ss-sk{opacity:.4; animation:ss-pulse 1.5s ease-in-out infinite}
@keyframes ss-pulse{0%,100%{opacity:.2}50%{opacity:.45}}
.ss-sk-bar{display:block; border-radius:7px; background:currentColor; opacity:.25}

@media (max-width:620px){
  #ss-team{padding:0 34px}
  .ss-top{gap:16px; margin-bottom:14px}
  .ss-ava{width:${Math.round(OPTS.avatar * .7)}px; height:${Math.round(OPTS.avatar * .7)}px}
  .ss-links{gap:16px}
  .ss-links svg{width:22px; height:22px}
  .ss-arrow.is-prev{left:-30px}
  .ss-arrow.is-next{right:-30px}
}
@media (prefers-reduced-motion:reduce){
  .ss-text,.ss-links a{transition:none}
  .ss-seg.is-live i{animation:none; transform:scaleX(1)}
  .ss-sk{animation:none}
}`;
    if (!OPTS.inheritType) {
      s.textContent += `
#ss-team .ss-role{font-size:${OPTS.fallback.role}}
#ss-team .ss-name{font-size:${OPTS.fallback.name}}
#ss-team .ss-tag{font-size:${OPTS.fallback.tag}}`;
    }
    if (OPTS.loadFont) {
      s.textContent += `
#ss-team,#ss-team *{font-family:"Figtree",-apple-system,"Segoe UI",Helvetica,Arial,sans-serif}`;
    }
    document.head.appendChild(s);
  }

  /* ---------------- content ---------------- */
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function parse(txt) {
    var out = [], cur = null, buf = [];
    function flush() {
      if (cur) {
        if (!cur.tag) cur.tag = buf.join(' ').trim();
        out.push(cur);
      }
      cur = null; buf = [];
    }
    txt.replace(/\r/g, '').split('\n').forEach(function (line) {
      var t = line.trim();
      var m = /^##\s+(.*)$/.exec(t);
      if (m) { flush(); cur = { name: m[1].trim(), role: '', image: '', href: '', tag: '', links: [] }; return; }
      if (/^#(?!#)/.test(t)) return;              // comment
      if (!cur) return;
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
    return out.filter(function (p) { return p.name; });
  }

  function url(src) {
    if (!src) return '';
    return /^https?:|^data:/i.test(src) ? src : OPTS.imageBase + src.replace(/^\//, '');
  }
  function initials(n) {
    return n.split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }

  function avatarHtml(p) {
    var img = url(p.image);
    return img
      ? '<div class="ss-ava"><img src="' + img + '" alt="" decoding="async"></div>'
      : '<div class="ss-ava is-empty">' + esc(initials(p.name)) + '</div>';
  }
  function linksHtml(p) {
    return p.links.map(function (l) {
      var ext = /^https?:/i.test(l.href) ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + l.href + '"' + ext + ' aria-label="' + esc(l.label) + '">' +
        iconFor(l.label, l.href) + '</a>';
    }).join('');
  }
  function textHtml(p) {
    var name = p.href
      ? '<a href="' + p.href + '">' + esc(p.name) + '</a>'
      : esc(p.name);
    return '<p class="ss-role">' + esc(p.role) + '</p>' +
      '<h1 class="ss-name">' + name + '</h1>' +
      '<h2 class="ss-tag">' + esc(p.tag) + '</h2>';
  }

  function skeleton() {
    return '<div class="ss-inner ss-sk">' +
      '<div class="ss-top"><div class="ss-ava"></div><div class="ss-side">' +
        '<span class="ss-sk-bar" style="width:280px;height:26px"></span>' +
        '<span class="ss-sk-bar" style="width:100%;height:3px;margin-top:16px"></span>' +
      '</div></div>' +
      '<span class="ss-sk-bar" style="width:90px;height:12px;margin-bottom:10px"></span>' +
      '<span class="ss-sk-bar" style="width:340px;height:38px;margin-bottom:10px"></span>' +
      '<span class="ss-sk-bar" style="width:250px;height:12px"></span>' +
    '</div>';
  }

  var ARROW = {
    prev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 2L4.5 8l6 6"/></svg>',
    next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 2l6 6-6 6"/></svg>'
  };

  /* ---------------- widget ---------------- */
  function build(root, people) {
    var many = people.length > 1;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.innerHTML =
      '<div class="ss-inner">' +
        '<div class="ss-top">' +
          '<div class="ss-ava-slot">' + avatarHtml(people[0]) + '</div>' +
          '<div class="ss-side">' +
            '<div class="ss-links">' + linksHtml(people[0]) + '</div>' +
            (many ? '<div class="ss-bar">' +
              people.map(function () { return '<span class="ss-seg"><i></i></span>'; }).join('') +
            '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="ss-textwrap">' +
          (many ? '<button class="ss-arrow is-prev" aria-label="Previous">' + ARROW.prev + '</button>' : '') +
          '<div class="ss-text" aria-live="polite">' + textHtml(people[0]) + '</div>' +
          (many ? '<button class="ss-arrow is-next" aria-label="Next">' + ARROW.next + '</button>' : '') +
        '</div>' +
      '</div>';

    var avaSlot = root.querySelector('.ss-ava-slot');
    var links   = root.querySelector('.ss-links');
    var text    = root.querySelector('.ss-text');
    var segs    = [].slice.call(root.querySelectorAll('.ss-seg'));
    var at = 0, busy = false, fallbackTimer = null;

    /* Hold the tallest layout so the page never twitches as it cycles. */
    function lock() {
      var probe = root.querySelector('.ss-inner').cloneNode(true);
      probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:' +
        root.querySelector('.ss-inner').offsetWidth + 'px;left:0;top:0';
      root.appendChild(probe);
      var pl = probe.querySelector('.ss-links'), pt = probe.querySelector('.ss-text');
      var wideIcons = 0, tallText = 0;
      people.forEach(function (p) {
        pl.innerHTML = linksHtml(p);
        pt.innerHTML = textHtml(p);
        wideIcons = Math.max(wideIcons, pl.scrollWidth);
        tallText = Math.max(tallText, pt.offsetHeight);
      });
      root.removeChild(probe);
      if (wideIcons) links.style.minWidth = wideIcons + 'px';
      if (tallText) text.style.minHeight = tallText + 'px';
    }

    function paintSegs() {
      segs.forEach(function (s, i) {
        s.classList.remove('is-live', 'is-done');
        s.querySelector('i').style.animation = '';
        if (i < at) s.classList.add('is-done');
      });
      var live = segs[at];
      if (!live || !OPTS.interval) return;
      var fill = live.querySelector('i');
      if (reduce) { live.classList.add('is-done'); return; }
      /* Restart the animation cleanly, then let it drive the change. */
      void fill.offsetWidth;
      fill.style.animationDuration = OPTS.interval + 'ms';
      live.classList.add('is-live');
    }

    function show(i, manual) {
      if (busy || !many) return;
      busy = true;
      at = (i + people.length) % people.length;
      text.classList.add('is-out');
      links.style.opacity = '0';
      setTimeout(function () {
        avaSlot.innerHTML = avatarHtml(people[at]);
        links.innerHTML = linksHtml(people[at]);
        text.innerHTML = textHtml(people[at]);
        text.classList.remove('is-out');
        links.style.opacity = '';
        busy = false;
        paintSegs();
      }, OPTS.fadeMs);
      if (manual) clearTimeout(fallbackTimer);
    }

    /* The bar finishing is what advances the widget, so the two can
       never fall out of step. */
    root.addEventListener('animationend', function (e) {
      if (e.animationName === 'ss-fill') show(at + 1);
    });
    if (reduce && OPTS.interval && many) {
      (function loop() {
        fallbackTimer = setTimeout(function () { show(at + 1); loop(); }, OPTS.interval);
      })();
    }

    var prev = root.querySelector('.ss-arrow.is-prev');
    var next = root.querySelector('.ss-arrow.is-next');
    if (prev) prev.addEventListener('click', function () { show(at - 1, true); });
    if (next) next.addEventListener('click', function () { show(at + 1, true); });

    function pause(on) {
      segs.forEach(function (s) {
        var f = s.querySelector('i');
        if (f) f.style.animationPlayState = on ? 'paused' : 'running';
      });
    }
    root.addEventListener('mouseenter', function () { pause(true); });
    root.addEventListener('mouseleave', function () { pause(false); });
    root.addEventListener('focusin', function () { pause(true); });
    root.addEventListener('focusout', function () { pause(false); });
    document.addEventListener('visibilitychange', function () { pause(document.hidden); });

    lock();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lock);
    window.addEventListener('resize', lock, { passive: true });
    paintSegs();
  }

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function init() {
    var root = document.getElementById('ss-team');
    if (!root) return;
    font(); styles();

    var cached = read(OPTS.cacheKey), painted = false;
    if (cached) {
      var people = parse(cached);
      if (people.length) { build(root, people); painted = true; }
    }
    if (!painted) root.innerHTML = skeleton();

    fetch(OPTS.source + '?v=' + Math.floor(Date.now() / 300000), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        if (painted && txt === cached) return;
        var fresh = parse(txt);
        if (!fresh.length) return;
        build(root, fresh);
        write(OPTS.cacheKey, txt);
      })
      .catch(function () { if (!painted) root.innerHTML = ''; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
