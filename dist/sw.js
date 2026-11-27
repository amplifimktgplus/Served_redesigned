/* Served. service worker. With the web app manifest it makes the site installable, and it keeps pages
   you have opened readable offline. Pages, styles, scripts and photos come from the network first, so a
   new deploy shows straight away; the cache only answers when the network cannot. Fonts never change,
   so they come from the cache first. The build stamps VERSION, and each deploy clears the last cache. */
const VERSION = '08fd99c840';
const CACHE = `served-${VERSION}`;
// styles, script and logo carry a build hash in their URLs, so they are cached as pages ask for them
const SHELL = ['./', 'assets/favicon.svg', 'manifest.webmanifest', 'assets/img/app-icon-192.png'];

const OFFLINE = `<!doctype html><html lang="en-PH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0a0a0a"><title>Offline | Served.</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#0a0a0a;color:#f7f7f5;font:16px/1.5 system-ui,sans-serif;text-align:center}h1{margin:0 0 8px;font-size:28px}i{display:inline-block;width:.3em;height:.3em;margin-left:.08em;border-radius:50%;background:#ff6b18}p{margin:0 0 18px;color:#cdd2da}a{display:inline-block;padding:14px 24px;border-radius:999px;background:#ff6b18;color:#0a0a0a;font-weight:700;text-decoration:none}</style></head><body><main><h1>You are offline<i></i></h1><p>Pages you have opened before still work. Reconnect to book a court.</p><a href="">Try again</a></main></body></html>`;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('served-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(page(e)); return; }
  if (url.pathname.includes('/assets/fonts/')) { e.respondWith(cacheFirst(e)); return; }
  e.respondWith(networkFirst(e));
});

// pages: network (or the navigation preload) first; offline, the copy from the last visit, else the offline page
async function page(e) {
  const cache = await caches.open(CACHE);
  try {
    const res = (await e.preloadResponse) || (await fetch(e.request));
    if (res.ok) e.waitUntil(cache.put(e.request, res.clone()));
    return res;
  } catch (err) {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    return hit || new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function networkFirst(e) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(e.request);
    if (res.ok && res.type === 'basic') e.waitUntil(cache.put(e.request, res.clone()));
    return res;
  } catch (err) {
    const hit = await cache.match(e.request);
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(e) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(e.request);
  if (hit) return hit;
  const res = await fetch(e.request);
  if (res.ok) e.waitUntil(cache.put(e.request, res.clone()));
  return res;
}
