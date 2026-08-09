/* =============================================================
   ESOTERIC EBB - COLLABORATORS

   Same language as the FAQ: rounded outlined boxes, no fills, the
   outline and the text in the bright Ebb green. Each entry is a
   wide box with a circular avatar standing to its left.

   Content lives in collaborators.txt, so names, roles, copy, links
   and avatar filenames are all editable without touching code.

   FONT: declared outright rather than inherited, because Carrd's
   own rules win inside an embed.

   INSTALL
   1. Upload ee-collaborators.js and collaborators.txt to CB_Site,
      and the avatars to CB_Site/images/.
   2. Replace the contents of #collaborators with one Carrd Embed
      (Type: Code, Style: Inline):

      <div id="ee-collab"></div>
      <script defer src="https://glitch951.github.io/CB_Site/ee-collaborators.js"></script>

   collaborators.txt FORMAT

      @intro
      Text under the heading. A blank line starts a new paragraph.

      ## Oscar Westberg
      role: Illustrator
      image: oscar-westberg.png
      link: Home | https://oscarwestberg.se/
      link: X | https://twitter.com/oscarwestberg

      Body paragraph one.

      Body paragraph two.

      ---            a thin rule, for grouping

   role, image and link only count directly under a ## name line.
   Everything after the first blank line is body text, where
   **bold**, *italic*, [link](https://url) and - bullets all work.
   image takes a bare filename, resolved against imageBase below,
   or a full https:// URL. An entry with no image shows its
   initials instead, which reads as deliberate while you gather
   the artwork.
   ============================================================= */

(function () {
  'use strict';
  if (window.__eeCollab) return;
  window.__eeCollab = true;

  var OPTS = {
    source:    'https://glitch951.github.io/CB_Site/collaborators.txt',
    imageBase: 'https://glitch951.github.io/CB_Site/images/',
    heading:   'Collaborators',
    sub:       "my so-called 'escargatoire'",

    avatar:    108,    // px
    maxWidth:  1020,   // px, the row including the avatar
    cacheBust: 5,      // minutes before an edit shows up. 0 disables it

    /* To use the sans cut of the same superfamily, change both. */
    font:     "'Averia Serif Libre'",
    fontHref: 'https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,400&display=swap'
  };

  var GREEN  = '#DAE5CF';
  var ORANGE = '#DB5B2C';

  function font() {
    if (!OPTS.fontHref || document.getElementById('ee-cb-font')) return;
    var l = document.createElement('link');
    l.id = 'ee-cb-font';
    l.rel = 'stylesheet';
    l.href = OPTS.fontHref;
    document.head.appendChild(l);
  }

  function styles() {
    var s = document.createElement('style');
    s.id = 'ee-collab-css';
    s.textContent = `
#ee-collab,#ee-collab *{box-sizing:border-box; font-family:${OPTS.font},Georgia,serif}
#ee-collab{
  max-width:${OPTS.maxWidth}px; margin:0 auto; text-align:left; color:${GREEN};
  padding:0 clamp(14px,4vw,24px) clamp(30px,6vw,70px);
}

.ee-cb-head{margin-bottom:clamp(26px,4vw,44px)}
.ee-cb-sub{
  font-size:.78em; letter-spacing:.2em; text-transform:uppercase;
  color:rgba(218,229,207,.55); margin-bottom:.5em;
}
.ee-cb-title{
  margin:0 0 .35em; color:${ORANGE}; font-weight:400;
  font-size:clamp(30px,4.5vw,54px); line-height:1;
  font-variant:small-caps; letter-spacing:.02em;
}
.ee-cb-intro{line-height:1.62; color:rgba(218,229,207,.8); max-width:70ch}
.ee-cb-intro > *{margin:0 0 .9em}
.ee-cb-intro > *:last-child{margin-bottom:0}
.ee-cb-intro a{color:${ORANGE}; text-decoration:none}
.ee-cb-intro a:hover{text-decoration:underline}
.ee-cb-intro strong{color:${GREEN}}

.ee-cb-rule{border:0; border-top:1px solid rgba(218,229,207,.12); margin:clamp(22px,3vw,34px) 0}

/* avatar outside the box, on its left */
.ee-cb-row{
  display:grid; grid-template-columns:${OPTS.avatar}px minmax(0,1fr);
  gap:clamp(16px,2.2vw,26px); align-items:start;
  margin-bottom:14px;
  opacity:0; transform:translateY(14px);
  transition:opacity .8s ease, transform .8s ease;
}
.ee-cb-row.is-in{opacity:1; transform:none}

.ee-cb-ava{
  width:${OPTS.avatar}px; height:${OPTS.avatar}px; border-radius:50%;
  overflow:hidden; margin-top:6px;
  border:1px solid rgba(218,229,207,.28);
  display:grid; place-items:center;
}
.ee-cb-ava img{width:100%; height:100%; object-fit:cover; display:block}
.ee-cb-ava.is-empty{color:rgba(218,229,207,.4); font-size:1.5em; letter-spacing:.06em}
.ee-cb-row:hover .ee-cb-ava{border-color:${ORANGE}}

/* the box: outlined, transparent, bright, like a FAQ answer */
.ee-cb-box{
  border:1px solid rgba(218,229,207,.28); border-radius:16px;
  padding:1.15em 1.35em 1.25em;
}
.ee-cb-row:hover .ee-cb-box{border-color:rgba(219,91,44,.55)}

.ee-cb-role{
  font-size:.72em; letter-spacing:.2em; text-transform:uppercase;
  color:${ORANGE}; margin-bottom:.35em;
}
.ee-cb-name{
  margin:0 0 .55em; color:${GREEN}; font-weight:400;
  font-size:clamp(20px,2.3vw,28px); line-height:1.1;
  font-variant:small-caps; letter-spacing:.015em;
}
.ee-cb-body{line-height:1.62; color:${GREEN}}
.ee-cb-body > *{margin:0 0 .85em}
.ee-cb-body > *:last-child{margin-bottom:0}
.ee-cb-body strong{color:#fff}
.ee-cb-body em{font-style:italic}
.ee-cb-body a{color:${ORANGE}; text-decoration:none}
.ee-cb-body a:hover{text-decoration:underline}
.ee-cb-body a strong{color:inherit}
.ee-cb-body ul{list-style:none; padding-left:0; margin-left:0}
.ee-cb-body li{position:relative; padding-left:1.3em}
.ee-cb-body li::before{
  content:"\\2022"; position:absolute; left:.25em; top:0; color:${ORANGE};
}

.ee-cb-links{margin-top:1em; display:flex; flex-wrap:wrap; gap:0 1.4em}
.ee-cb-links a{
  color:${ORANGE}; text-decoration:none;
  font-size:.74em; letter-spacing:.16em; text-transform:uppercase;
  border-bottom:1px solid transparent; padding-bottom:2px;
}
.ee-cb-links a:hover{border-bottom-color:${ORANGE}}

.ee-cb-msg{color:rgba(218,229,207,.55); font-style:italic; padding:2em 0}

@media (max-width:640px){
  .ee-cb-row{grid-template-columns:1fr; gap:14px}
  .ee-cb-ava{margin-top:0}
}
@media (prefers-reduced-motion:reduce){
  .ee-cb-row{opacity:1; transform:none; transition:none}
}`;
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
    var intro = [], rows = [], cur = null, buf = [], mode = null, meta = false;

    function flush() {
      if (mode === 'intro') { intro = buf; }
      else if (mode === 'entry' && cur) { cur.body = blocks(buf); rows.push(cur); cur = null; }
      buf = [];
    }

    txt.replace(/\r/g, '').split('\n').forEach(function (line) {
      var t = line.trim();
      var m2 = /^##\s+(.*)$/.exec(t);

      if (/^@intro\s*$/i.test(t)) { flush(); mode = 'intro'; return; }
      if (m2) {
        flush(); mode = 'entry'; meta = true;
        cur = { name: inline(m2[1].trim()), role: '', image: '', links: [], body: '' };
        return;
      }
      if (/^-{3,}\s*$/.test(t)) { flush(); mode = null; rows.push({ rule: true }); return; }

      if (mode === 'entry' && cur) {
        if (meta && t) {
          var kv = /^(role|image|avatar|link):\s*(.*)$/i.exec(t);
          if (kv) {
            var k = kv[1].toLowerCase(), v = kv[2].trim();
            if (k === 'role') cur.role = v;
            else if (k === 'image' || k === 'avatar') cur.image = v;
            else {
              var bits = v.split('|');
              if (bits.length >= 2) {
                cur.links.push({ label: bits[0].trim(), href: bits.slice(1).join('|').trim() });
              }
            }
            return;
          }
        }
        if (!t) meta = false;
      }
      if (mode) buf.push(line);
    });
    flush();

    return { intro: blocks(intro), rows: rows };
  }

  /* ---------- render ---------- */
  function url(src) {
    if (!src) return '';
    return /^https?:|^data:/i.test(src) ? src : OPTS.imageBase + src.replace(/^\//, '');
  }
  function initials(name) {
    return name.replace(/<[^>]*>/g, '').split(/\s+/).slice(0, 2)
      .map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }

  function rowHtml(p) {
    var img = url(p.image);
    var ava = img
      ? '<div class="ee-cb-ava"><img src="' + img + '" alt="" loading="lazy" decoding="async"></div>'
      : '<div class="ee-cb-ava is-empty">' + initials(p.name) + '</div>';

    return '<div class="ee-cb-row">' + ava +
      '<div class="ee-cb-box">' +
        (p.role ? '<div class="ee-cb-role">' + esc(p.role) + '</div>' : '') +
        '<h3 class="ee-cb-name">' + p.name + '</h3>' +
        '<div class="ee-cb-body">' + p.body + '</div>' +
        (p.links.length ? '<div class="ee-cb-links">' + p.links.map(function (l) {
          return '<a href="' + l.href + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>';
        }).join('') + '</div>' : '') +
      '</div></div>';
  }

  function render(root, data) {
    var html = '<div class="ee-cb-head">' +
      (OPTS.sub ? '<div class="ee-cb-sub">' + esc(OPTS.sub) + '</div>' : '') +
      '<h2 class="ee-cb-title">' + esc(OPTS.heading) + '</h2>' +
      (data.intro ? '<div class="ee-cb-intro">' + data.intro + '</div>' : '') +
      '</div>';

    data.rows.forEach(function (r) {
      html += r.rule ? '<hr class="ee-cb-rule">' : rowHtml(r);
    });
    root.innerHTML = html;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
      [].forEach.call(root.querySelectorAll('.ee-cb-row'), function (c) { io.observe(c); });
    } else {
      [].forEach.call(root.querySelectorAll('.ee-cb-row'), function (c) { c.classList.add('is-in'); });
    }
  }

  function bust(u) {
    if (!OPTS.cacheBust) return u;
    return u + (u.indexOf('?') === -1 ? '?' : '&') + 'v=' + Math.floor(Date.now() / (OPTS.cacheBust * 60000));
  }

  function init() {
    var root = document.getElementById('ee-collab');
    if (!root) return;
    font(); styles();
    root.innerHTML = '<p class="ee-cb-msg">Gathering the escargatoire...</p>';

    fetch(bust(OPTS.source), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        var data = parse(txt);
        if (!data.rows.length) throw new Error('empty');
        render(root, data);
      })
      .catch(function () {
        root.innerHTML = '<p class="ee-cb-msg">The collaborator list could not be loaded. ' +
          'Try again in a moment.</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
