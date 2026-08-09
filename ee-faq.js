/* =============================================================
   ESOTERIC EBB - FAQ

   Laid out like the Ask Chris page, but as an FAQ rather than a
   chat: each question is a rounded outlined box you can click,
   and its answer opens in a second outlined box below it. The
   boxes have no fill. The outline and the text are the bright
   Ebb green, the background stays transparent.

   Content comes from faq.txt, so the questions can be edited
   without touching any code.

   INSTALL
   1. Upload ee-faq.js and faq.txt to the CB_Site repo.
   2. Replace the contents of #faq with one Carrd Embed
      (Type: Code, Style: Inline):

      <div id="ee-faq"></div>
      <script defer src="https://glitch951.github.io/CB_Site/ee-faq.js"></script>

   faq.txt FORMAT
      @intro
      Lines here appear under the FAQ heading.

      @panel FAN MERCH POLICY
      A standing notice, always open, shown above the questions.
      Add as many as you like; they appear in the order written.

      # Category name
      ## The question?
      The answer. A blank line starts a new paragraph.

      - a dash makes a bullet

      **bold**, *italic* and [link text](https://url) work.
   ============================================================= */

(function () {
  'use strict';
  if (window.__eeFaq) return;
  window.__eeFaq = true;

  var OPTS = {
    source:  'https://glitch951.github.io/CB_Site/faq.txt',
    heading: 'FAQ',

    /* The font is declared outright rather than inherited, because
       Carrd's own rules were winning inside the embed. To switch to
       the sans cut of the same superfamily, change both lines to
       'Averia Sans Libre' and Averia+Sans+Libre. */
    font:     "'Averia Serif Libre'",
    fontHref: 'https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,400&display=swap',

    cacheBust: 5,      // minutes before an edit shows up. 0 disables it
    single:    false   // true means only one answer open at a time
  };

  var GREEN  = '#DAE5CF';
  var ORANGE = '#DB5B2C';

  function font() {
    if (!OPTS.fontHref || document.getElementById('ee-faq-font')) return;
    var l = document.createElement('link');
    l.id = 'ee-faq-font';
    l.rel = 'stylesheet';
    l.href = OPTS.fontHref;
    document.head.appendChild(l);
  }

  function styles() {
    var s = document.createElement('style');
    s.id = 'ee-faq-css';
    s.textContent = `
#ee-faq,#ee-faq *{box-sizing:border-box; font-family:${OPTS.font},Georgia,serif}
#ee-faq{
  max-width:820px; margin:0 auto; text-align:left; color:${GREEN};
  padding:0 clamp(14px,4vw,24px) clamp(30px,6vw,70px);
}
.ee-faq-title{
  margin:0 0 .3em; color:${ORANGE}; font-weight:400;
  font-size:clamp(30px,4.5vw,54px); line-height:1;
  font-variant:small-caps; letter-spacing:.02em;
}
.ee-faq-intro{margin:0 0 clamp(26px,4vw,44px); color:rgba(218,229,207,.6); font-style:italic; line-height:1.55}
.ee-faq-intro p{margin:0}
/* a standing notice, always open, sat above the questions */
.ee-faq-panel{
  border:1px solid rgba(219,91,44,.55); border-radius:16px;
  padding:1.1em 1.3em 1.2em; margin:0 0 clamp(26px,4vw,42px);
}
.ee-faq-panel-title{
  margin:0 0 .65em; color:${ORANGE}; font-weight:400;
  font-size:clamp(15px,1.6vw,19px); letter-spacing:.18em; line-height:1.2;
}
.ee-faq-panel-body{line-height:1.62; color:${GREEN}}
.ee-faq-panel-body > *{margin:0 0 .85em}
.ee-faq-panel-body > *:last-child{margin-bottom:0}
.ee-faq-panel-body li{margin-bottom:.5em}
.ee-faq-panel-body li:last-child{margin-bottom:0}
.ee-faq-panel-body a{color:${ORANGE}; text-decoration:none}
.ee-faq-panel-body a:hover{text-decoration:underline}

.ee-faq-cat{
  margin:clamp(30px,4vw,52px) 0 .9em; color:#C1D3AE; font-weight:400;
  font-size:clamp(17px,2vw,22px); letter-spacing:.16em; text-transform:uppercase;
}
.ee-faq-cat:first-of-type{margin-top:0}

.ee-q{margin-bottom:10px}

/* the question: outlined, transparent, bright */
.ee-q-btn{
  width:100%; display:flex; align-items:center; gap:16px; text-align:left; cursor:pointer;
  padding:.8em 1.1em; background:transparent; color:${GREEN};
  border:1px solid rgba(218,229,207,.42); border-radius:16px;
  font-size:clamp(15px,1.35vw,18px); line-height:1.45;
  transition:none;
}
.ee-q-btn:hover,.ee-q-btn:focus-visible{color:${ORANGE}; border-color:${ORANGE}}
.ee-q.is-open .ee-q-btn{color:${ORANGE}; border-color:${ORANGE}}
.ee-q-text{flex:1}

/* plus that becomes a minus */
.ee-q-mark{position:relative; flex:0 0 auto; width:13px; height:13px}
.ee-q-mark::before,.ee-q-mark::after{
  content:""; position:absolute; left:0; top:6px; width:13px; height:1.5px;
  background:currentColor;
}
.ee-q-mark::after{transform:rotate(90deg); transition:transform .25s ease}
.ee-q.is-open .ee-q-mark::after{transform:rotate(0deg)}

/* the answer: same treatment, dimmer outline, indented */
.ee-a{height:0; overflow:hidden; transition:height .35s ease}
.ee-a-pad{padding:8px 0 0 clamp(0px,2.4vw,34px)}
.ee-a-inner{
  border:1px solid rgba(218,229,207,.22); border-radius:16px;
  padding:1em 1.2em; line-height:1.62; color:${GREEN};
}
.ee-a-inner > *{margin:0 0 .85em}
.ee-a-inner > *:last-child{margin-bottom:0}
/* Carrd resets lists to list-style:none, which swallowed the bullets.
   These are drawn as content instead, so nothing can strip them. */
.ee-a-inner ul,.ee-faq-panel-body ul{list-style:none; padding-left:0; margin-left:0}
.ee-a-inner li,.ee-faq-panel-body li{position:relative; padding-left:1.3em}
.ee-a-inner li::before,.ee-faq-panel-body li::before{
  content:"\\2022"; position:absolute; left:.25em; top:0;
  color:${ORANGE}; font-size:1.05em; line-height:inherit;
}
.ee-a-inner a{color:${ORANGE}; text-decoration:none}
.ee-a-inner a:hover{text-decoration:underline}
.ee-a-inner strong,.ee-faq-panel-body strong{color:${GREEN}}
.ee-a-inner a strong{color:inherit}

.ee-faq-msg{color:rgba(218,229,207,.55); font-style:italic; padding:2em 0}
@media (prefers-reduced-motion:reduce){ .ee-a,.ee-q-mark::after{transition:none} }`;
    document.head.appendChild(s);
  }

  /* ---------- plaintext parsing ---------- */
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function inline(s) {
    return esc(s)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, txt, href) {
        var ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
        return '<a href="' + href + '"' + ext + '>' + txt + '</a>';
      })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  }
  function blocks(lines) {
    var out = [], para = [], list = [];
    function flushP() { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } }
    function flushL() {
      if (list.length) {
        out.push('<ul>' + list.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + '</ul>');
        list = [];
      }
    }
    lines.forEach(function (raw) {
      var line = raw.trim();
      if (!line) { flushP(); flushL(); return; }
      if (/^-\s+/.test(line)) { flushP(); list.push(line.replace(/^-\s+/, '')); return; }
      flushL(); para.push(line);
    });
    flushP(); flushL();
    return out.join('');
  }
  function parse(txt) {
    var intro = [], panels = [], groups = [];
    var cat = null, item = null, panel = null, buf = [], mode = null;

    function flush() {
      if (mode === 'intro') { intro = buf; }
      else if (mode === 'panel' && panel) { panel.body = blocks(buf); panels.push(panel); panel = null; }
      else if (mode === 'item' && item) {
        item.a = blocks(buf);
        if (item.a) cat.items.push(item);
        item = null;
      }
      buf = [];
    }

    txt.replace(/\r/g, '').split('\n').forEach(function (line) {
      var t = line.trim();
      var pm = /^@panel\s+(.*)$/i.exec(t);
      var m2 = /^##\s+(.*)$/.exec(t);
      var m1 = /^#\s+(.*)$/.exec(t);

      if (/^@intro\s*$/i.test(t)) { flush(); mode = 'intro'; return; }
      if (pm) { flush(); mode = 'panel'; panel = { title: pm[1].trim(), body: '' }; return; }
      if (m2) {
        flush();
        if (!cat) { cat = { category: '', items: [] }; groups.push(cat); }
        mode = 'item'; item = { q: inline(m2[1].trim()), a: '' };
        return;
      }
      if (m1) { flush(); cat = { category: m1[1].trim(), items: [] }; groups.push(cat); mode = null; return; }
      if (mode) buf.push(line);
    });
    flush();

    return {
      intro: blocks(intro),
      panels: panels,
      groups: groups.filter(function (g) { return g.items.length; })
    };
  }

  /* ---------- render ---------- */
  function render(root, data) {
    var html = '<h2 class="ee-faq-title">' + OPTS.heading + '</h2>' +
      (data.intro ? '<div class="ee-faq-intro">' + data.intro + '</div>' : '');

    (data.panels || []).forEach(function (p) {
      html += '<section class="ee-faq-panel">' +
        '<h3 class="ee-faq-panel-title">' + esc(p.title) + '</h3>' +
        '<div class="ee-faq-panel-body">' + p.body + '</div>' +
      '</section>';
    });

    data.groups.forEach(function (g, gi) {
      if (g.category) html += '<h3 class="ee-faq-cat">' + esc(g.category) + '</h3>';
      g.items.forEach(function (it, i) {
        var id = 'eeq-' + gi + '-' + i;
        html += '<div class="ee-q">' +
          '<button class="ee-q-btn" aria-expanded="false" aria-controls="' + id + '">' +
            '<span class="ee-q-text">' + it.q + '</span>' +
            '<span class="ee-q-mark" aria-hidden="true"></span>' +
          '</button>' +
          '<div class="ee-a" id="' + id + '"><div class="ee-a-pad">' +
            '<div class="ee-a-inner">' + it.a + '</div>' +
          '</div></div>' +
        '</div>';
      });
    });
    root.innerHTML = html;
  }

  function wire(root) {
    var items = [].slice.call(root.querySelectorAll('.ee-q'));
    function close(q) {
      q.classList.remove('is-open');
      q.querySelector('.ee-q-btn').setAttribute('aria-expanded', 'false');
      q.querySelector('.ee-a').style.height = '0px';
    }
    function open(q) {
      if (OPTS.single) items.forEach(function (o) { if (o !== q && o.classList.contains('is-open')) close(o); });
      q.classList.add('is-open');
      q.querySelector('.ee-q-btn').setAttribute('aria-expanded', 'true');
      q.querySelector('.ee-a').style.height = q.querySelector('.ee-a-pad').offsetHeight + 'px';
    }
    items.forEach(function (q) {
      q.querySelector('.ee-q-btn').addEventListener('click', function () {
        q.classList.contains('is-open') ? close(q) : open(q);
      });
    });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        items.forEach(function (q) {
          if (q.classList.contains('is-open')) {
            q.querySelector('.ee-a').style.height = q.querySelector('.ee-a-pad').offsetHeight + 'px';
          }
        });
      }, 140);
    }, { passive: true });
  }

  function bust(u) {
    if (!OPTS.cacheBust) return u;
    return u + (u.indexOf('?') === -1 ? '?' : '&') + 'v=' + Math.floor(Date.now() / (OPTS.cacheBust * 60000));
  }

  function init() {
    var root = document.getElementById('ee-faq');
    if (!root) return;
    font(); styles();
    root.innerHTML = '<p class="ee-faq-msg">Fetching the questions...</p>';

    fetch(bust(OPTS.source), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        var data = parse(txt);
        if (!data.groups.length) throw new Error('empty');
        render(root, data); wire(root);
      })
      .catch(function () {
        root.innerHTML = '<p class="ee-faq-msg">The questions could not be loaded. Try again in a moment.</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
