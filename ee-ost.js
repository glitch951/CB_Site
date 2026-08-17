/* =============================================================
   ESOTERIC EBB - SOUNDTRACK

   Same Averia Serif Libre, cream-green and orange as ee-faq.js
   and askchris.js, same outlined boxes with no fill.

   One screen. The section is a full viewport tall, clear of the
   top bar, and nothing below the fold: the record sits on the
   left with its links, the tracklist on the right, and either
   column scrolls on its own if the window is short.

   Volumes are a carousel. The arrows at the sides slide the
   whole record across; nothing on the page moves or resizes.
   Arrow keys and swipes work too. Add a third volume and it
   joins the run on its own.

   INSTALL
   1. Upload ee-ost.js to the CB_Site repo.
   2. Replace the contents of #ost with one Carrd Embed
      (Type: Code, Style: Inline):

      <div id="ee-ost"></div>
      <script defer src="https://glitch951.github.io/CB_Site/ee-ost.js"></script>

   TRACKS
      'Title' or 'Title | 3:57'. The time is optional.
   ============================================================= */

(function () {
  'use strict';
  if (window.__eeOst) return;
  window.__eeOst = true;

  var HERE = document.currentScript;

  var OPTS = {
    heading: 'Soundtrack',

    /* Declared outright rather than inherited, because Carrd's own
       rules win inside an embed. */
    font:     "'Averia Serif Libre'",
    fontHref: 'https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,400&display=swap',

    /* Clearance for ee-topbar, which is fixed and 74px tall, 58px
       under 1080px wide. Change these together with the bar. */
    barH:   74,
    barHSm: 58,

    /* How tall the section stands. Carrd sections carry their own
       padding, so if this ends up a touch too tall and the page
       scrolls, trim it here: 'calc(100svh - 4em)'. */
    fill: '100svh',

    remember: true,   // reopen on the volume last looked at

    /* Clicking a track plays it. Bandcamp refuses to let an embed
       start itself, so playback runs through Spotify, which ships a
       real API for it: a slim player drops in under the record and
       starts the track. Visitors signed in to Premium hear it whole,
       everyone else gets Spotify's 30 second preview.
       A track with no Spotify id falls back to cueing the Bandcamp
       player, which then waits on one press of play.
       Set false for a plain, unclickable list. */
    playOnClick:  true,
    playerLabel:  'Now playing',
    playerHeight: 80,

    /* ---------------------------------------------------------
       VOLUMES - one entry per record, in release order.
       album    the number from the Bandcamp EmbeddedPlayer URL
       listen   streaming links
       buy      shops carrying the record. Leave empty and the
                whole section drops out, with `note` in its place.
       tracks   'Title' or 'Title | 3:57'
       --------------------------------------------------------- */
    volumes: [
      {
        tab:      'Vol. 1',
        title:    'Esoteric Ebb, Vol. 1',
        subtitle: 'Original Soundtrack',
        cat:      'OIL072',
        credits: [
          '24 tracks composed, produced and mixed by Anders Bach, Brian Batz and Kristian Paulsen.',
          'Mastered by Angel Marcloid at Angel Hair Audio. Released by The Big Oil Recording Company.'
        ],
        album: '592533375',

        listen: [
          { label: 'Spotify',  note: 'Stream',            url: 'https://open.spotify.com/album/5dqcutGdziX0pR0sMOQyuR' },
          { label: 'Bandcamp', note: 'Stream & download', url: 'https://andersbachbrianbatzkristianpaulsen.bandcamp.com/album/oil072-esoteric-ebb-vol-1-original-soundtrack' }
        ],

        buy: [
          { label: 'Bandcamp',          note: 'From the label', url: 'https://andersbachbrianbatzkristianpaulsen.bandcamp.com/album/oil072-esoteric-ebb-vol-1-original-soundtrack' },
          { label: 'Cartridge Thunder', note: 'US',             url: 'https://cartridgethunder.com/products/esoteric-ebb-vol-1-original-soundtrack' },
          { label: 'Amazon',            note: 'UK',             url: 'https://www.amazon.co.uk/Esoteric-Ebb-Vol-1-VINYL/dp/B0H4RRW73V/' },
          { label: 'Juno',              note: 'UK',             url: 'https://www.juno.co.uk/products/anders-bach-brian-batz-esoteric-ebb-vol-1-vinyl/1164313-01/' },
          { label: 'HEAD Records',      note: 'UK',             url: 'https://headrecords.co.uk/soundtracks/esoteric-ebb-vol.-1-anders-bach/brian-batz/kristian-paulsen/p-oil0721' },
          { label: 'Proper Music',      note: 'UK',             url: 'https://propermusic.com/products/andersbachbrianbatzkristianpaulsen-esotericebbvol1' }
        ],

        /* 'Title | length | spotify track id' - the id is what the
           player above uses. Drop it and the row falls back to cueing
           Bandcamp. */
        tracks: [
          'Endless Ebb | 1:48 | 0GSpY1V3CRCBabsruB8ZIj',
          'Waking Morgue | 3:25 | 7KJNc8wwxhDwKNqiupEMeG',
          'Norvik | 5:40 | 6Uh7Tom49GG8fISk5IPI6k',
          'Peril | 3:21 | 4glPTPjNqRJZfY95kWuGLU',
          'Comrades | 2:54 | 0u5mT6GhvUasJEpX4TQqLI',
          'Dear Snell | 2:53 | 5eNseA0UExyaAZNu7nCY27',
          'At The Throne | 4:04 | 4Lfe9GbEwVIHQX0CYPz7se',
          'This Halo Glows | 4:36 | 5NmX0wBxQiJmRoy5vQBwMq',
          'Merchants | 4:40 | 1UwwnCymAtY4mDKTM6Wkin',
          'Night on Tolstad | 1:55 | 7Ma45ftBamzWcE7BndwD1n',
          'Questions Need Answering | 2:56 | 0kFsM1j1IqQi4vVztGxtVo',
          'Waterlane | 4:51 | 1Jnt5PXtvC1MSsILsehgZJ',
          'Dank Bodies, Mooring Visage | 2:30 | 1TtbrQGIjRJo3VHy8zaZmJ',
          'Light of Brr | 3:04 | 3YsidP9SI1yYjpIkv7yuT0',
          'The Cabin | 5:17 | 0fby2SHlNtCL5dqaF6UD5n',
          'Shwmae, Dyn Metel Rhyfedd! | 4:07 | 4RvIdzsRVlGa2ZoDEyx1bu',
          'Roots | 2:32 | 0kLvWNOkfsjow1Uuy84eTm',
          'A Specter, A Trifler | 5:03 | 0Vmu9HeRwOgvHE7zHgwCeM',
          'Entering the Pillar | 3:06 | 27ZKUs5vxIMq5rPg804ftz',
          'The Missing Paladin (feat. Sleep Party People) | 4:49 | 2NHjPIXQJz7787mJDm6oPD',
          'Chosen of Urth (feat. Seiðr) | 6:36 | 3Cf6eOacqslQmKOdYwSIJf',
          'Voids of Resolution | 5:16 | 39AssLJ59edghzVL7oG7xs',
          'Days of Jor (feat. MØ & GNOM) | 5:53 | 7CBMFsslIW9rzmpGco8HHC',
          'An Esoteric Ebb | 3:39 | 62XP1MuEC3BFpuhuiruUmE'
        ]
      },

      {
        tab:      'Vol. 2',
        title:    'Esoteric Ebb, Vol. 2',
        subtitle: 'Original Soundtrack',
        cat:      '',
        credits: [
          '22 tracks composed, produced and mixed by Anders Bach, Brian Batz and Kristian Paulsen.',
          'Out 24 July 2026 on The Big Oil Recording Company.'
        ],
        album: '3281776048',

        /* Spotify carries Vol. 2 inside the combined Vol. 1 & 2
           release rather than on its own, which is why the record
           reads Disc 2 over there. */
        listen: [
          { label: 'Spotify',  note: 'Stream',      url: 'https://open.spotify.com/album/6iOh5l6FuVPh0DQRGEgnzD' },
          { label: 'Bandcamp', note: 'Stream & download',  url: 'https://andersbachbrianbatzkristianpaulsen.bandcamp.com/album/esoteric-ebb-vol-2-original-soundtrack-2' }
        ],

        /* No vinyl yet. Fill this in and the section appears. */
        buy:  [],
        note: '',

        tracks: [
          "Nearly's Song | 3:57 | 7bRaVBPpILlvashVogt2mS",
          'Norvikian Decay | 3:36 | 1VOOUUFwM3vi80TBS0bKKx',
          'Outside | 3:59 | 6d7P5fo3Ct8JlWVANLiqi1',
          "The Prison of Toulin'catl | 6:58 | 7yg9StfJkUUxtpFT6Mwty5",
          'Calmness Is a Still | 2:48 | 3WX31XqDUMX4DvaNITtKjl',
          'The Tower | 3:33 | 5A56IzaOAaTM7tWIy3wVWH',
          'Burnt | 4:12 | 1MMSRW4W7cuWKa0VO5nK5o',
          'Meriadoc Sleeps | 1:20 | 4li9utAqQxS57hxYSPF1De',
          'The Presence of Sageleaf | 5:23 | 4qelqfTYf1j4sKc89MlD0U',
          'Patriots | 4:32 | 75B8bjMALZ3c5HYJAJ52Ez',
          'Distill Portside | 4:00 | 1PJNXImC2dSCfNi4mJuqq9',
          "At Snurre's | 3:41 | 5E3r40Ek92kGdRceUXnxIA",
          'Long Rest | 0:23 | 2AWsCOrw9Fz9tsPUbnJIvZ',
          'Highland Fling | 2:52 | 0ZsPvdkTw8fK9AnGuoO4mr',
          'Undercoast | 6:04 | 0wB9QFKESHaXtN2qgAiulP',
          'Crypts | 2:23 | 6xDHQZ1inOQxwZbNwMYbRo',
          "Kraiid's Teeth | 3:16 | 7IVz345DqZ3xvDH8oCxyry",
          'Caverns | 5:25 | 1G37GLIfODmhZ9p1uaa61L',
          'Revel in Urth | 2:26 | 3WVLaYGmwYCVwHWV7f7Aax',
          'Ruins | 1:12 | 0ghm9l51ktiLX1Su0WJrpO',
          'Leaving | 3:53 | 6vCPIfSaVNfh2rYCrv6qMZ',
          'In the Void | 3:26 | 0BfVu6frA91pOnugBvs6x5'
        ]
      }
    ],

    listenHeading: 'Listen',
    buyHeading:    'Buy the vinyl',
    tracksHeading: 'Tracklist'
  };

  var GREEN  = '#DAE5CF';
  var ORANGE = '#DB5B2C';
  var SAGE   = '#C1D3AE';
  var INK    = '020E16';   // Bandcamp takes hex with no hash

  function font() {
    if (!OPTS.fontHref || document.getElementById('ee-ost-font')) return;
    var l = document.createElement('link');
    l.id = 'ee-ost-font';
    l.rel = 'stylesheet';
    l.href = OPTS.fontHref;
    document.head.appendChild(l);
  }

  function styles() {
    if (document.getElementById('ee-ost-css')) return;
    var s = document.createElement('style');
    s.id = 'ee-ost-css';
    s.textContent = `
#ee-ost,#ee-ost *{box-sizing:border-box; font-family:${OPTS.font},Georgia,serif}
#ee-ost{
  display:flex; flex-direction:column; color:${GREEN}; text-align:left;
  width:100%; max-width:1180px; margin:0 auto;
  min-height:100vh; min-height:${OPTS.fill};
  padding:calc(${OPTS.barH}px + clamp(12px,2.5vh,30px)) clamp(14px,4vw,30px) clamp(14px,2.5vh,28px);
}
@media (max-width:1080px){
  #ee-ost{padding-top:calc(${OPTS.barHSm}px + clamp(12px,2.5vh,30px))}
}

/* heading sits on one line with the volume name, to save the height */
.ee-ost-top{display:flex; align-items:baseline; gap:clamp(10px,2vw,20px); flex-wrap:wrap; margin:0 0 clamp(10px,2vh,22px)}
.ee-ost-title{
  margin:0; color:${ORANGE}; font-weight:400; line-height:1;
  font-size:clamp(26px,3.6vw,46px); font-variant:small-caps; letter-spacing:.02em;
}
.ee-ost-of{color:rgba(218,229,207,.45); font-style:italic; font-size:clamp(13px,1.3vw,16px)}

/* the carousel */
.ee-ost-stagewrap{position:relative; flex:1 1 auto; min-height:0; display:flex}
.ee-ost-stage{position:relative; flex:1 1 auto; min-height:0; overflow:hidden; padding:0 clamp(44px,4.5vw,64px)}
.ee-ost-slide{
  position:absolute; inset:0; padding:0 clamp(44px,4.5vw,64px);
  display:grid; grid-template-columns:minmax(0,330px) minmax(0,1fr);
  gap:clamp(18px,3vw,38px); align-items:stretch;
  opacity:0; visibility:hidden; transform:translateX(46px);
  transition:opacity .42s ease, transform .42s cubic-bezier(.22,.61,.36,1), visibility .42s;
}
.ee-ost-slide.is-left{transform:translateX(-46px)}
.ee-ost-slide.is-on{opacity:1; visibility:visible; transform:none}

/* both columns scroll on their own, so a short window never
   pushes the section past one screen */
.ee-ost-col{min-height:0; overflow-y:auto; overscroll-behavior:contain; padding-right:6px}
.ee-ost-col::-webkit-scrollbar{width:6px}
.ee-ost-col::-webkit-scrollbar-thumb{background:rgba(218,229,207,.22); border-radius:99px}
.ee-ost-col::-webkit-scrollbar-thumb:hover{background:rgba(219,91,44,.6)}
.ee-ost-col{scrollbar-width:thin; scrollbar-color:rgba(218,229,207,.22) transparent}

.ee-ost-player{border:1px solid rgba(218,229,207,.22); border-radius:16px; overflow:hidden; line-height:0}
.ee-ost-player iframe{display:block; width:100%; border:0}
.ee-ost-name{
  margin:.9em 0 0; color:${GREEN}; font-weight:400; line-height:1.1;
  font-size:clamp(20px,2.4vw,28px); font-variant:small-caps; letter-spacing:.02em;
}
.ee-ost-sub{display:block; margin-top:.3em; color:${SAGE}; font-size:clamp(12px,1.2vw,14px);
  letter-spacing:.16em; text-transform:uppercase; font-variant:normal}
.ee-ost-cat{display:inline-block; margin:.7em 0 0; padding:.12em .7em;
  border:1px solid rgba(219,91,44,.55); border-radius:999px; color:${ORANGE};
  font-size:11.5px; letter-spacing:.18em}
.ee-ost-credits{margin:.8em 0 0; padding:0; list-style:none; line-height:1.55;
  color:rgba(218,229,207,.7); font-size:14px}
.ee-ost-credits li{margin:0 0 .4em}
.ee-ost-note{margin:.7em 0 0; color:rgba(218,229,207,.5); font-style:italic; font-size:14px}

.ee-ost-cap{margin:clamp(16px,2.4vh,26px) 0 .7em; color:${SAGE}; font-weight:400;
  font-size:clamp(14px,1.5vw,17px); letter-spacing:.16em; text-transform:uppercase}
.ee-ost-col > .ee-ost-cap:first-child{margin-top:0}

/* links: outlined, transparent, orange on hover. Reflows for
   however many shops there are. */
.ee-ost-links{display:grid; gap:8px; grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}
.ee-ost-link{
  display:flex; align-items:center; gap:12px; text-decoration:none; color:${GREEN};
  padding:.6em 1em; border:1px solid rgba(218,229,207,.42); border-radius:14px;
  font-size:clamp(14px,1.3vw,16px); line-height:1.35; transition:none;
}
.ee-ost-link:hover,.ee-ost-link:focus-visible{color:${ORANGE}; border-color:${ORANGE}}
.ee-ost-ltext{flex:1; min-width:0}
.ee-ost-lnote{display:block; margin-top:.15em; font-size:11px; letter-spacing:.14em;
  text-transform:uppercase; color:rgba(218,229,207,.5)}
.ee-ost-link:hover .ee-ost-lnote{color:rgba(219,91,44,.75)}
.ee-ost-arrow{flex:0 0 auto; width:11px; height:11px; opacity:.55}
.ee-ost-link:hover .ee-ost-arrow{opacity:1}

/* tracklist */
.ee-ost-tracks{margin:0; padding:.2em 1.1em; list-style:none;
  border:1px solid rgba(218,229,207,.22); border-radius:16px}
.ee-ost-track{display:flex; align-items:baseline; gap:12px; padding:.5em 0;
  border-bottom:1px dashed rgba(218,229,207,.16); line-height:1.35;
  width:100%; text-align:left; font:inherit; color:inherit; background:none;
  border-left:0; border-right:0; border-top:0; transition:none}
.ee-ost-tracks li:last-child .ee-ost-track{border-bottom:0}
.ee-ost-n{flex:0 0 auto; width:1.8em; color:${ORANGE}; font-size:12.5px; font-variant-numeric:tabular-nums}
.ee-ost-tt{flex:1; min-width:0; font-size:15px}
.ee-ost-td{flex:0 0 auto; color:rgba(218,229,207,.4); font-size:12.5px; font-variant-numeric:tabular-nums}

/* a row you can play: the number gives way to a play mark */
button.ee-ost-track{cursor:pointer}
button.ee-ost-track:hover .ee-ost-tt,button.ee-ost-track:focus-visible .ee-ost-tt{color:${ORANGE}}
.ee-ost-mark{position:relative; flex:0 0 auto; width:1.8em; height:1em; font-size:12.5px}
.ee-ost-mark b{position:absolute; left:0; top:0; font-weight:400; color:${ORANGE};
  font-variant-numeric:tabular-nums}
.ee-ost-mark i{position:absolute; left:1px; top:.08em; width:0; height:0; opacity:0;
  border-left:7px solid ${ORANGE}; border-top:4.5px solid transparent;
  border-bottom:4.5px solid transparent}
button.ee-ost-track:hover .ee-ost-mark b,button.ee-ost-track:focus-visible .ee-ost-mark b{opacity:0}
button.ee-ost-track:hover .ee-ost-mark i,button.ee-ost-track:focus-visible .ee-ost-mark i{opacity:1}
.ee-ost-track.is-cued .ee-ost-mark b{opacity:0}
.ee-ost-track.is-cued .ee-ost-mark i{opacity:1}
.ee-ost-track.is-cued .ee-ost-tt{color:${ORANGE}}
.ee-ost-track.is-cued .ee-ost-td{color:rgba(219,91,44,.7)}

/* the side arrows */
.ee-ost-go{
  position:absolute; top:50%; transform:translateY(-50%); z-index:3;
  width:clamp(34px,3.4vw,44px); height:clamp(34px,3.4vw,44px);
  display:grid; place-items:center; cursor:pointer; padding:0;
  background:transparent; color:${GREEN};
  border:1px solid rgba(218,229,207,.42); border-radius:50%;
  transition:color .15s ease, border-color .15s ease;
}
.ee-ost-go:hover,.ee-ost-go:focus-visible{color:${ORANGE}; border-color:${ORANGE}}
.ee-ost-go svg{width:11px; height:16px; display:block}
.ee-ost-go.is-prev{left:0}
.ee-ost-go.is-next{right:0}

/* which record you are on */
.ee-ost-dots{display:flex; align-items:center; justify-content:center; gap:12px;
  padding-top:clamp(8px,1.6vh,16px)}
.ee-ost-dot{width:9px; height:9px; padding:0; cursor:pointer; background:transparent;
  border:1px solid rgba(218,229,207,.45); border-radius:50%; transition:none}
.ee-ost-dot:hover{border-color:${ORANGE}}
.ee-ost-dot.is-on{background:${ORANGE}; border-color:${ORANGE}}

/* the player that drops in when a track is clicked */
.ee-ost-now{
  flex:0 0 auto; height:0; overflow:hidden; opacity:0;
  transition:height .34s cubic-bezier(.22,.61,.36,1), opacity .28s ease;
}
.ee-ost-now.is-up{height:calc(${OPTS.playerHeight}px + 30px); opacity:1}
.ee-ost-nowin{
  display:flex; align-items:center; gap:clamp(12px,2vw,22px);
  margin-top:clamp(10px,1.6vh,18px);
  padding:.7em 1em; border:1px solid rgba(219,91,44,.45); border-radius:16px;
}
.ee-ost-nowtext{flex:0 0 auto; min-width:0; max-width:34%}
.ee-ost-noweyebrow{display:block; color:${SAGE}; font-size:11px; letter-spacing:.2em;
  text-transform:uppercase; opacity:.8}
.ee-ost-nowtitle{display:block; margin-top:.25em; color:${ORANGE};
  font-size:clamp(15px,1.5vw,18px); font-variant:small-caps; letter-spacing:.02em;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.ee-ost-nowvol{color:rgba(218,229,207,.45); font-variant:normal; font-size:12.5px;
  letter-spacing:.1em; text-transform:uppercase; margin-left:.6em}
.ee-ost-nowplayer{flex:1 1 auto; min-width:0; height:${OPTS.playerHeight}px}
.ee-ost-nowplayer iframe{display:block; width:100%; height:100%; border:0; border-radius:12px}
.ee-ost-nowstop{
  flex:0 0 auto; width:30px; height:30px; padding:0; cursor:pointer; line-height:1;
  background:transparent; color:rgba(218,229,207,.55); font-size:19px;
  border:1px solid rgba(218,229,207,.3); border-radius:50%; transition:none;
}
.ee-ost-nowstop:hover,.ee-ost-nowstop:focus-visible{color:${ORANGE}; border-color:${ORANGE}}
.ee-ost-nowhint{color:rgba(218,229,207,.4); font-size:11.5px; font-style:italic;
  padding:6px 4px 0; text-align:right}

/* stacked, with the arrows brought down to the foot beside the dots */
@media (max-width:820px){
  #ee-ost{min-height:0; padding-bottom:clamp(30px,6vw,60px)}
  .ee-ost-stage,.ee-ost-slide{padding:0}
  .ee-ost-stage{overflow:visible}
  .ee-ost-slide{position:relative; inset:auto; grid-template-columns:1fr; display:none}
  .ee-ost-slide.is-on{display:grid; transform:none}
  .ee-ost-col{overflow:visible}
  .ee-ost-go{position:static; transform:none}
  .ee-ost-dots{gap:18px; padding-top:22px}
  /* the player follows the page down rather than sitting in the flow */
  .ee-ost-now.is-up{
    position:fixed; left:0; right:0; bottom:0; z-index:8000; height:auto;
    background:#020E16; padding:0 14px 12px;
    box-shadow:0 -14px 30px rgba(2,14,22,.75);
  }
  .ee-ost-nowin{margin-top:12px}
  .ee-ost-nowtext{display:none}
  .ee-ost-nowhint{display:none}
}

@media (prefers-reduced-motion:reduce){.ee-ost-slide{transition:none}}`;
    document.head.appendChild(s);
  }

  /* ---------- markup ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var OUT = '<svg class="ee-ost-arrow" viewBox="0 0 12 12" aria-hidden="true" fill="none" ' +
    'stroke="currentColor" stroke-width="1.4"><path d="M2.5 9.5 9.5 2.5M4.2 2.5h5.3v5.3"/></svg>';

  function chev(dir) {
    var d = dir < 0 ? 'M8 2 2.5 8 8 14' : 'M3 2 8.5 8 3 14';
    return '<svg viewBox="0 0 11 16" aria-hidden="true" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
  }

  function links(list) {
    return (list || []).filter(function (l) { return l && l.url; }).map(function (l) {
      return '<a class="ee-ost-link" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
        '<span class="ee-ost-ltext">' + esc(l.label) +
        (l.note ? '<span class="ee-ost-lnote">' + esc(l.note) + '</span>' : '') +
        '</span>' + OUT + '</a>';
    }).join('');
  }

  function tracks(list, playable) {
    var rows = (list || []).map(function (raw, i) {
      var bits = String(raw).split('|');
      var time = bits.length > 1 ? bits[1].trim() : '';
      var sp   = bits.length > 2 ? bits[2].trim() : '';
      var name = esc(bits[0].trim());
      var body =
        (playable
          ? '<span class="ee-ost-mark" aria-hidden="true"><b>' + (i + 1) + '</b><i></i></span>'
          : '<span class="ee-ost-n">' + (i + 1) + '</span>') +
        '<span class="ee-ost-tt">' + name + '</span>' +
        (time ? '<span class="ee-ost-td">' + esc(time) + '</span>' : '');
      return '<li>' + (playable
        ? '<button type="button" class="ee-ost-track" data-t="' + (i + 1) + '" ' +
          (sp ? 'data-sp="' + esc(sp) + '" ' : '') +
          'data-title="' + name + '" aria-label="Play ' + name + '">' + body + '</button>'
        : '<div class="ee-ost-track">' + body + '</div>') + '</li>';
    }).join('');
    return rows ? '<ol class="ee-ost-tracks">' + rows + '</ol>' : '';
  }

  function player(album, title) {
    if (!album) return '';
    var src = 'https://bandcamp.com/EmbeddedPlayer/album=' + encodeURIComponent(album) +
      '/size=large/bgcol=' + INK + '/linkcol=' + ORANGE.replace('#', '') +
      '/tracklist=false/transparent=true/';
    /* held in data-src so a record you have not opened does not pull
       a player down in the background */
    return '<div class="ee-ost-player"><iframe data-src="' + src + '" data-base="' + src + '" ' +
      'loading="lazy" seamless title="' + esc(title) + ' on Bandcamp"></iframe></div>';
  }

  function slide(v, i) {
    var left = player(v.album, v.title) +
      '<h3 class="ee-ost-name">' + esc(v.title) +
        (v.subtitle ? '<span class="ee-ost-sub">' + esc(v.subtitle) + '</span>' : '') +
      '</h3>' +
      (v.cat ? '<span class="ee-ost-cat">' + esc(v.cat) + '</span>' : '') +
      (v.credits && v.credits.length
        ? '<ul class="ee-ost-credits"><li>' + v.credits.map(esc).join('</li><li>') + '</li></ul>' : '') +
      (v.listen && v.listen.length
        ? '<h4 class="ee-ost-cap">' + esc(OPTS.listenHeading) + '</h4>' +
          '<div class="ee-ost-links">' + links(v.listen) + '</div>' : '') +
      (v.buy && v.buy.length
        ? '<h4 class="ee-ost-cap">' + esc(OPTS.buyHeading) + '</h4>' +
          '<div class="ee-ost-links">' + links(v.buy) + '</div>'
        : (v.note ? '<p class="ee-ost-note">' + esc(v.note) + '</p>' : ''));

    var right = '<h4 class="ee-ost-cap">' + esc(OPTS.tracksHeading) + '</h4>' +
      tracks(v.tracks, !!(OPTS.playOnClick && v.album));

    return '<article class="ee-ost-slide" id="ee-ost-s' + i + '" aria-hidden="true">' +
      '<div class="ee-ost-col">' + left + '</div>' +
      '<div class="ee-ost-col">' + right + '</div>' +
    '</article>';
  }

  function render(root) {
    var vols = OPTS.volumes || [];
    var many = vols.length > 1;

    var html = '<div class="ee-ost-top"><h2 class="ee-ost-title">' + esc(OPTS.heading) + '</h2>' +
      (many ? '<span class="ee-ost-of" data-ee-of></span>' : '') + '</div>' +
      '<div class="ee-ost-stagewrap">' +
        (many ? '<button class="ee-ost-go is-prev" type="button" aria-label="Previous volume">' +
          chev(-1) + '</button>' : '') +
        '<div class="ee-ost-stage">' + vols.map(slide).join('') + '</div>' +
        (many ? '<button class="ee-ost-go is-next" type="button" aria-label="Next volume">' +
          chev(1) + '</button>' : '') +
      '</div>';

    if (many) {
      html += '<div class="ee-ost-dots">' + vols.map(function (v, i) {
        return '<button class="ee-ost-dot" type="button" data-i="' + i + '" ' +
          'aria-label="' + esc(v.tab || ('Volume ' + (i + 1))) + '"></button>';
      }).join('') + '</div>';
    }

    if (OPTS.playOnClick) {
      html += '<div class="ee-ost-now" aria-live="polite">' +
        '<div class="ee-ost-nowin">' +
          '<div class="ee-ost-nowtext">' +
            '<span class="ee-ost-noweyebrow">' + esc(OPTS.playerLabel) + '</span>' +
            '<span class="ee-ost-nowtitle" data-ee-now></span>' +
          '</div>' +
          '<div class="ee-ost-nowplayer"><div data-ee-sp></div></div>' +
          '<button class="ee-ost-nowstop" type="button" aria-label="Stop playback">&times;</button>' +
        '</div></div>';
    }
    root.innerHTML = html;
  }

  /* ---------- the player ----------
     Spotify publishes an iframe API, so unlike Bandcamp its player can
     actually be told to start. The script is only pulled in the first
     time somebody plays something, so a visitor who never clicks a
     track never loads it. */
  var SP = { api: null, ctrl: null, ready: false, playing: false, queue: [] };

  function spotifyApi(cb) {
    if (SP.api) return cb(SP.api);
    SP.queue.push(cb);
    if (SP.loading) return;
    SP.loading = true;
    window.onSpotifyIframeApiReady = function (api) {
      SP.api = api;
      SP.queue.splice(0).forEach(function (f) { f(api); });
    };
    var el = document.createElement('script');
    el.src = 'https://open.spotify.com/embed/iframe-api/v1';
    el.async = true;
    el.onerror = function () { SP.failed = true; SP.queue.length = 0; };
    document.head.appendChild(el);
  }

  /* The API answers play() only once the frame is up, and browsers can
     swallow the first attempt, so it is nudged a few times and then
     left alone rather than fought with. */
  function nudge(left) {
    if (!SP.ctrl || SP.playing) return;
    try { SP.ctrl.play(); } catch (e) {}
    if (left > 0) setTimeout(function () { nudge(left - 1); }, 420);
  }

  function spotifyPlay(id, mount) {
    var uri = 'spotify:track:' + id;
    SP.playing = false;
    spotifyApi(function (api) {
      if (SP.ctrl) { 
        try { SP.ctrl.loadUri(uri); } catch (e) {}
        nudge(4);
        return;
      }
      api.createController(mount, {
        uri: uri, width: '100%', height: OPTS.playerHeight
      }, function (ctrl) {
        SP.ctrl = ctrl;
        ctrl.addListener('ready', function () { SP.ready = true; nudge(4); });
        ctrl.addListener('playback_update', function (e) {
          SP.playing = !!(e && e.data && e.data.isPaused === false);
        });
        nudge(4);
      });
    });
  }

  function spotifyPause() {
    if (SP.ctrl) { try { SP.ctrl.pause(); } catch (e) {} }
    SP.playing = false;
  }

  /* ---------- behaviour ---------- */
  function wire(root) {
    var slides = [].slice.call(root.querySelectorAll('.ee-ost-slide'));
    var dots   = [].slice.call(root.querySelectorAll('.ee-ost-dot'));
    var label  = root.querySelector('[data-ee-of]');
    var vols   = OPTS.volumes || [];
    if (!slides.length) return;

    var at = 0;

    function show(i, dir) {
      i = (i + slides.length) % slides.length;
      dir = dir || (i > at ? 1 : -1);
      slides.forEach(function (s, n) {
        var on = n === i;
        s.classList.toggle('is-on', on);
        /* the outgoing record leaves the way you are travelling,
           the next one arrives from the other side */
        s.classList.toggle('is-left', !on && (n < i));
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) {
          var f = s.querySelector('iframe[data-src]');
          if (f) { f.src = f.getAttribute('data-src'); f.removeAttribute('data-src'); }
          sizePlayer(s);
        }
      });
      dots.forEach(function (d, n) {
        d.classList.toggle('is-on', n === i);
        d.setAttribute('aria-current', n === i ? 'true' : 'false');
      });
      if (label) {
        label.textContent = (vols[i] && vols[i].tab ? vols[i].tab : 'Vol. ' + (i + 1)) +
          ' of ' + slides.length;
      }
      at = i;
      if (OPTS.remember) { try { localStorage.setItem('ee-ost-vol', String(i)); } catch (e) {} }
    }

    /* Only one record plays at a time. There is no way to reach inside
       a Bandcamp frame and press pause, so the other one is unloaded
       instead, which stops it dead. Its data-src is put back, so it
       rebuilds itself the next time that volume is opened. */
    var frames = [].slice.call(root.querySelectorAll('.ee-ost-player iframe'));
    function silence(keep) {
      frames.forEach(function (f) {
        if (f === keep || !f.getAttribute('src') || f.src === 'about:blank') return;
        var base = f.getAttribute('data-base');
        var slide = f.closest('.ee-ost-slide');
        f.src = 'about:blank';
        if (base) f.setAttribute('data-src', base);
        if (slide) [].forEach.call(slide.querySelectorAll('.is-cued'), function (r) {
          r.classList.remove('is-cued');
        });
        /* A record still on screen gets rebuilt straight away, or the
           visitor is left staring at a hole where the sleeve was. One
           out of sight stays unloaded until its volume comes round. */
        if (slide && slide.classList.contains('is-on') && base) {
          setTimeout(function () {
            if (f.src === 'about:blank') {
              f.removeAttribute('data-src');
              f.src = base;
            }
          }, 60);
        }
      });
    }

    /* the strip that carries the player */
    var bar   = root.querySelector('.ee-ost-now');
    var mount = root.querySelector('[data-ee-sp]');
    var nowT  = root.querySelector('[data-ee-now]');
    var stop  = root.querySelector('.ee-ost-nowstop');

    function lit(row) {
      [].forEach.call(root.querySelectorAll('.ee-ost-track.is-cued'), function (r) {
        if (r !== row) r.classList.remove('is-cued');
      });
      if (row) row.classList.add('is-cued');
    }

    function openBar(title, vol) {
      if (!bar) return;
      nowT.innerHTML = esc(title) +
        (vol ? '<span class="ee-ost-nowvol">' + esc(vol) + '</span>' : '');
      bar.classList.add('is-up');
    }

    if (stop) stop.addEventListener('click', function () {
      spotifyPause();
      bar.classList.remove('is-up');
      lit(null);
    });

    slides.forEach(function (s, si) {
      var frame = s.querySelector('iframe');
      s.addEventListener('click', function (e) {
        var row = e.target.closest && e.target.closest('button.ee-ost-track');
        if (!row) return;

        var id = row.getAttribute('data-sp');
        var vol = (vols[si] && vols[si].tab) || '';

        /* Spotify plays it outright */
        if (id && mount && !SP.failed) {
          silence(null);                     // no Bandcamp frame keeps running
          openBar(row.getAttribute('data-title'), vol);
          spotifyPlay(id, mount);
          lit(row);
          return;
        }

        /* no Spotify id, so fall back to pointing the Bandcamp player at
           the track. Bandcamp addresses one inside an album embed with
           t=<number>. It will not start itself, so it waits on play. */
        if (!frame) return;
        var base = frame.getAttribute('data-base');
        if (!base) return;
        spotifyPause();
        frame.removeAttribute('data-src');
        frame.src = base + 't=' + row.getAttribute('data-t') + '/';
        silence(frame);
        lit(row);
        var small = window.matchMedia
          ? window.matchMedia('(max-width:820px)').matches
          : window.innerWidth <= 820;
        if (small && frame.scrollIntoView) frame.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    });

    /* Pressing play inside a frame happens out of our reach, but the
       page still loses focus to that frame when it is clicked. That is
       the signal that this is now the record being listened to, so
       every other one is silenced. Covers hitting play on the player
       itself rather than through the tracklist. */
    window.addEventListener('blur', function () {
      setTimeout(function () {
        var el = document.activeElement;
        if (el && el.tagName === 'IFRAME' && frames.indexOf(el) !== -1) {
          silence(el);
          spotifyPause();          // the record itself is being played now
        }
      }, 0);
    });

    var prev = root.querySelector('.ee-ost-go.is-prev');
    var next = root.querySelector('.ee-ost-go.is-next');
    if (prev) prev.addEventListener('click', function () { show(at - 1, -1); });
    if (next) next.addEventListener('click', function () { show(at + 1, 1); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { show(parseInt(d.getAttribute('data-i'), 10)); });
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1, 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1, -1); }
    });

    /* swipe, ignoring the up and down of a scrolling column */
    var stage = root.querySelector('.ee-ost-stage');
    var x0 = 0, y0 = 0;
    stage.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(at + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }, { passive: true });

    var start = 0;
    if (OPTS.remember) {
      try {
        var saved = parseInt(localStorage.getItem('ee-ost-vol'), 10);
        if (saved >= 0 && saved < slides.length) start = saved;
      } catch (e) {}
    }
    show(start, 1);
    return function () { slides.forEach(sizePlayer); };
  }

  /* The Bandcamp frame is a square of artwork with a bar under it.
     The square follows the column, so the height is measured. */
  function sizePlayer(slide) {
    var box = slide.querySelector('.ee-ost-player');
    if (!box || !box.offsetWidth) return;
    var f = box.querySelector('iframe');
    if (f) f.style.height = Math.round(box.offsetWidth + 72) + 'px';
  }

  function init() {
    var root = document.getElementById('ee-ost');
    if (!root) {
      root = document.createElement('div');
      root.id = 'ee-ost';
      if (HERE && HERE.parentNode) HERE.parentNode.insertBefore(root, HERE);
      else document.body.appendChild(root);
    }
    root.setAttribute('tabindex', '-1');
    font(); styles();
    render(root);
    var resize = wire(root);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (resize) resize(); }, 140);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
