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

  /* Ebb palette - adjust freely to match the page it sits on. */
  var CSS = [
    '#askchris { --ac-paper: #fbf8e5; --ac-ink: #020E16; --ac-red: #E93C3C;',
    '  --ac-rule: rgba(2,14,22,.15);',
    '  font-family: "Averia Serif Libre", Georgia, serif;',
    '  color: var(--ac-ink); max-width: 860px; margin: 0 auto; text-align: left; }',
    '#askchris * { box-sizing: border-box; }',
    '.ac-head { font-size: 13px; font-weight: 300; letter-spacing: .18em;',
    '  text-transform: uppercase; opacity: .6; margin: 0 0 18px; }',
    '.ac-thread { border: 1px solid var(--ac-rule); border-radius: 10px;',
    '  margin: 0 0 14px; background: var(--ac-paper); overflow: hidden; }',
    '.ac-top { display: block; width: 100%; text-align: left; font: inherit;',
    '  color: inherit; background: none; border: 0; cursor: pointer;',
    '  padding: 16px 18px; }',
    '.ac-top:hover .ac-title { color: var(--ac-red); }',
    '.ac-title { font-size: 20px; font-weight: 700; letter-spacing: -.01em;',
    '  margin: 0 0 6px; transition: color .15s ease; }',
    '.ac-meta { font-size: 12px; font-weight: 300; letter-spacing: .08em;',
    '  text-transform: uppercase; opacity: .55; }',
    '.ac-preview { font-size: 15px; font-weight: 300;',
    '  line-height: 1.55; opacity: .75; margin: 8px 0 0; display: -webkit-box;',
    '  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }',
    '.ac-body { display: none; border-top: 1px solid var(--ac-rule); padding: 4px 18px 16px; }',
    '.ac-thread.is-open .ac-body { display: block; }',
    '.ac-msg { position: relative; padding: 14px 0 14px 16px; }',
    '.ac-msg + .ac-msg { border-top: 1px dashed var(--ac-rule); }',
    '.ac-msg::before { content: ""; position: absolute; left: 0; top: 16px;',
    '  bottom: 16px; width: 3px; border-radius: 2px; background: var(--ac-rule); }',
    /* developer answers: indented, red spine, faint red wash */
    '.ac-msg.is-dev { margin-left: 26px; padding-left: 18px;',
    '  background: rgba(233,60,60,.05); border-radius: 0 8px 8px 0; }',
    '.ac-msg.is-dev::before { background: var(--ac-red); top: 0; bottom: 0;',
    '  border-radius: 0; }',
    '.ac-msg.is-dev + .ac-msg, .ac-msg + .ac-msg.is-dev { border-top: 0; }',
    '.ac-who { font-size: 12px; font-weight: 700; letter-spacing: .12em;',
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
    '.ac-search { position: relative; margin: 0 0 10px; }',
    '.ac-input { width: 100%; padding: 12px 44px 12px 18px; font-family: inherit;',
    '  font-size: 15px; color: var(--ac-ink); background: transparent;',
    '  border: 1px solid var(--ac-rule); border-radius: 999px; outline: none;',
    '  transition: border-color .15s ease, box-shadow .15s ease; }',
    '.ac-input::placeholder { font-weight: 300; opacity: .55; color: inherit; }',
    '.ac-input:focus { border-color: var(--ac-red);',
    '  box-shadow: 0 0 0 3px rgba(233,60,60,.12); }',
    '.ac-input::-webkit-search-cancel-button { display: none; }',
    '.ac-clear { position: absolute; right: 8px; top: 50%; transform: translateY(-50%);',
    '  width: 30px; height: 30px; border: 0; border-radius: 50%; cursor: pointer;',
    '  background: none; color: var(--ac-ink); font-size: 20px; line-height: 1;',
    '  opacity: .5; display: none; }',
    '.ac-clear:hover { opacity: 1; color: var(--ac-red); }',
    '.ac-count { font-size: 12px; font-weight: 300; letter-spacing: .1em;',
    '  text-transform: uppercase; opacity: .55; margin: 0 0 14px; min-height: 15px; }',
    '.ac-hit { color: var(--ac-red); opacity: 1; font-weight: 700; }',
    '#askchris mark { background: rgba(233,60,60,.18); color: inherit;',
    '  border-radius: 2px; padding: 0 1px; }',
    '.ac-more { display: block; margin: 6px auto 0; padding: 10px 26px;',
    '  font-family: inherit; font-size: 12.5px; font-weight: 300;',
    '  letter-spacing: .16em; text-transform: uppercase; color: var(--ac-ink);',
    '  background: none; border: 1px solid var(--ac-rule); border-radius: 999px;',
    '  cursor: pointer; transition: color .15s, border-color .15s; }',
    '.ac-more:hover { color: var(--ac-red); border-color: var(--ac-red); }',
    '.ac-loading, .ac-error { font-size: 14px; font-weight: 300;',
    '  letter-spacing: .1em; text-transform: uppercase; opacity: .55;',
    '  padding: 30px 0; text-align: center; }',
    '.ac-skel { height: 74px; border: 1px solid var(--ac-rule); border-radius: 10px;',
    '  margin-bottom: 14px; background: linear-gradient(100deg,',
    '  rgba(2,14,22,.05) 40%, rgba(2,14,22,.1) 50%, rgba(2,14,22,.05) 60%);',
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
    var body = h('div', { class: 'ac-body' },
      t.messages.map(function (m) {
        var dev = m.dev || m.chris; // (older cached payloads say "chris")
        return h('div', { class: 'ac-msg' + (dev ? ' is-dev' : '') }, [
          h('div', { class: 'ac-who', html:
            m.author +
            (m.replyTo ? '<small>replying to ' + m.replyTo + '</small>' : '') +
            '<small>' + fmtDate(m.ts) + '</small>' }),
          h('div', { class: 'ac-text', html: m.html })
        ]);
      }));
    top.addEventListener('click', function () {
      thread.classList.toggle('is-open');
    });
    thread.appendChild(top);
    thread.appendChild(body);
    return thread;
  }

  function render(root, data, keepQuery) {
    root.innerHTML = '';
    root.appendChild(h('div', { class: 'ac-head', text: 'Ask Chris \u2014 from the Esoteric Ebb Discord' }));
    var all = (data && data.threads) || [];
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

    var list = h('div', {});
    root.appendChild(list);
    var more = h('button', { class: 'ac-more', type: 'button', text: 'Load more posts' });
    root.appendChild(more);
    var io = null;
    if (window.IntersectionObserver) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) more.click(); });
      }, { rootMargin: '500px' });
      io.observe(more);
    }

    var CHUNK = 10;
    var current = [];
    var currentTerms = [];
    var shown = 0;
    function addChunk() {
      current.slice(shown, shown + CHUNK).forEach(function (t) {
        list.appendChild(renderThread(t, currentTerms));
      });
      shown = Math.min(current.length, shown + CHUNK);
      more.style.display = shown >= current.length ? 'none' : '';
    }
    more.addEventListener('click', addChunk);

    function showList(threads, terms) {
      current = threads;
      currentTerms = terms || [];
      shown = 0;
      list.innerHTML = '';
      if (!currentTerms.length) {
        count.textContent = '';
      } else if (!threads.length) {
        count.textContent = 'Nothing matches \u2014 try fewer or different words.';
      } else {
        count.textContent = threads.length +
          (threads.length === 1 ? ' matching thread' : ' matching threads');
      }
      addChunk();
    }

    function applyQuery() {
      var q = input.value.trim();
      clear.style.display = q ? '' : 'none';
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) { showList(all, []); return; }
      showList(all.filter(function (t) {
        return terms.every(function (x) { return t._search.indexOf(x) >= 0; });
      }), terms);
    }

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
    return input;
  }


  function boot() {
    var font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap';
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

    // instant paint from the last visit, then a quiet refresh
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem('ac-last') || 'null'); } catch (e) {}
    var activeInput = null;
    if (cached && cached.threads) {
      activeInput = render(root, cached);
    } else {
      root.appendChild(h('div', { class: 'ac-head', text: 'Ask Chris \u2014 from the Esoteric Ebb Discord' }));
      for (var i = 0; i < 4; i++) root.appendChild(h('div', { class: 'ac-skel' }));
    }

    var bucket = Math.floor(Date.now() / 600000);
    fetch(WORKER_URL.replace(/\/$/, '') + '/?t=' + bucket)
      .then(function (r) { return r.json(); })
      .then(function (fresh) {
        if (!fresh || !fresh.threads) throw new Error('bad payload');
        try { localStorage.setItem('ac-last', JSON.stringify(fresh)); } catch (e) {}
        if (!cached || JSON.stringify(fresh) !== JSON.stringify(cached)) {
          render(root, fresh, activeInput ? activeInput.value : '');
        }
      })
      .catch(function () {
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