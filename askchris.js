/* ================================================================
   ask-chris embed for esotericebb.com
   Usage: place on the page (e.g. the #askchris section):

     <div id="askchris"></div>
     <script src="askchris.js"></script>

   Renders the ask-chris forum archive as expandable threads.
   Self-contained: injects its own styles, no dependencies.
   ================================================================ */
(function () {
  'use strict';

  /* Where the ask-chris worker lives. */
  var WORKER_URL = 'https://ask-chris.christofferbodegard.workers.dev';

  /* Background character art, exactly like christofferbodegard.com: paste
     the same absolute image URL(s) used in that site's content.json
     "portraits" list. One is picked at random per visit and drawn REALLY
     BIG behind the page at whisper opacity. Empty list = no background. */
  var PORTRAITS = [
    // 'https://christofferbodegard.com/portraits/01.png',
  ];
  var PORTRAIT_OPACITY = 0.05;

  /* Ebb palette - adjust freely to match the page it sits on. */
  var CSS = [
    /* The embed sits on esotericebb.com's DARK page: everything that is not
       a cream card gets the same cream (--ac-paper) treatment so nothing
       disappears into the black. --ac-pagetext is for text sitting directly
       on the dark page (counts, errors). */
    '#askchris { --ac-paper: #fbf8e5; --ac-ink: #020E16; --ac-red: #E93C3C;',
    '  --ac-rule: rgba(2,14,22,.15); --ac-pagetext: rgba(251,248,229,.75);',
    '  font-family: "Averia Serif Libre", Georgia, serif;',
    '  color: var(--ac-ink); max-width: 860px; margin: 0 auto; text-align: left; }',
    '#askchris { position: relative; }',
    '#askchris > *:not(.ac-bg) { position: relative; z-index: 1; }',
    '.ac-bg { position: absolute; inset: 0; overflow: hidden;',
    '  pointer-events: none; z-index: 0; }',
    '.ac-bg-stick { position: sticky; top: 0; height: 100vh; }',
    '.ac-bg img { position: absolute; top: -18vh; right: -14%;',
    '  height: 136vh; width: auto; max-width: none; }',
    '#askchris * { box-sizing: border-box; }',
    /* search: a cream pill, like the cards */
    '.ac-search { position: relative; margin: 0 0 12px; }',
    '.ac-input { width: 100%; padding: 13px 46px 13px 46px; font-family: inherit;',
    '  font-size: 15px; color: var(--ac-ink); background: var(--ac-paper);',
    '  border: 1px solid transparent; border-radius: 999px; outline: none;',
    '  transition: border-color .18s ease, box-shadow .18s ease; }',
    '.ac-input::placeholder { font-weight: 300; opacity: .55; color: var(--ac-ink); }',
    '.ac-input:focus { border-color: var(--ac-red);',
    '  box-shadow: 0 0 0 3px rgba(233,60,60,.22); }',
    '.ac-input::-webkit-search-cancel-button { display: none; }',
    '.ac-search::before { content: ""; position: absolute; left: 18px; top: 50%;',
    '  width: 15px; height: 15px; transform: translateY(-50%); opacity: .45;',
    '  background: no-repeat center / contain url("data:image/svg+xml,' +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#020E16" stroke-width="2.4"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>') + '"); }',
    '.ac-clear { position: absolute; right: 9px; top: 50%; transform: translateY(-50%);',
    '  width: 30px; height: 30px; border: 0; border-radius: 50%; cursor: pointer;',
    '  background: none; color: var(--ac-ink); font-size: 20px; line-height: 1;',
    '  opacity: .5; display: none; }',
    '.ac-clear:hover { opacity: 1; color: var(--ac-red); }',
    /* text directly on the dark page */
    '.ac-count { font-family: "Figtree", sans-serif; font-size: 12px; font-weight: 300;',
    '  letter-spacing: .12em; text-transform: uppercase; color: var(--ac-pagetext);',
    '  margin: 0 4px 14px; min-height: 15px; }',
    '.ac-loading, .ac-error { font-family: "Figtree", sans-serif; font-size: 13px;',
    '  font-weight: 300; letter-spacing: .12em; text-transform: uppercase;',
    '  color: var(--ac-pagetext); padding: 30px 0; text-align: center; }',
    /* the smooth search swap */
    '.ac-list { transition: opacity .16s ease; }',
    '.ac-list.is-fading { opacity: 0; }',
    '@keyframes acIn { from { opacity: 0; transform: translateY(8px); }',
    '  to { opacity: 1; transform: none; } }',
    /* A repaint (fresh data arriving over the cached copy) must not
       re-run the entrance animation, or the whole list visibly flashes. */
    '#askchris.ac-quiet .ac-thread { animation: none; }',
    '.ac-thread { border: 1px solid var(--ac-rule); border-radius: 12px;',
    '  margin: 0 0 14px; background: var(--ac-paper); overflow: hidden;',
    '  animation: acIn .28s ease both; }',
    '.ac-top { display: block; width: 100%; text-align: left; font: inherit;',
    '  color: inherit; background: none; border: 0; cursor: pointer;',
    '  padding: 16px 18px; position: relative; }',
    '.ac-top:hover .ac-title { color: var(--ac-red); }',
    /* titles in Figtree, per the house style */
    '.ac-title { font-family: "Figtree", sans-serif; font-size: 20px;',
    '  font-weight: 800; letter-spacing: -.02em; margin: 0 0 6px;',
    '  padding-right: 30px; transition: color .15s ease; }',
    '.ac-meta { font-family: "Figtree", sans-serif; font-size: 11.5px;',
    '  font-weight: 300; letter-spacing: .1em;',
    '  text-transform: uppercase; opacity: .55; }',
    '.ac-preview { font-size: 15px; font-weight: 300;',
    '  line-height: 1.55; opacity: .75; margin: 8px 0 0; display: -webkit-box;',
    '  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }',
    '.ac-chev { position: absolute; right: 18px; top: 22px; font-size: 15px;',
    '  opacity: .4; transition: transform .3s ease; }',
    '.ac-thread.is-open .ac-chev { transform: rotate(180deg); }',
    '.ac-body { display: grid; grid-template-rows: 0fr;',
    '  transition: grid-template-rows .32s ease; }',
    '.ac-bodyin { min-height: 0; overflow: hidden; opacity: 0;',
    '  padding: 0 18px; transition: opacity .26s ease; }',
    '.ac-thread.is-open .ac-body { grid-template-rows: 1fr; }',
    '.ac-thread.is-open .ac-bodyin { opacity: 1; transition-delay: .08s;',
    '  border-top: 1px solid var(--ac-rule); padding: 4px 18px 16px; }',
    '.ac-msg { position: relative; padding: 14px 0 14px 16px; }',
    '.ac-msg + .ac-msg { border-top: 1px dashed var(--ac-rule); }',
    '.ac-msg::before { content: ""; position: absolute; left: 0; top: 16px;',
    '  bottom: 16px; width: 3px; border-radius: 2px; background: var(--ac-rule); }',
    '.ac-msg.is-dev { background: rgba(233,60,60,.05);',
    '  border-radius: 0 8px 8px 0; }',
    '.ac-msg.is-dev::before { background: var(--ac-red); top: 0; bottom: 0;',
    '  border-radius: 0; }',
    '.ac-who { font-family: "Figtree", sans-serif; font-size: 11.5px;',
    '  font-weight: 700; letter-spacing: .12em;',
    '  text-transform: uppercase; margin: 0 0 6px; opacity: .7; }',
    '.ac-msg.is-dev .ac-who { color: var(--ac-red); opacity: 1; }',
    '.ac-who small { font-weight: 300; letter-spacing: .06em; opacity: .6;',
    '  text-transform: none; margin-left: 10px; }',
    '.ac-text { font-size: 16px; font-weight: 400; line-height: 1.62; }',
    '.ac-text p { margin: 0 0 10px; } .ac-text p:last-child { margin-bottom: 0; }',
    '.ac-text a { color: var(--ac-red); }',
    '.ac-text blockquote { margin: 8px 0; padding: 2px 0 2px 12px;',
    '  border-left: 3px solid var(--ac-rule); opacity: .8; }',
    '.ac-text pre, .ac-text code { font-family: ui-monospace, monospace;',
    '  font-size: 13.5px; background: rgba(2,14,22,.06); border-radius: 4px; }',
    '.ac-text code { padding: 1px 5px; }',
    '.ac-text pre { padding: 10px 12px; overflow-x: auto; }',
    '.ac-spoiler { background: var(--ac-ink); color: var(--ac-ink);',
    '  border-radius: 3px; padding: 0 4px; cursor: pointer;',
    '  transition: color .2s ease; }',
    '.ac-spoiler.is-shown { color: var(--ac-paper); }',
    '.ac-hit { color: var(--ac-red); opacity: 1; font-weight: 700; }',
    '#askchris mark { background: rgba(233,60,60,.18); color: inherit;',
    '  border-radius: 2px; padding: 0 1px; }',
    /* the load-more button: a cream pill like everything else */
    '.ac-more { display: block; margin: 10px auto 0; padding: 11px 28px;',
    '  font-family: "Figtree", sans-serif; font-size: 12px; font-weight: 500;',
    '  letter-spacing: .16em; text-transform: uppercase; color: var(--ac-ink);',
    '  background: var(--ac-paper); border: 0; border-radius: 999px;',
    '  cursor: pointer; transition: color .15s ease, box-shadow .15s ease; }',
    '.ac-more:hover { color: var(--ac-red);',
    '  box-shadow: 0 0 0 3px rgba(233,60,60,.22); }',
    /* skeletons shimmer LIGHT on the dark page */
    '.ac-skel { height: 76px; border-radius: 12px;',
    '  margin-bottom: 14px; background: linear-gradient(100deg,',
    '  rgba(251,248,229,.08) 40%, rgba(251,248,229,.16) 50%, rgba(251,248,229,.08) 60%);',
    '  background-size: 200% 100%; animation: acShimmer 1.3s linear infinite; }',
    '@keyframes acShimmer { to { background-position: -200% 0; } }'
  ].join('\n');

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (kid) { if (kid) el.appendChild(kid); });
    return el;
  }

  function fmtDate(ts) {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleDateString('en-GB',
        { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return ''; }
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Wrap each search term's occurrences in <mark>, on escaped text. */
  function hilite(text, terms) {
    var safe = esc(text);
    if (!terms || !terms.length) return safe;
    terms.forEach(function (term) {
      var re = new RegExp('(' + esc(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      safe = safe.replace(re, '<mark>$1</mark>');
    });
    return safe;
  }

  function plain(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || '';
  }

  function renderThread(t, terms) {
    var q = t.messages[0];
    var previewText = q ? plain(q.html) : '';
    // are the matches visible up top, or buried in the replies?
    var head = (t.title + ' ' + previewText).toLowerCase();
    var buried = (terms || []).length &&
      !terms.every(function (x) { return head.indexOf(x) >= 0; });
    var thread = h('div', { class: 'ac-thread' });
    var top = h('button', { class: 'ac-top', type: 'button' }, [
      h('h3', { class: 'ac-title', html: hilite(t.title, terms) }),
      h('div', { class: 'ac-meta', html:
        fmtDate(t.createdAt) + ' &nbsp;\u00b7&nbsp; ' + t.replies +
        (t.replies === 1 ? ' reply' : ' replies') +
        (buried ? ' &nbsp;\u00b7&nbsp; <span class="ac-hit">match in replies</span>' : '') }),
      q ? h('p', { class: 'ac-preview', html: hilite(previewText, terms) }) : null
    ]);
    top.appendChild(h('span', { class: 'ac-chev', text: '\u25be' }));
    var body = h('div', { class: 'ac-body' }, [h('div', { class: 'ac-bodyin' },
      t.messages.map(function (m) {
        var dev = m.dev || m.chris; // (older cached payloads say "chris")
        return h('div', { class: 'ac-msg' + (dev ? ' is-dev' : '') }, [
          h('div', { class: 'ac-who', html:
            m.author +
            (m.replyTo ? '<small>replying to ' + m.replyTo + '</small>' : '') +
            '<small>' + fmtDate(m.ts) + '</small>' }),
          h('div', { class: 'ac-text', html: m.html })
        ]);
      }))]);
    top.addEventListener('click', function () {
      thread.classList.toggle('is-open');
    });
    thread.appendChild(top);
    thread.appendChild(body);
    return thread;
  }

  var portraitPick = PORTRAITS.length
    ? PORTRAITS[Math.floor(Math.random() * PORTRAITS.length)] : '';

  function render(root, data, keepQuery) {
    /* Pin the current height before emptying the node, so the page does
       not collapse and snap back while the new list is built. */
    var prevH = root.offsetHeight;
    var repaint = root.getAttribute('data-ac-painted') === '1';
    if (repaint && prevH > 100) root.style.minHeight = prevH + 'px';
    if (repaint) root.classList.add('ac-quiet');
    root.innerHTML = '';
    if (portraitPick) {
      var bgImg = h('img', { alt: '', src: portraitPick });
      bgImg.style.opacity = String(PORTRAIT_OPACITY);
      root.appendChild(h('div', { class: 'ac-bg' }, [
        h('div', { class: 'ac-bg-stick' }, [bgImg])
      ]));
    }
    var all = (data && data.threads) || [];
    if (window.console && console.info) console.info('[askchris] rendering ' + all.length + ' threads');
    if (!all.length) {
      root.appendChild(h('div', { class: 'ac-error', text: 'No threads yet.' }));
      return;
    }

    // one lowercase haystack per thread: title + every kept message
    all.forEach(function (t) {
      if (t._search) return;
      t._search = (t.title + ' ' + t.messages.map(function (m) {
        return m.author + ' ' + plain(m.html);
      }).join(' ')).toLowerCase();
    });

    /* search box */
    var input = h('input', { class: 'ac-input', type: 'search',
      placeholder: 'Search questions & answers\u2026',
      'aria-label': 'Search the archive' });
    var clear = h('button', { class: 'ac-clear', type: 'button',
      text: '\u00d7', 'aria-label': 'Clear search' });
    var count = h('div', { class: 'ac-count' });
    root.appendChild(h('div', { class: 'ac-search' }, [input, clear]));
    root.appendChild(count);

    var list = h('div', { class: 'ac-list' });
    root.appendChild(list);
    /* batches load on the button, and only on the button - predictable */
    var more = h('button', { class: 'ac-more', type: 'button', text: 'Load more posts' });
    root.appendChild(more);

    var CHUNK = 10;
    var current = [];
    var currentTerms = [];
    var shown = 0;
    function addChunk() {
      current.slice(shown, shown + CHUNK).forEach(function (t, n) {
        var card = renderThread(t, currentTerms);
        card.style.animationDelay = Math.min(n * 35, 240) + 'ms';
        list.appendChild(card);
      });
      shown = Math.min(current.length, shown + CHUNK);
      more.style.display = shown >= current.length ? 'none' : '';
    }
    more.addEventListener('click', addChunk);

    var swapTimer = null;
    function showList(threads, terms, instant) {
      current = threads;
      currentTerms = terms || [];
      if (!currentTerms.length) {
        count.textContent = '';
      } else if (!threads.length) {
        count.textContent = 'Nothing matches, try fewer or different words.';
      } else {
        count.textContent = threads.length +
          (threads.length === 1 ? ' matching thread' : ' matching threads');
      }
      var swap = function () {
        shown = 0;
        list.innerHTML = '';
        addChunk();
        list.classList.remove('is-fading');
        // release the held height once the fade-in has settled
        setTimeout(function () { list.style.minHeight = ''; }, 220);
      };
      clearTimeout(swapTimer);
      if (instant || !list.childNodes.length) {
        swap();
        return;
      }
      /* hold the current height so the page cannot hop, fade the old
         results out, then bring the new ones in */
      list.style.minHeight = list.offsetHeight + 'px';
      list.classList.add('is-fading');
      swapTimer = setTimeout(swap, 170);
    }

    function applyQuery() {
      var q = input.value.trim();
      clear.style.display = q ? '' : 'none';
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) { showList(all, [], firstFill); firstFill = false; return; }
      showList(all.filter(function (t) {
        return terms.every(function (x) { return t._search.indexOf(x) >= 0; });
      }), terms, firstFill);
      firstFill = false;
    }

    var firstFill = true;
    var deb = null;
    input.addEventListener('input', function () {
      clearTimeout(deb);
      deb = setTimeout(applyQuery, 120);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; applyQuery(); }
    });
    clear.addEventListener('click', function () {
      input.value = '';
      applyQuery();
      input.focus();
    });

    if (keepQuery) input.value = keepQuery;
    applyQuery();

    root.setAttribute('data-ac-painted', '1');
    requestAnimationFrame(function () {
      root.style.minHeight = '';
      root.classList.remove('ac-quiet');
      try { localStorage.setItem('ac-h', String(root.offsetHeight)); } catch (e) {}
    });
    return input;
  }


  function boot() {
    /* Logged so this file can be diagnosed from the console the way the
       top bar can: if you do not see this line, the script never ran. */
    if (window.console && console.info) {
      console.info('[askchris] boot | root found: ' +
        !!document.getElementById('askchris') +
        ' | cached: ' + (function(){ try { var v = localStorage.getItem('ac-last');
          return v ? v.length + ' chars' : 'none'; } catch(e){ return 'blocked'; } })());
    }

    var font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Figtree:wght@300..900&display=swap';
    document.head.appendChild(font);

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = document.getElementById('askchris');
    if (!root) {
      root = h('div', { id: 'askchris' });
      var here = document.currentScript;
      if (here && here.parentNode) here.parentNode.insertBefore(root, here);
      else document.body.appendChild(root);
    }

    // spoilers reveal on click (delegated once)
    root.addEventListener('click', function (e) {
      var sp = e.target.closest && e.target.closest('.ac-spoiler');
      if (sp) { sp.classList.toggle('is-shown'); e.stopPropagation(); }
    });

    /* Hold the space this page took last time, so it does not open
       collapsed and then shove everything down once data lands. */
    var lastH = 0;
    try { lastH = parseInt(localStorage.getItem('ac-h') || '0', 10) || 0; } catch (e) {}
    root.style.minHeight = (lastH > 200 ? lastH : Math.round(window.innerHeight * 0.7)) + 'px';

    // instant paint from the last visit, then a quiet refresh
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem('ac-last') || 'null'); } catch (e) {}
    var activeInput = null;
    if (cached && cached.threads) {
      activeInput = render(root, cached);
    } else {
      for (var i = 0; i < 4; i++) root.appendChild(h('div', { class: 'ac-skel' }));
    }

    var bucket = Math.floor(Date.now() / 600000);
    fetch(WORKER_URL.replace(/\/$/, '') + '/?t=' + bucket)
      .then(function (r) {
        if (window.console && console.info) console.info('[askchris] worker HTTP ' + r.status);
        return r.json();
      })
      .then(function (fresh) {
        if (!fresh || !fresh.threads) throw new Error('bad payload');
        try { localStorage.setItem('ac-last', JSON.stringify(fresh)); } catch (e) {}
        if (!cached || JSON.stringify(fresh) !== JSON.stringify(cached)) {
          activeInput = render(root, fresh, activeInput ? activeInput.value : '');
        }
        /* The worker crawls in bounded passes; if it says more threads are
           waiting, pump a few passes in the background and re-render once
           the archive is complete. Any visitor heals the backlog. */
        var pumps = 0;
        function pump() {
          if (pumps++ >= 8) return;
          fetch(WORKER_URL.replace(/\/$/, '') + '/?warm=1&r=' + Date.now())
            .then(function (r) { return r.json(); })
            .then(function (j) {
              if (j && j.backlog > 0) { setTimeout(pump, 4000); return; }
              return fetch(WORKER_URL.replace(/\/$/, '') + '/?t=' + Date.now())
                .then(function (r) { return r.json(); })
                .then(function (full) {
                  if (!full || !full.threads) return;
                  var same = false;
                  try { same = localStorage.getItem('ac-last') === JSON.stringify(full); } catch (e) {}
                  if (same) return;   // nothing changed, do not repaint
                  try { localStorage.setItem('ac-last', JSON.stringify(full)); } catch (e) {}
                  activeInput = render(root, full, activeInput ? activeInput.value : '');
                });
            })
            .catch(function () {});
        }
        if (fresh.backlog > 0) setTimeout(pump, 1500);
      })
      .catch(function (err) {
        if (window.console && console.warn) console.warn('[askchris] failed:', err);
        root.style.minHeight = '';
        if (cached && cached.threads) return; // stale beats an error
        root.innerHTML = '';
        root.appendChild(h('div', { class: 'ac-error', text: 'Could not load the archive right now.' }));
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();