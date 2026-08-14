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
          { label: 'Cartridge Thunder', note: 'Soundtracks',    url: 'https://cartridgethunder.com/products/esoteric-ebb-vol-1-original-soundtrack' },
          { label: 'Amazon',            note: 'UK',             url: 'https://www.amazon.co.uk/Esoteric-Ebb-Vol-1-VINYL/dp/B0H4RRW73V/' },
          { label: 'Juno',              note: 'UK',             url: 'https://www.juno.co.uk/products/anders-bach-brian-batz-esoteric-ebb-vol-1-vinyl/1164313-01/' },
          { label: 'HEAD Records',      note: 'UK',             url: 'https://headrecords.co.uk/soundtracks/esoteric-ebb-vol.-1-anders-bach/brian-batz/kristian-paulsen/p-oil0721' },
          { label: 'Proper Music',      note: 'UK',             url: 'https://propermusic.com/products/andersbachbrianbatzkristianpaulsen-esotericebbvol1' }
        ],

        tracks: [
          'Endless Ebb | 1:48',
          'Waking Morgue | 3:25',
          'Norvik | 5:40',
          'Peril | 3:21',
          'Comrades | 2:54',
          'Dear Snell | 2:53',
          'At The Throne | 4:04',
          'This Halo Glows | 4:36',
          'Merchants | 4:40',
          'Night on Tolstad | 1:55',
          'Questions Need Answering | 2:56',
          'Waterlane | 4:51',
          'Dank Bodies, Mooring Visage | 2:30',
          'Light of Brr | 3:04',
          'The Cabin | 5:17',
          'Shwmae, Dyn Metel Rhyfedd! | 4:07',
          'Roots | 2:32',
          'A Specter, A Trifler | 5:03',
          'Entering the Pillar | 3:06',
          'The Missing Paladin (feat. Sleep Party People) | 4:49',
          'Chosen of Urth (feat. Seiðr) | 6:36',
          'Voids of Resolution | 5:16',
          'Days of Jor (feat. MØ & GNOM) | 5:53',
          'An Esoteric Ebb | 3:39'
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
          { label: 'Spotify',  note: 'On Vol. 1 & 2',      url: 'https://open.spotify.com/album/6iOh5l6FuVPh0DQRGEgnzD' },
          { label: 'Bandcamp', note: 'Stream & download',  url: 'https://andersbachbrianbatzkristianpaulsen.bandcamp.com/album/esoteric-ebb-vol-2-original-soundtrack-2' }
        ],

        /* No vinyl yet. Fill this in and the section appears. */
        buy:  [],
        note: 'Digital for now. Vinyl to be announced.',

        tracks: [
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
  border-bottom:1px dashed rgba(218,229,207,.16); line-height:1.35}
.ee-ost-track:last-child{border-bottom:0}
.ee-ost-n{flex:0 0 auto; width:1.8em; color:${ORANGE}; font-size:12.5px; font-variant-numeric:tabular-nums}
.ee-ost-tt{flex:1; min-width:0; font-size:15px}
.ee-ost-td{flex:0 0 auto; color:rgba(218,229,207,.4); font-size:12.5px; font-variant-numeric:tabular-nums}

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

  function tracks(list) {
    var rows = (list || []).map(function (raw, i) {
      var bits = String(raw).split('|');
      var time = bits.length > 1 ? bits[1].trim() : '';
      return '<li class="ee-ost-track">' +
        '<span class="ee-ost-n">' + (i + 1) + '</span>' +
        '<span class="ee-ost-tt">' + esc(bits[0].trim()) + '</span>' +
        (time ? '<span class="ee-ost-td">' + esc(time) + '</span>' : '') +
      '</li>';
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
    return '<div class="ee-ost-player"><iframe data-src="' + src + '" loading="lazy" seamless ' +
      'title="' + esc(title) + ' on Bandcamp"></iframe></div>';
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

    var right = '<h4 class="ee-ost-cap">' + esc(OPTS.tracksHeading) + '</h4>' + tracks(v.tracks);

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
    root.innerHTML = html;
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
