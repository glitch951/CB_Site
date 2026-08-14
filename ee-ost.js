/* =============================================================
   ESOTERIC EBB - SOUNDTRACK

   Built to sit next to ee-faq.js and askchris.js: same Averia
   Serif Libre, same cream-green on the dark page, same orange,
   same rounded outlined boxes with no fill.

   One volume is shown at a time. The volume buttons at the top
   swap the whole panel - player, credits, links and tracklist -
   so Vol. 1 and Vol. 2 never fight for the same space. Add a
   third volume and a third button appears on its own.

   Everything is in CONFIG. The shop lists are plain arrays, so
   adding or dropping a shop is one line and the grid reflows
   for however many there are.

   INSTALL
   1. Upload ee-ost.js to the CB_Site repo.
   2. Replace the contents of #ost with one Carrd Embed
      (Type: Code, Style: Inline):

      <div id="ee-ost"></div>
      <script defer src="https://glitch951.github.io/CB_Site/ee-ost.js"></script>

   TRACKS
      Write a track as 'Title' or 'Title | 3:57'. The time is
      optional and can be left off the whole list.
   ============================================================= */

(function () {
  'use strict';
  if (window.__eeOst) return;
  window.__eeOst = true;

  /* Grabbed while the script is still running. Inside init it would be
     null, since that can fire later from DOMContentLoaded. */
  var HERE = document.currentScript;

  var OPTS = {
    heading: 'Soundtrack',
    intro:   'Composed, produced and mixed by Anders Bach, Brian Batz and Kristian Paulsen.',

    /* Declared outright rather than inherited, because Carrd's own
       rules win inside an embed. Same superfamily as the FAQ. */
    font:     "'Averia Serif Libre'",
    fontHref: 'https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,400&display=swap',

    remember: true,   // reopen on the volume last looked at
    /* The Bandcamp player is a square of artwork with a bar under it.
       The square follows the column width, so the height is measured
       rather than fixed. This is the bar. */
    playerBar: 72,
    back:     null,   // e.g. '#home' to draw a back link at the foot

    /* ---------------------------------------------------------
       VOLUMES
       tab      the button label
       album    the number from the Bandcamp EmbeddedPlayer URL,
                or null to leave the player out
       listen   streaming links
       buy      shops that carry the record
       discs    one entry per disc. A single disc prints without
                a disc heading; two or more print with one.
       --------------------------------------------------------- */
    volumes: [
      {
        tab:      'Vol. 1',
        title:    'Esoteric Ebb, Vol. 1',
        subtitle: 'Original Soundtrack',
        cat:      'OIL072',
        credits: [
          '24 tracks composed, produced and mixed by Anders Bach, Brian Batz and Kristian Paulsen.',
          'Mastered by Angel Marcloid at Angel Hair Audio.',
          'Released by The Big Oil Recording Company.'
        ],
        album: '592533375',

        listen: [
          { label: 'Spotify',  note: 'Stream',            url: 'http://open.spotify.com/album/5dqcutGdziX0pR0sMOQyuR' },
          { label: 'Bandcamp', note: 'Stream & download', url: 'https://andersbachbrianbatzkristianpaulsen.bandcamp.com/album/oil072-esoteric-ebb-vol-1-original-soundtrack' }
        ],

        buy: [
          { label: 'Bandcamp',          note: 'From the label', url: 'https://andersbachbrianbatzkristianpaulsen.bandcamp.com/album/oil072-esoteric-ebb-vol-1-original-soundtrack' },
          { label: 'Cartridge Thunder', note: 'Soundtracks',    url: 'https://cartridgethunder.com/products/esoteric-ebb-vol-1-original-soundtrack' },
          { label: 'Amazon',            note: 'UK',             url: 'https://www.amazon.co.uk/Esoteric-Ebb-Vol-1-VINYL/dp/B0H4RRW73V/' },
          { label: 'Juno',              note: 'UK',             url: 'https://www.juno.co.uk/products/anders-bach-brian-batz-esoteric-ebb-vol-1-vinyl/1164313-01/' },
          { label: 'HEAD Records',      note: 'UK',             url: 'https://headrecords.co.uk/soundtracks/esoteric-ebb-vol.-1-anders-bach/brian-batz/kristian-paulsen/p-oil0721' },
          { label: 'Proper Music',      note: 'UK',             url: 'https://propermusic.com/products/andersbachbrianbatzkristianpaulsen-esotericebbvol1' }
        ],

        discs: [
          { name: '', tracks: [
            'Endless Ebb',
            'Waking Morgue',
            'Norvik',
            'Peril',
            'Comrades',
            'Dear Snell',
            'At The Throne',
            'This Halo Glows',
            'Merchants',
            'Night on Tolstad',
            'Questions Need Answering',
            'Waterlane',
            'Dank Bodies, Mooring Visage',
            'Light of Brr',
            'The Cabin',
            'Shwmae, Dyn Metel Rhyfedd!',
            'Roots',
            'A Specter, A Trifler',
            'Entering the Pillar',
            'The Missing Paladin (feat. Sleep Party People)',
            'Chosen of Urth (feat. Seiðr)',
            'Voids of Resolution',
            'Days of Jor (feat. MØ & GNOM)',
            'An Esoteric Ebb'
          ] }
        ]
      },

      {
        tab:      'Vol. 2',
        title:    'Esoteric Ebb, Vol. 2',
        subtitle: 'Original Soundtrack',
        cat:      '',              // catalogue number, once there is one
        credits: [
          'Composed, produced and mixed by Anders Bach, Brian Batz and Kristian Paulsen.'
        ],
        album: null,               // Bandcamp id for Vol. 2 goes here

        listen: [
          // { label: 'Spotify', note: 'Stream', url: '...' }
        ],

        buy: [
          // same shape as Vol. 1 above
        ],

        /* The screenshot this came from is headed Disc 2, so if Vol. 2
           is a double, paste Disc 1 in above it as its own entry and
           both headings start printing on their own. */
        discs: [
          { name: 'Disc 2', tracks: [
            "Nearly's Song | 3:57",
            'Norvikian Decay | 3:36',
            'Outside | 3:59',
            "The Prison of Toulin'catl | 6:58",
            'Calmness Is a Still | 2:48',
            'The Tower | 3:33',
            'Burnt | 4:12',
            'Meriadoc Sleeps | 1:20',
            'The Presence of Sageleaf | 5:23',
            'Patriots | 4:32',
            'Distill Portside | 4:00',
            "At Snurre's | 3:41",
            'Long Rest | 0:23',
            'Highland Fling | 2:52',
            'Undercoast | 6:04',
            'Crypts | 2:23',
            "Kraiid's Teeth | 3:16",
            'Caverns | 5:25',
            'Revel in Urth | 2:26',
            'Ruins | 1:12',
            'Leaving | 3:53',
            'In the Void | 3:26'
          ] }
        ]
      }
    ],

    listenHeading: 'Listen',
    buyHeading:    'Buy the vinyl',
    tracksHeading: 'Tracklist',
    emptyNote:     'Not out yet. The tracklist is below.'
  };

  var GREEN  = '#DAE5CF';
  var ORANGE = '#DB5B2C';
  var SAGE   = '#C1D3AE';
  var INK    = '020E16';   // Bandcamp wants hex with no hash

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
  max-width:820px; margin:0 auto; text-align:left; color:${GREEN};
  padding:0 clamp(14px,4vw,24px) clamp(30px,6vw,70px);
}
.ee-ost-title{
  margin:0 0 .3em; color:${ORANGE}; font-weight:400;
  font-size:clamp(30px,4.5vw,54px); line-height:1;
  font-variant:small-caps; letter-spacing:.02em;
}
.ee-ost-intro{margin:0 0 clamp(20px,3vw,30px); color:rgba(218,229,207,.6); font-style:italic; line-height:1.55}

/* volume buttons: the FAQ's outlined box, shrunk to a row */
.ee-ost-tabs{display:flex; flex-wrap:wrap; gap:10px; margin:0 0 clamp(24px,4vw,38px)}
.ee-ost-tab{
  cursor:pointer; padding:.55em 1.4em; background:transparent; color:${GREEN};
  border:1px solid rgba(218,229,207,.42); border-radius:16px;
  font-family:inherit; font-size:clamp(15px,1.35vw,18px); line-height:1.45;
  letter-spacing:.08em; font-variant:small-caps; transition:none;
}
.ee-ost-tab:hover,.ee-ost-tab:focus-visible{color:${ORANGE}; border-color:${ORANGE}}
.ee-ost-tab[aria-selected="true"]{color:${ORANGE}; border-color:${ORANGE}}

.ee-ost-vol[hidden]{display:none}
.ee-ost-vol{animation:eeOstIn .26s ease both}
@keyframes eeOstIn{from{opacity:0; transform:translateY(6px)}to{opacity:1; transform:none}}

/* the record: player on the left, the writing on it to the right */
.ee-ost-head{display:grid; grid-template-columns:minmax(0,290px) minmax(0,1fr); gap:clamp(18px,3vw,30px); align-items:start}
@media (max-width:640px){.ee-ost-head{grid-template-columns:1fr}}
.ee-ost-head.is-solo{grid-template-columns:1fr}
.ee-ost-player{border:1px solid rgba(218,229,207,.22); border-radius:16px; overflow:hidden; line-height:0}
.ee-ost-player iframe{display:block; width:100%; border:0}
.ee-ost-name{
  margin:0; color:${GREEN}; font-weight:400; line-height:1.1;
  font-size:clamp(22px,2.8vw,32px); font-variant:small-caps; letter-spacing:.02em;
}
.ee-ost-sub{display:block; margin-top:.35em; color:${SAGE}; font-size:clamp(13px,1.3vw,15px);
  letter-spacing:.16em; text-transform:uppercase; font-variant:normal}
.ee-ost-cat{
  display:inline-block; margin:.9em 0 0; padding:.15em .7em;
  border:1px solid rgba(219,91,44,.55); border-radius:999px;
  color:${ORANGE}; font-size:12px; letter-spacing:.18em;
}
.ee-ost-credits{margin:1em 0 0; padding:0; list-style:none; line-height:1.62; color:rgba(218,229,207,.75)}
.ee-ost-credits li{margin:0 0 .4em}
.ee-ost-credits li:last-child{margin:0}
.ee-ost-none{margin:1em 0 0; color:rgba(218,229,207,.55); font-style:italic}

/* section headings, lifted straight off the FAQ categories */
.ee-ost-cap{
  margin:clamp(30px,4vw,52px) 0 .9em; color:${SAGE}; font-weight:400;
  font-size:clamp(17px,2vw,22px); letter-spacing:.16em; text-transform:uppercase;
}

/* shops and streaming: outlined, transparent, orange on hover.
   Reflows on its own for any number of links. */
.ee-ost-links{display:grid; gap:10px; grid-template-columns:repeat(auto-fit,minmax(215px,1fr))}
.ee-ost-link{
  display:flex; align-items:center; gap:14px; text-decoration:none;
  padding:.8em 1.1em; color:${GREEN};
  border:1px solid rgba(218,229,207,.42); border-radius:16px;
  font-size:clamp(15px,1.35vw,18px); line-height:1.45; transition:none;
}
.ee-ost-link:hover,.ee-ost-link:focus-visible{color:${ORANGE}; border-color:${ORANGE}}
.ee-ost-ltext{flex:1; min-width:0}
.ee-ost-lnote{display:block; margin-top:.2em; font-size:11.5px; letter-spacing:.14em;
  text-transform:uppercase; color:rgba(218,229,207,.5)}
.ee-ost-link:hover .ee-ost-lnote{color:rgba(219,91,44,.75)}
.ee-ost-arrow{flex:0 0 auto; width:12px; height:12px; opacity:.55}
.ee-ost-link:hover .ee-ost-arrow{opacity:1}

/* tracklist: one dimmer outlined box, rows split by dashes */
.ee-ost-disc + .ee-ost-disc{margin-top:18px}
.ee-ost-discname{margin:0 0 .6em; color:rgba(218,229,207,.55); font-size:13px;
  letter-spacing:.2em; text-transform:uppercase}
.ee-ost-tracks{
  margin:0; padding:.4em 1.2em; list-style:none;
  border:1px solid rgba(218,229,207,.22); border-radius:16px;
  columns:2; column-gap:clamp(20px,4vw,44px);
}
@media (max-width:640px){.ee-ost-tracks{columns:1}}
.ee-ost-track{
  break-inside:avoid; display:flex; align-items:baseline; gap:12px;
  padding:.62em 0; border-bottom:1px dashed rgba(218,229,207,.18); line-height:1.4;
}
.ee-ost-track:last-child{border-bottom:0}
.ee-ost-n{flex:0 0 auto; width:1.9em; color:${ORANGE}; font-size:13px; font-variant-numeric:tabular-nums}
.ee-ost-tt{flex:1; min-width:0}
.ee-ost-td{flex:0 0 auto; color:rgba(218,229,207,.45); font-size:13px; font-variant-numeric:tabular-nums}

.ee-ost-foot{margin-top:clamp(28px,4vw,44px); text-align:center}
.ee-ost-back{color:rgba(218,229,207,.6); text-decoration:none; letter-spacing:.16em; font-variant:small-caps}
.ee-ost-back:hover{color:${ORANGE}}

@media (prefers-reduced-motion:reduce){.ee-ost-vol{animation:none}}`;
    document.head.appendChild(s);
  }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var ARROW = '<svg class="ee-ost-arrow" viewBox="0 0 12 12" aria-hidden="true" fill="none" ' +
    'stroke="currentColor" stroke-width="1.4"><path d="M2.5 9.5 9.5 2.5M4.2 2.5h5.3v5.3"/></svg>';

  function links(list) {
    return (list || []).filter(function (l) { return l && l.url; }).map(function (l) {
      return '<a class="ee-ost-link" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
        '<span class="ee-ost-ltext">' + esc(l.label) +
        (l.note ? '<span class="ee-ost-lnote">' + esc(l.note) + '</span>' : '') +
        '</span>' + ARROW + '</a>';
    }).join('');
  }

  function tracks(disc) {
    var rows = (disc.tracks || []).map(function (raw, i) {
      var parts = String(raw).split('|');
      var name = parts[0].trim();
      var time = parts.length > 1 ? parts[1].trim() : '';
      return '<li class="ee-ost-track">' +
        '<span class="ee-ost-n">' + (i + 1) + '</span>' +
        '<span class="ee-ost-tt">' + esc(name) + '</span>' +
        (time ? '<span class="ee-ost-td">' + esc(time) + '</span>' : '') +
      '</li>';
    }).join('');
    return rows ? '<ol class="ee-ost-tracks">' + rows + '</ol>' : '';
  }

  function player(album) {
    if (!album) return '';
    var src = 'https://bandcamp.com/EmbeddedPlayer/album=' + encodeURIComponent(album) +
      '/size=large/bgcol=' + INK + '/linkcol=' + ORANGE.replace('#', '') +
      '/tracklist=false/transparent=true/';
    /* Held in data-src so a volume that has never been opened does not
       pull a player down in the background. */
    return '<div class="ee-ost-player"><iframe data-src="' + src + '" ' +
      'loading="lazy" seamless title="Bandcamp player"></iframe></div>';
  }

  function volume(v, i) {
    var hasLinks = (v.listen && v.listen.length) || (v.buy && v.buy.length);
    var head =
      '<div class="ee-ost-head' + (v.album ? '' : ' is-solo') + '">' +
        player(v.album) +
        '<div>' +
          '<h3 class="ee-ost-name">' + esc(v.title) +
            (v.subtitle ? '<span class="ee-ost-sub">' + esc(v.subtitle) + '</span>' : '') +
          '</h3>' +
          (v.cat ? '<span class="ee-ost-cat">' + esc(v.cat) + '</span>' : '') +
          (v.credits && v.credits.length
            ? '<ul class="ee-ost-credits"><li>' + v.credits.map(esc).join('</li><li>') + '</li></ul>'
            : '') +
          (!hasLinks && OPTS.emptyNote ? '<p class="ee-ost-none">' + esc(OPTS.emptyNote) + '</p>' : '') +
        '</div>' +
      '</div>';

    var body = '';
    if (v.listen && v.listen.length) {
      body += '<h4 class="ee-ost-cap">' + esc(OPTS.listenHeading) + '</h4>' +
        '<div class="ee-ost-links">' + links(v.listen) + '</div>';
    }
    if (v.buy && v.buy.length) {
      body += '<h4 class="ee-ost-cap">' + esc(OPTS.buyHeading) + '</h4>' +
        '<div class="ee-ost-links">' + links(v.buy) + '</div>';
    }

    var discs = (v.discs || []).filter(function (d) { return d.tracks && d.tracks.length; });
    if (discs.length) {
      body += '<h4 class="ee-ost-cap">' + esc(OPTS.tracksHeading) + '</h4>';
      discs.forEach(function (d) {
        body += '<div class="ee-ost-disc">' +
          (discs.length > 1 && d.name ? '<p class="ee-ost-discname">' + esc(d.name) + '</p>' : '') +
          tracks(d) + '</div>';
      });
    }

    return '<section class="ee-ost-vol" id="ee-ost-p' + i + '" role="tabpanel" ' +
      'aria-labelledby="ee-ost-t' + i + '" hidden>' + head + body + '</section>';
  }

  /* ---------- render ---------- */
  function render(root) {
    var vols = OPTS.volumes || [];
    var html = '<h2 class="ee-ost-title">' + esc(OPTS.heading) + '</h2>' +
      (OPTS.intro ? '<p class="ee-ost-intro">' + esc(OPTS.intro) + '</p>' : '');

    if (vols.length > 1) {
      html += '<div class="ee-ost-tabs" role="tablist">' + vols.map(function (v, i) {
        return '<button class="ee-ost-tab" type="button" role="tab" id="ee-ost-t' + i + '" ' +
          'aria-controls="ee-ost-p' + i + '" aria-selected="false" tabindex="-1">' +
          esc(v.tab || ('Vol. ' + (i + 1))) + '</button>';
      }).join('') + '</div>';
    }

    html += vols.map(volume).join('');

    if (OPTS.back) {
      html += '<div class="ee-ost-foot"><a class="ee-ost-back" href="' + esc(OPTS.back) + '">- Back -</a></div>';
    }
    root.innerHTML = html;
  }

  function wire(root) {
    var tabs   = [].slice.call(root.querySelectorAll('.ee-ost-tab'));
    var panels = [].slice.call(root.querySelectorAll('.ee-ost-vol'));
    if (!panels.length) return;

    function show(i, focus) {
      panels.forEach(function (p, n) {
        p.hidden = n !== i;
        if (n === i) {
          /* first time this volume is opened, let its player load */
          var f = p.querySelector('iframe[data-src]');
          if (f) { f.src = f.getAttribute('data-src'); f.removeAttribute('data-src'); }
        }
      });
      tabs.forEach(function (t, n) {
        t.setAttribute('aria-selected', n === i ? 'true' : 'false');
        t.tabIndex = n === i ? 0 : -1;
        if (n === i && focus) t.focus();
      });
      sizePlayers(root);
      if (OPTS.remember) { try { localStorage.setItem('ee-ost-vol', String(i)); } catch (e) {} }
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        show((i + d + tabs.length) % tabs.length, true);
      });
    });

    var start = 0;
    if (OPTS.remember) {
      try {
        var saved = parseInt(localStorage.getItem('ee-ost-vol'), 10);
        if (saved >= 0 && saved < panels.length) start = saved;
      } catch (e) {}
    }
    show(start);
  }

  /* Square artwork plus the play bar, so the frame is never letterboxed
     and never clipped, at any column width. */
  function sizePlayers(root) {
    [].forEach.call(root.querySelectorAll('.ee-ost-player'), function (box) {
      var f = box.querySelector('iframe');
      if (!f || !box.offsetWidth) return;
      f.style.height = Math.round(box.offsetWidth + (OPTS.playerBar || 72)) + 'px';
    });
  }

  function init() {
    var root = document.getElementById('ee-ost');
    if (!root) {
      root = document.createElement('div');
      root.id = 'ee-ost';
      if (HERE && HERE.parentNode) HERE.parentNode.insertBefore(root, HERE);
      else document.body.appendChild(root);
    }
    font(); styles();
    render(root);
    wire(root);
    sizePlayers(root);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { sizePlayers(root); }, 140);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();