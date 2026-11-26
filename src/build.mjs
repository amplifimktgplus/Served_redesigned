// src/build.mjs: renders every page into dist/, copies assets, concatenates CSS and JS, writes sitemap, robots and 404.
// Usage: node src/build.mjs [--out dist]
import { rmSync, mkdirSync, writeFileSync, readFileSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from './pages.mjs';
import { SITE } from './content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'dist');
const BASE = new URL(SITE.url).pathname; // "/Served_redesigned/" on GitHub Pages

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets'), { recursive: true });

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
const css = ['base', 'chrome', 'components', 'pages', 'motion'].map((f) => readFileSync(join(ROOT, `src/styles/${f}.css`), 'utf8')).join('\n');
const min = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n /g, '\n').trim();
writeFileSync(join(OUT, 'assets/site.css'), min);
writeFileSync(join(OUT, 'assets/site.js'), readFileSync(join(ROOT, 'src/scripts/site.js'), 'utf8'));
writeFileSync(join(OUT, 'assets/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#101515"/><circle cx="32" cy="32" r="17" fill="#c6ea2b"/><path d="M19.5 21.5c6 5 6 16 0 21M44.5 21.5c-6 5-6 16 0 21" fill="none" stroke="#101515" stroke-width="2.6" stroke-linecap="round"/></svg>`);

// sitemap, robots (preview: nothing indexed), .nojekyll
const urls = list.filter((p) => p.path !== '/404').map((p) => `  <url><loc>${SITE.url}${p.path.replace(/^\//, '')}</loc></url>`).join('\n');
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `# Design concept preview: every page is noindex.\nUser-agent: *\nDisallow: /\n`);
writeFileSync(join(OUT, '.nojekyll'), '');

console.log(`built ${list.length} pages into ${OUT.replace(ROOT + '/', '')} (css ${(min.length / 1024).toFixed(0)} KB)`);
