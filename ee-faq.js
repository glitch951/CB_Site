/* =============================================================
   ESOTERIC EBB - FAQ

   Category headings and click to open answers. No search box,
   no filter buttons, no boxes. Content comes from faq.txt so it
   can be edited without touching code.

   FONT: nothing declared, everything inherits from Carrd.

   INSTALL
   1. Upload ee-faq.js and faq.txt to the CB_Site repo.
   2. Replace the contents of #faq with one Carrd Embed
      (Type: Code, Style: Inline):

      <div id="ee-faq"></div>
      <script defer src="https://glitch951.github.io/CB_Site/ee-faq.js"></script>

   faq.txt FORMAT
      @intro
      Lines here appear under the FAQ heading.

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
    source:    'https://glitch951.github.io/CB_Site/faq.txt',
    heading:   'FAQ',
    cacheBust: 5,      // minutes before an edit shows up. 0 disables it
    single:    false   // true means only one answer open at a time
  };

  function styles() {
    var s = document.createElement('style');
    s.id = 'ee-faq-css';
    s.textContent = `
#ee-faq,#ee-faq *{box-sizing:border-box}
#ee-faq{
  max-width:820px; margin:0 auto; text-align:left; color:#DAE5CF;
  padding:0 clamp(14px,4vw,24px) clamp(30px,6vw,70px);
}
.ee-faq-title{
  margin:0 0 .3em; color:#DB5B2C; font-weight:400;
  font-size:clamp(30px,4.5vw,54px); line-height:1;
  font-variant:small-caps; letter-spacing:.02em;
}
.ee-faq-intro{margin:0 0 clamp(26px,4vw,44px); color:rgba(218,229,207,.6); font-style:italic; line-height:1.55}
.ee-faq-intro p{margin:0}
.ee-faq-cat{
  margin:clamp(30px,4vw,52px) 0 .2em; color:#C1D3AE; font-weight:400;
  font-size:clamp(17px,2vw,22px); letter-spacing:.16em; text-transform:uppercase;
}
.ee-faq-cat:first-of-type{margin-top:0}
.ee-q{border-bottom:1px solid rgba(218,229,207,.10)}
.ee-q-btn{
  width:100%; display:flex; gap:.7em; align-items:baseline; text-align:left;
  padding:.85em 0; background:none; border:0; cursor:pointer; color:inherit;
  font:inherit; line-height:1.4; transition:color .25s ease;
}
.ee-q-btn:hover{color:#DB5B2C}
.ee-q-mark{flex:0 0 auto; color:#DB5B2C; opacity:.75; transition:transform .3s ease}
.ee-q.is-open .ee-q-btn{color:#DB5B2C}
.ee-q.is-open .ee-q-mark{transform:rotate(90deg); opacity:1}
.ee-a{overflow:hidden; height:0; transition:height .38s ease}
.ee-a-inner{padding:0 0 1.2em 1.5em; line-height:1.62; color:rgba(218,229,207,.78)}
.ee-a-inner > *{margin:0 0 .85em}
.ee-a-inner > *:last-child{margin-bottom:0}
.ee-a-inner ul{padding-left:1.1em}
.ee-a-inner a{color:#DB5B2C; text-decoration:none}
.ee-a-inner a:hover{text-decoration:underline}
.ee-faq-msg{color:rgba(218,229,207,.55); font-style:italic; padding:2em 0}
@media (max-width:560px){ .ee-a-inner{padding-left:0} }
@media (prefers-reduced-motion:reduce){ .ee-a,.ee-q-mark{transition:none} }`;
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
    var intro = [], groups = [], cat = null, item = null, buf = [], inIntro = false;
    function closeItem() {
      if (item) { item.a = blocks(buf); if (item.a) cat.items.push(item); }
      item = null; buf = [];
    }
    txt.replace(/\r/g, '').split('\n').forEach(function (line) {
      var t = line.trim();
      if (/^@intro\s*$/i.test(t)) { closeItem(); inIntro = true; cat = null; return; }
      var m2 = /^##\s+(.*)$/.exec(t);
      var m1 = /^#\s+(.*)$/.exec(t);
      if (m1 || m2) inIntro = false;
      if (m2) {
        closeItem();
        if (!cat) { cat = { category: '', items: [] }; groups.push(cat); }
        item = { q: inline(m2[1].trim()), a: '' };
        return;
      }
      if (m1) { closeItem(); cat = { category: m1[1].trim(), items: [] }; groups.push(cat); return; }
      if (inIntro) { intro.push(line); return; }
      if (item) buf.push(line);
    });
    closeItem();
    return { intro: blocks(intro), groups: groups.filter(function (g) { return g.items.length; }) };
  }

  /* ---------- render ---------- */
  function render(root, data) {
    var html = '<h2 class="ee-faq-title">' + OPTS.heading + '</h2>' +
      (data.intro ? '<div class="ee-faq-intro">' + data.intro + '</div>' : '');

    data.groups.forEach(function (g, gi) {
      if (g.category) html += '<h3 class="ee-faq-cat">' + esc(g.category) + '</h3>';
      g.items.forEach(function (it, i) {
        var id = 'eeq-' + gi + '-' + i;
        html += '<div class="ee-q">' +
          '<button class="ee-q-btn" aria-expanded="false" aria-controls="' + id + '">' +
            '<span class="ee-q-mark" aria-hidden="true">&rsaquo;</span>' +
            '<span class="ee-q-text">' + it.q + '</span>' +
          '</button>' +
          '<div class="ee-a" id="' + id + '"><div class="ee-a-inner">' + it.a + '</div></div>' +
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
      q.querySelector('.ee-a').style.height = q.querySelector('.ee-a-inner').offsetHeight + 'px';
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
            q.querySelector('.ee-a').style.height = q.querySelector('.ee-a-inner').offsetHeight + 'px';
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
    styles();
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
