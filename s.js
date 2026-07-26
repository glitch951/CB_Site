/* christofferbodegard.com — Broadsheet
   Loaded by a single Carrd embed. Everything you edit lives in content.json.
   No dependencies. */

(function () {
  var SCRIPT = document.currentScript;
  var BASE = SCRIPT.src.replace(/\/[^/]*$/, '/');

  /* Works out "gh/user/repo@branch" from this script's own URL, so nothing has to be
     configured by hand. Only used when content.json doesn't set portraitsFrom. */
  var SELF_PKG = (function () {
    var m = /cdn\.jsdelivr\.net\/(gh\/[^/]+\/[^/@]+(?:@[^/]+)?)\//.exec(SCRIPT.src);
    return m ? m[1] : null;
  })();

  var PAGES = ['work', 'devlogs', 'talks', 'press', 'backstory', 'inspirations'];
  var TITLES = {
    work: 'Work', devlogs: 'Devlogs', talks: 'Talks',
    press: 'Press', backstory: 'Backstory', inspirations: 'Inspirations'
  };

  var C = null;      // content.json
  var app, main;
  var cache = {};    // fetched feeds

  /* ---------- tiny helpers ------------------------------------- */
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === 'html') el.innerHTML = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (kid) { if (kid) el.appendChild(kid); });
    return el;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function paras(arr, dropcap) {
    return (arr || []).map(function (p, i) {
      return '<p' + (dropcap && i === 0 ? ' class="cb-dropcap"' : '') + '>' + p + '</p>';
    }).join('');
  }
  function fmtDate(unix) {
    return new Date(unix * 1000).toLocaleDateString('en-GB',
      { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ---------- Steam BBCode -> HTML ------------------------------ */
  var CLAN = 'https://clan.cloudflare.steamstatic.com/images/';
  function bb(src) {
    var s = String(src || '');
    s = s.replace(/\{STEAM_CLAN_IMAGE\}/g, CLAN)
         .replace(/\{STEAM_CLAN_LOC_IMAGE\}/g, CLAN);
    s = s.replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" alt="">')
         .replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener">$2</a>')
         .replace(/\[url\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener">$1</a>')
         .replace(/\[b\](.*?)\[\/b\]/gis, '<strong>$1</strong>')
         .replace(/\[i\](.*?)\[\/i\]/gis, '<em>$1</em>')
         .replace(/\[u\](.*?)\[\/u\]/gis, '<u>$1</u>')
         .replace(/\[h(\d)\](.*?)\[\/h\1\]/gis, '<h3>$2</h3>')
         .replace(/\[quote.*?\](.*?)\[\/quote\]/gis, '<blockquote>$1</blockquote>')
         .replace(/\[list\]/gi, '<ul>').replace(/\[\/list\]/gi, '</ul>')
         .replace(/\[\*\]/g, '<li>')
         .replace(/\[previewyoutube=([\w-]+).*?\]\[\/previewyoutube\]/gi,
           '<a href="https://youtu.be/$1" target="_blank" rel="noopener">Watch on YouTube</a>')
         .replace(/\[\/?[a-z][^\]]*\]/gi, '');           // drop anything left over
    // paragraphs from blank lines
    return s.split(/\n{2,}/).map(function (block) {
      block = block.trim();
      if (!block) return '';
      if (/^<(h3|ul|blockquote|img|figure)/i.test(block)) return block;
      return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }
  function firstImage(html) {
    var m = /<img src="([^"]+)"/.exec(html);
    return m ? m[1] : null;
  }
  function excerpt(html, n) {
    var t = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
  }

  /* ---------- shell -------------------------------------------- */
  function build() {
    app = h('div', { id: 'cb-app' });

    var portrait = h('div', { class: 'cb-portrait' });
    app.appendChild(portrait);
    rollPortrait(portrait);

    var navLinks = PAGES.map(function (p) { return navLink(p); });

    var rail = h('div', { class: 'cb-rail' }, [
      h('div', { class: 'cb-rail-top' }, [
        h('div', { class: 'cb-name', html: esc(C.name).replace(' ', '<br>') }),
        h('div', { class: 'cb-hr' }),
        h('nav', { class: 'cb-nav' }, navLinks),
        h('div', { class: 'cb-hr' }),
        h('p', { class: 'cb-bio', html: C.bio })
      ]),
      h('div', { class: 'cb-rail-bottom' }, [
        h('div', { class: 'cb-social' }, (C.social || []).map(function (s) {
          return h('a', { href: s.url, target: '_blank', rel: 'noopener', text: s.label });
        })),
        h('div', { class: 'cb-copy', text: C.copyright || '' })
      ])
    ]);

    var topbar = h('div', { class: 'cb-topbar' }, [
      h('div', { class: 'cb-name', text: C.name }),
      h('nav', {}, PAGES.map(function (p) { return navLink(p); }))
    ]);

    main = h('div', { class: 'cb-main' });

    app.appendChild(rail);
    app.appendChild(topbar);
    app.appendChild(main);

    // hide whatever Carrd rendered, then mount
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el.tagName !== 'SCRIPT' && el.tagName !== 'LINK') el.style.display = 'none';
    });
    document.body.style.margin = '0';
    document.body.appendChild(app);
  }

  /* Picks one portrait at random. You never list them by hand: the folder is read
     from jsDelivr's file index, so uploading a file to portraits/ is all it takes.
     An explicit "portraits" array in content.json overrides this if you ever want it. */
  function portraitList() {
    if ((C.portraits || []).length) return Promise.resolve(C.portraits);
    var pkg = C.portraitsFrom || SELF_PKG;
    if (!pkg) return Promise.resolve([]);
    var dir = (C.portraitsDir || 'portraits').replace(/^\/|\/$/g, '');
    return fetch('https://data.jsdelivr.com/v1/packages/' + pkg)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var node = (j.files || []).filter(function (f) { return f.type === 'directory' && f.name === dir; })[0];
        if (!node) return [];
        return (node.files || [])
          .filter(function (f) { return /\.(png|jpe?g|webp|gif|avif)$/i.test(f.name); })
          .map(function (f) { return dir + '/' + f.name; });
      })
      .catch(function () { return []; });
  }

  function navLink(p) {
    var a = h('a', { href: '#cb-' + p, 'data-page': p, text: TITLES[p] });
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      go(p);
    });
    return a;
  }

  function rollPortrait(holder) {
    portraitList().then(function (list) { mountPortrait(holder, list); });
  }

  function mountPortrait(holder, list) {
    if (!list.length) return;
    var src = list[Math.floor(Math.random() * list.length)];
    var img = h('img', { alt: '' });
    img.style.setProperty('--portrait-opacity', C.portraitOpacity || .5);
    img.style.left = (-13 + Math.random() * 12) + '%';
    img.style.top = (-13 + Math.random() * 12) + '%';
    if (Math.random() > .5) img.style.transform = 'scaleX(-1)';
    img.onload = function () { img.classList.add('is-in'); };
    img.onerror = function () { img.remove(); };
    img.src = /^https?:/.test(src) ? src : BASE + src;
    holder.appendChild(img);
  }

  function guardImages(root) {
    root.querySelectorAll('.cb-body img').forEach(function (im) {
      im.onerror = function () { im.remove(); };
    });
  }

  function setActive(page) {
    app.querySelectorAll('[data-page]').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-page') === page);
    });
  }

  /* ---------- pages -------------------------------------------- */
  function masthead(label, note) {
    return h('div', { class: 'cb-masthead' }, [
      h('span', { class: 'cb-kicker', text: label }),
      note ? h('div', { class: 'cb-fill' }) : null,
      note ? h('span', { class: 'cb-note', text: note }) : null
    ]);
  }

  function pageBackstory() {
    var b = C.backstory || {};
    var page = h('div', { class: 'cb-page' }, [
      masthead('Backstory'),
      h('h2', { class: 'cb-title', text: b.title || '' }),
      h('p', { class: 'cb-standfirst', text: b.standfirst || '' })
    ]);
    (b.chapters || []).forEach(function (ch, i) {
      if (i > 0) {
        page.appendChild(h('div', { class: 'cb-chapter' }, [
          h('h3', { text: ch.title }),
          h('div', { class: 'cb-fill' }),
          h('span', { text: ch.years || '' })
        ]));
      }
      page.appendChild(h('div', {
        class: 'cb-body', html: paras(ch.paragraphs, i === 0)
      }));
      if (ch.pullquote) {
        page.appendChild(h('div', { class: 'cb-pull' }, [h('div', { text: ch.pullquote })]));
      }
      if (ch.image) {
        var fig = h('figure', { class: 'cb-figure' }, [
          h('img', { src: /^https?:/.test(ch.image) ? ch.image : BASE + ch.image, alt: '' }),
          ch.caption ? h('figcaption', { text: ch.caption }) : null
        ]);
        fig.querySelector('img').onerror = function () { fig.remove(); };
        page.appendChild(fig);
      }
    });
    return page;
  }

  function pageWork() {
    var page = h('div', { class: 'cb-page' }, [masthead('Work')]);
    var list = h('div', { class: 'cb-list' });
    (C.work || []).forEach(function (w) {
      list.appendChild(h('a', {
        class: 'cb-row cb-row-work', href: w.url || '#work',
        target: w.url ? '_blank' : null, rel: 'noopener'
      }, [
        h('div', { class: 'cb-meta', text: w.year }),
        h('div', {}, [
          h('div', { style: 'display:flex;align-items:baseline;gap:12px;flex-wrap:wrap' }, [
            h('h4', { text: w.title }),
            w.role ? h('span', { class: 'cb-tag', text: w.role }) : null
          ]),
          h('div', { class: 'cb-desc', text: w.note || '' })
        ])
      ]));
    });
    page.appendChild(list);
    return page;
  }

  function pageTalks() {
    var page = h('div', { class: 'cb-page' }, [masthead('Talks')]);
    var list = h('div', { class: 'cb-list' });
    (C.talks || []).forEach(function (t) {
      list.appendChild(h('div', { class: 'cb-row cb-row-talk' }, [
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
      ]));
    });
    page.appendChild(list);
    return page;
  }

  function pageInspirations() {
    var page = h('div', { class: 'cb-page' }, [
      masthead('Inspirations', 'A growing list'),
      h('h2', { class: 'cb-title', text: (C.inspirations || {}).title || '' }),
      h('p', { class: 'cb-standfirst', text: (C.inspirations || {}).standfirst || '' })
    ]);
    var list = h('div', { class: 'cb-list' });
    ((C.inspirations || {}).items || []).forEach(function (g, i) {
      list.appendChild(h('a', {
        class: 'cb-row cb-row-insp', href: g.url || '#inspirations',
        target: g.url ? '_blank' : null, rel: 'noopener'
      }, [
        h('div', { class: 'cb-meta', text: String(i + 1).padStart(2, '0') }),
        h('div', {}, [
          h('h4', { text: g.title, style: 'font-size:20px' }),
          g.why ? h('div', { class: 'cb-desc', text: g.why }) : null
        ]),
        h('div', { class: 'cb-meta', text: g.genre || '' }),
        h('div', { class: 'cb-meta', text: g.year || '' })
      ]));
    });
    page.appendChild(list);
    return page;
  }

  /* ---------- feeds -------------------------------------------- */
  function feed(kind) {
    if (cache[kind]) return Promise.resolve(cache[kind]);
    var url = C.feedsUrl.replace(/\/$/, '') + '/?feed=' + kind;
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      cache[kind] = j;
      return j;
    });
  }

  function pageDevlogs() {
    var page = h('div', { class: 'cb-page' }, [
      masthead('Devlogs', 'Mirrored from Steam'),
      h('div', { class: 'cb-loading', text: 'Loading posts…' })
    ]);
    feed('steam').then(function (items) {
      page.innerHTML = '';
      page.appendChild(masthead('Devlogs', 'Mirrored from Steam · ' + items.length + ' posts'));
      if (!items.length) {
        page.appendChild(h('div', { class: 'cb-loading', text: 'No posts found.' }));
        return;
      }
      var top = items[0];
      var body = bb(top.contents);
      var hero = firstImage(body);
      page.appendChild(h('div', {
        style: 'display:flex;gap:14px;margin-top:34px;font-family:JetBrains Mono,monospace;' +
               'font-size:12px;letter-spacing:.16em;text-transform:uppercase'
      }, [
        h('span', { text: fmtDate(top.date), style: 'color:#DB5B2C' }),
        h('span', { text: top.gameName || '', style: 'opacity:.5' })
      ]));
      page.appendChild(h('h2', { class: 'cb-title', text: top.title, style: 'font-size:72px;max-width:20ch' }));
      if (hero) {
        var heroFig = h('figure', { class: 'cb-figure' }, [h('img', { src: hero, alt: '' })]);
        heroFig.querySelector('img').onerror = function () { heroFig.remove(); };
        page.appendChild(heroFig);
        body = body.replace(/<img src="[^"]+"[^>]*>/, '');
      }
      page.appendChild(h('div', { class: 'cb-body', html: body }));
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
          var img = firstImage(b2);
          var thumbImg = img ? h('img', { src: img, alt: '' }) : null;
          if (thumbImg) thumbImg.onerror = function () { thumbImg.remove(); };
          cards.appendChild(h('a', {
            class: 'cb-card', href: it.url, target: '_blank', rel: 'noopener'
          }, [
            h('div', { class: 'cb-thumb' }, [thumbImg]),
            h('div', { style: 'display:flex;flex-direction:column;gap:8px' }, [
              h('div', { class: 'cb-card-meta' }, [
                h('span', { text: fmtDate(it.date) }),
                h('span', { text: '·' }),
                h('span', { text: it.gameName || '' })
              ]),
              h('h4', { text: it.title }),
              h('div', { class: 'cb-desc', text: excerpt(b2, 130) })
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

  function pagePress() {
    var page = h('div', { class: 'cb-page' }, [
      masthead('Press', 'Updates itself'),
      h('div', { class: 'cb-loading', text: 'Loading coverage…' })
    ]);
    feed('press').then(function (items) {
      var pinned = C.pressPinned || [];
      var all = pinned.concat(items);
      page.innerHTML = '';
      page.appendChild(masthead('Press', 'Auto — updated hourly'));
      var list = h('div', { class: 'cb-list' });
      all.forEach(function (p) {
        list.appendChild(h('a', {
          class: 'cb-row cb-row-press', href: p.url, target: '_blank', rel: 'noopener'
        }, [
          h('div', { class: 'cb-meta is-orange', text: p.outlet || '' }),
          h('div', { class: 'cb-headline', text: p.title }),
          h('div', { class: 'cb-meta', text: p.date || '', style: 'text-align:right' })
        ]));
      });
      page.appendChild(list);
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
    guardImages(built);
    setActive(page);
    document.title = TITLES[page] + ' — ' + C.name;
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

  // Live preview: editor.html injects content instead of a fetch, and pushes updates.
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
