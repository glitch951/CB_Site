/* cb-feeds - Cloudflare Worker
   Serves two JSON feeds with CORS open and 1-hour caching:
     /?feed=steam  -> Steam devlog posts for every appid in APPS
     /?feed=press  -> news coverage for the queries in PRESS_QUERIES
   Add &debug=1 to either one to see what it found and why.
   Deploy at dash.cloudflare.com > Compute (Workers) > cb-feeds > Edit code. */

// Games to mirror. The number is the appid from the Steam store URL.
const APPS = [
  { id: 2057760, name: 'Esoteric Ebb' },
  { id: 1299690, name: 'Gori: Cuddly Carnage' },
  { id: 648800,  name: 'Raft' }
];

// Only your own announcements/devlogs. Set to null to let everything through
// (patch notes, sales, and press articles Steam syndicates into the news feed).
const FEED_FILTER = 'steam_community_announcements';

// Titles containing any of these are dropped from the devlog list.
const DEVLOG_TITLE_BLOCKLIST = [];

// Press searches. Every one runs; results are merged and de-duplicated.
// Both spellings of the surname matter: most outlets drop the å.
const PRESS_QUERIES = [
  '"Christoffer Bodegård"',
  '"Christoffer Bodegard"',
  '"Esoteric Ebb" interview',
  '"Esoteric Ebb" podcast'
];

// Domains you never want on the press page.
const PRESS_BLOCKLIST = ['store.steampowered.com', 'reddit.com', 'youtube.com/shorts'];

// Try to pull a thumbnail from the article page. Costs one fetch per article.
const PRESS_THUMBS = true;
const PRESS_THUMB_COUNT = 9;

const CORS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'cache-control': 'public, max-age=3600'
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const feed = url.searchParams.get('feed');
    const debug = url.searchParams.get('debug');
    try {
      if (feed === 'press') return json(await press(debug));
      return json(await steam());
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err && err.stack || err) }),
        { status: 500, headers: CORS });
    }
  }
};

function json(data) {
  return new Response(JSON.stringify(data), { headers: CORS });
}

/* ---------- Steam ------------------------------------------------ */
async function steam() {
  const all = [];
  for (const app of APPS) {
    const url = 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/'
      + '?maxlength=0&count=40&appid=' + app.id;
    const res = await fetch(url, { cf: { cacheTtl: 3600 } });
    if (!res.ok) continue;
    const data = await res.json();
    const items = ((data.appnews || {}).newsitems) || [];
    for (const it of items) {
      if (FEED_FILTER && it.feedname !== FEED_FILTER) continue;
      if (DEVLOG_TITLE_BLOCKLIST.some(b => it.title.toLowerCase().includes(b.toLowerCase()))) continue;
      all.push({
        title: it.title,
        url: it.url,
        date: it.date,
        contents: it.contents,
        feedname: it.feedname,
        gameName: app.name,
        appid: app.id
      });
    }
  }
  all.sort((a, b) => b.date - a.date);
  return all;
}

/* ---------- Press ------------------------------------------------ */
async function press(debug) {
  const log = [];
  let items = [];

  for (const q of PRESS_QUERIES) {
    const bing = await bingNews(q);
    log.push({ source: 'bing', query: q, found: bing.length });
    items = items.concat(bing);
  }

  if (!items.length) {
    for (const q of PRESS_QUERIES) {
      const goog = await googleNews(q);
      log.push({ source: 'google', query: q, found: goog.length });
      items = items.concat(goog);
    }
  }

  // de-duplicate on normalised title
  const seen = new Set();
  items = items.filter(it => {
    if (!it.title || !it.url) return false;
    if (PRESS_BLOCKLIST.some(b => it.url.includes(b))) return false;
    const key = it.title.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  items.sort((a, b) => (b.ts || 0) - (a.ts || 0));

  if (PRESS_THUMBS) {
    const head = items.slice(0, PRESS_THUMB_COUNT);
    await Promise.all(head.map(async it => {
      it.image = await ogImage(it.url);
    }));
  }

  if (debug) return { count: items.length, log, items };
  return items;
}

async function bingNews(q) {
  const url = 'https://www.bing.com/news/search?q=' + encodeURIComponent(q) + '&format=RSS&count=30';
  const xml = await getText(url);
  return parseRss(xml).map(it => Object.assign(it, { outlet: it.outlet || hostOf(it.url) }));
}

async function googleNews(q) {
  const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q)
    + '&hl=en-US&gl=US&ceid=US:en';
  const xml = await getText(url);
  return parseRss(xml).map(it => {
    // Google wraps links in a redirect; the real one is usually in the description
    const m = /href=["'](https?:\/\/(?!news\.google)[^"']+)["']/.exec(it.raw || '');
    if (m) it.url = m[1];
    it.title = it.title.replace(/\s+-\s+[^-]{2,40}$/, '');
    it.outlet = it.outlet || hostOf(it.url);
    return it;
  });
}

async function getText(url) {
  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 3600 },
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
    if (!res.ok) return '';
    return await res.text();
  } catch (e) {
    return '';
  }
}

function parseRss(xml) {
  const out = [];
  const blocks = String(xml || '').split(/<item[\s>]/).slice(1);
  for (const block of blocks) {
    const title = clean(tag(block, 'title'));
    const link = clean(tag(block, 'link')) || attr(block, 'link', 'href');
    const pub = clean(tag(block, 'pubDate'));
    const source = clean(tag(block, 'source'));
    const desc = tag(block, 'description');
    if (!title || !link) continue;
    const ts = pub ? Date.parse(pub) : 0;
    out.push({
      title,
      url: link,
      outlet: source,
      summary: clean(desc).replace(/<[^>]+>/g, '').trim().slice(0, 320),
      raw: desc,
      ts: isNaN(ts) ? 0 : ts,
      date: ts ? new Date(ts).toLocaleDateString('en-GB',
        { month: 'short', year: 'numeric' }).toUpperCase() : ''
    });
  }
  return out;
}

async function ogImage(url) {
  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 86400 },
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; cb-feeds/1.0)' }
    });
    if (!res.ok) return '';
    const html = (await res.text()).slice(0, 120000);
    const m = /<meta[^>]+(?:property|name)=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i.exec(html)
      || /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i.exec(html);
    if (!m) return '';
    let src = m[1];
    if (src.startsWith('//')) src = 'https:' + src;
    if (src.startsWith('/')) src = new URL(url).origin + src;
    return src;
  } catch (e) {
    return '';
  }
}

function hostOf(u) {
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
}

function tag(block, name) {
  const m = new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>').exec(block);
  return m ? m[1] : '';
}

function attr(block, name, a) {
  const m = new RegExp('<' + name + '[^>]*\\s' + a + '=["\']([^"\']+)["\']').exec(block);
  return m ? m[1] : '';
}

function clean(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}
