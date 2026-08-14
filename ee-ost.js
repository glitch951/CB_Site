/*!
 * EE-OST.js — Esoteric Ebb, Vol. 1 (Original Soundtrack) section
 * Self-contained. No dependencies. Drop-in embed for esotericebb.com/#ost
 *
 * USAGE
 *   <div id="ee-ost"></div>
 *   <script src="https://cdn.jsdelivr.net/gh/USER/REPO@main/EE-OST.js" defer></script>
 *
 * If #ee-ost doesn't exist, the widget renders where the <script> tag sits.
 *
 * CUSTOMISING
 *   Everything lives in CONFIG below. Add or remove entries in `listen` and
 *   `vinyl` freely — the grids reflow for any number of links (1, 6, 20...).
 *   You can also override without editing this file:
 *
 *   <script>
 *     window.EE_OST_CONFIG = {
 *       vinyl: [{ label: "New Shop", sub: "DE", url: "https://..." }]
 *     };
 *   </script>
 *   <script src=".../EE-OST.js" defer></script>
 *
 *   Call EE_OST.render() at any time to redraw after changing EE_OST.config.
 */
(function () {
  "use strict";

  var HOST_SCRIPT = document.currentScript;

  /* ====================================================================
   * CONFIG — edit freely
   * ================================================================== */
  var CONFIG = {
    mount: "#ee-ost",           // where to render; falls back to script position
    backLink: "#home",          // set to null to hide the back link
    backLabel: "— Back —",

    catalogue: "OIL072",        // shown in the eyebrow; set "" to hide
    label: "The Big Oil Recording Company",

    title: "Esoteric Ebb, Vol. 1",
    subtitle: "(Original Soundtrack)",

    credits: [
      "24 tracks composed, produced and mixed by Anders Bach, Brian Batz and Kristian Paulsen.",
      "Mastered by Angel Marcloid at Angel Hair Audio.",
      "Released by The Big Oil Recording Company."
    ],

    // Bandcamp embed. albumId is the number in the EmbeddedPlayer URL.
    player: {
      albumId: "592533375",
      height: 470,
      bgcol: "333333",
      linkcol: "4ec5ec"
    },

    // --- LINKS ---------------------------------------------------------
    // Add/remove at will. `sub` is the small line under the label.
    // `tag` is optional (e.g. "Digital", "2×LP"). `url` is required.
    listenHeading: "Listen",
    listen: [
      { label: "Spotify",          sub: "Stream",              url: "http://open.spotify.com/album/5dqcutGdziX0pR0sMOQyuR" },
      { label: "Bandcamp",         sub: "Stream & download",   url: "https://andersbachbrianbatzkristianpaulsen.bandcamp.com/album/oil072-esoteric-ebb-vol-1-original-soundtrack" }
    ],

    vinylHeading: "Buy the vinyl",
    vinylNote: "Stocked by the shops below. Availability varies — if one's sold out, try the next.",
    vinyl: [
      { label: "Bandcamp",          sub: "Direct from the label", url: "https://andersbachbrianbatzkristianpaulsen.bandcamp.com/album/oil072-esoteric-ebb-vol-1-original-soundtrack" },
      { label: "Cartridge Thunder", sub: "Game soundtracks",      url: "https://cartridgethunder.com/products/esoteric-ebb-vol-1-original-soundtrack" },
      { label: "Amazon",            sub: "UK",                    url: "https://www.amazon.co.uk/Esoteric-Ebb-Vol-1-VINYL/dp/B0H4RRW73V/" },
      { label: "Juno",              sub: "UK",                    url: "https://www.juno.co.uk/products/anders-bach-brian-batz-esoteric-ebb-vol-1-vinyl/1164313-01/" },
      { label: "HEAD Records",      sub: "UK",                    url: "https://headrecords.co.uk/soundtracks/esoteric-ebb-vol.-1-anders-bach/brian-batz/kristian-paulsen/p-oil0721" },
      { label: "Proper Music",      sub: "UK",                    url: "https://propermusic.com/products/andersbachbrianbatzkristianpaulsen-esotericebbvol1" }
    ],

    tracksHeading: "Tracklist",
    tracks: [
      "Endless Ebb",
      "Waking Morgue",
      "Norvik",
      "Peril",
      "Comrades",
      "Dear Snell",
      "At The Throne",
      "This Halo Glows",
      "Merchants",
      "Night on Tolstad",
      "Questions Need Answering",
      "Waterlane",
      "Dank Bodies, Mooring Visage",
      "Light of Brr",
      "The Cabin",
      "Shwmae, Dyn Metel Rhyfedd!",
      "Roots",
      "A Specter, A Trifler",
      "Entering the Pillar",
      "The Missing Paladin (feat. Sleep Party People)",
      "Chosen of Urth (feat. Seiðr)",
      "Voids of Resolution",
      "Days of Jor (feat. MØ & GNOM)",
      "An Esoteric Ebb"
    ],

    // --- LOOK ----------------------------------------------------------
    theme: {
      ink:    "#020D15",   // section background
      panel:  "#071620",   // cards / player frame
      bone:   "#E9E6DC",   // primary text
      muted:  "#8FA6B3",   // secondary text
      cyan:   "#4EC5EC",   // accent (matches the Bandcamp player)
      brass:  "#C9A227",   // second accent — numbers, catalogue tag
      hair:   "rgba(78,197,236,.20)"
    },
    // Leave null to inherit the site's own fonts.
    fontDisplay: null,
    fontBody: null,
    spinRecord: true       // slow-rotating record behind the player
  };

  /* ==================================================================== */

  var css = function (t) {
    return [
      ".eeost{--ink:", t.ink, ";--panel:", t.panel, ";--bone:", t.bone,
      ";--muted:", t.muted, ";--cyan:", t.cyan, ";--brass:", t.brass,
      ";--hair:", t.hair, ";",
      "background:var(--ink);color:var(--bone);font-family:", (CONFIG.fontBody || "inherit"),
      ";line-height:1.5;padding:clamp(28px,6vw,72px) clamp(18px,5vw,48px);",
      "overflow-x:clip;-webkit-font-smoothing:antialiased;box-sizing:border-box}",
      ".eeost *,.eeost *::before,.eeost *::after{box-sizing:border-box}",
      ".eeost-in{max-width:1080px;margin:0 auto}",

      /* eyebrow */
      ".eeost-eyebrow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;",
      "font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin:0 0 18px}",
      ".eeost-cat{border:1px solid var(--brass);color:var(--brass);padding:3px 8px;letter-spacing:.16em}",
      ".eeost-rule{flex:1;height:1px;background:var(--hair);min-width:24px}",

      /* head */
      ".eeost-head{display:grid;grid-template-columns:minmax(0,400px) minmax(0,1fr);",
      "gap:clamp(24px,5vw,56px);align-items:start}",
      "@media(max-width:820px){.eeost-head{grid-template-columns:1fr}}",

      ".eeost-playerwrap{position:relative}",
      ".eeost-disc{position:absolute;right:-34px;top:8%;width:62%;max-width:300px;z-index:0;",
      "opacity:.5;pointer-events:none}",
      ".eeost-disc.spin{animation:eeost-spin 26s linear infinite}",
      "@keyframes eeost-spin{to{transform:rotate(360deg)}}",
      "@media(max-width:820px){.eeost-disc{display:none}}",
      ".eeost-frame{position:relative;z-index:1;border:1px solid var(--hair);background:var(--panel);padding:10px}",
      ".eeost-frame iframe{display:block;width:100%;border:0}",

      ".eeost-title{font-family:", (CONFIG.fontDisplay || "inherit"),
      ";font-size:clamp(30px,5.2vw,52px);line-height:1.02;margin:0;letter-spacing:-.01em}",
      ".eeost-sub{display:block;font-size:clamp(14px,2vw,18px);letter-spacing:.16em;",
      "text-transform:uppercase;color:var(--cyan);margin-top:12px;line-height:1.3}",
      ".eeost-credits{margin:22px 0 0;padding:0;list-style:none;border-top:1px solid var(--hair)}",
      ".eeost-credits li{padding:11px 0;border-bottom:1px solid var(--hair);color:var(--muted);font-size:14.5px}",

      /* section headings */
      ".eeost-h{display:flex;align-items:center;gap:14px;margin:clamp(34px,6vw,60px) 0 6px}",
      ".eeost-h h3{font-family:", (CONFIG.fontDisplay || "inherit"),
      ";font-size:13px;letter-spacing:.26em;text-transform:uppercase;margin:0;font-weight:700;white-space:nowrap}",
      ".eeost-note{color:var(--muted);font-size:13.5px;margin:10px 0 18px;max-width:56ch}",

      /* link grid */
      ".eeost-links{display:grid;gap:10px;margin-top:16px;",
      "grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}",
      ".eeost-link{position:relative;display:flex;align-items:center;gap:12px;",
      "padding:15px 16px;background:var(--panel);border:1px solid var(--hair);color:var(--bone);",
      "text-decoration:none;overflow:hidden;transition:border-color .18s,transform .18s,background .18s}",
      ".eeost-link::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;",
      "background:var(--cyan);transform:scaleY(0);transform-origin:bottom;transition:transform .22s}",
      ".eeost-link:hover,.eeost-link:focus-visible{border-color:var(--cyan);transform:translateY(-2px)}",
      ".eeost-link:hover::before,.eeost-link:focus-visible::before{transform:scaleY(1);transform-origin:top}",
      ".eeost-link:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}",
      ".eeost-ltext{min-width:0;flex:1}",
      ".eeost-llabel{display:block;font-weight:600;letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".eeost-lsub{display:block;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:3px}",
      ".eeost-tag{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass);",
      "border:1px solid var(--brass);padding:2px 6px;white-space:nowrap}",
      ".eeost-arr{flex:none;color:var(--cyan);opacity:.55;transition:opacity .18s,transform .18s}",
      ".eeost-link:hover .eeost-arr{opacity:1;transform:translate(2px,-2px)}",

      /* tracklist */
      ".eeost-tracks{margin:16px 0 0;padding:0;list-style:none;",
      "columns:2;column-gap:clamp(24px,5vw,56px)}",
      "@media(max-width:640px){.eeost-tracks{columns:1}}",
      ".eeost-track{break-inside:avoid;display:flex;align-items:baseline;gap:12px;",
      "padding:9px 4px;border-bottom:1px solid var(--hair)}",
      ".eeost-num{flex:none;width:2.1em;font-variant-numeric:tabular-nums;font-size:12px;",
      "letter-spacing:.1em;color:var(--brass)}",
      ".eeost-tname{font-size:15px}",
      ".eeost-dots{flex:1;border-bottom:1px dotted var(--hair);transform:translateY(-4px);min-width:8px}",

      /* footer */
      ".eeost-foot{margin-top:clamp(34px,6vw,60px);padding-top:20px;border-top:1px solid var(--hair);",
      "display:flex;justify-content:center}",
      ".eeost-back{color:var(--muted);text-decoration:none;font-size:12px;letter-spacing:.24em;",
      "text-transform:uppercase;padding:8px 4px;transition:color .18s}",
      ".eeost-back:hover{color:var(--cyan)}",

      /* reveal */
      ".eeost-rev{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s ease}",
      ".eeost-rev.in{opacity:1;transform:none}",
      "@media(prefers-reduced-motion:reduce){.eeost *{animation:none!important;transition:none!important}",
      ".eeost-rev{opacity:1;transform:none}}"
    ].join("");
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  var ARROW = '<svg class="eeost-arr" width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">' +
    '<path d="M3 10L10 3M10 3H4.2M10 3v5.8" fill="none" stroke="currentColor" stroke-width="1.4" ' +
    'stroke-linecap="square"/></svg>';

  function disc(t) {
    return '<svg class="eeost-disc' + (CONFIG.spinRecord ? ' spin' : '') + '" viewBox="0 0 200 200" ' +
      'aria-hidden="true"><circle cx="100" cy="100" r="99" fill="#04080c"/>' +
      '<circle cx="100" cy="100" r="99" fill="none" stroke="' + t.hair + '"/>' +
      '<circle cx="100" cy="100" r="82" fill="none" stroke="' + t.hair + '"/>' +
      '<circle cx="100" cy="100" r="70" fill="none" stroke="' + t.hair + '"/>' +
      '<circle cx="100" cy="100" r="58" fill="none" stroke="' + t.hair + '"/>' +
      '<circle cx="100" cy="100" r="34" fill="' + t.brass + '" opacity=".85"/>' +
      '<circle cx="100" cy="100" r="4.5" fill="' + t.ink + '"/></svg>';
  }

  function linkCards(items) {
    var out = "";
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it || !it.url) continue;
      out += '<a class="eeost-link eeost-rev" href="' + esc(it.url) + '" target="_blank" ' +
        'rel="noopener noreferrer" style="transition-delay:' + Math.min(i * 45, 320) + 'ms">' +
        '<span class="eeost-ltext"><span class="eeost-llabel">' + esc(it.label) + '</span>' +
        (it.sub ? '<span class="eeost-lsub">' + esc(it.sub) + '</span>' : '') + '</span>' +
        (it.tag ? '<span class="eeost-tag">' + esc(it.tag) + '</span>' : '') +
        ARROW + '</a>';
    }
    return out;
  }

  function section(heading) {
    return '<div class="eeost-h eeost-rev"><h3>' + esc(heading) + '</h3>' +
      '<span class="eeost-rule"></span></div>';
  }

  function build() {
    var t = CONFIG.theme;
    var p = CONFIG.player || {};
    var bc = "https://bandcamp.com/EmbeddedPlayer/album=" + encodeURIComponent(p.albumId) +
      "/size=large/bgcol=" + (p.bgcol || "333333") + "/linkcol=" + (p.linkcol || "4ec5ec") +
      "/tracklist=false/transparent=true/";

    var html = '<div class="eeost-in">';

    html += '<p class="eeost-eyebrow eeost-rev">' +
      (CONFIG.catalogue ? '<span class="eeost-cat">' + esc(CONFIG.catalogue) + '</span>' : '') +
      '<span>' + esc(CONFIG.label) + '</span><span class="eeost-rule"></span></p>';

    html += '<div class="eeost-head">' +
      '<div class="eeost-playerwrap eeost-rev">' + disc(t) +
      '<div class="eeost-frame"><iframe title="' + esc(CONFIG.title) + ' — Bandcamp player" ' +
      'src="' + bc + '" height="' + (p.height || 470) + '" loading="lazy" seamless ' +
      'allow="autoplay *; encrypted-media *"></iframe></div></div>' +
      '<div class="eeost-rev" style="transition-delay:90ms">' +
      '<h2 class="eeost-title">' + esc(CONFIG.title) +
      '<span class="eeost-sub">' + esc(CONFIG.subtitle) + '</span></h2>' +
      '<ul class="eeost-credits">';
    for (var c = 0; c < CONFIG.credits.length; c++) {
      html += '<li>' + esc(CONFIG.credits[c]) + '</li>';
    }
    html += '</ul></div></div>';

    if (CONFIG.listen && CONFIG.listen.length) {
      html += section(CONFIG.listenHeading) +
        '<div class="eeost-links">' + linkCards(CONFIG.listen) + '</div>';
    }

    if (CONFIG.vinyl && CONFIG.vinyl.length) {
      html += section(CONFIG.vinylHeading) +
        (CONFIG.vinylNote ? '<p class="eeost-note eeost-rev">' + esc(CONFIG.vinylNote) + '</p>' : '') +
        '<div class="eeost-links">' + linkCards(CONFIG.vinyl) + '</div>';
    }

    if (CONFIG.tracks && CONFIG.tracks.length) {
      html += section(CONFIG.tracksHeading) + '<ol class="eeost-tracks">';
      for (var i = 0; i < CONFIG.tracks.length; i++) {
        var n = (i + 1) < 10 ? "0" + (i + 1) : String(i + 1);
        html += '<li class="eeost-track eeost-rev"><span class="eeost-num">' + n + '</span>' +
          '<span class="eeost-tname">' + esc(CONFIG.tracks[i]) + '</span>' +
          '<span class="eeost-dots"></span></li>';
      }
      html += '</ol>';
    }

    if (CONFIG.backLink) {
      html += '<div class="eeost-foot"><a class="eeost-back" href="' + esc(CONFIG.backLink) + '">' +
        esc(CONFIG.backLabel) + '</a></div>';
    }

    return html + '</div>';
  }

  function reveal(root) {
    var items = root.querySelectorAll(".eeost-rev");
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("in");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  function merge(base, extra) {
    if (!extra) return base;
    for (var k in extra) {
      if (!Object.prototype.hasOwnProperty.call(extra, k)) continue;
      if (extra[k] && extra[k].constructor === Object) {
        base[k] = merge(base[k] || {}, extra[k]);
      } else {
        base[k] = extra[k];
      }
    }
    return base;
  }

  function styleTag() {
    var el = document.getElementById("eeost-style");
    if (!el) {
      el = document.createElement("style");
      el.id = "eeost-style";
      document.head.appendChild(el);
    }
    el.textContent = css(CONFIG.theme);
  }

  function target() {
    var el = CONFIG.mount ? document.querySelector(CONFIG.mount) : null;
    if (el) return el;
    if (HOST_SCRIPT && HOST_SCRIPT.parentNode) {
      var holder = document.createElement("div");
      holder.id = "ee-ost";
      HOST_SCRIPT.parentNode.insertBefore(holder, HOST_SCRIPT);
      return holder;
    }
    return null;
  }

  function render() {
    var host = target();
    if (!host) { console.warn("EE-OST: no mount point found."); return; }
    styleTag();
    host.classList.add("eeost");
    host.innerHTML = build();
    reveal(host);
  }

  merge(CONFIG, window.EE_OST_CONFIG);
  window.EE_OST = { config: CONFIG, render: render };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
