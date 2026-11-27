// src/lib.mjs: helpers, layout chrome and shared components for the Served. rebuild.
// Every URL is written RELATIVE to the page that carries it, so the build serves from any sub-path.
import { SITE, IMAGES, SPORTS, CITIES, VENUES, RALLYX, CAPTURED_ON, LOGO, VENUE_COUNT, COURT_COUNT, playsSport } from './content.mjs';

// ---------------------------------------------------------------- page context + url helpers
let CUR = '/';
export const setPage = (p) => { CUR = p; };
// a hash of this build's stylesheet, script and logo, added to their URLs so a deploy never pairs new
// pages with a stylesheet the browser cached from the last one
let ASSET_V = 'dev';
export const setAssetVersion = (v) => { ASSET_V = v; };
const depth = () => CUR.split('/').filter(Boolean).length;
export const root = () => '../'.repeat(depth()) || './';
export function u(to) {
  if (/^(https?:|mailto:|tel:|#)/.test(to)) return to;
  const r = '../'.repeat(depth()) + to.replace(/^\//, '');
  return r === '' ? './' : (r.startsWith('?') ? './' + r : r);
}
export const a = (p) => '../'.repeat(depth()) + p;
// court photos on a concave carousel: a native, snapping horizontal scroller whose photos turn and come forward the
// further they sit from the centre (site.js sets the angles). items: [{ html, full, alt }]. No captions over the
// photos (client, 27 Nov 2026): what a photo shows lives in its alt text and its enlarge label.
export function carousel(items, label) {
  const n = items.length;
  return `<div class="cc" data-cc><div class="cc__track" data-cc-track tabindex="0" role="region" aria-roledescription="carousel" aria-label="${esc(label)}">${items.map((x, i) => `<figure class="cc__s" data-cc-slide aria-label="${i + 1} of ${n}"><button class="cc__btn" type="button" data-lightbox="${x.full}" aria-label="Enlarge photo: ${esc(x.alt)}">${x.html}</button></figure>`).join('')}</div><div class="cc__ui"><button class="iconbtn" type="button" data-cc-prev aria-label="Previous photo">${icon('back')}</button><span class="cc__count" data-cc-count aria-live="polite">1 / ${n}</span><button class="iconbtn" type="button" data-cc-next aria-label="Next photo">${icon('arrow')}</button></div></div>`;
}

// the official logo from the sprite the build writes: letters and full stop as two shapes, one colour
export const LOGO_VB = `0 0 ${LOGO.w} ${LOGO.h}`;
const logoUse = (id) => `${a('assets/served-logo.svg')}?v=${ASSET_V}#${id}`;
export const logoMark = (cls = 'logo__svg') => `<svg class="${cls}" viewBox="${LOGO_VB}" aria-hidden="true" focusable="false"><use href="${logoUse('letters')}"/><use class="logo__d" href="${logoUse('dot')}"/></svg>`;
export const logoPart = (id) => `<svg viewBox="${LOGO_VB}" aria-hidden="true" focusable="false"><use href="${logoUse(id)}"/></svg>`;
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const peso = (n) => '₱' + Number(n).toLocaleString('en-PH', { maximumFractionDigits: 2 });
export const json = (o) => esc(JSON.stringify(o));
// the period as a brand device: the full stop stays in the text, an orange ball is drawn behind it
export const dot = (s) => String(s).replace(/\.(?=\s|$|<)/g, '<span class="pd">.</span>');
export const fmtDate = (iso, opt = { day: 'numeric', month: 'short' }) => new Date(iso + 'T12:00:00+08:00').toLocaleDateString('en-PH', { ...opt, timeZone: 'Asia/Manila' });

// ---------------------------------------------------------------- images
export function img(name, { alt = '', sizes = '100vw', cls = '', eager = false, pos = '', attrs = '' } = {}) {
  const m = IMAGES[name];
  if (!m) throw new Error('unknown image ' + name);
  const set = m.sizes.map((s) => `${a(`assets/img/${name}-${s}.webp`)} ${s}w`).join(', ');
  const mid = m.sizes.find((s) => s >= 1000) || m.sizes.at(-1);
  return `<img src="${a(`assets/img/${name}-${mid}.webp`)}" srcset="${set}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''}${pos ? ` style="object-position:${pos}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${attrs ? ' ' + attrs : ''}>`;
}

// ---------------------------------------------------------------- icons
const I = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-ne': '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  pin: '<path d="M12 21s-6.5-5.8-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  star: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 19c1-3 3.4-4.5 6.5-4.5s5.5 1.5 6.5 4.5"/><circle cx="17" cy="9" r="2.8"/><path d="M16.4 14.6c2.5-.1 4.3 1.3 5.1 3.9"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  parking: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M10 16.5v-9h3.2a2.6 2.6 0 0 1 0 5.2H10"/>',
  shower: '<path d="M5 21V9a4 4 0 0 1 8 0v1"/><path d="M9.5 10h7"/><path d="M11 14v.01M14 14v.01M17 14v.01M12.5 17.5v.01M15.5 17.5v.01M14 21v.01"/>',
  locker: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 3v18M9 9v2.5M15 9v2.5"/>',
  shirt: '<path d="M8.5 4 4 7l2 3.2 2-1V20h8V9.2l2 1L20 7l-4.5-3c-.6 1.4-1.9 2.3-3.5 2.3S9.1 5.4 8.5 4z"/>',
  racket: '<ellipse cx="14.5" cy="9.5" rx="5" ry="6.2" transform="rotate(38 14.5 9.5)"/><path d="m10.6 14.2-6.1 6.1M11.6 6.6l6.3 5.6M13.9 4.9l3.4 9.6"/>',
  tennis: '<circle cx="12" cy="12" r="8.5"/><path d="M5.4 6.6c3 2.6 3 8.2 0 10.8M18.6 6.6c-3 2.6-3 8.2 0 10.8"/>',
  // paddle face and wrapped grip on the diagonal, perforated ball top right (client style, 27 Nov 2026)
  // the face is taller than wide so it reads as a paddle, not a lens; everything sits a full stroke inside the box
  pickleball: '<g transform="translate(10.2 13.6) rotate(-45)"><path d="M1.3 1.8a3 3 0 0 0 3-3v-5.6a3 3 0 0 0-3-3h-2.6a3 3 0 0 0-3 3v5.6a3 3 0 0 0 3 3v6.8a1.3 1.3 0 0 0 2.6 0z"/><path d="M-1.3 5.2 1.3 4M-1.3 7.4 1.3 6.2"/></g><circle cx="18.2" cy="5.8" r="3.4"/><path d="M18.2 4.5h.01M18.2 7.1h.01M16.9 5.8h.01M19.5 5.8h.01" stroke-width="1.25"/>',
  badminton: '<path d="M7.5 14.5 4 4.5l3.8 1.6L10.4 3l1.6 3.3L13.6 3l2.6 3.1L20 4.5l-3.5 10z"/><path d="M7.5 14.5h9"/><path d="M8.3 14.5a3.7 3.7 0 0 0 7.4 0"/>',
  basketball: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5v17M6.3 5.7c2.6 2.2 2.6 10.4 0 12.6M17.7 5.7c-2.6 2.2-2.6 10.4 0 12.6"/>',
  padel: '<path d="M12 2.8c3.6 0 6.2 2.7 6.2 6.3 0 3.4-2.4 6.3-5 6.9v4.2a1.2 1.2 0 0 1-2.4 0V16c-2.6-.6-5-3.5-5-6.9 0-3.6 2.6-6.3 6.2-6.3z"/><path d="M9.6 7.4h.01M12 7.4h.01M14.4 7.4h.01M10.8 9.8h.01M13.2 9.8h.01M12 12.2h.01"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14.5 6.5v11" stroke-dasharray="1.6 2.2"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  wallet: '<path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h11v3"/><rect x="4" y="8" width="16" height="11" rx="2.5"/><circle cx="16" cy="13.5" r="1.2"/>',
  qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2"/>',
  bank: '<path d="M3 9.5 12 4l9 5.5M5 10.5v7.5M9.5 10.5v7.5M14.5 10.5v7.5M19 10.5v7.5M3 20h18"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  // a real pickleball court from above: kitchen lines either side of the net, centre lines to the baselines
  court: '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M8.6 7v10M12 7v10M15.4 7v10M2 12h6.6M15.4 12H22"/>',
  locate: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="9.5" r="1.8"/><path d="m21 16-5-5-8 9"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/>',
  whistle: '<circle cx="9" cy="14" r="5"/><path d="M12.5 10.5 20 5v4l-5.2 3"/><path d="M9 14h.01"/>',
  play: '<path d="M8 5.5v13l10-6.5z"/>',
  home: '<path d="M4 11 12 4l8 7v9h-5.5v-5.5h-5V20H4z"/>',
  phone: '<path d="M6.5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
};
export const icon = (n, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;
export const sprite = () => `<svg class="sprite" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>${Object.entries(I).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join('')}</defs></svg>`;
export const sportOf = (name) => SPORTS.find((s) => s.name === name || s.slug === name);
export const amenityIcon = (am) => ({ Lights: 'bulb', Parking: 'parking', Showers: 'shower', Lockers: 'locker', 'Changing rooms': 'shirt', 'Equipment rental': 'racket' }[am] || 'check');

// ---------------------------------------------------------------- small components
export const kicker = (t, cls = '') => `<p class="kicker${cls ? ' ' + cls : ''}"><span class="kicker__ball" aria-hidden="true"></span>${t}</p>`;
export function sh({ k, h, lede, tag = 'h2', size = 'd2', cls = '', id = '' }) {
  return `<header class="sh ${cls}"${id ? ` id="${id}"` : ''} data-reveal>${k ? kicker(k) : ''}<${tag} class="${size}">${h}</${tag}>${lede ? `<p class="lede">${lede}</p>` : ''}</header>`;
}
export const btn = (label, href, cls = 'btn--accent', extra = '') => `<a class="btn ${cls}" href="${u(href)}"${extra}><span>${label}</span>${icon(/^https?:/.test(href) ? 'arrow-ne' : 'arrow')}</a>`;
export const ctas = (...b) => `<div class="ctas">${b.join('')}</div>`;
export const chipSport = (s, cls = '') => { const sp = sportOf(s); return `<span class="chip chip--sport ${cls}" data-tone="${sp.tone}">${icon(sp.icon)}${sp.name}</span>`; };
export const score = (v) => v.reviewCount ? `<span class="score" title="${v.rating} out of 5 from ${v.reviewCount} reviews">${icon('star', 'ico--fill')}<b>${v.rating.toFixed(1)}</b><small>${v.reviewCount} reviews</small></span>` : `<span class="score score--new">${icon('sparkle')}<b>New</b><small>no reviews yet</small></span>`;
export const priceTag = (v, big = false) => `<p class="price${big ? ' price--big' : ''}"><b>${peso(v.rate)}</b><span>/ hr</span><small>${v.sample ? '<em class="sample">Sample rate</em> ' : ''}exclusive of service fees</small></p>`;
export const nextTag = (v) => `<p class="next" data-next="${esc(v.open.join(','))}">${icon('cal')}<span>Next: <b>${fmtDate(v.open[0])}</b></span></p>`;
export const linesSvg = () => `<svg class="cl" viewBox="0 0 400 240" preserveAspectRatio="none" aria-hidden="true"><path d="M8 8h384v224H8zM8 44h384M8 196h384M200 8v224M104 44v152M296 44v152M104 120h192" pathLength="1"/></svg>`;

// a court of the venue's sport seen from above, length across: line positions are the real court's, in feet
export function courtPath(sport, x0, y0, w, h) {
  const X = (f) => +(x0 + w * f).toFixed(2), Y = (f) => +(y0 + h * f).toFixed(2);
  const v = (f, a = 0, b = 1) => `M${X(f)} ${Y(a)}V${Y(b)}`;
  const hz = (f, a = 0, b = 1) => `M${X(a)} ${Y(f)}H${X(b)}`;
  const s = String(sport).toLowerCase();
  if (s === 'tennis') { const al = 4.5 / 36, sv = 18 / 78; return hz(al) + hz(1 - al) + v(.5) + v(sv, al, 1 - al) + v(1 - sv, al, 1 - al) + hz(.5, sv, 1 - sv); }
  if (s === 'badminton') { const al = 1.5 / 20, lb = 2.5 / 44, ss = 15.5 / 44; return hz(al) + hz(1 - al) + v(lb) + v(1 - lb) + v(ss) + v(1 - ss) + v(.5) + hz(.5, 0, ss) + hz(.5, 1 - ss, 1); }
  const k = 15 / 44; return v(k) + v(.5) + v(1 - k) + hz(.5, 0, k) + hz(.5, 1 - k, 1);
}
const roundRect = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}z`;
export const courtSvg = (sport, cls = '') => `<svg class="${cls}" viewBox="0 0 90 42" aria-hidden="true" focusable="false"><path d="${roundRect(1, 1, 88, 40, 4)}${courtPath(sport, 1, 1, 88, 40)}"/></svg>`;
export const courtD = (sport, x, y, w, h, r = 4) => roundRect(x, y, w, h, r) + courtPath(sport, x, y, w, h);

export function vcard(v, { variant = '', lazy = true } = {}) {
  const sp = sportOf(v.sport);
  return `<article class="vcard ${variant}" data-tone="${sp.tone}" data-tilt data-reveal>
  <a class="vcard__media" href="${u(`/courts/${v.slug}/`)}" tabindex="-1" aria-hidden="true">${img(v.img, { alt: '', sizes: '(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw' })}${v.featured ? '<span class="ribbon">Featured</span>' : ''}</a>
  <div class="vcard__tags">${chipSport(v.sport)}${score(v)}</div>
  <div class="vcard__body">
    <h3 class="vcard__name"><a href="${u(`/courts/${v.slug}/`)}">${esc(v.name)}</a></h3>
    <p class="vcard__meta">${icon('pin')}<span>${esc(v.address)}</span><span class="sep">/</span><span>${esc(v.surface)}</span><span class="sep">/</span><span>${v.courts} courts</span></p>
    <p class="vcard__desc">${esc(v.desc)}</p>
    <div class="vcard__foot">${priceTag(v)}${nextTag(v)}</div>
    <div class="ctas ctas--card"><a class="btn btn--accent btn--sm" href="${u(`/courts/${v.slug}/availability/`)}"><span>Book Now</span>${icon('arrow')}</a><a class="btn btn--ghost btn--sm" href="${u(`/courts/${v.slug}/`)}"><span>View Court</span></a></div>
  </div>
  <span class="glint" aria-hidden="true"></span>
</article>`;
}

// Rally X, live: books like any venue, on the sample rates and courts set in content.mjs (marked as samples)
export function rallyCard(cls = '') {
  const R = RALLYX;
  return `<article class="vcard ${cls}" data-tone="heat" data-tilt data-reveal>
  <a class="vcard__media" href="${u('/courts/rally-x/')}" tabindex="-1" aria-hidden="true">${img(R.img, { alt: '', sizes: '(min-width: 1100px) 33vw, 100vw', pos: '50% 60%' })}<span class="ribbon">Now open</span></a>
  <div class="vcard__tags">${chipSport('Pickleball')}${chipSport('Tennis')}</div>
  <div class="vcard__body">
    <h3 class="vcard__name"><a href="${u('/courts/rally-x/')}">Rally X</a></h3>
    <p class="vcard__meta">${icon('pin')}<span>${esc(R.address)}</span></p>
    <p class="vcard__desc">${esc(R.desc)}</p>
    <div class="vcard__foot">${priceTag(R)}${nextTag(R)}</div>
    <div class="ctas ctas--card"><a class="btn btn--accent btn--sm" href="${u('/courts/rally-x/availability/')}"><span>Book Now</span>${icon('arrow')}</a><a class="btn btn--ghost btn--sm" href="${u('/courts/rally-x/')}"><span>View Court</span></a></div>
  </div>
  <span class="glint" aria-hidden="true"></span>
</article>`;
}

// a venue that is coming to Served: no price, no booking, a page with a notify form
export function soonCard(s) {
  return `<article class="vcard vcard--soon" data-tone="${s.tone}" data-tilt data-reveal>
  <a class="vcard__media" href="${u(`/courts/${s.slug}/`)}" tabindex="-1" aria-hidden="true">${img(s.img, { alt: '', sizes: '(min-width: 1100px) 33vw, 100vw' })}<span class="ribbon ribbon--rust">Opening soon</span></a>
  <div class="vcard__tags">${chipSport(s.sport)}</div>
  <div class="vcard__body">
    <h3 class="vcard__name"><a href="${u(`/courts/${s.slug}/`)}">${esc(s.name)}</a></h3>
    <p class="vcard__meta">${icon('pin')}<span>${esc(s.address)}</span></p>
    <p class="vcard__desc">${esc(s.sport)} courts coming to Served. Rates, hours and courts are announced when booking opens.</p>
    <div class="vcard__foot"><p class="price price--soon"><b>Soon</b><span>on Served.</span></p></div>
    <div class="ctas ctas--card"><a class="btn btn--ghost btn--sm" href="${u(`/courts/${s.slug}/#notify`)}"><span>Get notified</span>${icon('arrow')}</a></div>
  </div>
  <span class="glint" aria-hidden="true"></span>
</article>`;
}

// speed: a multiple of the base marquee speed (1 = the hero board's pace)
export function marquee(words, cls = '', speed = 1) {
  const run = words.map((w, i) => `<span class="mq__w${i % 2 ? ' mq__w--o' : ''}">${w}</span><span class="mq__ball" aria-hidden="true"></span>`).join('');
  return `<div class="mq ${cls}" data-marquee${speed === 1 ? '' : `="${speed}"`} aria-hidden="true"><div class="mq__track"><div class="mq__run">${run}</div><div class="mq__run">${run}</div></div></div>`;
}

// a court-line section divider: baseline, service line tick and a net that draws itself on scroll
export const divider = (cls = '') => `<div class="cdiv ${cls}" aria-hidden="true"><svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path class="cdiv__base" d="M0 40H1440" pathLength="1" data-draw/><path class="cdiv__t" d="M720 14V66" pathLength="1" data-draw/><path class="cdiv__net" d="M360 40h720" pathLength="1"/></svg><span class="cdiv__ball"></span></div>`;

export function faqList(items, cls = '') {
  return `<div class="faq ${cls}">${items.map((f) => `<details class="faq__item" data-reveal data-cat="${esc(f.cat)}"><summary><span>${esc(f.q)}</span><i aria-hidden="true">${icon('plus')}</i></summary><div class="faq__a"><p>${esc(f.a)}</p></div></details>`).join('')}</div>`;
}

// ---------------------------------------------------------------- chrome
const navData = () => ({
  courts: {
    sports: SPORTS.map((s) => ({ ...s, n: playsSport(s.name).length })),
    cities: CITIES.map((c) => ({ ...c, n: VENUES.filter((v) => v.city === c.name).length })),
  },
});

function mega() {
  const d = navData();
  const sportLinks = d.courts.sports.map((s) => s.live
    ? `<a class="mega__link" href="${u(`/courts/?sport=${s.name}`)}" data-tone="${s.tone}">${icon(s.icon)}<span>${s.name} courts<small>${s.n} venue${s.n > 1 ? 's' : ''}</small></span></a>`
    : `<a class="mega__link is-soon" href="${u(`/sports/#${s.slug}`)}" data-tone="${s.tone}">${icon(s.icon)}<span>${s.name}<small>Coming soon</small></span></a>`).join('');
  const cityLinks = d.courts.cities.map((c) => `<a class="mega__link mega__link--city" href="${u(`/cities/${c.slug}/`)}"><span>${c.name}<small>${c.n} venue${c.n > 1 ? 's' : ''}</small></span></a>`).join('');
  return {
    courts: `<div class="mega__cols">
      <div class="mega__col"><p class="mega__h">By sport</p>${sportLinks}</div>
      <div class="mega__col"><p class="mega__h">By city</p><div class="mega__grid">${cityLinks}</div></div>
      <div class="mega__col"><p class="mega__h">Browse</p>
        <a class="mega__link" href="${u('/courts/')}">${icon('court')}<span>All courts<small>Every venue, one list</small></span></a>
        <a class="mega__link" href="${u('/courts/?view=map')}">${icon('map')}<span>Map view<small>See what is near</small></span></a>
        <a class="mega__link" href="${u('/courts/?sort=rating')}">${icon('star')}<span>Top rated<small>Sorted by players</small></span></a>
        <a class="mega__link" href="${u('/sports/')}">${icon('sparkle')}<span>All sports<small>Live and coming soon</small></span></a></div>
      <a class="mega__card" href="${u('/courts/rally-x/')}">${img('rallyx-now-open', { alt: '', sizes: '280px' })}<span><small>Now on Served</small><b>Rally X</b>Pickleball and tennis, book now</span></a></div>`,
    play: `<div class="mega__cols mega__cols--play">
      <div class="mega__col mega__col--wide"><p class="mega__h">Play mode <em class="soon">Coming soon</em></p><div class="mega__grid mega__grid--2">
      ${['open-play:Open play:users:Join a game near you', 'find-players:Find players:search:Need a fourth?', 'clubs:Club ranking:flag:Your crew, organised', 'tournaments:Tournaments:trophy:Brackets and courts', 'events:Events:ticket:Clinics and socials'].map((x) => { const [id, n, ic, s] = x.split(':'); return `<a class="mega__link" href="${u(`/play/#${id}`)}">${icon(ic)}<span>${n}<small>${s}</small></span></a>`; }).join('')}</div></div>
      <a class="mega__card" href="${u('/play/')}">${img('rallyx-ready-position', { alt: '', sizes: '280px', pos: '50% 30%' })}<span><small>Concept preview</small><b>Who’s playing?</b>See how Play mode will work</span></a></div>`,
    pricing: `<div class="mega__cols mega__cols--sm">
      <div class="mega__col"><p class="mega__h">Pricing</p>
      <a class="mega__link" href="${u('/pricing/#players')}">${icon('user')}<span>For players<small>Venue rate plus a 5% service fee</small></span></a>
      <a class="mega__link" href="${u('/pricing/#owners')}">${icon('court')}<span>For court owners<small>₱0 to list, every month</small></span></a></div>
      <div class="mega__note board"><p class="mega__h">Player pays</p><p class="mega__num">${peso(525)}</p><p>on a ${peso(500)} court hour. The venue receives ${peso(500)}.</p></div></div>`,
    list: `<div class="mega__cols mega__cols--sm">
      <div class="mega__col"><p class="mega__h">For venues</p>
      <a class="mega__link" href="${u('/list-your-court/')}">${icon('info')}<span>How listing works<small>Three steps to your first booking</small></span></a>
      <a class="mega__link" href="${u('/sign-up/?role=owner')}">${icon('plus')}<span>Start listing<small>Free, no subscription</small></span></a>
      <a class="mega__link" href="${u('/staff/sign-in/')}">${icon('users')}<span>Staff sign in<small>Front desk access</small></span></a></div>
      <a class="mega__card" href="${u('/list-your-court/')}">${img('live-cta-court', { alt: '', sizes: '280px' })}<span><small>Register your court</small><b>We already built the traffic.</b>You bring the court.</span></a></div>`,
  };
}

export function header(active = '') {
  const m = mega();
  const item = (key, label, panel) => `<li class="nav__item" data-mega>
    <button class="nav__btn${active === key ? ' is-active' : ''}" type="button" aria-expanded="false" aria-controls="mega-${key}">${label}${icon('chev')}</button>
    <div class="mega" id="mega-${key}" hidden><div class="mega__in">${panel}</div></div></li>`;
  return `<a class="skip" href="#main">Skip to content</a>
<header class="hdr" data-hdr>
  <div class="hdr__in">
    <a class="logo" href="${u('/')}" aria-label="Served. home">${logoMark()}</a>
    <nav class="nav" aria-label="Main"><ul class="nav__list">
      ${item('courts', 'Courts', m.courts)}
      ${item('play', 'Play', m.play)}
      ${item('pricing', 'Pricing', m.pricing)}
      ${item('list', 'List Your Court', m.list)}
      <li class="nav__item"><a class="nav__a${active === 'contact' ? ' is-active' : ''}" href="${u('/contact/')}">Contact Us</a></li>
    </ul></nav>
    <div class="hdr__acts">
      <a class="hdr__in-link" href="${u('/sign-in/')}" data-acct>${icon('user')}<span>Login / Register</span></a>
      <a class="btn btn--accent btn--sm hdr__book" href="${u('/courts/')}"><span>Book a court</span></a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Open menu" data-burger><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" hidden data-drawer>
  <div class="drawer__in">
    <form class="drawer__search" action="${u('/courts/')}" method="get" role="search"><label class="sr" for="dq">Search courts</label>${icon('search')}<input id="dq" name="q" type="search" placeholder="Court name or city" autocomplete="off"><button class="btn btn--accent btn--sm" type="submit"><span>Search</span></button></form>
    <nav class="drawer__nav" aria-label="Mobile">
      <a href="${u('/')}">Home</a><a href="${u('/courts/')}">Courts</a><a href="${u('/play/')}">Play <em class="soon">Soon</em></a><a href="${u('/pricing/')}">Pricing</a><a href="${u('/list-your-court/')}">List Your Court</a><a href="${u('/help/')}">Help</a><a href="${u('/contact/')}">Contact Us</a>
    </nav>
    <p class="drawer__h">Sports</p>
    <div class="drawer__chips">${SPORTS.filter((s) => s.live).map((s) => `<a class="chip chip--sport" data-tone="${s.tone}" href="${u(`/courts/?sport=${s.name}`)}">${icon(s.icon)}${s.name}</a>`).join('')}</div>
    <p class="drawer__h">Cities</p>
    <div class="drawer__chips">${CITIES.map((c) => `<a class="chip" href="${u(`/cities/${c.slug}/`)}">${c.name}</a>`).join('')}</div>
    <div class="ctas drawer__ctas"><a class="btn btn--ghost" href="${u('/sign-in/')}" data-acct><span>Login / Register</span></a><a class="btn btn--accent" href="${u('/courts/')}"><span>Book a court</span>${icon('arrow')}</a></div>
  </div>
</div>`;
}

// the sticky bar: shows past the hero, hides at the footer, while typing and with the drawer open; x hides it for the session
export function stickyBar(kind = 'site', v = null) {
  if (kind === 'venue' && v) {
    return `<aside class="stick" data-stick aria-label="Book ${esc(v.name)}" hidden><div class="stick__in">
      <span class="stick__thumb">${img(v.img, { alt: '', sizes: '56px' })}</span>
      <p class="stick__txt"><b>${esc(v.name)}</b><small>${peso(v.rate)} / hr${v.sample ? ' (sample)' : ''} <span class="sep">/</span> <span data-next-short="${esc(v.open.join(','))}">Next: ${fmtDate(v.open[0])}</span></small></p>
      <div class="stick__acts"><a class="btn btn--accent btn--sm" href="${CUR === `/courts/${v.slug}/` ? '#book' : u(`/courts/${v.slug}/availability/`)}"><span>Book a slot</span>${icon('arrow')}</a></div>
      <button class="stick__x" type="button" data-stick-x aria-label="Hide this bar">${icon('close')}</button></div></aside>`;
  }
  return `<aside class="stick" data-stick aria-label="Quick booking" hidden><div class="stick__in">
    <p class="stick__txt"><b>Your next game is calling.</b><small>${VENUE_COUNT} venues <span class="sep">/</span> ${COURT_COUNT} courts <span class="sep">/</span> 3 sports</small></p>
    <div class="stick__acts">
      <a class="stick__ic" href="${u('/courts/?view=map')}" aria-label="Map view">${icon('map')}<span>Map</span></a>
      <a class="btn btn--accent btn--sm" href="${u('/courts/')}"><span>Find a court</span>${icon('arrow')}</a>
    </div>
    <button class="stick__x" type="button" data-stick-x aria-label="Hide this bar">${icon('close')}</button></div></aside>`;
}

// the closing band, centred: a split-flap board that clacks through to GAME ON. Each tile has a still upper and lower
// half and two flaps that turn over them (site.js); the markup already reads GAME ON. without script or motion.
// The full stop is the Served. ball.
const flapFace = (ch) => (ch === '.' ? '<b class="flap__ball"></b>' : esc(ch));
const flapTile = (ch, i) => `<span class="flap__t" data-ch="${esc(ch)}" style="--i:${i}">${['u', 'l', 'fu', 'fl'].map((k) => `<span class="flap__h flap__${k}"><i>${flapFace(ch)}</i></span>`).join('')}</span>`;
export function finalCta() {
  let i = 0;
  const board = [...'GAME ON.'].map((ch) => (ch === ' ' ? '<span class="flap__gap"></span>' : flapTile(ch, i++))).join('');
  return `<section class="band band--accent fin" aria-labelledby="fin-h">
  <div class="band__clip" aria-hidden="true"><span class="fin__lines">${linesSvg()}</span></div>
  <div class="wrap fin__in">
    ${kicker('Your next game is calling', 'fin__k')}
    <h2 class="fin__h" id="fin-h"><span class="sr">Game on.</span><span class="flap" data-flap aria-hidden="true">${board}</span></h2>
    <p class="lede fin__lede">Find your court, lock your slot, and show up ready to play.</p>
    ${ctas(btn('Search courts', '/courts/', 'btn--ink btn--lg'), btn('List your court', '/list-your-court/', 'btn--line btn--lg'))}
  </div>
</section>`;
}

// a venue's own header and footer (see layout's own). fill: the listing template, filled in the browser (data-l)
export function ownHeader(o) {
  const N = o.fill ? ' data-l="name"' : '', M = o.fill ? ' data-l="mono"' : '', P = o.fill ? ' data-l-page' : '';
  return `<a class="skip" href="#main">Skip to content</a>
<header class="vbar vbar--top" data-own-bar><div class="wrap vbar__in">
  <a class="vbar__brand" href="${o.home}" aria-label="${esc(o.name)}${o.home === '#top' ? ', back to top' : ', venue page'}"><span class="vbar__mono" aria-hidden="true"${M}>${esc(o.name[0])}</span><b${N}>${esc(o.short || o.name)}</b></a>
  ${o.links && o.links.length ? `<nav class="vbar__links" aria-label="${esc(o.name)}"${P}>${o.links.map(([t, h, x = '']) => `<a href="${h}"${x}>${t}</a>`).join('')}</nav>` : ''}
  ${o.cta ? `<a class="btn btn--accent btn--sm vbar__go" href="${o.cta[1]}"${P}><span>${o.cta[0]}</span>${icon('arrow')}</a>` : ''}
</div></header>`;
}
export function ownFooter(o) {
  const N = o.fill ? ' data-l="name"' : '', M = o.fill ? ' data-l="mono"' : '', A = o.fill ? ' data-l="address"' : '';
  return `<footer class="vend vend--foot" data-ftr><div class="wrap vend__in">
  <span class="vend__mono" aria-hidden="true"${M}>${esc(o.name[0])}</span>
  <div class="vend__id"><b${N}>${esc(o.name)}</b><span${A}>${esc(o.address || '')}</span></div>
  ${o.cta ? `<a class="btn btn--accent" href="${o.cta[1]}"${o.fill ? ' data-l-page' : ''}><span>${o.cta[0] === 'Book now' ? 'Book a court' : o.cta[0]}</span>${icon('arrow')}</a>` : ''}
  <p class="vend__by"><span>Bookings by</span><a class="vend__served" href="${u('/')}" aria-label="Served. home">${logoMark('vend__logo')}</a><span class="vend__fine">Design concept preview <span class="sep">/</span> <a href="${u('/gallery/#credits')}">Photo credits</a></span></p>
</div></footer>`;
}

export function footer() {
  const col = (h, links) => `<details class="ftr__col" open><summary>${h}${icon('chev')}</summary><ul>${links.map(([t, href]) => `<li><a href="${u(href)}">${t}</a></li>`).join('')}</ul></details>`;
  return `<footer class="ftr" data-ftr>
  <div class="wrap ftr__top">
    <div class="ftr__brand">
      <a class="logo logo--lg" href="${u('/')}" aria-label="Served. home">${logoMark()}</a>
      <p>${esc(SITE.blurb)}</p>
      <p class="ftr__contact"><a href="mailto:${SITE.email}">${icon('mail')}${SITE.email}</a><span>${icon('clock')}${SITE.hours}</span></p>
    </div>
    <div class="ftr__cols">
      ${col('Info', [['Home', '/'], ['Tournaments', '/play/#tournaments'], ['Court Gallery', '/gallery/'], ['Club Ranking', '/courts/?sort=rating'], ['Events', '/play/#events'], ['Registration', '/sign-up/'], ['Staff sign in', '/staff/sign-in/']])}
      ${col('Courts', [['All courts', '/courts/'], ['Pickleball', '/sports/pickleball/'], ['Tennis', '/sports/tennis/'], ['Badminton', '/sports/badminton/'], ['Cities', '/cities/'], ['Rally X', '/courts/rally-x/']])}
      ${col('Served.', [['About', '/about/'], ['Play mode', '/play/'], ['Pricing', '/pricing/'], ['List Your Court', '/list-your-court/'], ['Help and FAQ', '/help/'], ['Contact Us', '/contact/']])}
    </div>
  </div>
  <div class="ftr__word" aria-hidden="true"><span class="ftr__w"></span><span class="ftr__d" data-bounce></span></div>
  <div class="wrap ftr__base">
    <p>&copy; Copyright 2026 Served. All Rights Reserved.</p>
    <p class="ftr__pill">Design concept preview <span class="sep">/</span> not the live Served. website</p>
    <p><a href="${u('/gallery/#credits')}">Photo credits</a><span class="sep">/</span><span>Venue data as of ${fmtDate(CAPTURED_ON, { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
  </div>
</footer>`;
}

const splash = () => `<div class="splash" aria-hidden="true" data-splash><div class="splash__court">${linesSvg()}</div><div class="splash__mark"><span class="splash__w">${logoPart('letters')}</span><span class="splash__ball">${logoPart('dot')}</span></div></div>`;

// vslug marks a venue's own pages (page, booking, Rally X) so an owner's page settings can be applied to them
// own: a venue's own page (its page, its booking pages, a listing, a venue opening soon). The venue's bar is the header
// and its sign-off the footer; no Served menus, splash or closing band, and no other courts, so the link or QR code an
// owner shares opens what reads as the venue's own site. Served shows only as "Bookings by Served.".
export function layout({ path, title, desc, body, active = '', bodyCls = '', sticky = 'site', venue = null, schema = null, ogImg = 'og-served.jpg', noFinal = false, vslug = venue ? venue.slug : '', own = null }) {
  setPage(path);
  const full = title.includes('Served') ? title : `${title} | Served.`;
  const html = `<!doctype html>
<html lang="en-PH" class="no-js"${own ? ' data-own' : ''} data-root="${root()}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="${SITE.url}${path.replace(/^\//, '')}">
<meta name="theme-color" content="#0a0a0a">
<meta property="og:type" content="website"><meta property="og:site_name" content="Served."><meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${SITE.url}assets/img/${ogImg}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${a('assets/favicon.svg')}" type="image/svg+xml">
<link rel="manifest" href="${a('manifest.webmanifest')}">
<link rel="apple-touch-icon" href="${a('assets/img/app-icon-180.png')}">
<link rel="preload" href="${a('assets/fonts/archivo-var.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${a('assets/fonts/jakarta-var.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${a('assets/site.css')}?v=${ASSET_V}">
<script>(function(d){d.classList.remove('no-js');d.classList.add('js');try{if(!d.hasAttribute('data-own')&&!sessionStorage.getItem('srv.splash')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('splash-on')}catch(e){}setTimeout(function(){if(!window.__srv){d.classList.remove('splash-on');d.classList.add('reveal-all')}},3000)})(document.documentElement)</script>
<script defer src="${a('assets/site.js')}?v=${ASSET_V}"></script>
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
</head>
<body class="${bodyCls}${own ? ' is-own' : ''}"${vslug ? ` data-venue="${vslug}"` : ''}>
${sprite()}
${own ? '' : splash()}
${own ? ownHeader(own) : header(active)}
<main id="main">
${body}
${noFinal || own ? '' : finalCta()}
</main>
${own ? ownFooter(own) : footer()}
${sticky ? stickyBar(sticky, venue) : ''}
<div class="toast" role="status" aria-live="polite" data-toast></div>
</body>
</html>`;
  return html;
}
