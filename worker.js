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
  'Christoffer Bodegård'
];

// Every result must actually be about him, not just about the game.
const PRESS_MUST_MATCH = /bodeg[\u00e5a]rd/i;

// Domains you never want on the press page.
const PRESS_BLOCKLIST = ['store.steampowered.com', 'reddit.com', 'youtube.com/shorts',
  'msn.com', 'news.yahoo.com', 'flipboard.com', 'newsbreak.com'];

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
   store page. Try the events endpoints, then fall back to scraping the store's
   own news page. Whichever works first wins. */
function clanImage(file) {
  if (!file) return '';
  if (/^https?:/.test(file)) return file;
  return 'https://clan.cloudflare.steamstatic.com/images/' + String(file).replace(/^\/+/, '');
}

function isJunkImage(u) {
  return !u || /steam_share_image|steamcommunity\/public\/images|apps\/\d+\/header/.test(u);
}

async function eventsJson(url) {
  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 3600 },
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'accept': 'application/json, text/plain, */*'
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

function normTitle(t) {
  return String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 60);
}

/* Steam uses a different gid for the event and for the announcement, and the news
   API only gives one of them. Index on every id we can see plus the headline. */
function harvestEvents(data, map) {
  for (const ev of ((data && data.events) || [])) {
    let jd = ev.jsondata;
    if (typeof jd === 'string') { try { jd = JSON.parse(jd); } catch (e) { jd = null; } }
    const caps = (jd && (jd.localized_capsule_image || jd.localized_title_image)) || [];
    const file = Array.isArray(caps) ? caps.find(Boolean) : caps;
    const url = clanImage(file);
    if (!url || isJunkImage(url)) continue;

    const body = ev.announcement_body || {};
    [ev.gid, ev.announcement_gid, body.gid, body.clanid, ev.unique_id]
      .filter(Boolean)
      .forEach(id => { map.byGid[String(id)] = url; });

    const title = body.headline || ev.event_name || ev.name || '';
    if (title) map.byTitle[normTitle(title)] = url;
  }
}

async function capsules(appid, notes) {
  const map = { byGid: {}, byTitle: {} };
  const base = 'https://store.steampowered.com/events/ajaxgetpartnereventspageable/';

  const tries = [
    base + '?clan_accountid=0&appid=' + appid + '&offset=0&count=100&l=english&origin=' +
      encodeURIComponent('https://store.steampowered.com'),
    base + '?clan_accountid=0&appid=' + appid + '&offset=0&count=100&l=english',
    base + '?appid=' + appid + '&offset=0&count=100&l=english'
  ];

  for (const url of tries) {
    const data = await eventsJson(url);
    harvestEvents(data, map);
    if (notes) notes.push({ source: 'events', gids: Object.keys(map.byGid).length,
      titles: Object.keys(map.byTitle).length });
    if (Object.keys(map.byTitle).length) return map;
  }

  // last resort: the store news page embeds the same data as escaped JSON
  try {
    const res = await fetch('https://store.steampowered.com/news/app/' + appid, {
      cf: { cacheTtl: 3600 },
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; cb-feeds/1.0)' }
    });
    if (res.ok) {
      const html = await res.text();
      const re = /"gid"\s*:\s*\\?"(\d{6,})\\?"[\s\S]{0,6000}?localized_capsule_image\\?"\s*:\s*\[\s*\\?"([^"\\]+)/g;
      let m;
      while ((m = re.exec(html))) {
        const url = clanImage(m[2]);
        if (!map.byGid[m[1]] && !isJunkImage(url)) map.byGid[m[1]] = url;
      }
      if (notes) notes.push({ source: 'newspage', gids: Object.keys(map.byGid).length });
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
    const caps = await capsules(app.id, notes);
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
        image: caps.byGid[it.gid] || caps.byGid[gidFromUrl(it.url)] ||
               caps.byTitle[normTitle(it.title)] || ''
      });
    }
  }
  all.sort((a, b) => b.date - a.date);

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

  // Open each candidate once: confirm the name really appears in the article and
  // take its preview image while we are there.
  const candidates = items.slice(0, PRESS_VERIFY_COUNT);
  await Promise.allSettled(candidates.map(async it => {
    const page = await readArticle(it.url);
    it.image = page.image || '';
    it.verified = page.ok
      ? page.mentions
      : PRESS_MUST_MATCH.test((it.title || '') + ' ' + (it.summary || ''));
  }));

  const before = items.length;
  items = candidates.filter(it => it.verified);
  log.push({ stage: 'verified', checked: candidates.length, kept: items.length, dropped: before - items.length });

  items.sort((a, b) => (b.ts || 0) - (a.ts || 0));
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

async function resolveGoogleLink(url) {
  if (!/news\.google\.com/.test(url)) return url;
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      cf: { cacheTtl: 86400 },
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });
    if (res.url && !/news\.google\.com/.test(res.url)) return res.url;
    const html = await res.text();
    const m = /<a[^>]+href=["'](https?:\/\/(?!news\.google)[^"']+)["']/.exec(html)
      || /data-n-au=["'](https?:\/\/[^"']+)["']/.exec(html)
      || /url=(https?%3A%2F%2F[^"'&]+)/.exec(html);
    if (m) return decodeURIComponent(m[1]);
  } catch (e) {}
  return url;
}

async function googleNews(q) {
  const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q)
    + '&hl=en-US&gl=US&ceid=US:en';
  const xml = await getText(url);
  const items = parseRss(xml).map(it => {
    const m = /href=["'](https?:\/\/(?!news\.google)[^"']+)["']/.exec(it.raw || '');
    if (m) it.url = m[1];
    // Google puts the outlet after a trailing dash in the headline
    const src = /\s+-\s+([^-]{2,40})$/.exec(it.title);
    if (src) it.outlet = src[1].trim();
    it.title = it.title.replace(/\s+-\s+[^-]{2,40}$/, '');
    return it;
  });
  await Promise.allSettled(items.map(async it => {
    it.url = await resolveGoogleLink(it.url);
    if (!it.outlet) it.outlet = prettyOutlet(hostOf(it.url));
  }));
  return items;
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

async function readArticle(url) {
  const out = { ok: false, mentions: false, image: '' };
  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 86400 },
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml'
      }
    });
    if (!res.ok) return out;
    const html = (await res.text()).slice(0, 400000);
    out.ok = true;

    // the name, however the outlet spells or escapes it
    const text = html
      .replace(/&#229;|&aring;|&#xe5;/gi, 'å')
      .replace(/\\u00e5/gi, 'å');
    out.mentions = PRESS_MUST_MATCH.test(text);

    const m = /<meta[^>]+(?:property|name)=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i.exec(html)
      || /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i.exec(html)
      || /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i.exec(html);
    if (m) {
      let src = m[1];
      if (src.startsWith('//')) src = 'https:' + src;
      if (src.startsWith('/')) src = new URL(url).origin + src;
      out.image = src;
    }
  } catch (e) {}
  return out;
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
