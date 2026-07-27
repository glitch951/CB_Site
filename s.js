/* christofferbodegard.com - Broadsheet
   Loaded by a single Carrd embed. Everything you edit lives in content.json.
   No dependencies. */

(function () {
  var SCRIPT = document.currentScript;
  var BASE = SCRIPT.src.replace(/\/[^/]*$/, '/');

  /* Where am I served from? Works for jsDelivr and GitHub Pages alike, so the
     portrait folder can be read without anything being configured by hand. */
  var REPO = (function () {
    var m = /cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^/@]+)(?:@([^/]+))?\//.exec(SCRIPT.src);
    if (m) return { owner: m[1], repo: m[2], ref: m[3] || 'HEAD' };
    m = /^https?:\/\/([^.]+)\.github\.io\/([^/]+)\//.exec(SCRIPT.src);
    if (m) return { owner: m[1], repo: m[2], ref: 'HEAD' };
    return null;
  })();

  var PAGES = ['devlogs', 'work', 'talks', 'press', 'backstory', 'inspirations'];
  var TITLES = {
    devlogs: 'Devlogs', work: 'Work', talks: 'Talks',
    press: 'Press', backstory: 'Backstory', inspirations: 'Inspirations'
  };

  var C = null;
  var app, main;
  var cache = {};

  /* ---------- tiny helpers ------------------------------------- */
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    for (var k in attrs || {}) {
      if (attrs[k] == null) continue;
      if (k === 'html') el.innerHTML = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (kid) { if (kid) el.appendChild(kid); });
    return el;
  }
  function asArray(v) { return !v ? [] : (Array.isArray(v) ? v : [v]); }
  function paras(arr) {
    return asArray(arr).map(function (p) { return '<p>' + p + '</p>'; }).join('');
  }
  function fmtDate(unix) {
    return new Date(unix * 1000).toLocaleDateString('en-GB',
      { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function abs(p) { return /^(https?:|data:)/.test(p) ? p : BASE + p; }

  /* ---------- Steam BBCode -> HTML ------------------------------ */
  var CLAN = 'https://clan.cloudflare.steamstatic.com/images/';

  function shortUrl(u, max) {
    var s = u.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    max = max || 60;
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  function bb(src) {
    var s = String(src || '').replace(/\r\n?/g, '\n');
    s = s.replace(/\{STEAM_CLAN_IMAGE\}/g, CLAN)
         .replace(/\{STEAM_CLAN_LOC_IMAGE\}/g, CLAN);

    s = s.replace(/\[h(\d)\]([\s\S]*?)\[\/h\1\]/gi, '\n\n<h3>$2</h3>\n\n')
         .replace(/\[quote[^\]]*\]([\s\S]*?)\[\/quote\]/gi, '\n\n<blockquote>$1</blockquote>\n\n')
         .replace(/\[list\]/gi, '\n\n<ul>').replace(/\[\/list\]/gi, '</ul>\n\n')
         .replace(/\[olist\]/gi, '\n\n<ol>').replace(/\[\/olist\]/gi, '</ol>\n\n')
         .replace(/\[\*\]\s*/g, '<li>')
         .replace(/\[img\]\s*([^\[\]\s]+)\s*\[\/img\]/gi, '\n\n<img src="$1" alt="">\n\n')
         .replace(/\[previewyoutube=([\w-]+)[^\]]*\]\s*\[\/previewyoutube\]/gi,
           '\n\n<a class="cb-out" href="https://youtu.be/$1" target="_blank" rel="noopener">Watch on YouTube</a>\n\n')
         .replace(/\[hr\]\[\/hr\]|\[hr\]/gi, '\n\n');

    s = s.replace(/\[url=["']?(.*?)["']?\]([\s\S]*?)\[\/url\]/gi, function (m, href, label) {
          label = label.trim();
          if (!label || /^https?:\/\//i.test(label)) {
            return '\n\n<a class="cb-out is-bare" href="' + href +
              '" target="_blank" rel="noopener">' + shortUrl(href) + '</a>\n\n';
          }
          return '<a class="cb-out" href="' + href + '" target="_blank" rel="noopener">' + label + '</a>';
        })
        .replace(/\[url\]\s*(.*?)\s*\[\/url\]/gi, function (m, href) {
          return '\n\n<a class="cb-out is-bare" href="' + href +
            '" target="_blank" rel="noopener">' + shortUrl(href) + '</a>\n\n';
        })
        // a line break inside an inline tag must survive the paragraph split,
        // otherwise the tag is torn in half and the sign-off runs on
        .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, function (m, x) { return '<strong>' + keepBreaks(x) + '</strong>'; })
        .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, function (m, x) { return '<em>' + keepBreaks(x) + '</em>'; })
        .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, function (m, x) { return '<u>' + keepBreaks(x) + '</u>'; })
        .replace(/\[strike\]([\s\S]*?)\[\/strike\]/gi, function (m, x) { return '<s>' + keepBreaks(x) + '</s>'; })
        .replace(/\[\/?[a-z][^\]]*\]/gi, '');

    // bare URLs the author typed without tags get a line of their own
    s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)\]]+)/g, function (m, pre, url) {
      return pre.replace(/\s+$/, '') + '\n\n<a class="cb-out is-bare" href="' + url +
        '" target="_blank" rel="noopener">' + shortUrl(url) + '</a>\n\n';
    });

    s = s.replace(/&nbsp;/g, ' ').replace(/\t/g, ' ').replace(/[ ]{2,}/g, ' ');
    s = fixGluedText(s);

    return s.split(/\n+/).map(function (block) {
      block = block.trim();
      if (!block) return '';
      if (/^<(h3|ul|ol|blockquote|img|figure)/i.test(block)) return block;
      if (/^<a class="cb-out is-bare"/.test(block) && /<\/a>$/.test(block)) {
        return '<p class="cb-linkline">' + block + '</p>';
      }
      return '<p>' + block + '</p>';
    }).filter(Boolean).join('').replace(/\u0001/g, '<br>');
  }

  function keepBreaks(s) { return String(s).replace(/\n/g, '\u0001'); }

  /* Steam posts routinely lose the space between sentences once formatting tags
     are stripped ("stuff.Speaking", "here:<b>Bandcamp</b>", "</a>That's"). Repair
     it in visible text only, never inside a tag, an href or a URL. */
  function fixGluedText(html) {
    var parts = html.split(/(<[^>]*>)/);
    var i, j, k;
    for (i = 0; i < parts.length; i += 2) {
      parts[i] = parts[i].replace(/([a-zà-ÿ0-9)"'\]!?][.!?:;])([A-ZÀ-Þ0-9"'(])/g, '$1 $2');
    }
    for (j = 0; j < parts.length; j += 2) {
      if (!/[a-zà-ÿ0-9.!?:;,)"'\]]$/.test(parts[j])) continue;
      var endsSentence = /[.!?:;,)]$/.test(parts[j]);
      for (k = j + 1; k < parts.length; k++) {
        if (k % 2) {
          if (/^<\/?(p|h\d|ul|ol|li|br|div|blockquote|figure|img)\b/i.test(parts[k])) break;
          continue;
        }
        if (!parts[k].length) continue;
        var startsHard = /^[A-ZÀ-Þ0-9"'(]/.test(parts[k]);
        var afterLink = /<\/a>/.test(parts.slice(j + 1, k).join(''));
        var beforeLink = /<a\b/.test(parts.slice(j + 1, k).join(''));
        if ((endsSentence && (startsHard || beforeLink)) || (afterLink && startsHard)) {
          parts[j] += ' ';
        }
        break;
      }
    }
    return parts.join('');
  }

  function firstImage(html) {
    var m = /<img src="([^"]+)"/.exec(html);
    return m ? m[1] : null;
  }
  function excerpt(html, n) {
    var t = String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
  }
  function steamHeader(appid) {
    return appid ? 'https://cdn.cloudflare.steamstatic.com/steam/apps/' + appid + '/header.jpg' : '';
  }

  /* ---------- shell -------------------------------------------- */
  function navLink(p) {
    var a = h('a', { href: '#cb-' + p, 'data-page': p, text: TITLES[p] });
    a.addEventListener('click', function (ev) {
      ev.preventDefault(); ev.stopPropagation(); go(p);
    });
    return a;
  }

  function railExtras() {
    var items = C.railExtras || [];
    if (!items.length) return null;
    return h('div', { class: 'cb-extras' }, items.map(function (x) {
      if (x.url) return h('a', { href: x.url, target: '_blank', rel: 'noopener', text: x.label });
      return h('div', { class: 'cb-extra-text', html: x.label });
    }));
  }

  var THEME_KEY = 'cb-theme';
  function isDark() {
    try { return localStorage.getItem(THEME_KEY) === 'dark'; } catch (e) { return false; }
  }
  function applyTheme() {
    if (!app) return;
    var dark = isDark();
    app.classList.toggle('is-dark', dark);
    app.querySelectorAll('.cb-theme').forEach(function (b) {
      b.textContent = dark ? 'Light' : 'Dark';
      b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  function themeButton() {
    var b = h('button', { class: 'cb-theme', type: 'button', text: 'Dark' });
    b.addEventListener('click', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      try { localStorage.setItem(THEME_KEY, isDark() ? 'light' : 'dark'); } catch (e) {}
      applyTheme();
    });
    return b;
  }

  function build() {
    app = h('div', { id: 'cb-app' });
    var portrait = h('div', { class: 'cb-portrait' });
    app.appendChild(portrait);
    rollPortrait(portrait);

    var rail = h('div', { class: 'cb-rail' }, [
      h('div', { class: 'cb-rail-top' }, [
        h('div', { class: 'cb-name', html: String(C.name || '').replace(' ', '<br>') }),
        h('div', { class: 'cb-hr' }),
        h('nav', { class: 'cb-nav' }, PAGES.map(navLink)),
        h('div', { class: 'cb-hr' }),
        h('p', { class: 'cb-bio', html: C.bio || '' }),
        railExtras()
      ]),
      h('div', { class: 'cb-rail-bottom' }, [
        h('div', { class: 'cb-social' }, (C.social || []).map(function (s) {
          return h('a', { href: s.url, target: '_blank', rel: 'noopener', text: s.label });
        })),
        h('div', { class: 'cb-footrow' }, [
          h('div', { class: 'cb-copy', text: C.copyright || '' }),
          themeButton()
        ])
      ])
    ]);

    var topbar = h('div', { class: 'cb-topbar' }, [
      h('div', { class: 'cb-topbar-row' }, [
        h('div', { class: 'cb-name', text: C.name || '' }),
        themeButton()
      ]),
      h('nav', {}, PAGES.map(navLink))
    ]);

    main = h('div', { class: 'cb-main' });
    app.appendChild(rail);
    app.appendChild(topbar);
    app.appendChild(main);

    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el.tagName !== 'SCRIPT' && el.tagName !== 'LINK') el.style.display = 'none';
    });
    document.body.style.margin = '0';
    document.body.appendChild(app);
    applyTheme();
  }

  /* Portraits: read the folder listing once, remember it for the session, then
     load exactly ONE image per page load so nothing heavy is downloaded twice. */
  function portraitList() {
    if ((C.portraits || []).length) return Promise.resolve(C.portraits.map(abs));
    var dir = (C.portraitsDir || 'portraits').replace(/^\/|\/$/g, '');
    var key = 'cb-portraits-' + dir;
    try {
      var cached = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (cached && cached.length) return Promise.resolve(cached);
    } catch (e) {}
    if (!REPO) return Promise.resolve([]);

    var api = 'https://api.github.com/repos/' + REPO.owner + '/' + REPO.repo +
      '/contents/' + dir + (REPO.ref && REPO.ref !== 'HEAD' ? '?ref=' + REPO.ref : '');
    return fetch(api)
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (files) {
        var list = (files || [])
          .filter(function (f) {
            return f.type === 'file' && /\.(png|jpe?g|webp|gif|avif)$/i.test(f.name);
          })
          .map(function (f) { return f.download_url; });
        try { sessionStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
        return list;
      })
      .catch(function () { return []; });
  }

  function rollPortrait(holder) {
    portraitList().then(function (list) {
      if (!list.length) return;
      var pool = list.slice();
      for (var i = pool.length - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1));
        var t = pool[i]; pool[i] = pool[r]; pool[r] = t;
      }
      var picks = pool.slice(0, Math.min(2, pool.length));
      var sides = ['is-left', 'is-right'];
      var imgs = [];

      /* Sizing: same pixel density for both (portraitZoom screen px per image
         px), but never small - every portrait is at least portraitMinHeight
         of the window tall (default 1.05, i.e. slightly taller than the
         screen), whatever its source resolution. If the pair would overlap,
         both shrink by the same factor, but never below that minimum.
         Placement: vertically centered by default; portraitAlign can be
         'top' or 'bottom' instead. */
      function layout() {
        var vw = holder.clientWidth || window.innerWidth;
        var vh = holder.clientHeight || window.innerHeight;
        var zoom = C.portraitZoom != null ? C.portraitZoom : 2;
        var minH = vh * (C.portraitMinHeight != null ? C.portraitMinHeight : 1.05);
        var ready = imgs.filter(function (im) { return im.naturalWidth && im.naturalHeight; });
        if (!ready.length) return;
        var floors = ready.map(function (im) { return minH * im.naturalWidth / im.naturalHeight; });
        var widths = ready.map(function (im, n) {
          return Math.max(im.naturalWidth * zoom, floors[n]);
        });
        var sum = widths.reduce(function (a, b) { return a + b; }, 0);
        var fit = C.portraitAllowOverlap ? 1 : Math.min(1, vw / sum);
        ready.forEach(function (im, n) {
          im.style.width = Math.max(widths[n] * fit, floors[n]) + 'px';
        });
      }

      picks.forEach(function (src, n) {
        var img = h('img', { alt: '', class: sides[n] });
        img.style.setProperty('--portrait-opacity',
          C.portraitOpacity != null ? C.portraitOpacity : .1);
        var flip = n === 1 ? ' scaleX(-1)' : '';
        if (C.portraitAlign === 'top') {
          img.style.top = '0';
          if (flip) img.style.transform = 'scaleX(-1)';
        } else if (C.portraitAlign === 'bottom') {
          img.style.bottom = '0';
          if (flip) img.style.transform = 'scaleX(-1)';
        } else {
          img.style.top = '50%';
          img.style.transform = 'translateY(-50%)' + flip;
        }
        img.onload = function () { layout(); img.classList.add('is-in'); };
        img.onerror = function () { img.remove(); layout(); };
        img.decoding = 'async';
        img.src = src;
        imgs.push(img);
        holder.appendChild(img);
      });
      window.addEventListener('resize', layout);
    });
  }

  function setActive(page) {
    app.querySelectorAll('[data-page]').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-page') === page);
    });
  }

  /* ---------- pages -------------------------------------------- */
  function masthead(label) {
    return h('div', { class: 'cb-masthead' }, [h('span', { class: 'cb-kicker', text: label })]);
  }

  function mediaBlock(src, caption) {
    if (!src) return null;
    var node;
    if (/\.(mp4|webm|mov)$/i.test(src)) {
      node = h('video', { src: abs(src), autoplay: '', loop: '', playsinline: '' });
      node.muted = true;
    } else {
      node = h('img', { src: abs(src), alt: '' });
    }
    var fig = h('figure', { class: 'cb-side-media' }, [
      node, caption ? h('figcaption', { text: caption }) : null
    ]);
    node.onerror = function () { fig.remove(); };
    return fig;
  }

  /* Vertical visual for the Backstory, Talks and Work rails. Two moods:
     ambient (silent, looping, no controls - scenery, not a player) and
     player (controls shown, nothing moves until the visitor presses play).
     Steam library capsules are 2:3, everything else is framed 9:16.
     The rail it sits in is hidden by CSS on anything narrower than 1250px. */
  function vertMedia(src, opts) {
    if (!src) return null;
    opts = opts || {};
    var capsule = /library_capsule|library_600x900/i.test(src);
    var node;
    if (/\.(mp4|webm|mov)([?#]|$)/i.test(src)) {
      if (opts.ambient) {
        node = h('video', { src: abs(src), autoplay: '', loop: '', playsinline: '', preload: 'auto' });
        node.muted = true;
      } else {
        node = h('video', { src: abs(src), controls: '', playsinline: '', preload: 'metadata' });
      }
    } else {
      node = h('img', { src: abs(src), alt: '', loading: 'lazy' });
    }
    var fig = h('figure', { class: 'cb-vert' + (capsule ? ' is-capsule' : '') }, [
      node, opts.caption ? h('figcaption', { text: opts.caption }) : null
    ]);
    node.onerror = function () {
      if (opts.fallback && node.getAttribute('src') !== opts.fallback) {
        node.src = opts.fallback;
        return;
      }
      fig.remove();
    };
    return fig;
  }

  /* Shared by Talks and Work: a sticky vertical rail whose visual follows the
     selected row. The top row is selected by default; clicking another row
     swaps the visual (pausing any playing video); the little orange marker
     shows which row owns what the rail is showing. entries[i] carries
     { visual, fallback, caption } for rows[i]; a row without a visual leaves
     the rail empty. */
  function attachVisualRail(page, list, rows, entries, opts) {
    var rail = h('aside', { class: 'cb-vert-rail' });
    var selected = -1;
    function select(i) {
      if (i === selected || !entries[i]) return;
      selected = i;
      rows.forEach(function (r, n) { r.classList.toggle('is-selected', n === i); });
      rail.querySelectorAll('video').forEach(function (v) { v.pause(); });
      rail.innerHTML = '';
      var e = entries[i];
      // a row without a visual simply shows nothing in the rail
      var med = e.visual && vertMedia(e.visual, { caption: e.caption, fallback: e.fallback });
      if (med) rail.appendChild(med);
    }
    rows.forEach(function (row, i) {
      row.classList.add('is-selectable');
      row.addEventListener('click', function (ev) {
        if (ev.target.closest && ev.target.closest('a')) return;
        select(i);
      });
    });
    page.appendChild(h('div', { class: 'cb-withside' }, [list, rail]));
    select(0);
  }

  /* Steam's stable vertical library art, derived from any store URL. */
  function steamLibraryArt(url) {
    var m = /store\.steampowered\.com\/app\/(\d+)/.exec(url || '');
    if (!m) return null;
    var base = 'https://cdn.cloudflare.steamstatic.com/steam/apps/' + m[1] + '/library_600x900';
    return { src: base + '_2x.jpg', fallback: base + '.jpg' };
  }

  function pageBackstory() {
    var b = C.backstory || {};
    var page = h('div', { class: 'cb-page' }, [masthead('Backstory')]);
    if (b.title) page.appendChild(h('h2', { class: 'cb-title', text: b.title }));
    if (b.standfirst) page.appendChild(h('p', { class: 'cb-standfirst', text: b.standfirst }));
    page.classList.add(b.title || b.standfirst ? 'has-head' : 'no-head');

    /* One page-level vertical visual that stays beside the text through every
       chapter (sticky). Wide screens only - the rail vanishes below 1250px. */
    var host = page;
    var vert = vertMedia(b.sideVisual, { ambient: true, caption: b.sideVisualCaption });
    if (vert) {
      host = h('div', {});
      page.appendChild(h('div', { class: 'cb-withside' }, [
        host, h('aside', { class: 'cb-vert-rail' }, [vert])
      ]));
    }

    (b.chapters || []).forEach(function (ch) {
      var col = h('div', { class: 'cb-chapter-col' });
      if (ch.title) col.appendChild(h('h3', { class: 'cb-chapter-h', text: ch.title }));
      col.appendChild(h('div', { class: 'cb-body', html: paras(ch.paragraphs) }));

      var side = mediaBlock(ch.media, ch.mediaCaption);
      host.appendChild(h('div', { class: 'cb-chapter-grid' + (side ? '' : ' is-wide') },
        [col, side]));
    });
    return page;
  }

  function pageWork() {
    var page = h('div', { class: 'cb-page' }, [masthead('Work')]);
    var works = C.work || [];
    var list = h('div', { class: 'cb-list' });
    var rows = [];

    /* Each row's vertical art: an explicit `visual` in content.json wins;
       otherwise it is derived from the Steam store link automatically, so
       every game with a store page gets its library capsule for free. */
    var entries = works.map(function (w) {
      if (w.visual) return { visual: w.visual, fallback: '', caption: w.visualCaption || '' };
      var art = steamLibraryArt(w.url);
      return {
        visual: art ? art.src : '',
        fallback: art ? art.fallback : '',
        caption: w.visualCaption || ''
      };
    });

    works.forEach(function (w) {
      var row = h('div', { class: 'cb-row cb-row-work' }, [
        h('div', { class: 'cb-meta', text: w.year || '' }),
        h('div', {}, [
          w.url
            ? h('a', { class: 'cb-h4link', href: w.url, target: '_blank', rel: 'noopener' },
                [h('h4', { text: w.title })])
            : h('h4', { text: w.title }),
          h('div', {
            class: 'cb-desc',
            html: paras(w.paragraphs && w.paragraphs.length ? w.paragraphs : w.note)
          })
        ])
      ]);
      rows.push(row);
      list.appendChild(row);
    });

    if (entries.some(function (e) { return e.visual; })) {
      attachVisualRail(page, list, rows, entries, { capsule: true });
    } else {
      page.appendChild(list);
    }
    return page;
  }

  function pageTalks() {
    var page = h('div', { class: 'cb-page' }, [masthead('Talks')]);
    var talks = C.talks || [];
    var list = h('div', { class: 'cb-list' });
    var rows = [];
    var entries = talks.map(function (t) {
      return { visual: t.visual || '', fallback: '', caption: t.visualCaption || '' };
    });

    talks.forEach(function (t) {
      var row = h('div', { class: 'cb-row cb-row-talk' }, [
        h('div', { class: 'cb-meta', text: t.date || '' }),
        h('div', {}, [
          h('h4', { text: t.venue || t.title }),
          t.venue && t.title ? h('div', { class: 'cb-subtitle', text: t.title }) : null,
          h('div', { class: 'cb-desc', html: paras(t.paragraphs) }),
          t.url ? h('a', {
            class: 'cb-link is-small', href: t.url, target: '_blank', rel: 'noopener',
            text: (t.linkLabel || 'Read more') + ' →'
          }) : null
        ])
      ]);
      rows.push(row);
      list.appendChild(row);
    });

    if (entries.some(function (e) { return e.visual; })) {
      attachVisualRail(page, list, rows, entries);
    } else {
      page.appendChild(list);
    }
    return page;
  }

  function pageInspirations() {
    var ins = C.inspirations || {};
    var page = h('div', { class: 'cb-page' }, [masthead('Inspirations')]);
    if (ins.title) page.appendChild(h('h2', { class: 'cb-title is-mid', text: ins.title }));
    if (ins.standfirst) page.appendChild(h('p', { class: 'cb-standfirst', text: ins.standfirst }));

    var list = h('div', { class: 'cb-list' });
    (ins.items || []).forEach(function (g, i) {
      var panel = h('div', { class: 'cb-drawer' }, [
        h('div', { class: 'cb-drawer-in' }, [
          h('div', { class: 'cb-desc', html: paras(g.why) }),
          g.url ? h('a', {
            class: 'cb-link is-small', href: g.url, target: '_blank', rel: 'noopener',
            text: 'More →'
          }) : null
        ])
      ]);
      var row = h('div', { class: 'cb-row cb-row-insp' }, [
        h('div', { class: 'cb-meta', text: String(i + 1).padStart(2, '0') }),
        h('div', { class: 'cb-insp-title', text: g.title }),
        h('div', { class: 'cb-meta cb-insp-genre', text: g.genre || '' }),
        h('div', { class: 'cb-meta cb-insp-year', text: g.year || '' }),
        h('div', { class: 'cb-chev', text: '+' })
      ]);
      var wrap = h('div', { class: 'cb-acc' }, [row, panel]);
      row.addEventListener('click', function () {
        var open = wrap.classList.toggle('is-open');
        panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '';
        wrap.querySelector('.cb-chev').textContent = open ? '–' : '+';
      });
      list.appendChild(wrap);
    });
    page.appendChild(list);
    return page;
  }

  /* ---------- feeds -------------------------------------------- */
  /* Feeds are cached three deep: in memory for this page, in sessionStorage
     for the visit (so reloads are instant), and per 10-minute bucket so
     nothing goes stale for long. Empty results are never stored. */
  function feed(kind) {
    if (cache[kind]) return Promise.resolve(cache[kind]);
    if (!C.feedsUrl) return Promise.reject(new Error('no feedsUrl'));
    var bucket = Math.floor(Date.now() / 600000);
    var key = 'cb-feed-' + kind + '-' + bucket;
    try {
      var stored = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (stored && stored.length) { cache[kind] = stored; return Promise.resolve(stored); }
    } catch (e) {}
    var url = C.feedsUrl.replace(/\/$/, '') + '/?feed=' + kind + '&t=' + bucket;
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      cache[kind] = j;
      try {
        if (j && j.length) sessionStorage.setItem(key, JSON.stringify(j));
      } catch (e) {}
      return j;
    });
  }

  function thumb(src, fallback, cls) {
    var url = src || fallback;
    if (!url) return null;
    var box = h('div', { class: 'cb-thumb' + (cls ? ' ' + cls : '') });
    var img = h('img', { src: url, alt: '', loading: 'lazy' });
    img.onerror = function () {
      if (fallback && img.getAttribute('src') !== fallback) { img.src = fallback; return; }
      img.remove();
    };
    box.appendChild(img);
    return box;
  }

  function pageDevlogs() {
    var page = h('div', { class: 'cb-page' }, [
      masthead('Devlogs'), h('div', { class: 'cb-loading', text: 'Loading posts…' })
    ]);
    feed('steam').then(function (items) {
      page.innerHTML = '';
      page.appendChild(masthead('Devlogs'));
      if (!items.length) {
        page.appendChild(h('div', { class: 'cb-loading', text: 'No posts found.' }));
        return;
      }
      var top = items[0];
      var body = bb(top.contents);
      var bodyImg = firstImage(body);
      var hero = top.image || bodyImg;
      page.appendChild(h('div', { class: 'cb-lede' }, [
        h('div', { class: 'cb-postmeta' }, [
          h('span', { class: 'is-orange', text: fmtDate(top.date) }),
          h('span', { text: top.gameName || '' })
        ]),
        h('h2', { class: 'cb-title is-post', text: top.title })
      ]));
      if (hero) {
        var fig = h('figure', { class: 'cb-figure' }, [h('img', { src: hero, alt: '' })]);
        fig.querySelector('img').onerror = function () { fig.remove(); };
        page.appendChild(fig);
        if (hero === bodyImg) body = body.replace(/<img src="[^"]+"[^>]*>/, '');
      }
      page.appendChild(h('div', { class: 'cb-body is-post', html: body }));
      page.appendChild(h('a', {
        class: 'cb-link', href: top.url, target: '_blank', rel: 'noopener',
        text: 'Read the whole post on Steam →'
      }));

      if (items.length > 1) {
        page.appendChild(h('div', { class: 'cb-sep' }, [
          h('span', { text: 'Earlier posts' }), h('div', {})
        ]));
        var cards = h('div', { class: 'cb-cards' });
        items.slice(1, 25).forEach(function (it) {
          var b2 = bb(it.contents);
          cards.appendChild(h('a', {
            class: 'cb-card', href: it.url, target: '_blank', rel: 'noopener'
          }, [
            thumb(it.image || firstImage(b2), steamHeader(it.appid)),
            h('div', { class: 'cb-card-txt' }, [
              h('div', { class: 'cb-card-meta' }, [
                h('span', { text: fmtDate(it.date) }),
                h('span', { text: it.gameName || '' })
              ]),
              h('h4', { text: it.title }),
              h('div', { class: 'cb-desc', text: excerpt(b2, 120) })
            ])
          ]));
        });
        page.appendChild(cards);
      }
    }).catch(function () {
      page.innerHTML = '';
      page.appendChild(masthead('Devlogs'));
      page.appendChild(h('div', { class: 'cb-loading', text: 'Steam feed unavailable right now.' }));
    });
    return page;
  }

  /* Press: the latest articles about him, newest first, straight from the
     worker's Google News feed. Nothing pinned, nothing merged, no options.
     Ten rows at a time; the arrow sits below the list, slides down as rows
     are added, and keeps loading until the feed runs out - at which point it
     becomes a quiet end-of-coverage mark instead of silently vanishing. */
  function pagePress() {
    var page = h('div', { class: 'cb-page' }, [
      masthead('Press'), h('div', { class: 'cb-loading', text: 'Loading\u2026' })
    ]);
    feed('press').then(function (items) {
      items = (items || []).filter(function (p) { return p && p.title && p.url; });
      items.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });

      page.innerHTML = '';
      page.appendChild(masthead('Press'));
      if (!items.length) {
        page.appendChild(h('div', { class: 'cb-loading', text: 'Nothing found right now.' }));
        return;
      }

      var list = h('div', { class: 'cb-list' });
      page.appendChild(list);

      var more = h('button', {
        class: 'cb-more is-arrow', type: 'button', text: '\u2193',
        'aria-label': 'Load more articles', title: 'Load more articles'
      });
      var theEnd = h('div', { class: 'cb-feed-end', text: 'End of coverage' });

      function row(p) {
        return h('a', {
          class: 'cb-row cb-row-press',
          href: p.url, target: '_blank', rel: 'noopener'
        }, [
          p.image
            ? thumb(p.image, '', 'is-small')
            : h('div', { class: 'cb-thumb is-small is-empty' }),
          h('div', {}, [
            h('div', { class: 'cb-meta is-orange', text: p.outlet || '' }),
            h('div', { class: 'cb-headline', text: p.title }),
            p.summary ? h('div', { class: 'cb-press-sum', text: p.summary }) : null
          ]),
          h('div', { class: 'cb-meta cb-right', text: p.date || '' })
        ]);
      }

      var shown = 0;
      var STEP = 10;
      function addRows() {
        items.slice(shown, shown + STEP).forEach(function (p) { list.appendChild(row(p)); });
        shown = Math.min(items.length, shown + STEP);
        if (shown >= items.length) more.replaceWith(theEnd);
      }
      addRows();
      if (shown < items.length) page.appendChild(more);
      more.addEventListener('click', addRows);
    }).catch(function () {
      page.innerHTML = '';
      page.appendChild(masthead('Press'));
      page.appendChild(h('div', { class: 'cb-loading', text: 'Press feed unavailable right now.' }));
    });
    return page;
  }

  /* ---------- router ------------------------------------------- */
  var BUILDERS = {
    work: pageWork, devlogs: pageDevlogs, talks: pageTalks,
    press: pagePress, backstory: pageBackstory, inspirations: pageInspirations
  };
  var current = null;

  function pageFromHash() {
    var m = /#cb-([a-z]+)/.exec(location.hash || '');
    return m && PAGES.indexOf(m[1]) !== -1 ? m[1] : null;
  }
  function go(page) {
    if (PAGES.indexOf(page) === -1) page = C.homePage || 'work';
    try { history.replaceState(null, '', '#cb-' + page); } catch (e) {}
    render(page);
  }
  function route() { render(pageFromHash() || C.homePage || 'work'); }

  function render(page) {
    current = page;
    main.innerHTML = '';
    main.scrollTop = 0;
    var built = BUILDERS[page]();
    main.appendChild(built);
    built.querySelectorAll('.cb-body img').forEach(function (im) {
      im.onerror = function () { im.remove(); };
    });
    setActive(page);
    document.title = C.name + ' / ' + TITLES[page];
  }

  /* ---------- go ------------------------------------------------ */
  function boot(json) {
    C = json;
    var old = document.getElementById('cb-app');
    if (old) old.remove();
    build();
    route();
  }

  window.addEventListener('hashchange', function () {
    var p = pageFromHash();
    if (C && p && p !== current) render(p);
  });

  window.addEventListener('message', function (ev) {
    if (ev.data && ev.data.type === 'cb-content' && ev.data.content) {
      var keep = current;
      boot(ev.data.content);
      if (keep) render(keep);
    }
  });

  if (window.CB_CONTENT) {
    boot(window.CB_CONTENT);
  } else {
    fetch(BASE + 'content.json?v=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(boot)
      .catch(function (e) { console.error('[cb] could not load content.json', e); });
  }
})();
