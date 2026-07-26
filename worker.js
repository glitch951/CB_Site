/* cb-feeds — Cloudflare Worker
   Serves two JSON feeds with CORS open and 1-hour caching:
     /?feed=steam  -> Steam news posts for every appid in APPS
     /?feed=press  -> Google News results for PRESS_QUERY
   Deploy at cloudflare.com > Workers & Pages > Create Worker (free plan). */

// Add any game you want mirrored. Find the appid in its Steam store URL.
const APPS = [
  { id: 2057760, name: 'Esoteric Ebb' },
  { id: 1299690, name: 'Gori: Cuddly Carnage' },
  { id: 648800,  name: 'Raft' }
];

// Only mirror posts you wrote as announcements. Set to null to include everything.
const FEED_FILTER = 'steam_community_announcements';

// Google News search. Quotes matter.
const PRESS_QUERY = '"Christoffer Bodegård" OR "Esoteric Ebb" interview';

// Outlets you never want on the press page.
const PRESS_BLOCKLIST = ['example-spam-site.com'];

const CORS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'cache-control': 'public, max-age=3600'
};

export default {
  async fetch(request) {
    const feed = new URL(request.url).searchParams.get('feed');
    try {
      if (feed === 'press') return json(await press());
      return json(await steam());
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS });
    }
  }
};

function json(data) {
  return new Response(JSON.stringify(data), { headers: CORS });
}

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
      all.push({
        title: it.title,
        url: it.url,
        date: it.date,
        contents: it.contents,
        gameName: app.name
      });
    }
  }
  all.sort((a, b) => b.date - a.date);
  return all;
}

async function press() {
  const url = 'https://news.google.com/rss/search?q='
    + encodeURIComponent(PRESS_QUERY) + '&hl=en-US&gl=US&ceid=US:en';
  const res = await fetch(url, {
    cf: { cacheTtl: 3600 },
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; cb-feeds/1.0)' }
  });
  const xml = await res.text();
  const items = [];
  const blocks = xml.split('<item>').slice(1);
  for (const block of blocks) {
    const title = tag(block, 'title');
    const link = tag(block, 'link');
    const pub = tag(block, 'pubDate');
    const source = tag(block, 'source');
    if (!title || !link) continue;
    if (PRESS_BLOCKLIST.some(b => link.includes(b))) continue;
    items.push({
      title: clean(title).replace(/\s+-\s+[^-]+$/, ''),
      url: link,
      outlet: clean(source),
      date: pub ? new Date(pub).toLocaleDateString('en-GB',
        { month: 'short', year: 'numeric' }).toUpperCase() : ''
    });
  }
  return items;
}

function tag(block, name) {
  const m = new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>').exec(block);
  return m ? m[1] : '';
}

function clean(s) {
  return s.replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .trim();
}
