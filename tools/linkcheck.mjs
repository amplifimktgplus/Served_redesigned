// tools/linkcheck.mjs: every local href, src and srcset candidate in dist/ must resolve to a file.
// Also proves the "no empty destination" rule: every Book / category link lands on a page that lists bookable venues.
// Usage: node tools/linkcheck.mjs [dist]
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, process.argv[2] || 'dist');
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith('.html') ? [join(d, e.name)] : []);
const files = walk(DIST);
let refs = 0; const bad = [];
const target = (from, ref) => {
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return null;
  let p = resolve(dirname(from), decodeURIComponent(clean));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  return p;
};
for (const f of files) {
  if (f.endsWith('404.html')) continue; // uses <base href>, checked on the live preview
  const html = readFileSync(f, 'utf8');
  const found = [];
  for (const m of html.matchAll(/\s(?:href|src|data-lightbox)="([^"]+)"/g)) found.push(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) m[1].split(',').forEach((c) => found.push(c.trim().split(/\s+/)[0]));
  for (const ref of found) {
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(ref)) continue;
    refs++;
    const t = target(f, ref);
    if (t && !existsSync(t)) bad.push(`${f.replace(DIST, '')} -> ${ref}`);
  }
}
// destination rule: every "Book" / sport / category link must land on a page that carries venue cards or a booking widget
const destBad = [];
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<a [^>]*href="([^"#]+)"[^>]*>(?:(?!<\/a>)[\s\S])*?(Book|courts|Courts|Search courts|Find a court)(?:(?!<\/a>)[\s\S])*?<\/a>/g)) {
    const t = target(f, m[1]); if (!t || !existsSync(t)) continue;
    const dest = readFileSync(t, 'utf8');
    if (!/class="vcard|data-book=|data-disc/.test(dest)) destBad.push(`${f.replace(DIST, '')} -> ${m[1]}`);
  }
}
console.log(`pages ${files.length}, local refs ${refs}, broken ${bad.length}`);
[...new Set(bad)].slice(0, 40).forEach((b) => console.log('  BROKEN', b));
console.log(`booking/category links landing on a page without venues or a booking widget: ${new Set(destBad).size}`);
[...new Set(destBad)].slice(0, 20).forEach((b) => console.log('  EMPTY-DEST', b));
process.exit(bad.length || destBad.length ? 1 : 0);
