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

// Domains you never want on the press page. (yahoo/msn/flipboard etc. are
// syndicated mirrors of articles that exist on the real outlet.)
const PRESS_BLOCKLIST = ['store.steampowered.com', 'reddit.com', 'youtube.com/shorts',
  'msn.com', 'yahoo.com', 'flipboard.com', 'newsbreak.com', 'ground.news'];

// URL patterns that are index pages rather than articles. (Do NOT add '/games/'
// here - PC Gamer and others put real articles under /games/... paths.)
const PRESS_URL_JUNK = ['/tag/', '/tags/', '/topic/', '/topics/', '/category/',
  '/categories/', '/author/', '/people/', '/search?'];

// A "headline" that is really just a name or a label is a listing page.
// Real headlines can be short ("Esoteric Ebb Review"), so only drop the
// truly tiny ones and exact name/game matches.
function looksLikeIndexPage(it) {
  const t = (it.title || '').trim();
  if (t.length < 8) return true;
  if (/^(christoffer\s+bodeg[åa]rd|esoteric\s+ebb)$/i.test(t)) return true;
  const u = (it.url || '').toLowerCase();
  return PRESS_URL_JUNK.some(p => u.includes(p));
}

// Press feed budgets. Cloudflare's free plan allows 50 subrequests per request,
// so every per-article fetch below is capped. Sources are Google News RSS and
// the GDELT news API; thumbnails come from GDELT's socialimage field or each
// article's own og:image - the exact picture Google News shows in its results.
const PRESS_MAX = 80;               // most articles ever returned
const PRESS_GOOGLE_DECODE_COUNT = 20; // newest google-news links decoded per run
const PRESS_SCRAPE_COUNT = 20;      // article pages opened for a thumbnail per run

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/* Every outbound fetch gets a deadline. Without one, a single outlet
   tar-pitting bot traffic holds the entire feed response hostage. */
function tfetch(url, opts, ms) {
  opts = Object.assign({}, opts || {});
  try { opts.signal = AbortSignal.timeout(ms || 8000); } catch (e) {}
  return fetch(url, opts);
}

const CORS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'cache-control': 'public, max-age=600'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const feed = url.searchParams.get('feed') === 'press' ? 'press' : 'steam';
    const debug = url.searchParams.get('debug');
    try {
      /* Serve the last finished feed instantly when we have one; rebuild at
         most once an hour. Best-effort: the Cache API is a silent no-op on
         *.workers.dev subdomains (it activates for free if this worker is
         ever routed through the site's own domain), so the browser-side
         max-age in CORS still does the day-to-day caching either way. */
      const cacheKey = new Request('https://cb-feeds.cache/' + feed);
      if (!debug) {
        try {
          const hit = await caches.default.match(cacheKey);
          if (hit) return new Response(await hit.text(), { headers: CORS });
        } catch (e) {}
      }

      const data = feed === 'press' ? await press(debug) : await steam(debug);

      if (!debug && Array.isArray(data) && data.length) {
        try {
          const put = caches.default.put(cacheKey, new Response(JSON.stringify(data), {
            headers: { 'content-type': 'application/json; charset=utf-8',
              'cache-control': 'public, max-age=3600' }
          }));
          if (ctx && ctx.waitUntil) ctx.waitUntil(put); else await put;
        } catch (e) {}
      }
      return json(data);
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
/* jsondata only stores the file name; the served URL needs the clan's account id
   in the path: .../images/<clanid>/<file>. That missing id is why every capsule
   used to 404 and the site fell back to header.jpg. */
function clanImage(file, clanid) {
  if (!file) return '';
  if (/^https?:/.test(file)) return file;
  var f = String(file).replace(/^\/+/, '');
  if (!/^\d{6,}\//.test(f) && clanid) f = clanid + '/' + f;
  return 'https://clan.cloudflare.steamstatic.com/images/' + f;
}

/* Clans encode their 32-bit account id in the low bits of the 64-bit steamid. */
function clanAccountId(ev, body) {
  if (body && body.clanid) return String(body.clanid);
  if (ev && ev.clanid) return String(ev.clanid);
  try {
    if (ev && ev.clan_steamid) return String(BigInt(ev.clan_steamid) & 0xFFFFFFFFn);
  } catch (e) {}
  return '';
}

function isJunkImage(u) {
  return !u || /steam_share_image|steamcommunity\/public\/images|apps\/\d+\/header/.test(u);
}

async function eventsJson(url) {
  try {
    const res = await tfetch(url, {
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
    const body = ev.announcement_body || {};
    const url = clanImage(file, clanAccountId(ev, body));
    if (!url || isJunkImage(url)) continue;

    [ev.gid, ev.announcement_gid, body.gid, ev.unique_id]
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
    const res = await tfetch('https://store.steampowered.com/news/app/' + appid, {
      cf: { cacheTtl: 3600 },
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; cb-feeds/1.0)' }
    });
    if (res.ok) {
      const html = await res.text();
      const cm = /\\?"clanid\\?"\s*:\s*(\d{4,})/.exec(html);
      const clanid = cm ? cm[1] : '';
      const re = /"gid"\s*:\s*\\?"(\d{6,})\\?"[\s\S]{0,6000}?localized_capsule_image\\?"\s*:\s*\[\s*\\?"([^"\\]+)/g;
      let m;
      while ((m = re.exec(html))) {
        const url = clanImage(m[2], clanid);
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
    notes.push({ appid: app.id,
      capsulesFound: Object.keys(caps.byGid).length + Object.keys(caps.byTitle).length });
    const url = 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/'
      + '?maxlength=0&count=40&appid=' + app.id;
    const res = await tfetch(url, { cf: { cacheTtl: 3600 } });
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
/* Two independent sources so an outage of one can never empty the page:
     - Google News RSS (sent with consent cookies - Google serves a consent
       wall to datacenter IPs without them, which is what blanked the feed)
     - GDELT, a free news-monitoring API with real URLs and each article's
       own social/og image already attached
   Results are merged, de-duplicated, newest first. Thumbnails come from
   GDELT's socialimage or a one-time og:image fetch of the article page.
   Nothing is dropped because of what article pages return - outlets serve
   bot-walls to datacenters and that must never hide coverage.
   If the page is ever empty again, ?feed=press&debug=1 now names the exact
   blocker per source (http status, consent wall, captcha...). */
async function press(debug) {
  const log = [];
  const t0 = Date.now();

  /* Both sources start immediately. Google answers in a second or two, so
     its link-decoding runs WHILE GDELT is still scanning - the two slowest
     stages overlap instead of stacking. */
  const gdeltP = Promise.all(PRESS_QUERIES.map(q => gdelt(q, log)));
  const googleP = Promise.all(PRESS_QUERIES.map(q => googleNews(q, log)));

  let gItems = mergeLists(await googleP);
  gItems.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  gItems = gItems.slice(0, PRESS_MAX);
  await resolveGoogleUrls(gItems, log);

  let items = mergeLists([gItems].concat(await gdeltP));
  items = items.filter(it => {
    if (PRESS_BLOCKLIST.some(b => it.url.includes(b))) return false;
    if (looksLikeIndexPage(it)) return false;
    if (PRESS_URL_JUNK.some(p => it.url.toLowerCase().includes(p))) return false;
    return true;
  });

  // newest first, always - the site shows them in this order
  items.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  items = items.slice(0, PRESS_MAX);
  for (const it of items) {
    if (!it.outlet) it.outlet = prettyOutlet(hostOf(it.url));
  }

  // Thumbnails for the newest articles that still lack one.
  const toScrape = items
    .filter(it => !it.image && it.url && !/news\.google\.com/.test(it.url))
    .slice(0, PRESS_SCRAPE_COUNT);
  await Promise.allSettled(toScrape.map(async it => {
    const page = await readArticle(it.url);
    if (page.image) it.image = page.image;
  }));
  log.push({ stage: 'thumbnails', opened: toScrape.length,
    found: toScrape.filter(it => it.image).length });

  items.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  items = items.map(it => ({
    title: it.title, url: it.url, outlet: it.outlet,
    summary: it.summary, date: it.date, ts: it.ts, image: it.image || ''
  }));

  log.push({ stage: 'timing', ms: Date.now() - t0 });
  if (debug) return { count: items.length, withImage: items.filter(i => i.image).length, log, items };
  return items;
}

/* De-duplicate on normalised title, merging the best fields of each copy. */
function mergeLists(lists) {
  const byKey = new Map();
  for (const list of lists) for (const it of list) {
    if (!it.title || !it.url) continue;
    const key = normTitle(it.title);
    const prev = byKey.get(key);
    if (!prev) { byKey.set(key, it); continue; }
    if (/news\.google\.com/.test(prev.url) && !/news\.google\.com/.test(it.url)) prev.url = it.url;
    if (!prev.image && it.image) prev.image = it.image;
    if (!prev.outlet && it.outlet) prev.outlet = it.outlet;
    if (!prev.summary && it.summary) prev.summary = it.summary;
    if (!prev.ts && it.ts) { prev.ts = it.ts; prev.date = it.date; }
  }
  return [...byKey.values()];
}

/* GDELT DOC API: full-text news search, JSON out, socialimage included.
   The full-archive query (back to 2024) is slow - GDELT scans a lot - so it
   gets a 20s deadline of its own; sources run in parallel so it doesn't
   stack with the others. If it times out or comes back thin, a quick
   default-window (last 3 months) query papers over the gap. */
function fmtDateShort(ts) {
  return ts ? new Date(ts).toLocaleDateString('en-GB',
    { month: 'short', year: 'numeric' }).toUpperCase() : '';
}

async function gdeltFetch(q, fullArchive, ms) {
  const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=' +
    encodeURIComponent('"' + q + '" sourcelang:eng') +
    '&mode=artlist&format=json&maxrecords=100&sort=datedesc' +
    (fullArchive ? '&startdatetime=20240101000000' : '');
  let status = 0, arts = [];
  try {
    const res = await tfetch(url, {
      cf: { cacheTtl: 3600 },
      headers: { 'user-agent': UA, 'accept': 'application/json' }
    }, ms);
    status = res.status;
    if (res.ok) {
      const data = await res.json();
      arts = (data && data.articles) || [];
    }
  } catch (e) { status = 'timeout'; }
  const items = arts.map(a => {
    const m = /^(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})/.exec(a.seendate || '');
    const ts = m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : 0;
    return {
      // page titles carry a "| Site" suffix; a plain dash is left alone
      // because real headlines contain those
      title: clean(a.title).replace(/\s*\|\s*[^|]{2,40}$/, ''),
      url: a.url || '',
      outlet: prettyOutlet(String(a.domain || '').replace(/^www\./, '')),
      summary: '',
      image: /^https?:/.test(a.socialimage || '') ? a.socialimage : '',
      ts,
      date: fmtDateShort(ts)
    };
  }).filter(it => it.title && it.url);
  return { status, items };
}

async function gdelt(q, log) {
  const deep = await gdeltFetch(q, true, 15000);
  let items = deep.items;
  let statuses = String(deep.status);
  if (items.length < 5) {
    const quick = await gdeltFetch(q, false, 8000);
    statuses += '/' + quick.status;
    const seen = new Set(items.map(it => normTitle(it.title)));
    for (const it of quick.items) {
      if (!seen.has(normTitle(it.title))) { seen.add(normTitle(it.title)); items.push(it); }
    }
  }
  if (log) log.push({ source: 'gdelt', query: q, status: statuses, found: items.length });
  return items;
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
  'gamespot.com': 'GameSpot',
  'rpgfan.com': 'RPGFan',
  'aftermath.site': 'Aftermath',
  'gamereactor.eu': 'Gamereactor',
  'gamereactor.dk': 'Gamereactor DK',
  'consolecreatures.com': 'Console Creatures',
  'whatculture.com': 'WhatCulture',
  'thesixthaxis.com': 'TheSixthAxis',
  'radiotimes.com': 'Radio Times'
};

function prettyOutlet(host) {
  if (!host) return '';
  if (OUTLET_NAMES[host]) return OUTLET_NAMES[host];
  const base = host.replace(/\.(com|net|org|se|co\.uk|io|gg|news)$/, '').replace(/\.[a-z]{2,3}$/, '');
  return base.split('.').pop().replace(/(^|[-_])(\w)/g, (m, a, b) => (a ? ' ' : '') + b.toUpperCase());
}

async function googleNews(q, log) {
  const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q)
    + '&hl=en-US&gl=US&ceid=US:en';
  let status = 0, xml = '';
  try {
    const res = await tfetch(url, {
      cf: { cacheTtl: 3600 },
      redirect: 'follow',
      headers: {
        'user-agent': UA,
        'accept': 'application/rss+xml, application/xml, text/xml, */*',
        'accept-language': 'en-US,en;q=0.9',
        // Without these Google often answers datacenter IPs with a consent
        // page instead of the feed. Standard bypass cookies.
        'cookie': 'CONSENT=YES+cb.20220419-08-p0.en+FX+700; ' +
          'SOCS=CAISHwgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAmVuIAEaBgiA_LyaBg'
      }
    }, 10000);
    status = res.status;
    if (res.ok) xml = await res.text();
  } catch (e) {}
  const items = parseRss(xml).map(it => {
    // Google puts the outlet after a trailing dash in the headline
    const src = /\s+-\s+([^-]{2,40})$/.exec(it.title);
    if (src && !it.outlet) it.outlet = src[1].trim();
    it.title = it.title.replace(/\s+-\s+[^-]{2,40}$/, '');
    it.summary = ''; // GN descriptions are just the headline again
    return it;
  });
  if (log) {
    const entry = { source: 'google', query: q, status, found: items.length };
    if (!items.length) entry.hint = sniffGoogleBlock(xml);
    log.push(entry);
  }
  return items;
}

/* When Google returns nothing, say why - it makes ?debug=1 actually useful. */
function sniffGoogleBlock(t) {
  t = String(t || '');
  if (!t) return 'empty or failed response';
  if (/consent\.google/i.test(t)) return 'consent wall';
  if (/unusual traffic|captcha|sorry\/index/i.test(t)) return 'captcha / rate limited';
  if (!/<item[\s>]/.test(t)) {
    return 'no <item>s; response starts: ' + t.slice(0, 80).replace(/\s+/g, ' ');
  }
  return 'items present but none parsed';
}

/* Google stopped redirecting news.google.com/rss/articles links server-side in
   2024, which is what quietly broke the old resolver. Three-layer replacement:
   1. old-style ids ("CBMi...") carry the URL inside the base64 - free to decode
   2. new-style ids need the page's signature + timestamp fed to the
      batchexecute endpoint (one POST decodes the whole batch)
   3. anything left keeps its google link, and often gets a real URL from the
      Bing copy of the same article during the merge anyway */
function decodeGoogleStatic(u) {
  try {
    const m = /articles\/([^?/]+)/.exec(u);
    if (!m) return '';
    const bin = atob(m[1].replace(/-/g, '+').replace(/_/g, '/'));
    if (bin.indexOf('AU_yqL') !== -1) return ''; // new format, needs batchexecute
    const urls = bin.match(/https?:\/\/[\x20-\x7e]+/g) || [];
    const best = urls.map(x => x.replace(/[\x00-\x1f].*$/, ''))
      .filter(x => !/news\.google|ampproject/.test(x));
    return best.length ? best[best.length - 1] : '';
  } catch (e) { return ''; }
}

async function googleDecodeParams(u) {
  try {
    const m = /articles\/([^?/]+)/.exec(u);
    if (!m) return null;
    const res = await tfetch('https://news.google.com/rss/articles/' + m[1], {
      redirect: 'follow', cf: { cacheTtl: 86400 },
      headers: { 'user-agent': UA, 'accept': 'text/html' }
    }, 6000);
    if (res.url && !/news\.google\.com/.test(res.url)) return { finalUrl: res.url };
    if (!res.ok) return null;
    const html = await res.text();
    const sg = /data-n-a-sg="([^"]+)"/.exec(html);
    const ts = /data-n-a-ts="([^"]+)"/.exec(html);
    if (sg && ts) return { id: m[1], sig: sg[1], ts: ts[1] };
  } catch (e) {}
  return null;
}

async function batchDecode(list) {
  const out = new Array(list.length).fill('');
  if (!list.length) return out;
  const reqs = list.map((p, i) => ['Fbv4je',
    JSON.stringify(['garturlreq',
      [['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1,
        null, null, null, null, null, 0, 1], 'X', 'X', 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
      p.id, Number(p.ts), p.sig]),
    null, String(i + 1)]);
  try {
    const res = await tfetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'user-agent': UA
      },
      body: 'f.req=' + encodeURIComponent(JSON.stringify([reqs]))
    });
    if (!res.ok) return out;
    const text = await res.text();
    for (const line of text.split('\n')) {
      if (line.charAt(0) !== '[') continue;
      let rows; try { rows = JSON.parse(line); } catch (e) { continue; }
      for (const row of rows) {
        if (!row || row[0] !== 'wrb.fr' || row[1] !== 'Fbv4je' || !row[2]) continue;
        let inner; try { inner = JSON.parse(row[2]); } catch (e) { continue; }
        if (!inner || !inner[1]) continue;
        const idx = parseInt(row[row.length - 1], 10) - 1;
        out[idx >= 0 && idx < out.length ? idx : 0] = inner[1];
      }
    }
  } catch (e) {}
  return out;
}

async function resolveGoogleUrls(items, log) {
  const pending = [];
  for (const it of items) {
    if (!/news\.google\.com/.test(it.url)) continue;
    const dec = decodeGoogleStatic(it.url);
    if (dec) it.url = dec;
    else pending.push(it);
  }
  const batch = pending.slice(0, PRESS_GOOGLE_DECODE_COUNT);
  const params = [];
  await Promise.allSettled(batch.map(async it => {
    const p = await googleDecodeParams(it.url);
    if (p && p.finalUrl) { it.url = p.finalUrl; return; }
    if (p) params.push({ it, p });
  }));
  const urls = await batchDecode(params.map(x => x.p));
  params.forEach((x, i) => { if (urls[i]) x.it.url = urls[i]; });
  if (log) log.push({
    stage: 'google-decode', googleLinks: pending.length + (items.length - pending.length),
    attempted: batch.length, viaBatch: urls.filter(Boolean).length,
    stillEncoded: items.filter(it => /news\.google\.com/.test(it.url)).length
  });
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
    let image = clean(tag(block, 'News:Image'))
      || attr(block, 'media:content', 'url')
      || attr(block, 'media:thumbnail', 'url')
      || attr(block, 'enclosure', 'url') || '';
    if (image && !/^https?:/.test(image)) image = '';
    out.push({
      title,
      url: link,
      outlet: source,
      image,
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
    const res = await tfetch(url, {
      cf: { cacheTtl: 86400 },
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml'
      }
    }, 6000);
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
      || /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i.exec(html)
      || /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i.exec(html)
      || /"image"\s*:\s*\[?\s*"(https?:[^"\\]+)"/.exec(html)
      || /"image"\s*:\s*\{[^{}]*?"url"\s*:\s*"(https?:[^"\\]+)"/.exec(html);
    if (m) {
      let src = m[1].replace(/&amp;/g, '&').replace(/\\\//g, '/');
      if (src.startsWith('//')) src = 'https:' + src;
      if (src.startsWith('/')) src = new URL(url).origin + src;
      if (/^https?:/.test(src)) out.image = src;
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
