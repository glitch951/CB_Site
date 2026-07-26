/* cb-feeds - Cloudflare Worker
   Serves two JSON feeds with CORS open and 1-hour caching:
     /?feed=steam  -> Steam devlog posts for every appid in APPS
     /?feed=press  -> news coverage for the queries in PRESS_QUERIES
   Add &debug=1 to either one to see what it found and why.
   Deploy at dash.cloudflare.com > Compute (Workers) > cb-feeds > Edit code. */

// Games to mirror. The number is the appid from the Steam store URL.
const APPS = [
  { id: 2057760, name: 'Esoteric Ebb' }
];

// Only your own announcements/devlogs. Set to null to let everything through
// (patch notes, sales, and press articles Steam syndicates into the news feed).
const FEED_FILTER = 'steam_community_announcements';

// Titles containing any of these are dropped from the devlog list.
const DEVLOG_TITLE_BLOCKLIST = [];

// Press searches. Every one runs; results are merged and de-duplicated.
// Both spellings of the surname matter: most outlets drop the å.
const PRESS_QUERIES = [
  'Christoffer Bodegard',
  '"Christoffer Bodegård"',
  '"Esoteric Ebb" interview',
  '"Esoteric Ebb" review',
  '"Esoteric Ebb" podcast',
  '"Esoteric Ebb" developer'
];

// Domains you never want on the press page.
const PRESS_BLOCKLIST = ['store.steampowered.com', 'reddit.com', 'youtube.com/shorts'];

// URL patterns that are index pages rather than articles.
const PRESS_URL_JUNK = ['/tag/', '/tags/', '/topic/', '/topics/', '/category/',
  '/categories/', '/author/', '/people/', '/search', '/games/'];

// A "headline" that is really just a name or a label is a listing page.
function looksLikeIndexPage(it) {
  const t = (it.title || '').trim();
  if (t.length < 22) return true;
  if (/^(christoffer\s+bodeg[åa]rd|esoteric\s+ebb)$/i.test(t)) return true;
  const u = (it.url || '').toLowerCase();
  return PRESS_URL_JUNK.some(p => u.includes(p));
}

// Try to pull a thumbnail from the article page. Costs one fetch per article.
const PRESS_THUMBS = true;
const PRESS_THUMB_COUNT = 40;

const CORS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'cache-control': 'public, max-age=600'
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const feed = url.searchParams.get('feed');
    const debug = url.searchParams.get('debug');
    try {
      if (feed === 'press') return json(await press(debug));
      return json(await steam(debug));
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
/* Steam's news API doesn't carry the capsule image an announcement shows on the
   store page, so pull the events list too and match them up by gid. */
async function capsules(appid) {
  const map = {};
  try {
    const url = 'https://store.steampowered.com/events/ajaxgetpartnereventspageable/' +
      '?clan_accountid=0&appid=' + appid + '&offset=0&count=100&l=english' +
      '&origin=' + encodeURIComponent('https://store.steampowered.com');
    const res = await fetch(url, { cf: { cacheTtl: 3600 } });
    if (!res.ok) return map;
    const data = await res.json();
    for (const ev of (data.events || [])) {
      const gid = String((ev.announcement_body && ev.announcement_body.gid) || ev.gid || '');
      let jd = ev.jsondata;
      if (typeof jd === 'string') { try { jd = JSON.parse(jd); } catch (e) { jd = null; } }
      const caps = (jd && (jd.localized_capsule_image || jd.localized_title_image)) || [];
      const file = Array.isArray(caps) ? caps.find(Boolean) : caps;
      if (gid && file) {
        map[gid] = /^https?:/.test(file)
          ? file
          : 'https://clan.cloudflare.steamstatic.com/images/' + file.replace(/^\/+/, '');
      }
    }
  } catch (e) {}
  return map;
}

function gidFromUrl(u) {
  const m = /\/(\d{6,})\/?(?:\?|$)/.exec(String(u || ''));
  return m ? m[1] : '';
}

async function steam(debug) {
  const all = [];
  const notes = [];
  for (const app of APPS) {
    const caps = await capsules(app.id);
    notes.push({ appid: app.id, capsulesFound: Object.keys(caps).length });
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
        appid: app.id,
        gid: it.gid || gidFromUrl(it.url),
        image: caps[it.gid] || caps[gidFromUrl(it.url)] || ''
      });
    }
  }
  all.sort((a, b) => b.date - a.date);

  // Anything still without a capsule: read og:image off the announcement page itself.
  const missing = all.filter(p => !p.image).slice(0, 24);
  await Promise.all(missing.map(async p => {
    const gid = p.gid || gidFromUrl(p.url);
    if (!gid) return;
    const page = 'https://steamcommunity.com/games/' + p.appid + '/announcements/detail/' + gid;
    p.image = await ogImage(page);
  }));

  if (debug) {
    return { count: all.length, withImage: all.filter(p => p.image).length, notes,
      sample: all.slice(0, 5).map(p => ({ title: p.title, gid: p.gid, image: p.image })) };
  }
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

  // Google News is run as well, not just as a fallback: it surfaces a lot that
  // Bing misses, and it gives real publisher links so thumbnails can be read.
  for (const q of PRESS_QUERIES) {
    const goog = await googleNews(q);
    log.push({ source: 'google', query: q, found: goog.length });
    items = items.concat(goog);
  }

  // de-duplicate on normalised title
  const seen = new Set();
  items = items.filter(it => {
    if (!it.title || !it.url) return false;
    if (PRESS_BLOCKLIST.some(b => it.url.includes(b))) return false;
    if (looksLikeIndexPage(it)) return false;
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

  items = items.map(it => ({
    title: it.title, url: it.url, outlet: it.outlet,
    summary: it.summary, date: it.date, ts: it.ts, image: it.image || ''
  }));

  if (debug) return { count: items.length, log, items };
  return items;
}

async function bingNews(q) {
  const url = 'https://www.bing.com/news/search?q=' + encodeURIComponent(q) + '&format=RSS&count=50';
  const xml = await getText(url);
  return parseRss(xml).map(it => {
    it.url = unwrapBing(it.url);
    it.outlet = prettyOutlet(hostOf(it.url));
    return it;
  });
}

// Bing wraps every link in a redirect. Pull the real publisher URL back out.
function unwrapBing(u) {
  try {
    const parsed = new URL(u);
    if (!/bing\.com$/.test(parsed.hostname.replace(/^www\./, ''))) return u;
    const real = parsed.searchParams.get('url');
    return real ? decodeURIComponent(real) : u;
  } catch (e) {
    return u;
  }
}

const OUTLET_NAMES = {
  'pcgamer.com': 'PC Gamer',
  'polygon.com': 'Polygon',
  'rockpapershotgun.com': 'Rock Paper Shotgun',
  'eurogamer.net': 'Eurogamer',
  'gamesradar.com': 'GamesRadar',
  'kotaku.com': 'Kotaku',
  'ign.com': 'IGN',
  'gamedeveloper.com': 'Game Developer',
  'destructoid.com': 'Destructoid',
  'pcgamesn.com': 'PCGamesN',
  'rpgsite.net': 'RPG Site',
  'gamespot.com': 'GameSpot'
};

function prettyOutlet(host) {
  if (!host) return '';
  if (OUTLET_NAMES[host]) return OUTLET_NAMES[host];
  const base = host.replace(/\.(com|net|org|se|co\.uk|io|gg|news)$/, '');
  return base.split('.').pop().replace(/(^|[-_])(\w)/g, (m, a, b) => (a ? ' ' : '') + b.toUpperCase());
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
    it.outlet = prettyOutlet(hostOf(it.url));
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
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCharCode(parseInt(n, 16)))
    .trim();
}
