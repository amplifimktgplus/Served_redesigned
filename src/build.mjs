// src/build.mjs: renders every page into dist/, copies assets, concatenates CSS and JS, writes the logo files,
// favicon, service worker, manifest, sitemap, robots and 404.
// Usage: node src/build.mjs [--out dist]
import { rmSync, mkdirSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { pages } from './pages.mjs';
import { setAssetVersion } from './lib.mjs';
import { SITE, LOGO } from './content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'dist');
const BASE = new URL(SITE.url).pathname; // "/Served_redesigned/" on GitHub Pages

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets'), { recursive: true });

// stylesheet and script first: their hash versions every URL that points at them, so pages and assets from
// one deploy always arrive together
const css = ['base', 'chrome', 'components', 'pages', 'motion', 'hero'].map((f) => readFileSync(join(ROOT, `src/styles/${f}.css`), 'utf8')).join('\n');
const min = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n /g, '\n').trim();
const js = readFileSync(join(ROOT, 'src/scripts/site.js'), 'utf8');
const assetV = createHash('sha1').update(min).update(js).update(JSON.stringify(LOGO)).digest('hex').slice(0, 10);
setAssetVersion(assetV);
writeFileSync(join(OUT, 'assets/site.css'), min);
writeFileSync(join(OUT, 'assets/site.js'), js);

// pages
const list = pages();
for (const p of list) {
  if (p.path === '/404') {
    // GitHub Pages serves 404.html at whatever path was missed, so pin its relative links to the site base
    writeFileSync(join(OUT, '404.html'), p.html.replace('<head>', `<head>\n<base href="${BASE}">`));
    continue;
  }
  const dir = join(OUT, p.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), p.html);
}

// assets
cpSync(join(ROOT, 'src/assets/img'), join(OUT, 'assets/img'), { recursive: true });
cpSync(join(ROOT, 'src/assets/fonts'), join(OUT, 'assets/fonts'), { recursive: true });

// the official logo: a sprite (letters and full stop as separate symbols, filled with currentColor) for inline
// use, the same two shapes as plain files for CSS masks, and the favicon cut from its S, white on black
const vb = `0 0 ${LOGO.w} ${LOGO.h}`;
const lettersD = LOGO.s.d + LOGO.letters;
writeFileSync(join(OUT, 'assets/served-logo.svg'), `<svg xmlns="http://www.w3.org/2000/svg"><symbol id="letters" viewBox="${vb}"><path fill="currentColor" fill-rule="evenodd" d="${lettersD}"/></symbol><symbol id="dot" viewBox="${vb}"><path fill="currentColor" d="${LOGO.dot.d}"/></symbol></svg>`);
writeFileSync(join(OUT, 'assets/served-letters.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="none"><path fill-rule="evenodd" d="${lettersD}"/></svg>`);
writeFileSync(join(OUT, 'assets/served-dot.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="none"><path d="${LOGO.dot.d}"/></svg>`);
const [sx, sy, sw, sh] = LOGO.s.box; const k = 46 / sh;
const fav = (bg, rx) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="${bg}"/><path transform="translate(${((64 - sw * k) / 2 - sx * k).toFixed(2)} ${((64 - sh * k) / 2 - sy * k).toFixed(2)}) scale(${k.toFixed(5)})" fill="#fff" d="${LOGO.s.d}"/></svg>`;
writeFileSync(join(OUT, 'assets/favicon.svg'), fav('#0a0a0a', 14));

// installable app: the service worker carries a hash of this build, so every deploy installs a fresh one
// and clears the previous cache; the manifest names the app, its colours, start page and icons
const ver = createHash('sha1').update(assetV).update(list.map((p) => p.html).join('')).digest('hex').slice(0, 10);
writeFileSync(join(OUT, 'sw.js'), readFileSync(join(ROOT, 'src/scripts/sw.js'), 'utf8').replace('__BUILD__', ver));
writeFileSync(join(OUT, 'manifest.webmanifest'), JSON.stringify({
  name: 'Served.', short_name: 'Served', id: './', start_url: './', scope: './', display: 'standalone', lang: 'en-PH',
  description: 'No calls, no waiting, no guesswork. Book instantly and get on the court in minutes.',
  background_color: '#0a0a0a', theme_color: '#0a0a0a', categories: ['sports'],
  icons: [
    { src: 'assets/img/app-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'assets/img/app-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'assets/img/app-icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  shortcuts: [
    { name: 'Find a court', url: 'courts/', icons: [{ src: 'assets/img/app-icon-192.png', sizes: '192x192', type: 'image/png' }] },
    { name: 'Pricing', url: 'pricing/', icons: [{ src: 'assets/img/app-icon-192.png', sizes: '192x192', type: 'image/png' }] },
  ],
}, null, 2));

// sitemap, robots (preview: nothing indexed), .nojekyll
const urls = list.filter((p) => p.path !== '/404' && !p.path.startsWith('/lab/')).map((p) => `  <url><loc>${SITE.url}${p.path.replace(/^\//, '')}</loc></url>`).join('\n');
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `# Design concept preview: every page is noindex.\nUser-agent: *\nDisallow: /\n`);
writeFileSync(join(OUT, '.nojekyll'), '');

console.log(`built ${list.length} pages into ${OUT.replace(ROOT + '/', '')} (css ${(min.length / 1024).toFixed(0)} KB, assets v${assetV})`);
