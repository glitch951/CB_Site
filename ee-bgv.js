/* ee-bgv.js — Esoteric Ebb splash background video
 * Drop-in replacement for the inline EE-BGV embed.
 *
 * Embed (Carrd Code section, in the #home / splash container):
 *   <div id="ee-bgv-marker" style="display:none" aria-hidden="true"></div>
 *   <script src="https://glitch951.github.io/CB_Site/ee-bgv.js" defer></script>
 *
 * Nothing is ever shown until every clip is fully in memory and the first
 * frame of the first clip has actually been decoded and presented.
 */
(function () {
'use strict';

/* ------------------------------ CONFIG ------------------------------ */
var CFG = {
  videos: [
    'https://files.catbox.moe/6rv19a.webm',
    'https://files.catbox.moe/2apyzk.webm',
    'https://files.catbox.moe/h61n83.webm',
    'https://files.catbox.moe/j7r6hg.webm',
    'https://files.catbox.moe/yjjr28.webm',
    'https://files.catbox.moe/v9vtxg.webm'
  ],

  debug: false,

  targetSelector: '',

  restDuration: 10000,
  fadeDuration: 1600,
  wipeDuration: 1000,
  wipeLead: 0.25,

  shuffleEachCycle: false,

  overlay: true,
  overlayCss:
    'linear-gradient(to bottom,' +
    ' rgba(2,13,21,0.38) 0%, rgba(2,13,21,0.10) 26%,' +
    ' rgba(2,13,21,0.06) 52%, rgba(2,13,21,0.62) 100%),' +
    'radial-gradient(120% 90% at 50% 40%,' +
    ' rgba(2,13,21,0) 55%, rgba(2,13,21,0.35) 100%)',

  disableBelowWidth: 0,
  respectReducedMotion: true,
  respectSaveData: true,
  pauseOffscreen: true,

  /* --- loading --- */
  persistentCache: true,      // reuse downloads across page loads (Cache Storage)
  cacheName: 'ee-bgv-v1',     // bump this string if you swap the clip list
  fetchTimeout: 90000,        // per attempt, ms — a hung fetch can no longer stall forever
  fetchRetries: 2,            // extra attempts after the first
  fetchConcurrency: 2,        // parallel downloads

  /* --- robustness --- */
  primeTimeout: 20000,        // max wait for a clip to become playable
  stallGrace: 1200,           // ms with no currentTime movement = stalled
  stallHardLimit: 5000,       // ms stalled before we force a recovery
  holdLimit: 12000            // ms we'll loop the current clip waiting for the next
};
/* --------------------------------------------------------------------- */

var TAG = '[EE-BGV]';
function log() {
  if (CFG.debug && window.console && console.log) {
    console.log.apply(console, [TAG].concat([].slice.call(arguments)));
  }
}
function warn() {
  if (window.console && console.warn) {
    console.warn.apply(console, [TAG].concat([].slice.call(arguments)));
  }
}

var now = (window.performance && performance.now)
  ? function () { return performance.now(); }
  : function () { return Date.now(); };

var EASE = 'cubic-bezier(.66,0,.34,1)';

var WIPES = [
  { n: 'push L>R', img: 'linear-gradient(100deg,#000 45%,rgba(0,0,0,0) 55%)',
    size: '300% 100%', from: '100% 50%', to: '0% 50%' },
  { n: 'push R>L', img: 'linear-gradient(100deg,rgba(0,0,0,0) 45%,#000 55%)',
    size: '300% 100%', from: '0% 50%', to: '100% 50%' },
  { n: 'descend', img: 'linear-gradient(186deg,#000 45%,rgba(0,0,0,0) 55%)',
    size: '100% 300%', from: '50% 100%', to: '50% 0%' },
  { n: 'rise', img: 'linear-gradient(186deg,rgba(0,0,0,0) 45%,#000 55%)',
    size: '100% 300%', from: '50% 0%', to: '50% 100%' },
  { n: 'diagonal', img: 'linear-gradient(135deg,#000 45%,rgba(0,0,0,0) 55%)',
    size: '300% 300%', from: '100% 100%', to: '0% 0%' },
  { n: 'iris', img: 'radial-gradient(circle,#000 58%,rgba(0,0,0,0) 75%)',
    size: '2% 2%', sizeTo: '330% 330%', from: '50% 50%', to: '50% 50%' }
];

/* ---------------------------- SINGLETON ----------------------------- */
/* Carrd can re-run a Code embed on section changes. Tear the old one
   down instead of stacking a second engine (and a second set of blobs)
   on top of it. */
if (window.__EE_BGV__ && typeof window.__EE_BGV__.destroy === 'function') {
  try { window.__EE_BGV__.destroy(); } catch (e) {}
}

var layer, host, vids;
var order = [];          // source URLs, in play order
var objUrls = {};        // source URL -> blob object URL
var cur = 0, idx = 0, lastWipe = -1;
var transitioning = false, running = false, inView = true, holding = false;
var standbyReady = false, holdStart = 0, destroyed = false;
var lastTime = -1, lastMove = 0, stallStage = 0;
var timers = [], rafId = null, stallTimer = null;
var listeners = [];

function later(fn, ms) {
  var id = setTimeout(function () {
    timers.splice(timers.indexOf(id), 1);
    if (!destroyed) fn();
  }, ms);
  timers.push(id);
  return id;
}
function on(target, evt, fn) {
  target.addEventListener(evt, fn);
  listeners.push([target, evt, fn]);
}

function destroy() {
  destroyed = true;
  running = false;
  timers.forEach(clearTimeout); timers = [];
  if (rafId) cancelAnimationFrame(rafId);
  if (stallTimer) clearInterval(stallTimer);
  listeners.forEach(function (l) {
    try { l[0].removeEventListener(l[1], l[2]); } catch (e) {}
  });
  listeners = [];
  if (vids) vids.forEach(function (v) {
    try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {}
  });
  Object.keys(objUrls).forEach(function (k) {
    try { URL.revokeObjectURL(objUrls[k]); } catch (e) {}
  });
  objUrls = {};
  if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
  log('destroyed');
}

window.__EE_BGV__ = { destroy: destroy, cfg: CFG };

/* ------------------------------ GATES ------------------------------- */
function sources() {
  var list = CFG.videos || CFG.videosWebm || [];
  var probe = document.createElement('video');
  var ok = probe.canPlayType &&
    (probe.canPlayType('video/webm; codecs="vp9"') ||
     probe.canPlayType('video/webm; codecs="vp8"'));
  if (!ok) { warn('this browser cannot play the webm sources'); return []; }
  return list.slice();
}

function blocked() {
  if (CFG.respectReducedMotion && window.matchMedia &&
      matchMedia('(prefers-reduced-motion: reduce)').matches)
    return 'prefers-reduced-motion is on';
  if (CFG.respectSaveData && navigator.connection && navigator.connection.saveData)
    return 'data saver is on';
  if (CFG.disableBelowWidth && window.innerWidth < CFG.disableBelowWidth)
    return 'viewport below disableBelowWidth';
  if (typeof fetch !== 'function' || typeof Promise !== 'function')
    return 'browser too old';
  return null;
}

/* ------------------------------ LOADER ------------------------------ */
function fromCache(url) {
  if (!CFG.persistentCache || !('caches' in window)) return Promise.resolve(null);
  return caches.open(CFG.cacheName)
    .then(function (c) { return c.match(url); })
    .then(function (res) { return res ? res.blob() : null; })
    .catch(function () { return null; });
}

function toCache(url, blob) {
  if (!CFG.persistentCache || !('caches' in window)) return;
  try {
    caches.open(CFG.cacheName).then(function (c) {
      c.put(url, new Response(blob)).catch(function () {});
    }).catch(function () {});
  } catch (e) {}
}

function fetchOnce(url) {
  return new Promise(function (resolve, reject) {
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var opts = { cache: 'force-cache' };
    if (ctl) opts.signal = ctl.signal;

    var timer = setTimeout(function () {
      if (ctl) { try { ctl.abort(); } catch (e) {} }
      reject(new Error('timeout'));
    }, CFG.fetchTimeout);

    fetch(url, opts)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.blob();
      })
      .then(function (blob) {
        clearTimeout(timer);
        if (!blob || !blob.size) reject(new Error('empty body'));
        else resolve(blob);
      })
      .catch(function (err) { clearTimeout(timer); reject(err); });
  });
}

function fetchWithRetry(url, attempt) {
  attempt = attempt || 0;
  return fetchOnce(url).catch(function (err) {
    if (destroyed || attempt >= CFG.fetchRetries) throw err;
    log('retry', attempt + 1, url, String(err));
    return new Promise(function (r) { setTimeout(r, 700 * (attempt + 1)); })
      .then(function () { return fetchWithRetry(url, attempt + 1); });
  });
}

function loadOne(url) {
  return fromCache(url).then(function (blob) {
    if (blob && blob.size) { log('cache hit', url); return blob; }
    return fetchWithRetry(url).then(function (b) { toCache(url, b); return b; });
  }).then(function (blob) {
    objUrls[url] = URL.createObjectURL(blob);
    return blob.size;
  });
}

/* All-or-nothing: resolves only once every clip is resident.
   Clips that fail every attempt are dropped from the playlist rather
   than left to stream — streaming is what produces the freeze frames. */
function loadAll(urls) {
  return new Promise(function (resolve) {
    var nextIdx = 0, active = 0, done = 0, bytes = 0;
    var okUrls = [];

    function pump() {
      while (active < CFG.fetchConcurrency && nextIdx < urls.length) {
        var i = nextIdx++;
        var url = urls[i];
        active++;
        (function (u) {
          loadOne(u)
            .then(function (size) { bytes += size; okUrls.push(u); })
            .catch(function (err) { warn('dropping clip (failed to load):', u, String(err)); })
            .then(function () {
              active--; done++;
              if (done === urls.length) {
                log('loaded', okUrls.length + '/' + urls.length,
                    (bytes / 1048576).toFixed(1) + ' MB');
                resolve(urls.filter(function (x) { return okUrls.indexOf(x) > -1; }));
              } else { pump(); }
            });
        })(url);
      }
    }
    if (!urls.length) resolve([]); else pump();
  });
}

/* ------------------------------ PRIMING ----------------------------- */
/* A clip is "primed" only when it is loaded, seeked to 0, and has had at
   least one frame decoded and presented. Priming happens a whole clip
   ahead of when the clip is needed, never 1.2s before like the old code. */
function waitPlayable(v) {
  return new Promise(function (resolve, reject) {
    if (v.readyState >= 4) return resolve();
    var settled = false, deadline = now() + CFG.primeTimeout;
    function finish(ok, why) {
      if (settled) return;
      settled = true;
      v.removeEventListener('canplaythrough', hit);
      v.removeEventListener('error', bad);
      clearInterval(poll);
      ok ? resolve() : reject(new Error(why));
    }
    function hit() { finish(true); }
    function bad() { finish(false, 'media error'); }
    var poll = setInterval(function () {
      if (destroyed) return finish(false, 'destroyed');
      if (v.readyState >= 4) return finish(true);
      // blob-backed media should hit 4; accept 3 late rather than hang
      if (v.readyState >= 3 && now() > deadline - CFG.primeTimeout * 0.35) return finish(true);
      if (now() > deadline) return finish(false, 'prime timeout');
    }, 100);
    v.addEventListener('canplaythrough', hit);
    v.addEventListener('error', bad);
  });
}

function seekZero(v) {
  return new Promise(function (resolve) {
    if (!v.currentTime) return resolve();
    var t = setTimeout(done, 800);
    function done() { clearTimeout(t); v.removeEventListener('seeked', done); resolve(); }
    v.addEventListener('seeked', done);
    try { v.currentTime = 0; } catch (e) { done(); }
  });
}

/* Force the decoder to actually produce a frame. The standby element sits
   underneath the fully opaque active video, so this is invisible. */
function warmFrame(v) {
  return new Promise(function (resolve) {
    var fired = false;
    function fin() {
      if (fired) return;
      fired = true;
      clearTimeout(guard);
      try { v.pause(); } catch (e) {}
      seekZero(v).then(resolve, resolve);
    }
    var guard = setTimeout(fin, 1500);
    if (typeof v.requestVideoFrameCallback === 'function') {
      v.requestVideoFrameCallback(fin);
    } else {
      setTimeout(fin, 220);
    }
    var p = v.play();
    if (p && p.catch) p.catch(fin);
  });
}

function primeVideo(v, url) {
  var src = objUrls[url];
  if (!src) return Promise.reject(new Error('no blob for ' + url));
  try { v.pause(); } catch (e) {}
  v.loop = false;
  v.removeAttribute('src');
  try { v.load(); } catch (e) {}
  v.src = src;
  try { v.load(); } catch (e) {}
  return waitPlayable(v).then(function () { return warmFrame(v); });
}

/* ----------------------------- PLAYBACK ----------------------------- */
function active() { return vids[cur]; }
function standby() { return vids[1 - cur]; }

function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t;
  }
}

function mask(el, img, size, pos) {
  var s = el.style;
  s.webkitMaskImage = s.maskImage = img;
  s.webkitMaskSize = s.maskSize = size;
  s.webkitMaskPosition = s.maskPosition = pos;
  s.webkitMaskRepeat = s.maskRepeat = 'no-repeat';
  s.willChange = 'mask-position, mask-size';
}
function unmask(el) {
  var s = el.style;
  s.transition = 'none';
  s.webkitMaskImage = s.maskImage = 'none';
  s.willChange = 'auto';
}

function safePlay(v) {
  var p;
  try { p = v.play(); } catch (e) { return Promise.reject(e); }
  return (p && p.then) ? p : Promise.resolve();
}

function pickWipe() {
  var i;
  do { i = (Math.random() * WIPES.length) | 0; }
  while (WIPES.length > 1 && i === lastWipe);
  lastWipe = i;
  return WIPES[i];
}

function resetStallWatch() { lastTime = -1; lastMove = now(); stallStage = 0; }

function prepareNext() {
  standbyReady = false;
  var n = idx + 1;
  if (n >= order.length) return;         // last clip — next is the fade-out
  var target = standby();
  primeVideo(target, order[n]).then(function () {
    if (destroyed) return;
    standbyReady = true;
    log('primed next:', order[n]);
  }).catch(function (err) {
    warn('could not prime', order[n], String(err));
    standbyReady = false;
  });
}

/* Timing check. Only fires a wipe when the incoming clip is genuinely
   ready; otherwise loops the current clip rather than freezing on a frame. */
function tick() {
  rafId = requestAnimationFrame(tick);
  if (destroyed || !running || transitioning) return;

  var v = active();
  if (!v || v.readyState === 0) return;
  var rem = v.duration - v.currentTime;
  if (!isFinite(rem)) return;

  var last = (idx === order.length - 1);

  if (holding) {
    if (standbyReady) { v.loop = false; holding = false; beginWipe(); }
    else if (now() - holdStart > CFG.holdLimit) {
      warn('next clip never became ready — skipping it');
      v.loop = false; holding = false;
      order.splice(idx + 1, 1);
      if (idx >= order.length - 1) fadeOutAndRest();
      else prepareNext();
      holdStart = now();
      if (idx < order.length - 1) { holding = true; v.loop = true; }
    }
    return;
  }

  if (last) {
    if (rem <= CFG.fadeDuration / 1000) fadeOutAndRest();
    return;
  }

  if (rem <= (CFG.wipeDuration / 1000) + CFG.wipeLead) {
    if (standbyReady) beginWipe();
    else if (rem <= 0.35) {
      log('holding: next clip not ready yet');
      holding = true; holdStart = now(); v.loop = true;
      safePlay(v);
    }
  }
}

function onEnded(e) {
  if (destroyed || e.target !== active() || transitioning || !running) return;
  if (holding) { safePlay(active()); return; }
  if (idx === order.length - 1) fadeOutAndRest();
  else if (standbyReady) beginWipe();
  else { holding = true; holdStart = now(); active().loop = true; safePlay(active()); }
}

function beginWipe() {
  if (transitioning || !standbyReady || destroyed) return;
  transitioning = true;

  var out = active(), inc = standby(), w = pickWipe();
  var finished = false;

  /* Hard latch-breaker: transitioning can never get stuck true. */
  var guard = later(finish, CFG.wipeDuration + 2000);

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(guard);
    unmask(inc);
    try { out.pause(); } catch (e) {}
    out.loop = false;
    cur = 1 - cur;
    idx++;
    transitioning = false;
    holding = false;
    resetStallWatch();
    prepareNext();
  }

  inc.style.transition = 'none';
  mask(inc, w.img, w.size, w.from);
  inc.style.zIndex = 3;
  out.style.zIndex = 2;
  try { inc.currentTime = 0; } catch (e) {}

  function run() {
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      if (finished || destroyed) return;
      inc.style.transition = ['-webkit-mask-position', 'mask-position',
                              '-webkit-mask-size', 'mask-size']
        .map(function (pr) { return pr + ' ' + CFG.wipeDuration + 'ms ' + EASE; })
        .join(',');
      inc.style.webkitMaskPosition = inc.style.maskPosition = w.to;
      if (w.sizeTo) inc.style.webkitMaskSize = inc.style.maskSize = w.sizeTo;
      later(finish, CFG.wipeDuration + 80);
    }); });
  }

  safePlay(inc).then(run, run);
}

function fadeOutAndRest() {
  if (transitioning || destroyed) return;
  transitioning = true;
  running = false;
  layer.style.opacity = 0;

  later(function () {
    vids.forEach(function (v) {
      try { v.pause(); } catch (e) {}
      v.loop = false;
    });
    transitioning = false;
    holding = false;
    /* Prime clip 0 during the rest gap so the next cycle opens instantly. */
    var restStart = now();
    if (CFG.shuffleEachCycle) shuffle(order);
    cur = 0; idx = 0;
    primeVideo(vids[0], order[0]).then(function () {
      var waited = now() - restStart;
      later(startCycle, Math.max(0, CFG.restDuration - waited));
    }).catch(function (err) {
      warn('failed to prime first clip for next cycle', String(err));
      later(startCycle, CFG.restDuration);
    });
  }, CFG.fadeDuration + 60);
}

function startCycle() {
  if (destroyed) return;
  if (!order.length) return;
  transitioning = false;
  holding = false;
  idx = 0; cur = 0;

  var v = vids[0], s = vids[1];
  unmask(v); unmask(s);
  v.style.zIndex = 3; s.style.zIndex = 2;

  function reveal() {
    running = true;
    resetStallWatch();
    layer.style.opacity = 1;
    prepareNext();
  }

  function begin() {
    safePlay(v).then(reveal, function () {
      log('autoplay blocked — waiting for first interaction');
      var once = function () {
        document.removeEventListener('pointerdown', once);
        document.removeEventListener('touchstart', once);
        safePlay(v).then(reveal, function () {});
      };
      on(document, 'pointerdown', once);
      on(document, 'touchstart', once);
    });
  }

  /* If this element is already primed on clip 0 (the rest-gap path), skip. */
  if (v.src && v.src === objUrls[order[0]] && v.readyState >= 3 && !v.currentTime) begin();
  else primeVideo(v, order[0]).then(begin, function (err) {
    warn('cannot start cycle', String(err));
    later(startCycle, 3000);
  });
}

/* ---------------------------- WATCHDOG ------------------------------ */
/* The real fix for the freeze frames: if currentTime stops advancing,
   nothing in the old script would ever notice. Now it escalates. */
function stallTick() {
  if (destroyed) return;
  if (!running || transitioning || document.hidden || !inView) { lastMove = now(); return; }
  var v = active();
  if (!v || v.paused || v.ended || v.readyState === 0) { lastMove = now(); return; }

  var t = v.currentTime;
  if (t !== lastTime) { lastTime = t; lastMove = now(); stallStage = 0; return; }

  var stuck = now() - lastMove;
  if (stallStage === 0 && stuck > CFG.stallGrace) {
    stallStage = 1;
    log('stall detected — re-issuing play()');
    safePlay(v).catch(function () {});
  } else if (stallStage === 1 && stuck > CFG.stallGrace * 2) {
    stallStage = 2;
    log('stall persists — nudging currentTime');
    try {
      var d = isFinite(v.duration) ? v.duration : t + 1;
      v.currentTime = Math.min(d - 0.05, t + 0.1);
    } catch (e) {}
    safePlay(v).catch(function () {});
  } else if (stuck > CFG.stallHardLimit) {
    warn('clip stalled hard — recovering');
    hardRecover();
  }
}

function hardRecover() {
  resetStallWatch();
  if (holding) { holding = false; active().loop = false; }
  if (standbyReady && idx < order.length - 1) beginWipe();
  else fadeOutAndRest();
}

function syncPlayback() {
  if (destroyed || !running) return;
  var ok = inView && !document.hidden;
  if (!ok) { try { active().pause(); } catch (e) {} }
  else { safePlay(active()).catch(function () {}); resetStallWatch(); }
}

/* ------------------------------ SETUP ------------------------------- */
function resolveTarget() {
  var sel = CFG.targetSelector;
  if (!sel) return null;
  var el = document.querySelector(sel);
  if (!el && /^#[\w-]+$/.test(sel) && !/-section$/.test(sel)) {
    el = document.querySelector(sel + '-section');
  }
  return el;
}

function findHost(marker) {
  var el = resolveTarget();
  if (el) return el;

  var fallback = null;
  el = marker && marker.parentElement;
  while (el && el !== document.body) {
    if (!fallback && (el.tagName === 'SECTION' || /container/i.test(el.id || '')))
      fallback = el;
    var bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') return el;
    el = el.parentElement;
  }
  if (fallback) return fallback;
  return document.querySelector('section') || document.querySelector('[id^="container"]');
}

function makeVideo(z) {
  var v = document.createElement('video');
  v.muted = true; v.setAttribute('muted', '');
  v.playsInline = true; v.setAttribute('playsinline', '');
  v.preload = 'auto';
  v.disableRemotePlayback = true;
  v.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' +
    'object-fit:cover;z-index:' + z + ';';
  on(v, 'ended', onEnded);
  on(v, 'error', function () {
    if (v === active() && running) { warn('media error on active clip'); hardRecover(); }
  });
  on(v, 'stalled', function () { log('event: stalled'); });
  on(v, 'waiting', function () { log('event: waiting'); });
  layer.appendChild(v);
  return v;
}

function init() {
  var why = blocked();
  if (why) { log('disabled:', why); destroyed = true; return; }

  var list = sources();
  if (!list.length) { destroyed = true; return; }

  var marker = document.getElementById('ee-bgv-marker');
  host = findHost(marker);
  if (!host) { warn('no host element found'); destroyed = true; return; }

  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  layer = document.createElement('div');
  layer.setAttribute('data-ee-bgv', '');
  layer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' +
    'overflow:hidden;z-index:1;opacity:0;pointer-events:none;' +
    'transition:opacity ' + CFG.fadeDuration + 'ms ease;';
  host.insertBefore(layer, host.firstChild);

  Array.prototype.forEach.call(host.children, function (ch) {
    if (ch === layer) return;
    var c = getComputedStyle(ch);
    if (/slideshow/i.test(ch.className || '')) { ch.style.zIndex = 0; return; }
    if (c.position === 'static') ch.style.position = 'relative';
    if (c.zIndex === 'auto') ch.style.zIndex = 2;
  });

  vids = [makeVideo(3), makeVideo(2)];

  if (CFG.overlay) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'z-index:5;pointer-events:none;background:' + CFG.overlayCss + ';';
    layer.appendChild(ov);
  }

  on(document, 'visibilitychange', syncPlayback);
  on(window, 'pagehide', destroy);

  if (CFG.pauseOffscreen && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0.05 });
    io.observe(host);
    listeners.push([{ addEventListener: function () {}, removeEventListener: function () { io.disconnect(); } }, 'x', function () {}]);
  }

  stallTimer = setInterval(stallTick, 400);
  rafId = requestAnimationFrame(tick);

  /* Nothing is revealed until this resolves. */
  loadAll(list).then(function (ready) {
    if (destroyed) return;
    if (!ready.length) { warn('no clips available — background video disabled'); return; }
    order = ready;
    if (CFG.shuffleEachCycle) shuffle(order);
    startCycle();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();
