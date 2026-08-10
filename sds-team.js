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

   TYPE: Carrd does not pass its heading styles down into an embed,
   so the widget sets its own. The sizes and colour in OPTS were
   measured off the page as it was, and are the only things to
   touch if the type ever needs nudging.

   INSTALL
   1. Upload ss-team.js and team.txt to CB_Site, avatars to
      CB_Site/images/.
   2. On suddensnail.com delete the icon row and the three text
      elements, and put one Embed in their place
      (Type: Code, Style: Inline):

      <div id="ss-team"></div>
      <script defer src="https://glitch951.github.io/CB_Site/sds-team.js"></script>

   The div may be called ss-team or sds-team, or carry a
   data-team-widget attribute. Any of the three is found.
   ============================================================= */

(function () {
  'use strict';
  if (window.__ssTeam) return;
  window.__ssTeam = true;

  var OPTS = {
    source:    'https://glitch951.github.io/CB_Site/team.txt',
    imageBase: 'https://glitch951.github.io/CB_Site/images/',

    avatar:     190,   // px
    gap:        70,    // px between the avatar and the icons
    iconSize:   34,    // px, fixed, not tied to the name
    iconGap:    30,    // px between icons
    interval:   7000,  // ms each person is shown. 0 stops the cycling
    fadeMs:     280,   // cross-fade when the person changes
    arrowInset: 74,    // px the arrows sit outside the text
    ringWidth:  1,      // px, hairline
    ringTrack:  '',     // blank means the same colour as the text
    ringFill:   '#E93C3C',

    /* The page colour behind the widget. Used to knock a gap in the
       tagline where the name's descenders come down into it, so the two
       lines can sit tight together without colliding. */
    bgColor:    '#000B13',
    knockout:   12,     // px of clearance carved around the name

    /* Carrd does not pass its heading styles into an embed, so the type
       and colour are set here instead. These are measured off the page as
       it was: name 71px, the small lines 20 and 24, in #C6D6B6.
       Change these four and nothing else. */
    color:      '#C6D6B6',
    typeWeight: { role: '600', name: '800', tag: '400' },

    /* Sizes are not fixed. On the original page the name ran the full
       width of the column, and the other two lines were in fixed
       proportion to it. Those proportions were measured off a screenshot
       (name 917 wide, tagline 907, "Founded by" 115), and the widget now
       fits the longest name to the column and derives the rest from
       these ratios. That way it reproduces the original layout whatever
       the column width and whatever font Carrd is serving, instead of
       depending on me guessing a pixel size. */
    fit: {
      nameFillsColumn: 1.00,   // the longest name fills the column
      roleOfColumn:    0.125,  // "Founded by" was 115 wide against a 917 name
      minName: 28, maxName: 160
    },

    loadFont: true,
    fontHref: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap',
    cacheKey: 'ss-team-txt'
  };

  /* ---------------- icons ---------------- */
  var P = {
    linkedin:'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    twitter:'M22 5.8a8 8 0 0 1-2.4.7 4.1 4.1 0 0 0 1.8-2.3 8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5 4 4 0 0 1-1.9-.5v.1a4.1 4.1 0 0 0 3.3 4 4.2 4.2 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.9A8.3 8.3 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5A8.3 8.3 0 0 0 22 5.8z',
    x:'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z',
    threads:'M12.2 22h-.1c-3.4 0-6-1.1-7.8-3.3C2.7 16.9 2 14.6 2 12c0-2.6.7-4.9 2.3-6.7C6.1 3.1 8.7 2 12.1 2h.1c2.6 0 4.8.7 6.5 2 1.6 1.2 2.7 3 3.3 5.2l-2 .6c-1-3.6-3.5-5.5-7.8-5.5h-.1c-2.7 0-4.8.9-6.2 2.6C4.6 8.3 4 10 4 12c0 2 .6 3.8 1.9 5.2 1.4 1.7 3.5 2.6 6.2 2.6h.1c2.5 0 4.1-.6 5.5-1.9 1.6-1.5 1.6-3.4 1.1-4.5-.3-.7-.9-1.2-1.6-1.6-.2 1.2-.6 2.2-1.1 3-.8 1.1-2 1.8-3.5 1.9-1.2.1-2.3-.2-3.1-.8-1-.7-1.6-1.8-1.6-3 0-2.4 1.9-4.1 4.8-4.3.9-.1 1.8 0 2.5.1-.1-.7-.3-1.2-.7-1.6-.5-.5-1.2-.8-2.2-.8c-.8 0-1.8.2-2.5 1.2l-1.7-1.1c.9-1.3 2.4-2 4.1-2h.1c2.9 0 4.6 1.8 4.8 4.9 1.7.7 2.9 1.8 3.5 3.2.9 2 1 5.2-1.6 7.7-1.8 1.7-4 2.5-7 2.5zm-.4-11.2c-2.6.1-3.2 1.3-3.2 2.3 0 .9.9 1.9 2.6 1.8 1.9-.1 2.6-1.1 3-3.9-.6-.2-1.4-.3-2.3-.2h-.1z',

    mastodon:'M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.61.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-2.207a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.7.077-.14.11-.017 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z',
    bluesky:'M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z',
    tiktok:'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    discord:'M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.79.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.32.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .31.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.11 13.11 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.94.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .78.009c.12.099.246.198.373.292a.077.077 0 0 1-.6.128 12.3 12.3 0 0 1-1.873.891.076.076 0 0 0-.4.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .84.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z',
    email:'M3 5h18v14H3zm2 2v.3l7 4.7 7-4.7V7zm14 10v-7.3l-7 4.7-7-4.7V17z',
    info:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-13h2v2h-2zm0 4h2v6h-2z',
    home:'M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3z',
    instagram:'M12 7.4A4.6 4.6 0 1 0 16.6 12 4.6 4.6 0 0 0 12 7.4zm0 7.6A3 3 0 1 1 15 12a3 3 0 0 1-3 3zm5.8-7.8a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1zM21 8.9a5.3 5.3 0 0 0-1.5-3.8A5.3 5.3 0 0 0 15.7 3.6C14.2 3.5 9.8 3.5 8.3 3.6A5.3 5.3 0 0 0 4.5 5.1 5.3 5.3 0 0 0 3 8.9c-.1 1.5-.1 5.9 0 7.4a5.3 5.3 0 0 0 1.5 3.8 5.3 5.3 0 0 0 3.8 1.5c1.5.1 5.9.1 7.4 0a5.3 5.3 0 0 0 3.8-1.5 5.3 5.3 0 0 0 1.5-3.8c.1-1.5.1-5.9 0-7.4zm-1.9 9a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.4.4s-4.2.1-5.4-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-5.4s-.1-4.2.4-5.4A3 3 0 0 1 6.6 5.4C7.8 4.9 10.6 5 12 5s4.2-.1 5.4.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.4s.1 4.2-.4 5.4z',
    artstation:'M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 0 0-2.142-1.289H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z',
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

  function rgba(hex, a) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
  }

  function styles() {
    var track = rgba(OPTS.color, .25);
    var s = document.createElement('style');
    s.id = 'ss-team-css';
    s.textContent = `
.ss-team,.ss-team *{box-sizing:border-box}
.ss-team{text-align:left}
.ss-inner{position:relative; text-align:left}

/* --- avatar + icons + bar --- */
.ss-top{display:flex; align-items:center; gap:${OPTS.gap}px; margin-bottom:22px}
.ss-side{flex:1 1 auto}
.ss-ava{
  flex:0 0 auto; position:relative;
  width:${OPTS.avatar}px; height:${OPTS.avatar}px; border-radius:50%;
  display:grid; place-items:center;
}
.ss-ava img{width:calc(100% - ${OPTS.ringWidth*2}px); height:calc(100% - ${OPTS.ringWidth*2}px);
  object-fit:cover; display:block; border-radius:50%}

.ss-ava.is-empty{font-size:${Math.round(OPTS.avatar/3.4)}px; opacity:.5}

.ss-side{min-width:0}
/* one row, always: wrapping icons was making the block grow a line */
.ss-links{display:flex; align-items:center; gap:${OPTS.iconGap}px; flex-wrap:nowrap}
.ss-links a{
  display:grid; place-items:center; color:inherit; line-height:0;
  opacity:.9; transition:opacity .18s ease, transform .18s ease;
}
.ss-links a:hover{opacity:1; transform:translateY(-2px)}
.ss-links svg{width:${OPTS.iconSize}px; height:${OPTS.iconSize}px; fill:currentColor}

/* one segment per person; the live one fills over the interval */
/* The track is a translucent colour, not currentColor at low opacity:
   opacity on the track would also dim the fill inside it, which is why
   the bar looked like it was doing nothing. */
.ss-seg{
  flex:1 1 0; height:${OPTS.barHeight}px; border-radius:${OPTS.barHeight}px;
  background:${track}; overflow:hidden; position:relative;
}

/* The timer is the ring around the avatar: it fills over the time each
   person is shown, and its finishing is what advances the widget, so the
   two can never drift apart. */
.ss-ring{position:absolute; inset:0; width:100%; height:100%;
  transform:rotate(-90deg); overflow:visible; pointer-events:none}
/* non-scaling-stroke keeps this an exact hairline whatever size
   the avatar is, instead of scaling with the viewBox */
.ss-ring circle{fill:none; stroke-width:${OPTS.ringWidth}px; vector-effect:non-scaling-stroke}
.ss-ring .ss-ring-track{stroke:${OPTS.ringTrack || OPTS.color}}
.ss-ring .ss-ring-fill{
  stroke:${OPTS.ringFill}; stroke-linecap:butt;
  stroke-dasharray:var(--ss-circ); stroke-dashoffset:var(--ss-circ);
}
.ss-ring .ss-ring-fill.is-live{animation:ss-ring linear forwards}
@keyframes ss-ring{from{stroke-dashoffset:var(--ss-circ)}to{stroke-dashoffset:0}}

/* --- text --- */
.ss-textwrap{position:relative}
.ss-text{transition:opacity ${OPTS.fadeMs}ms ease, transform ${OPTS.fadeMs}ms ease}
.ss-text.is-out{opacity:0; transform:translateY(6px)}
.ss-team .ss-role{margin:0}
.ss-team .ss-name{margin:0; line-height:1}
.ss-team .ss-name a{color:inherit; text-decoration:none}
.ss-team .ss-name a:hover{text-decoration:underline}
.ss-team .ss-tag{margin:0; min-height:1.35em}

.ss-arrow{
  position:absolute; top:50%; transform:translateY(-50%);
  width:40px; height:52px; padding:0; cursor:pointer;
  background:none; border:0; color:inherit; opacity:.4;
  display:grid; place-items:center; transition:opacity .18s ease;
}
.ss-arrow:hover,.ss-arrow:focus-visible{opacity:1}
.ss-arrow.is-prev{left:-54px}
.ss-arrow.is-next{right:-54px}
.ss-arrow svg{width:26px; height:26px; fill:none; stroke:currentColor;
  stroke-width:2; stroke-linecap:round; stroke-linejoin:round}

.ss-sk{opacity:.4; animation:ss-pulse 1.5s ease-in-out infinite}
@keyframes ss-pulse{0%,100%{opacity:.2}50%{opacity:.45}}
.ss-sk-bar{display:block; border-radius:7px; background:currentColor; opacity:.25}

@media (max-width:620px){
  .ss-team{padding:0 34px}
  .ss-top{gap:16px; margin-bottom:14px}
  .ss-ava{width:${Math.round(OPTS.avatar * .7)}px; height:${Math.round(OPTS.avatar * .7)}px}
  .ss-links{gap:16px}
  .ss-links svg{width:22px; height:22px}
  .ss-arrow.is-prev{left:-30px}
  .ss-arrow.is-next{right:-30px}
}
@media (prefers-reduced-motion:reduce){
  .ss-text,.ss-links a{transition:none}
  .ss-ring .ss-ring-fill.is-live{animation:none; stroke-dashoffset:0}
  .ss-sk{animation:none}
}`;
    /* Carrd's heading styles do not reach inside an embed, so the type
       and colour are set here. Measured off the page as it was. */
    s.textContent += `
.ss-team{color:${OPTS.color}}
.ss-team .ss-role{font-size:var(--ss-role); font-weight:${OPTS.typeWeight.role};
  margin:0 0 var(--ss-role-gap); line-height:1}
.ss-team .ss-name{
  font-size:var(--ss-name); font-weight:${OPTS.typeWeight.name};
  margin:0; line-height:1; white-space:nowrap;
  position:relative; z-index:2;
  /* the halo is painted first and the letter on top of it, so the name
     carves its own clearance out of the line below */
  -webkit-text-stroke:${OPTS.knockout}px ${OPTS.bgColor};
  paint-order:stroke fill;
}
.ss-team .ss-tag{
  font-size:var(--ss-tag); font-weight:${OPTS.typeWeight.tag};
  margin:var(--ss-tag-gap) 0 0; line-height:1; white-space:nowrap;
  position:relative; z-index:1;
}`;

    if (OPTS.loadFont) {
      s.textContent += `
.ss-team,.ss-team *{font-family:"Figtree",-apple-system,"Segoe UI",Helvetica,Arial,sans-serif}`;
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

  var RING = '<svg class="ss-ring" viewBox="0 0 100 100" aria-hidden="true">' +
    '<circle class="ss-ring-track" cx="50" cy="50" r="48"></circle>' +
    '<circle class="ss-ring-fill" cx="50" cy="50" r="48"></circle></svg>';

  function avatarHtml(p) {
    var img = url(p.image);
    var inner = img
      ? '<img src="' + img + '" alt="" decoding="async">'
      : '<span>' + esc(initials(p.name)) + '</span>';
    return '<div class="ss-ava' + (img ? '' : ' is-empty') + '">' + RING + inner + '</div>';
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
    var CIRC    = 2 * Math.PI * 48;
    var at = 0, run = 0, swapTimer = null, fallbackTimer = null;

    /* Two jobs, in order.

       First, size the type. On the original the name filled the column
       and the other lines were in fixed proportion to it, so rather than
       hardcoding pixel sizes the longest name is fitted to the column
       and everything else follows from the measured ratios. This holds
       whatever the column width and whatever font is actually serving.

       Second, freeze the layout. Every person is measured and the block
       is held at the widest arrangement, so the avatar, the icons, the
       bar and the text never move as it cycles.
     */
    function lock() {
      var inner = root.querySelector('.ss-inner');
      var F = OPTS.fit;

      inner.style.width = '';
      links.style.minWidth = '';
      text.style.minHeight = '';

      var column = root.clientWidth;
      if (!column) return;

      var probe = document.createElement('div');
      probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;' +
        'left:0;top:0;white-space:nowrap;font-weight:' + OPTS.typeWeight.name + ';font-size:100px';
      root.appendChild(probe);

      function widthAt100(txt, weight) {
        probe.style.fontWeight = weight;
        probe.textContent = txt;
        return probe.getBoundingClientRect().width || 1;
      }

      /* Reference sizes. The role line keeps one size for everyone so it
         does not jump about; the name and tagline are fitted per person
         in fitPerson below. */
      var roleTxt = people[0].role || '';
      var roleSize = roleTxt
        ? 100 * (column * F.roleOfColumn) / widthAt100(roleTxt, OPTS.typeWeight.role)
        : 16;

      /* the longest name decides the size, and everyone shares it */
      var widest = 0;
      people.forEach(function (p) {
        widest = Math.max(widest, widthAt100(p.name, OPTS.typeWeight.name));
      });
      nameSize = 100 * (column * F.nameFillsColumn) / widest;
      nameSize = Math.max(F.minName, Math.min(F.maxName, nameSize));

      root.removeChild(probe);
      root.style.setProperty('--ss-name', nameSize.toFixed(2) + 'px');
      root.style.setProperty('--ss-role', roleSize.toFixed(1) + 'px');
      root.style.setProperty('--ss-role-gap', (-nameSize * 0.06).toFixed(1) + 'px');
      root.style.setProperty('--ss-tag-gap',  (-nameSize * 0.07).toFixed(1) + 'px');

      /* now hold the widest arrangement so nothing shifts between people */
      var probe2 = inner.cloneNode(true);
      probe2.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;' +
        'left:0;top:0;width:auto;white-space:nowrap';
      root.appendChild(probe2);
      var pl = probe2.querySelector('.ss-links'), pt = probe2.querySelector('.ss-text');
      var wideIcons = 0, tallText = 0;
      people.forEach(function (p) {
        fitPerson(p);                       // each person at their own size
        pl.innerHTML = linksHtml(p);
        pt.innerHTML = textHtml(p);
        wideIcons = Math.max(wideIcons, pl.scrollWidth);
        tallText  = Math.max(tallText,  pt.offsetHeight);
      });
      fitPerson(people[at]);                // back to whoever is showing
      root.removeChild(probe2);

      if (wideIcons) links.style.minWidth = Math.ceil(wideIcons) + 'px';
      if (tallText)  text.style.minHeight = Math.ceil(tallText) + 'px';
    }

    function stopRing() {
      var fill = root.querySelector('.ss-ring-fill');
      if (!fill) return;
      fill.classList.remove('is-live');
      fill.style.animation = '';
      fill.style.animationPlayState = '';
    }

    function startRing() {
      var fill = root.querySelector('.ss-ring-fill');
      if (!fill) return;
      stopRing();
      if (!OPTS.interval || !many || reduce) return;
      void fill.offsetWidth;                     // force a clean restart
      fill.style.animationDuration = OPTS.interval + 'ms';
      fill.classList.add('is-live');
      if (hovering) fill.style.animationPlayState = 'paused';
    }

    /* Each name is set to fill the column, whatever its length, and the
       tagline is then scaled so it comes out exactly as long as the name.
       Both are measured, not guessed. */
    /* One size for everyone: whatever the longest name needs in order to
       fill the column. Shorter names keep that size and simply run
       shorter, left aligned, instead of swelling to fill the width. */
    var nameSize = 0;

    function fitPerson(p) {
      var column = root.clientWidth;
      if (!column || !nameSize) return;
      var probe = document.createElement('div');
      probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;' +
        'left:0;top:0;white-space:nowrap;font-size:100px';
      root.appendChild(probe);
      function w100(txt, weight) {
        probe.style.fontWeight = weight;
        probe.textContent = txt;
        return probe.getBoundingClientRect().width || 1;
      }
      var nameW = nameSize * w100(p.name, OPTS.typeWeight.name) / 100;
      var tagSize = p.tag ? 100 * nameW / w100(p.tag, OPTS.typeWeight.tag) : nameSize * 0.4;
      root.removeChild(probe);
      root.style.setProperty('--ss-tag', tagSize.toFixed(2) + 'px');
    }

    /* No lock: a second click simply supersedes the first. Each call
       takes a ticket, and only the newest one is allowed to finish, so
       hammering the arrows cannot leave a half-finished swap or a ring
       that never restarts. */
    function show(i) {
      if (!many) return;
      var ticket = ++run;
      clearTimeout(swapTimer);
      clearTimeout(fallbackTimer);
      stopRing();
      at = (i + people.length) % people.length;
      text.classList.add('is-out');
      links.style.opacity = '0';
      swapTimer = setTimeout(function () {
        if (ticket !== run) return;
        fitPerson(people[at]);
        avaSlot.innerHTML = avatarHtml(people[at]);
        links.innerHTML = linksHtml(people[at]);
        text.innerHTML = textHtml(people[at]);
        text.classList.remove('is-out');
        links.style.opacity = '';
        startRing();
      }, OPTS.fadeMs);
    }

    /* The bar finishing is what advances the widget, so the two can
       never fall out of step. */
    root.addEventListener('animationend', function (e) {
      /* ignore a stale ring that finished after its person was replaced */
      if (e.animationName === 'ss-ring' && e.target.classList.contains('is-live')) {
        show(at + 1);
      }
    });
    if (reduce && OPTS.interval && many) {
      (function loop() {
        fallbackTimer = setTimeout(function () { show(at + 1); loop(); }, OPTS.interval);
      })();
    }

    var prev = root.querySelector('.ss-arrow.is-prev');
    var next = root.querySelector('.ss-arrow.is-next');
    if (prev) prev.addEventListener('click', function () { show(at - 1); });
    if (next) next.addEventListener('click', function () { show(at + 1); });

    var hovering = false;
    function pause(on) {
      hovering = on;
      var f = root.querySelector('.ss-ring-fill');
      if (f) f.style.animationPlayState = on ? 'paused' : 'running';
    }
    root.addEventListener('mouseenter', function () { pause(true); });
    root.addEventListener('mouseleave', function () { pause(false); });
    root.addEventListener('focusin', function () { pause(true); });
    root.addEventListener('focusout', function () { pause(false); });
    document.addEventListener('visibilitychange', function () { pause(document.hidden); });

    root.style.setProperty('--ss-circ', CIRC.toFixed(2));
    lock();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ lock(); startRing(); });
    window.addEventListener('resize', lock, { passive: true });
    startRing();
  }

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function init() {
    /* Accepts any of these, so renaming the file or the div cannot
       break the widget. The styling keys off a class this adds, not
       off the id. */
    var root = document.getElementById('ss-team')
            || document.getElementById('sds-team')
            || document.querySelector('[data-team-widget]');
    if (!root) return;
    root.classList.add('ss-team');
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
