// src/pages.mjs: one function per page type. Captured words are carried verbatim; new pages are written for Served.
import { SITE, SPORTS, CITIES, VENUES, RALLYX, SOON, VENUE_COUNT, COURT_COUNT, playsSport, courtsFor, COLLECTIONS, FAQ, PLAY, ROADMAP, CREDITS, CAPTURED_ON, IMAGES } from './content.mjs';
import { layout, u, a, esc, peso, json, dot, fmtDate, img, icon, kicker, sh, btn, ctas, chipSport, score, priceTag, nextTag, courtSvg, courtD, logoMark, carousel,
  vcard, rallyCard, soonCard, marquee, divider, faqList, sportOf, amenityIcon, setPage } from './lib.mjs';

const TOTAL_COURTS = COURT_COUNT; // Rally X included
const minRate = (list) => Math.min(...list.filter((v) => !v.sample).map((v) => v.rate)); // a sample rate never sets a 'from' price
const crumbs = (items) => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map(([t, h], i) => i === items.length - 1 ? `<li aria-current="page">${esc(t)}</li>` : `<li><a href="${u(h)}">${esc(t)}</a></li>`).join('')}</ol></nav>`;
const demoNote = (t = 'Preview build: this form does not send anything.') => `<p class="demo-note">${icon('info')}${t}</p>`;
const venueHref = (v) => u(`/courts/${v.slug}/`);
// a venue's own header and footer (layout own): its sections, on its page or linked back to from its booking pages
const ownOf = (v, onPage) => {
  const at = (id) => (onPage ? `#${id}` : `${venueHref(v)}#${id}`);
  const links = v === RALLYX ? [['Book', '#book'], ['Photos', at('photos')], ['About', at('about')]]
    : [['Book', '#book'], ['About', at('about')], ...(onPage ? [['Photos', '#photos', ' data-vgal-link hidden']] : []), ['Location', at('location')], ['Reviews', at('reviews')]];
  return { name: v.name, address: v.address, home: onPage ? '#top' : venueHref(v), links, cta: ['Book now', '#book'] };
};

function phero({ k, h1, lede, crumb, img: im, tone = '', cls = '', extra = '', pos = '' }) {
  return `<section class="phero band band--night ${cls}"${tone ? ` data-tone="${tone}"` : ''}>
  <div class="band__clip" aria-hidden="true">${im ? `<figure class="phero__bg" data-depth="0.12">${img(im, { alt: '', sizes: '100vw', eager: true, pos })}</figure>` : ''}<span class="phero__scrim"></span>${im ? '' : '<span class="band__grid"></span>'}</div>
  <div class="wrap phero__in">${crumb ? crumbs(crumb) : ''}${k ? kicker(k) : ''}<h1 class="d1 phero__h" data-reveal>${h1}</h1>${lede ? `<p class="lede phero__lede" data-reveal>${lede}</p>` : ''}${extra}</div>
</section>`;
}

// ============================================================ RALLY X spotlight (home), shared with its layout options at /lab/rally-x/
const RX_LEDE = 'Pickleball and tennis under one roof: lime lines on the floor, a wall of paddles and the city right outside. Now open.';
const rxChips = () => `<p class="chips">${chipSport('Pickleball')}${chipSport('Tennis')}<span class="chip chip--live">Now open</span></p>`;
const rxCtas = () => ctas(btn('Book Rally X', '/courts/rally-x/availability/'), btn('See Rally X', '/courts/rally-x/', 'btn--ghost'));
function rallySpot(id = 'rx-h') {
  return `<section class="band band--iron spot" aria-labelledby="${id}">
  <div class="band__clip" aria-hidden="true"><span class="spot__x">X</span></div>
  <div class="wrap spot__in">
    <div class="spot__collage">
      <figure class="spot__a" data-depth="0.05" data-mask>${img('rallyx-now-open', { alt: 'Rally X from the street: a NOW OPEN banner for pickleball and tennis under a city tower', sizes: '(min-width: 900px) 34vw, 70vw' })}</figure>
      <figure class="spot__b" data-depth="0.07" data-mask>${img('rallyx-backhand-net', { alt: 'A player reaches for a backhand, seen through the net', sizes: '(min-width: 900px) 22vw, 50vw' })}</figure>
      <figure class="spot__c" data-depth="0.09" data-mask>${img('rallyx-paddle-wall', { alt: 'Pickleball paddles hanging on a wall', sizes: '(min-width: 900px) 22vw, 50vw' })}</figure>
    </div>
    <div class="spot__copy" data-reveal>
      ${kicker('New on the scene')}
      <h2 class="d1 spot__h" id="${id}">Rally<span class="spot__hx">X</span></h2>
      <p class="lede">${RX_LEDE}</p>
      ${rxChips()}
      ${rxCtas()}
    </div>
  </div>
</section>`;
}

// ============================================================ HOME
function home({ path = '/', hero = heroB(), bodyCls = 'pg-home' } = {}) {
  const sportCards = SPORTS.filter((s) => s.live).map((s) => {
    const list = playsSport(s.name);
    const courts = list.reduce((n, v) => n + courtsFor(v, s.name), 0);
    return `<a class="scard" href="${u(`/courts/?sport=${s.name}`)}" data-tone="${s.tone}" data-tilt data-reveal>
      <span class="scard__img">${img(s.card || s.img, { alt: '', sizes: '(min-width: 900px) 33vw, 85vw' })}</span>
      <span class="scard__shade" aria-hidden="true"></span>
      <span class="scard__top">${icon(s.icon)}<em>${list.length} venue${list.length === 1 ? '' : 's'} <span class="sep">/</span> ${courts} courts</em></span>
      <span class="scard__body"><span class="scard__line">${s.line}</span><span class="scard__name">${s.name}</span><span class="scard__meta">From ${peso(minRate(list))} / hr</span></span>
      <span class="scard__go">Book ${s.name.toLowerCase()} ${icon('arrow')}</span><span class="glint" aria-hidden="true"></span></a>`;
  }).join('');
  const soon = SPORTS.filter((s) => !s.live).map((s) => `<a class="scard scard--soon" href="${u(`/sports/#${s.slug}`)}" data-tone="${s.tone}" data-reveal>${icon(s.icon)}<span class="scard__name">${s.name}</span><span class="soon">Coming soon</span></a>`).join('');
  const featured = [...VENUES].sort((x, y) => (y.featured - x.featured) || (y.rating - x.rating));
  const collTabs = COLLECTIONS.map((c, i) => `<button class="tab${i ? '' : ' is-on'}" role="tab" type="button" id="ct-${c.id}" aria-controls="cp-${c.id}" aria-selected="${i ? 'false' : 'true'}" tabindex="${i ? '-1' : '0'}">${c.name}</button>`).join('');
  const collPanels = COLLECTIONS.map((c, i) => {
    const list = VENUES.filter(c.test);
    return `<div class="coll__panel" role="tabpanel" id="cp-${c.id}" aria-labelledby="ct-${c.id}"${i ? ' hidden' : ''}>
      <p class="coll__rule">${icon('info')}How we picked: ${c.rule}. <b>${list.length} venue${list.length === 1 ? '' : 's'}</b></p>
      <div class="rail" data-rail-scroll>${list.map((v) => `<a class="mcard" href="${u(`/courts/${v.slug}/availability/`)}" data-tone="${v.tone}">
        <span class="mcard__img">${img(v.img, { alt: '', sizes: '320px' })}</span>
        <span class="mcard__body">${chipSport(v.sport, 'chip--xs')}<b>${esc(v.name)}</b><small>${esc(v.address)}</small><span class="mcard__foot"><em>${peso(v.rate)} / hr</em><span class="mcard__go">Book ${icon('arrow')}</span></span></span></a>`).join('')}</div></div>`;
  }).join('');
  const cityCards = CITIES.map((c) => {
    const list = VENUES.filter((v) => v.city === c.name);
    return `<a class="ccard" href="${u(`/cities/${c.slug}/`)}" data-reveal>${img(c.img, { alt: '', sizes: '(min-width: 900px) 30vw, 80vw' })}<span class="ccard__body"><small>${esc(c.area)}</small><b>${c.name}</b><em>${list.length} venue${list.length > 1 ? 's' : ''} <span class="sep">/</span> ${[...new Set(list.map((v) => v.sport))].join(', ')}</em></span><span class="ccard__go">${icon('arrow')}</span></a>`;
  }).join('');
  const body = `
${hero}
${marquee(['Pickleball', 'Tennis', 'Badminton', 'No calls', 'No waiting', 'No guesswork', 'Book instantly', 'Game on'], 'mq--sm', 0.3)}
<section class="band band--night sports" aria-labelledby="sp-h">
  <div class="wrap">
    ${sh({ k: 'Pick your sport', h: '<span id="sp-h">Three sports live. <em>More</em> on the way.</span>', lede: 'Every sport gets its own colour, its own courts and its own crowd. Tap one to see open courts.', cls: 'sh--split' })}
    <div class="sports__grid">${sportCards}</div>
    <div class="sports__soon">${soon}</div>
  </div>
</section>
<section class="band band--night feat" aria-labelledby="fv-h">
  <div class="wrap">
    ${sh({ k: 'Courts now serving', h: '<span id="fv-h">Featured Venues</span>', lede: 'Advanced sports venues offering the latest facilities, dynamic and unique environments built for serious play.', cls: 'sh--split' })}
    <div class="feat__grid" data-rail-scroll>${featured.map((v) => vcard(v)).join('')}</div>
    ${ctas(btn('View All Featured', '/courts/', 'btn--ghost'))}
  </div>
</section>
${rallySpot()}
<section class="band band--cream how" aria-labelledby="how-h">
  <div class="wrap">
    ${sh({ k: 'How it works', h: '<span id="how-h">How Served. Works</span>', lede: 'Book a court, run your game, no calls, no waiting, no hassle.', cls: 'sh--center' })}
    <ol class="how__steps">
      <li class="how__step" data-reveal style="--i:0"><span class="how__n">01</span><span class="how__ic">${icon('user')}</span><h3>The Sign Up</h3><p>Create your account in seconds. Register as a Player to start booking, or as a Court Owner to get your facility listed.</p><a class="link" href="${u('/sign-up/')}">Register Now ${icon('arrow')}</a></li>
      <li class="how__step" data-reveal style="--i:1"><span class="how__n">02</span><span class="how__ic">${icon('search')}</span><h3>Find Your Court</h3><p>Search by sport, location, or availability. Every court on Served is real and ready to book.</p><a class="link" href="${u('/courts/')}">See All Courts ${icon('arrow')}</a></li>
      <li class="how__step" data-reveal style="--i:2"><span class="how__n">03</span><span class="how__ic">${icon('check')}</span><h3>Book &amp; Play</h3><p>Pick your slot, lock it in, show up. That is it, your court is served.</p><a class="link" href="${u('/courts/')}">Book Now ${icon('arrow')}</a></li>
    </ol>
    <svg class="how__arc" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true"><path d="M60 130C300 -20 500 -20 600 80S900 180 1140 30" pathLength="1" data-draw/></svg>
  </div>
</section>
<section class="band band--night coll" aria-labelledby="co-h">
  <div class="wrap">
    ${sh({ k: 'The clubhouse', h: '<span id="co-h">Play your way<span class="pd">.</span></span>', lede: 'Collections built from what each venue lists about its courts. Pick a mood, then pick a slot.', cls: 'sh--split' })}
    <div class="coll__tabs" role="tablist" aria-label="Collections" data-tabs>${collTabs}</div>
    ${collPanels}
  </div>
</section>
<section class="band band--night cities" aria-labelledby="ci-h">
  <div class="wrap">
    ${sh({ k: 'The city is the playground', h: '<span id="ci-h">Courts across the metro<span class="pd">.</span></span>', lede: CITIES.some((c) => c.slug === 'nasugbu') ? 'From BGC to Diliman, and Pico de Loro when you want the weekend out of town.' : `From BGC to Diliman, across ${CITIES.length} Metro Manila cities.`, cls: 'sh--split' })}
    <div class="cities__rail" data-rail-scroll>${cityCards}</div>
    ${ctas(btn('Open the map', '/courts/?view=map', 'btn--ghost'), btn('All cities', '/cities/', 'btn--line'))}
  </div>
</section>
<section class="band band--iron playt" aria-labelledby="pl-h">
  <div class="band__clip" aria-hidden="true"><span class="band__grid"></span></div>
  <div class="wrap">
    ${sh({ k: 'Play mode <em class="soon">Coming soon</em>', h: '<span id="pl-h">Who’s playing?</span>', lede: 'Served is built for more than bookings. Open play, finding players, clubs, tournaments and events are next, and they are marked as concepts until they are live.', cls: 'sh--split' })}
    <div class="playt__grid">${PLAY.map((p, i) => `<a class="ptile" href="${u(`/play/#${p.id}`)}" data-reveal style="--i:${i}" data-spotlight><span class="ptile__ic">${icon(p.icon)}</span><span class="stamp">Concept</span><b>${p.name}</b><em>${p.line}</em><small>${p.text}</small></a>`).join('')}</div>
    ${ctas(btn('Explore Play mode', '/play/'))}
  </div>
</section>
<section class="band band--cream owners" id="owners" aria-labelledby="ow-h">
  <div class="wrap owners__in">
    <div class="owners__copy" data-reveal>
      ${kicker('Served. <span class="sep">/</span> Register Your Court')}
      <h2 class="d1" id="ow-h"><span>We Already</span> <span>Built The Traffic.</span> <span class="hl">You Bring The Court.</span></h2>
      <p class="lede">Skip the cost of building your own booking site and running ads to fill it. List on Served and get in front of players who are already looking for a court.</p>
      <p class="owners__bh">Benefit from:</p>
      <ul class="ticks"><li>${icon('check')}Increase booking volume</li><li>${icon('check')}Build trust with verified players</li><li>${icon('check')}Save the cost of a standalone booking app and its marketing</li></ul>
      ${ctas(btn('Join Us Today!', '/sign-up/?role=owner&next=owner/list/', 'btn--ink'), btn('See pricing', '/pricing/#owners', 'btn--line-ink'))}
    </div>
    <div class="owners__side">
      <h3 class="d3">List Your Court Today</h3>
      <p class="owners__sub">Book a court, run your game, no calls, no waiting, no hassle.</p>
      <ol class="osteps">
        <li data-reveal style="--i:0"><b>List your court</b><p>Create your account in seconds. Fill out all necessary details about you.</p></li>
        <li data-reveal style="--i:1"><b>Add your court details</b><p>Fill out details about your court, amenities, rules, rates and photos.</p></li>
        <li data-reveal style="--i:2"><b>Manage your court bookings with ease</b><p>Monitor all bookings you receive, forecast upcoming bookings or even generate reports with ease, all for free.</p></li>
      </ol>
      <a class="link link--ink" href="${u('/sign-up/?role=owner')}">List your court now ${icon('arrow')}</a>
      <div class="receipt" data-reveal><p class="receipt__h">How a booking pays out</p>
        <dl><div><dt>Your court rate</dt><dd>${peso(500)}.00</dd></div><div><dt>Service fee, paid by the player</dt><dd>+ ${peso(25)}.00</dd></div><div class="tot"><dt>Player pays</dt><dd>${peso(525)}.00</dd></div><div class="you"><dt>You receive</dt><dd>${peso(500)}.00</dd></div></dl>
        <p class="receipt__f">No monthly fee and no commission</p></div>
    </div>
  </div>
</section>
<section class="band band--night faqp" aria-labelledby="fq-h">
  <div class="wrap faqp__in">
    ${sh({ k: 'Good to know', h: '<span id="fq-h">Questions, answered<span class="pd">.</span></span>', lede: 'Fees, cancellations, payments and how many hours you can grab.', cls: '' })}
    <div>${faqList([FAQ[0], FAQ[4], FAQ[7], FAQ[1], FAQ[5], FAQ[9]])}${ctas(btn('Visit the help centre', '/help/', 'btn--ghost'))}</div>
  </div>
</section>`;
  return layout({ path, title: 'Served | Book your court', desc: 'Every court, one tap away. Search courts, check live availability, and book your slot in minutes.', body, bodyCls,
    schema: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Served.', url: SITE.url, potentialAction: { '@type': 'SearchAction', target: SITE.url + 'courts/?q={q}', 'query-input': 'required name=q' } } });
}

// ============================================================ HOME HERO: live board (option B, picked 27 Nov 2026)
const liveSports = () => SPORTS.filter((x) => x.live).map((x) => { const list = playsSport(x.name); return { ...x, n: list.length, from: minRate(list) }; });
// Option B, "Live board", on the current site's hero photo and shade: the Served. wordmark down the right edge (turned to
// read upward, baseline on the edge), kinetic sport word, sport buttons and search of one width, Install App, next open slots
function heroB() {
  const board = [...VENUES, RALLYX].sort((x, y) => x.open[0].localeCompare(y.open[0]) || y.rating - x.rating).map((v) => `<a class="bitem" href="${u(`/courts/${v.slug}/availability/`)}" data-tone="${v.tone}"><i class="bitem__dot"></i><b>${esc(v.name)}</b><span>${esc(v.city || 'Metro Manila')}</span><span class="bitem__next" data-next="${v.open.join(',')}">Next <b>${fmtDate(v.open[0])}</b></span><em>${peso(v.rate)}/hr${v.sample ? ' <small>sample</small>' : ''}</em><span class="bitem__go">Book ${icon('arrow')}</span></a>`).join('');
  return `<section class="hb" aria-labelledby="hb-h">
  <div class="hb__media" aria-hidden="true">
    <figure class="hb__bg">${img('live-hero-court', { alt: '', sizes: '100vw', eager: true, pos: '50% 32%' })}</figure>
    <span class="hb__sun"></span><span class="hb__shade"></span><span class="hb__grain"></span>
  </div>
  <span class="hb__mark" aria-hidden="true">${logoMark('hb__logo')}</span>
  <div class="wrap hb__in">
    <p class="hb__live"><i></i>Live availability <span class="sep">/</span> ${VENUE_COUNT} venues, ${TOTAL_COURTS} courts</p>
    <h1 class="hb__h" id="hb-h"><span class="sr">Choose Your Court. Get Ready To Play.</span><span aria-hidden="true" class="hb__l hb__l--sm">Find your</span><span aria-hidden="true" class="hb__word"><span class="rot" data-rotate="Pickleball|Tennis|Badminton">Pickleball</span></span><span aria-hidden="true" class="hb__l">court</span></h1>
    <div class="hb__deck">
      <div class="hb__sports">${liveSports().map((x) => `<a class="hb__sport" href="${u(`/courts/?sport=${x.name}`)}" data-tone="${x.tone}">${icon(x.icon)}<span><b>${x.name}</b><small>${x.n} venue${x.n === 1 ? '' : 's'} <span class="sep">/</span> from ${peso(x.from)}/hr</small></span>${icon('arrow', 'hb__arrow')}</a>`).join('')}</div>
      <div class="hb__find">
        <form class="hb__search" action="${u('/courts/')}" method="get" role="search" aria-label="Search courts">${icon('search')}<label class="sr" for="hbq">Court name or city</label><input id="hbq" name="q" type="search" placeholder="Court name or city" autocomplete="off"><label class="sr" for="hbd">When</label><select id="hbd" name="date" data-date-select><option value="">Any day</option></select><button type="submit" aria-label="Search courts">${icon('arrow')}</button></form>
        <button class="btn btn--accent hb__install" type="button" data-install>${icon('download')}<span>Install App</span></button>
      </div>
    </div>
    <p class="hb__hint" data-install-hint role="status"></p>
  </div>
  <div class="hb__board"><p class="hb__label"><i></i>Next open</p><div class="mq mq--board" data-marquee><div class="mq__track"><div class="mq__run">${board}</div><div class="mq__run" aria-hidden="true">${board.replace(/<a /g, '<a tabindex="-1" ')}</div></div></div></div>
</section>`;
}

// ============================================================ COURTS (discovery)
function courts() {
  const surfaces = ['Acrylic', 'Clay', 'Hard', 'Wood'];
  const cards = VENUES.map((v) => `<div class="disc__item" data-item data-slug="${v.slug}" data-sport="${v.sport}" data-city="${v.city}" data-surface="${v.surface}" data-rate="${v.rate}" data-rating="${v.rating}" data-name="${esc(v.name.toLowerCase())} ${esc(v.address.toLowerCase())}" data-lat="${v.lat}" data-lng="${v.lng}" data-open="${v.open.join(',')}">${vcard(v)}</div>`).join('')
    + `<div class="disc__item" data-item data-slug="rally-x" data-sport="Pickleball Tennis" data-city="" data-surface="" data-rate="${RALLYX.rate}" data-rating="0" data-name="rally x ${esc(RALLYX.address.toLowerCase())}" data-open="${RALLYX.open.join(',')}">${rallyCard()}</div>`
    + SOON.map((s) => `<div class="disc__item" data-item data-soon data-slug="${s.slug}" data-sport="${s.sport}" data-city="${s.city}" data-surface="" data-rate="99999" data-rating="0" data-name="${esc(`${s.name} ${s.short} ${s.address}`.toLowerCase())}">${soonCard(s)}</div>`).join('');
  const pins = VENUES.map((v) => ({ slug: v.slug, name: v.name, rate: v.rate, city: v.city, lat: v.lat, lng: v.lng, tone: v.tone, sport: v.sport, href: u(`/courts/${v.slug}/availability/`), page: u(`/courts/${v.slug}/`) }));
  const body = `
${phero({ k: 'Courts', h1: 'Find Your Court', lede: 'Every court on Served is real and ready to book. Filter by location, surface or price and lock your slot in minutes.', crumb: [['Home', '/'], ['Courts', '/courts/']], cls: 'phero--short', img: 'live-hero-court', pos: '50% 60%' })}
<section class="band band--night mylist" data-my-listings hidden aria-labelledby="ml-h"><div class="wrap">
  ${sh({ k: 'Listed by court owners', h: '<span id="ml-h">New on Served</span>', lede: 'Venues their owners listed in this browser. Each one has its own page and books like any other court.', cls: 'sh--split' })}
  <div class="mylist__grid" data-my-listings-grid></div>
</div></section>
<section class="disc" data-disc data-pins="${json(pins)}">
  <div class="disc__bar">
    <div class="wrap disc__bar-in">
      <div class="seg seg--sport" role="radiogroup" aria-label="Sport" data-f-sport>
        <label><input type="radio" name="fsport" value="" checked><span>All</span></label>
        ${SPORTS.filter((s) => s.live).map((s) => `<label data-tone="${s.tone}"><input type="radio" name="fsport" value="${s.name}"><span>${icon(s.icon)}${s.name}</span></label>`).join('')}
      </div>
      <div class="disc__tools">
        <button class="btn btn--ghost btn--sm disc__fbtn" type="button" data-open-filters aria-controls="filters" aria-expanded="false">${icon('filter')}<span>Filters</span><b class="disc__fcount" data-fcount hidden></b></button>
        <div class="seg seg--view" role="radiogroup" aria-label="View"><label><input type="radio" name="view" value="list" checked><span>${icon('list')}List</span></label><label><input type="radio" name="view" value="map"><span>${icon('map')}Map</span></label></div>
      </div>
    </div>
  </div>
  <div class="wrap disc__wrap">
    <form class="filters" id="filters" data-filters aria-label="Filters">
      <div class="filters__head"><p class="d3">Filters</p><button class="iconbtn" type="button" data-close-filters aria-label="Close filters">${icon('close')}</button></div>
      <label class="field"><span class="field__l">Search</span><input type="search" name="q" placeholder="Court name or area" autocomplete="off">${icon('search', 'field__i')}</label>
      <label class="field"><span class="field__l">Location</span><select name="city"><option value="">All locations</option>${CITIES.map((c) => `<option>${c.name}</option>`).join('')}</select>${icon('pin', 'field__i')}</label>
      <label class="field"><span class="field__l">Surface</span><select name="surface"><option value="">Any surface</option>${surfaces.map((s) => `<option>${s}</option>`).join('')}</select>${icon('court', 'field__i')}</label>
      <label class="field"><span class="field__l">Max price</span><select name="max_price"><option value="">Any price</option><option value="500">Up to ₱500</option><option value="700">Up to ₱700</option><option value="900">Up to ₱900</option><option value="1200">Up to ₱1,200</option></select>${icon('wallet', 'field__i')}</label>
      <label class="field"><span class="field__l">Date</span><select name="date" data-date-select><option value="">Any day</option></select>${icon('cal', 'field__i')}</label>
      <label class="field"><span class="field__l">Sort by</span><select name="sort"><option value="rating">Top rated</option><option value="price">Lowest price</option><option value="near">Nearest to me</option></select>${icon('star', 'field__i')}</label>
      <button class="btn btn--ghost btn--sm filters__near" type="button" data-near>${icon('locate')}<span>Play near me</span></button>
      <div class="ctas filters__ctas"><a class="btn btn--ghost" href="${u('/courts/')}" data-reset><span>Reset</span></a><button class="btn btn--accent" type="submit" data-apply><span>Apply</span></button></div>
    </form>
    <div class="disc__results">
      <div class="disc__meta"><p class="disc__count" aria-live="polite" data-count-out><b>${VENUE_COUNT}</b> courts available</p><p class="disc__chips" data-active-chips></p></div>
      <div class="disc__loader" data-loader hidden aria-hidden="true"><span class="ballload"><i></i></span></div>
      <div class="disc__list" data-list>${cards}</div>
      <div class="disc__map" data-map hidden>
        <div class="map board"><svg class="map__svg" viewBox="0 0 1000 720" role="img" aria-label="Stylised map of venues across Metro Manila"><g class="map__grid"></g><g class="map__roads"></g><g class="map__labels"></g><g class="map__pins"></g></svg>
        <div class="map__card" data-map-card hidden></div>
        <p class="map__note">${icon('info')}Pins mark each venue’s city, not its exact address.${CITIES.some((c) => c.slug === 'nasugbu') ? ' Nasugbu sits off the map, to the south west.' : ''}</p></div>
      </div>
      <div class="empty" data-empty hidden><svg class="empty__net" viewBox="0 0 240 120" aria-hidden="true"><path d="M10 100h220M30 100V30h180v70M30 30h180" /><path d="M30 45h180M30 60h180M30 75h180M30 90h180M60 30v70M90 30v70M120 30v70M150 30v70M180 30v70" opacity=".35"/></svg><p class="d3">Out. No courts match that.</p><p>Try another date, widen the price or clear a filter.</p><a class="btn btn--accent" href="${u('/courts/')}" data-reset><span>Reset filters</span></a></div>
    </div>
  </div>
</section>`;
  return layout({ path: '/courts/', title: 'Find Your Court', desc: 'Every court on Served is real and ready to book. Filter by location, surface or price and lock your slot in minutes.', body, active: 'courts', bodyCls: 'pg-courts' });
}

// ============================================================ BOOKING WIDGET
function bookData(v) {
  // max: no cap. The current site's 4 hours per court was lifted at the client's request (27 Nov 2026), whole day included
  return { slug: v.slug, name: v.name, rate: v.rate, fee: v.booking.feeRate ?? SITE.feeRate, max: SITE.maxHours, hours: v.booking.hours,
    rates: v.booking.rates, courts: v.booking.courts, open: v.open, full: v.full, taken: v.booking.taken, address: v.address,
    links: { venue: u(`/courts/${v.slug}/`), availability: u(`/courts/${v.slug}/availability/`), slots: u(`/courts/${v.slug}/slots/`), courts: u('/courts/'), signin: u('/sign-in/') } };
}
function booking(v, mode) {
  const evening = v.booking.rates && Object.values(v.booking.rates).some((r) => r.label !== 'Standard');
  return `<section class="book" id="book" data-book="${json(bookData(v))}" data-mode="${mode}" aria-labelledby="book-h">
  <div class="wrap">
    ${v.sample ? `<p class="book__sample">${icon('info')}<span>Sample rates, hours and courts: ${esc(v.name)} has not confirmed its own yet.</span></p>` : ''}
    <ol class="steps" data-steps aria-label="Booking steps"><li class="is-on"><b>1</b><span>Choose a date</span></li><li><b>2</b><span>Pick time &amp; court</span></li><li><b>3</b><span>Payment</span></li><li><b>4</b><span>Confirmation</span></li></ol>
    ${mode === 'venue' ? `<div class="book__head"><h2 class="d2" id="book-h">Book a slot<span class="pd">.</span></h2><p>Orange days have open slots at ${esc(v.name)}. Pick one to choose your time.</p></div>` : '<span id="book-h" class="sr">Booking</span>'}
    <div class="book__grid">
      <div class="book__main">
        <div class="book__blk" data-blk="date">
          <div class="book__bh"><h3 class="d4">${icon('cal')}Choose a date</h3><button class="link" type="button" data-cal-toggle aria-expanded="false">Month view ${icon('chev')}</button></div>
          <div class="drail" data-rail role="radiogroup" aria-label="Dates"></div>
          <div class="cal board" data-cal hidden><div class="cal__head"><button class="iconbtn" type="button" data-cal-prev aria-label="Previous month">${icon('back')}</button><h4 class="cal__t" data-cal-title>Availability calendar</h4><button class="iconbtn" type="button" data-cal-next aria-label="Next month">${icon('arrow')}</button></div><div class="cal__grid" data-cal-grid></div></div>
          <ul class="legend"><li><i class="lg lg--open"></i>Available</li><li><i class="lg lg--full"></i>Fully booked</li><li><i class="lg lg--sel"></i>Selected</li></ul>
        </div>
        <div class="book__blk" data-blk="time">
          <div class="book__bh"><h3 class="d4">${icon('clock')}Pick time &amp; court</h3>${evening ? `<p class="ratekey"><span class="rk rk--std">Standard</span><span class="rk rk--eve">${icon('moon')}Evening rate</span></p>` : ''}</div>
          <p class="book__rule">Pick as many hours as you need, or tap Whole day for every open hour on a court. The hours do not have to be next to each other. To book another court as well, choose it and pick its hours; what you picked on the first is kept. Struck-through slots are already taken on the selected court.</p>
          <p class="book__lbl">Court selection</p>
          ${[...new Set([v.sport, ...(v.sports || [])])].map((sp) => `<template data-court-tpl data-sport="${sp}">${courtSvg(sp, 'cpk__court')}</template>`).join('')}<div class="courtpick" data-courts role="radiogroup" aria-label="Court selection"></div>
          <div class="book__slh"><p class="book__lbl">Time slots</p><button class="btn btn--line btn--sm" type="button" data-wholeday aria-pressed="false">${icon('sun')}<span>Whole day on this court</span></button></div>
          <div class="slots" data-slots aria-label="Time slots"><p class="slots__empty">Choose a date to see times.</p></div>
        </div>
      </div>
      <aside class="sum board" data-sum aria-labelledby="sum-h">
        <button class="sum__handle" type="button" data-sum-toggle aria-expanded="false"><span class="sum__mini"><b data-sum-hours>0 hours</b><span data-sum-total-mini>${peso(0)}.00</span></span><span class="sum__open">Details ${icon('chev')}</span></button>
        <div class="sum__body">
          <h3 class="d4" id="sum-h">Your selection</h3>
          <p class="sum__note">Nothing is reserved until payment.</p>
          <dl class="sum__dl"><div><dt>Venue</dt><dd>${esc(v.name)}</dd></div><div><dt>Date</dt><dd data-sum-date>Select a date</dd></div><div class="sum__picks"><dt>Booking</dt><dd data-sum-picks>Select a time</dd></div><div><dt>Hours</dt><dd data-sum-hrs>0 hours</dd></div><div><dt>Rate</dt><dd>${peso(v.rate)} / hr${v.sample ? ', sample' : ''} (exclusive of service fees)</dd></div><div><dt>Subtotal</dt><dd data-sum-sub>${peso(0)}.00</dd></div><div><dt>Service fee (5%)</dt><dd data-sum-fee>${peso(0)}.00</dd></div></dl>
          <div class="sum__total"><span>Total</span><b data-sum-total>${peso(0)}.00</b></div>
        </div>
        <button class="btn btn--accent btn--lg sum__go" type="button" data-continue disabled><span>Continue to payment</span>${icon('arrow')}</button>
        <p class="sum__refund">${icon('shield')}Court price refunded if you cancel 24 hours before your slot.</p>
      </aside>
    </div>
  </div>
  <div class="sheet" data-pay hidden role="dialog" aria-modal="true" aria-labelledby="pay-h"><div class="sheet__in board">
    <button class="iconbtn sheet__x" type="button" data-pay-close aria-label="Back to slots">${icon('close')}</button>
    <p class="kicker"><span class="kicker__ball"></span>Step 3 of 4</p><h2 class="d3" id="pay-h">Payment</h2>
    <div class="pay__sum" data-pay-sum></div>
    <fieldset class="paym"><legend>Pay with</legend>
      ${[['gcash', 'GCash', 'wallet'], ['maya', 'Maya', 'wallet'], ['qrph', 'QR Ph', 'qr'], ['card', 'Card', 'card'], ['bank', 'Bank', 'bank']].map(([k, n, ic], i) => `<label class="paym__o"><input type="radio" name="paym" value="${k}"${i ? '' : ' checked'}><span>${icon(ic)}${n}</span></label>`).join('')}
    </fieldset>
    <p class="pay__hold">${icon('clock')}The court is held while you pay, so nothing is double-booked.</p>
    <button class="btn btn--accent btn--lg pay__go" type="button" data-pay-go><span data-pay-label>Pay</span>${icon('arrow')}</button>
    ${demoNote('Preview build: no payment is taken and no court is booked.')}
  </div></div>
  <div class="sheet sheet--done" data-done hidden role="dialog" aria-modal="true" aria-labelledby="done-h"><div class="sheet__in board done">
    <div class="done__anim" aria-hidden="true"><svg viewBox="0 0 200 120"><path class="done__court" d="${courtD(v.sport, 10, 19, 180, 82, 6)}" pathLength="1"/></svg><span class="done__ball"></span></div>
    <p class="kicker"><span class="kicker__ball"></span>Step 4 of 4</p>
    <h2 class="d2" id="done-h">Court secured<span class="pd">.</span></h2>
    <p class="done__sub">Booked and served. You’re on.</p>
    <div class="ticket" data-ticket></div>
    <div class="ctas"><button class="btn btn--accent" type="button" data-ics><span>Add to calendar</span>${icon('download')}</button><a class="btn btn--ghost" href="#book" data-again><span>Book another time</span></a><a class="btn btn--line" href="${u('/account/')}"><span>My bookings</span></a></div>
    ${demoNote('Preview build: this is a demonstration of the confirmation step.')}
  </div></div>
  <noscript><div class="wrap"><p class="nojs">Turn on JavaScript to pick a slot. Next open day: ${fmtDate(v.open[0], { weekday: 'long', day: 'numeric', month: 'long' })}.</p></div></noscript>
</section>`;
}

// ============================================================ VENUE
function venuePage(v) {
  const sp = sportOf(v.sport);
  const city = CITIES.find((c) => c.name === v.city);
  const q = encodeURIComponent(`${v.name}, ${v.address}`);
  const body = `
<section class="vhero band band--night" data-tone="${v.tone}">
  <div class="band__clip" aria-hidden="true"><figure class="vhero__bg" data-depth="0.1">${img(v.img, { alt: '', sizes: '100vw', eager: true })}</figure><span class="vhero__scrim"></span></div>
  <div class="wrap vhero__in">
    <div class="vhero__grid">
      <div class="vhero__copy">
        <p class="chips">${chipSport(v.sport)}<span class="chip">${esc(v.surface)}</span>${score(v)}</p>
        ${v.by ? `<p class="vhero__by"><span class="vhero__mono" aria-hidden="true">${esc(v.name[0])}</span>By ${esc(v.by)}</p>` : ''}
        <h1 class="d1 vhero__h">${esc(v.name)}</h1>
        <p class="vhero__meta">${esc(v.area ? v.area + ', ' + v.city : v.city)} <span class="sep">/</span> ${esc(v.surface)} surface <span class="sep">/</span> ${v.courts} courts available</p>
      </div>
      <div class="vhero__board board" data-reveal>
        ${priceTag(v, true)}${nextTag(v)}
        ${ctas(`<a class="btn btn--accent btn--lg" href="#book"><span>Check availability</span>${icon('arrow')}</a>`, btn('Get directions', `https://www.google.com/maps/search/?api=1&query=${q}`, 'btn--ghost', ' target="_blank" rel="noopener"'))}
      </div>
    </div>
  </div>
  <p class="photo-note" data-photo-note>Representative photo</p>
</section>
${booking(v, 'venue')}
<section class="band band--night vinfo" id="about">
  <div class="wrap vinfo__grid">
    <div class="vinfo__about" data-reveal>
      ${kicker('The venue')}
      <h2 class="d2">About ${esc(v.name)}</h2>
      <p class="lede">${esc(v.desc)}</p>
      <dl class="specs">${[['Surface', v.surface], ['Court size', v.courtSize], ['Courts on site', v.courts], ['Sport', v.sport]].map(([k, x]) => `<div><dt>${k}</dt><dd>${esc(x)}</dd></div>`).join('')}</dl>
    </div>
    <div class="vinfo__am" data-reveal>
      <h2 class="d3">Amenities</h2>
      <ul class="amen">${v.amenities.map((x) => `<li>${icon(amenityIcon(x))}<span>${esc(x)}</span></li>`).join('')}</ul>
      <h2 class="d3">Good to know</h2>
      <ul class="rules">
        <li>${icon('shield')}<span>Nothing is reserved until payment.</span></li>
        <li>${icon('clock')}<span>Book by the hour, or the whole day.</span></li>
        <li>${icon('wallet')}<span>A 5% service fee is shown before you pay.</span></li>
        <li>${icon('check')}<span>Court price refunded if you cancel 24 hours before your slot.</span></li>
      </ul>
    </div>
  </div>
</section>
<section class="band band--night vgal" id="photos" data-vgal hidden aria-labelledby="ph-h">
  <div class="wrap">${kicker('Photos')}<h2 class="d2" id="ph-h">Inside ${esc(v.name)}</h2></div><div class="vgal__grid" data-vgal-grid></div>
</section>
<section class="band band--iron vloc" id="location" aria-labelledby="loc-h">
  <div class="wrap vloc__grid">
    <div class="vloc__copy" data-reveal>
      ${kicker('Location')}
      <h2 class="d2" id="loc-h">${esc(v.address)}</h2>
      <p class="lede">${esc(city.intro)}</p>
      ${ctas(btn('Get directions', `https://www.google.com/maps/search/?api=1&query=${q}`, 'btn--ghost', ' target="_blank" rel="noopener"'))}
    </div>
    <div class="vloc__map board" data-mapembed data-src="https://www.google.com/maps?q=${q}&output=embed">
      ${img(v.place, { alt: v.place === 'place-up-diliman' ? 'The Academic Oval, University of the Philippines Diliman' : `${city.name} skyline`, sizes: '(min-width: 900px) 45vw, 100vw' })}
      <button class="btn btn--accent btn--sm vloc__load" type="button" data-load-map>${icon('map')}<span>Show map</span></button>
      <p class="photo-note">${esc(v.place === 'place-up-diliman' ? 'UP Diliman' : city.name)}, Wikimedia Commons</p>
    </div>
  </div>
</section>
<section class="band band--night vrev" id="reviews" aria-labelledby="rv-h">
  <div class="wrap">
    <div class="vrev__head" data-reveal>
      <h2 class="d2" id="rv-h">Reviews</h2>
      ${v.reviewCount ? `<p class="vrev__score"><b>${v.rating.toFixed(1)}</b><span>from ${v.reviewCount} reviews</span></p>` : '<p class="vrev__score"><b>New</b><span>no reviews yet</span></p>'}
      <a class="link" href="${u('/sign-in/')}">Sign in to review a court you have played at. ${icon('arrow')}</a>
    </div>
    ${v.reviews.length ? `<div class="vrev__grid" data-rail-scroll data-vrev>${v.reviews.map((r, i) => `<figure class="rcard" data-reveal style="--i:${i}"><blockquote>${esc(r.text)}</blockquote><figcaption><span class="rcard__av" aria-hidden="true">${esc(r.name[0].toUpperCase())}</span><b>${esc(r.name)}</b><small>${esc(r.date)}</small></figcaption></figure>`).join('')}</div><p class="fine">Reviews shown as captured from the current site on ${fmtDate(CAPTURED_ON, { day: 'numeric', month: 'long', year: 'numeric' })}.</p>` : `<p class="empty-line">${icon('sparkle')}No reviews yet. Be the first to play here and say how it went.</p>`}
  </div>
</section>
`;
  return layout({ path: `/courts/${v.slug}/`, title: `${v.name}`, desc: `${v.desc} ${v.address}. ${peso(v.rate)} / hr. Check live availability and book on Served.`, body, active: 'courts', bodyCls: 'pg-venue', sticky: 'venue', venue: v, own: ownOf(v, true),
    schema: { '@context': 'https://schema.org', '@type': 'SportsActivityLocation', name: v.name, description: v.desc, address: { '@type': 'PostalAddress', streetAddress: v.area, addressLocality: v.city, addressCountry: 'PH' }, ...(v.reviewCount ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: v.rating, reviewCount: v.reviewCount } } : {}), amenityFeature: v.amenities.map((x) => ({ '@type': 'LocationFeatureSpecification', name: x, value: true })) } });
}

function bookPage(v, mode) {
  const isSlots = mode === 'slots';
  const body = `
<section class="bhero band band--night" data-tone="${v.tone}">
  <div class="band__clip" aria-hidden="true"><figure class="bhero__bg">${img(v.img, { alt: '', sizes: '100vw', eager: true })}</figure><span class="vhero__scrim"></span></div>
  <div class="wrap bhero__in">
    ${crumbs([[v.name, `/courts/${v.slug}/`], ['Availability', `/courts/${v.slug}/availability/`], ...(isSlots ? [['Time & court', `/courts/${v.slug}/slots/`]] : [])])}
    <div class="bhero__row">
      <div><h1 class="d1">${isSlots ? 'Pick Your Slot' : 'Check Availability'}</h1>
      <p class="lede" data-sel-line>${isSlots ? `Selected: <b data-sel-date>${fmtDate(v.open[0], { day: 'numeric', month: 'long', year: 'numeric' })}</b> at ${esc(v.name)}` : `Orange days have open slots at ${esc(v.name)} . Pick one to choose your time.`}</p></div>
      <a class="bhero__venue" href="${venueHref(v)}"><span>${img(v.img, { alt: '', sizes: '64px' })}</span><b>${esc(v.name)}</b><small>${esc(v.address)} <span class="sep">/</span> ${peso(v.rate)} / hr${v.sample ? ' (sample)' : ''}</small></a>
    </div>
  </div>
</section>
${booking(v, mode)}`;
  return layout({ path: `/courts/${v.slug}/${mode}/`, title: `${isSlots ? 'Pick Your Slot' : 'Check Availability'}: ${v.name}`, desc: `Live availability at ${v.name}, ${v.address}. Pick a date, choose your time and court, and pay online.`, body, active: 'courts', bodyCls: 'pg-book', sticky: null, noFinal: true, vslug: v.slug, own: ownOf(v, false) });
}

// ============================================================ RALLY X
function rallyx() {
  const R = RALLYX;
  const alts = { 'rallyx-now-open': 'Rally X street front with a NOW OPEN banner for pickleball and tennis', 'rallyx-forehand': 'A player hits a forehand on a Rally X court', 'rallyx-court-logo': 'The Rally X logo painted on the court', 'rallyx-paddle-ball': 'A paddle and a lime pickleball in front of a Rally X banner', 'rallyx-tennis-player': 'A player swings a tennis racket at Rally X', 'rallyx-paddle-wall': 'Pickleball paddles on a display wall', 'rallyx-backhand-net': 'A player reaches for a backhand behind the net', 'rallyx-target-net': 'A lime target net on court', 'rallyx-ready-position': 'A player in ready position on court', 'rallyx-paddles-court': 'Two paddles and two balls on a blue court', 'rallyx-paddle-wall-tall': 'A tall wall of paddles and balls', 'rallyx-facade': 'Rally X street front between city towers' };
  const body = `
<section class="vhero vhero--rx band band--night" data-tone="heat">
  <div class="band__clip" aria-hidden="true"><figure class="vhero__bg" data-depth="0.1">${img(R.hero, { alt: '', sizes: '100vw', eager: true, pos: '50% 40%' })}</figure><span class="vhero__scrim"></span></div>
  <div class="wrap vhero__in">
    <div class="vhero__grid">
      <div class="vhero__copy">
        <p class="chips">${chipSport('Pickleball')}${chipSport('Tennis')}<span class="chip chip--live">Now open</span>${score(R)}</p>
        <h1 class="d1 vhero__h vhero__h--rx">Rally<span>X</span></h1>
        <p class="vhero__meta">Pickleball and tennis <span class="sep">/</span> ${esc(R.address)}</p>
      </div>
      <div class="vhero__board board" data-reveal>
        ${priceTag(R, true)}${nextTag(R)}
        ${ctas(`<a class="btn btn--accent btn--lg" href="#book"><span>Check availability</span>${icon('arrow')}</a>`, btn('See the courts', '#photos', 'btn--ghost'))}
      </div>
    </div>
  </div>
</section>
${booking(R, 'venue')}
${marquee(['Rally X', 'Pickleball', 'Tennis', 'Now open', 'Rally X', 'Paddles up', 'Game on'], 'mq--accent')}
<section class="band band--night rxg" id="photos" aria-labelledby="rxg-h">
  <div class="wrap">
    ${sh({ k: 'On court', h: '<span id="rxg-h">Inside Rally X<span class="pd">.</span></span>', lede: 'Photos supplied by the venue. Swipe or use the arrows, and tap a photo to open it full size.', cls: 'sh--split' })}
  </div>
  ${carousel(R.photos.map((p) => ({ html: img(p, { alt: alts[p], sizes: '(min-width: 900px) 36vw, 80vw' }), full: a(`assets/img/${p}-${IMAGES[p].sizes.at(-1)}.webp`), alt: alts[p] })), 'Rally X photos')}
</section>
<section class="band band--cream rxfacts" id="about" aria-labelledby="rxf-h">
  <div class="wrap rxfacts__in">
    <div data-reveal>${kicker('What we know')}<h2 class="d2" id="rxf-h">From the sign out front<span class="pd">.</span></h2><p class="lede">What Rally X shows on its own signage, and what is still to be confirmed. Until it is, the rates, hours and courts in the booking are samples.</p></div>
    <ul class="facts">
      <li data-reveal><b>Now open</b><span>The street banner says so.</span></li>
      <li data-reveal><b>Pickleball and tennis</b><span>Both sports on the banner, both played on these floors.</span></li>
      <li data-reveal><b>Book now for schedule and booking</b><span>The banner points players to booking, and Rally X books on Served.</span></li>
      <li data-reveal><b>To be confirmed</b><span>Address, opening hours, rates and number of courts.</span></li>
    </ul>
  </div>
</section>`;
  return layout({ path: '/courts/rally-x/', title: 'Rally X: pickleball and tennis, now open', desc: 'Rally X is now open for pickleball and tennis. Check availability and book a court on Served.', body, active: 'courts', bodyCls: 'pg-venue pg-rx', ogImg: 'og-served.jpg', sticky: 'venue', venue: R, own: ownOf(R, true) });
}

// ============================================================ OPENING SOON (a venue coming to Served: its own page, a notify form)
function soonPage(s) {
  const body = `
<section class="vhero band band--night" data-tone="${s.tone}">
  <div class="band__clip" aria-hidden="true"><figure class="vhero__bg" data-depth="0.1">${img(s.hero, { alt: '', sizes: '100vw', eager: true })}</figure><span class="vhero__scrim"></span></div>
  <div class="wrap vhero__in">
    <div class="vhero__grid">
      <div class="vhero__copy">
        <p class="chips">${chipSport(s.sport)}<span class="chip chip--live">Opening soon</span></p>
        <h1 class="d1 vhero__h">${esc(s.name)}</h1>
        <p class="vhero__meta">${esc(s.sport)} <span class="sep">/</span> ${esc(s.address)}</p>
      </div>
      <div class="vhero__board board" id="notify">
        <p class="kicker"><span class="kicker__ball"></span>Booking on Served opens soon</p>
        <p class="vhero__soon">Be first on court when ${esc(s.short)} slots go live.</p>
        <form class="notify" data-demo-form><label class="field"><span class="field__l">Email address</span><input type="email" name="email" required placeholder="you@email.com" autocomplete="email">${icon('mail', 'field__i')}</label><button class="btn btn--accent" type="submit"><span>Notify me</span>${icon('arrow')}</button></form>
        ${demoNote()}
      </div>
    </div>
  </div>
  <p class="photo-note">UP Diliman, Wikimedia Commons</p>
</section>
<section class="band band--cream rxfacts" id="about" aria-labelledby="sf-h">
  <div class="wrap rxfacts__in">
    <div data-reveal>${kicker('What we know')}<h2 class="d2" id="sf-h">Coming to Served<span class="pd">.</span></h2><p class="lede">The name, the sport and the campus so far. The rest arrives with the listing.</p></div>
    <ul class="facts">
      <li data-reveal><b>${esc(s.sport)}</b><span>Courts at the UP College of Human Kinetics.</span></li>
      <li data-reveal><b>${esc(s.address)}</b><span>On the UP Diliman campus.</span></li>
      <li data-reveal><b>Opening soon</b><span>Booking on Served switches on when the courts are listed.</span></li>
      <li data-reveal><b>To be confirmed</b><span>Opening hours, rates and number of courts.</span></li>
    </ul>
  </div>
</section>`;
  return layout({ path: `/courts/${s.slug}/`, title: `${s.name}: opening soon`, desc: `${s.name}, ${s.address}. Booking on Served opens soon: get notified.`, body, active: 'courts', bodyCls: 'pg-venue pg-soon', sticky: null,
    own: { name: s.name, short: s.short, address: s.address, home: '#top', links: [['About', '#about']], cta: ['Get notified', '#notify'] } });
}

// ============================================================ PRICING
function pricing() {
  const body = `
${phero({ k: 'Pricing', h1: 'Simple Pricing', lede: 'Free to search and compare courts, and free for court owners to list.', crumb: [['Home', '/'], ['Pricing', '/pricing/']], img: 'live-cta-court', cls: 'phero--short' })}
<section class="band band--night prc" id="players" aria-labelledby="pp-h">
  <div class="wrap prc__grid">
    <div class="prc__head" data-reveal>${kicker('Players')}<h2 class="d1" id="pp-h">For Players</h2><p class="lede">Searching and comparing courts costs nothing. You pay the venue’s rate plus a 5% service fee, shown before you pay.</p>${ctas(btn('Find a court', '/courts/'))}</div>
    <div class="prc__cards">
      <article class="pcard" data-reveal data-spotlight><span class="pcard__ic">${icon('wallet')}</span><h3>A clear service fee</h3><p>Court cards show the venue’s hourly rate. Served adds a 5% service fee at checkout, listed on the order summary before you pay. It is not refunded if you cancel.</p></article>
      <article class="pcard" data-reveal data-spotlight><span class="pcard__ic">${icon('shield')}</span><h3>Cancel with notice</h3><p>Cancel up to 24 hours before your slot and the court price is refunded in full. Only the service fee is kept.</p></article>
      <article class="pcard" data-reveal data-spotlight><span class="pcard__ic">${icon('bolt')}</span><h3>Booking alerts</h3><p>Confirmations and reminders for every reservation, kept in your account alongside your booking history.</p></article>
    </div>
  </div>
</section>
<section class="band band--cream prc prc--own" id="owners" aria-labelledby="po-h">
  <div class="wrap">
    <div class="prc__ownhead" data-reveal>${kicker('Free for venues')}<h2 class="d1" id="po-h">For Court Owners</h2><p class="lede">List every court you run at no cost. No subscription, no commission: you receive the full court price on every booking.</p></div>
    <div class="prc__own">
      <article class="plan board" data-reveal><p class="plan__tag">No subscription</p><h3 class="d3">Free listing</h3><p>Everything you need to take bookings online, for every venue you run.</p><p class="plan__price"><b>₱0</b><span>to list, every month</span></p>
        <ul class="ticks">${['Unlimited venues and courts', 'Public listing with a live availability calendar', 'Online payments by GCash, Maya, QR Ph, bank and card', 'Owner dashboard and front-desk walk-in bookings', 'Payouts to your bank, GCash or Maya'].map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul>
        ${ctas(btn('List your venue free', '/sign-up/?role=owner'))}</article>
      <article class="calc board" data-calc data-reveal><p class="plan__tag">How a booking pays out</p><h3 class="d3">You keep the full court price</h3><p>Served’s 5% service fee is added on top for the player. It never comes out of your share.</p>
        <label class="field calc__in"><span class="field__l">Your court rate</span><input type="number" inputmode="numeric" min="100" max="10000" step="50" value="500" data-calc-rate aria-describedby="calc-note"><span class="calc__peso">₱</span></label>
        <input class="calc__range" type="range" min="200" max="2000" step="50" value="500" data-calc-range aria-label="Court rate slider">
        <dl class="calc__dl"><div><dt>Your court rate</dt><dd data-calc-o="rate">${peso(500)}.00</dd></div><div><dt>Service fee, paid by the player</dt><dd data-calc-o="fee">+ ${peso(25)}.00</dd></div><div class="tot"><dt>Player pays</dt><dd data-calc-o="pays">${peso(525)}.00</dd></div><div class="you"><dt>You receive</dt><dd data-calc-o="you">${peso(500)}.00</dd></div></dl>
        <p class="fine" id="calc-note">No monthly fee and no commission. Paid out to the account you verify with us.</p></article>
    </div>
    <ol class="psteps">
      <li data-reveal style="--i:0"><span>1</span><h3>1. List your venue</h3><p>Add your venue, courts, hours and rates. It takes minutes and costs nothing.</p></li>
      <li data-reveal style="--i:1"><span>2</span><h3>2. Players book and pay</h3><p>Players find you, pick a free slot and pay online. The court is held while they pay, so nothing is double-booked.</p></li>
      <li data-reveal style="--i:2"><span>3</span><h3>3. You get paid</h3><p>Served sends your earnings to your bank, GCash or Maya, with every booking listed in your dashboard.</p></li>
    </ol>
  </div>
</section>`;
  return layout({ path: '/pricing/', title: 'Simple Pricing', desc: 'Free to search and compare courts, and free for court owners to list. Players pay the venue rate plus a 5% service fee.', body, active: 'pricing', bodyCls: 'pg-pricing' });
}

// ============================================================ LIST YOUR COURT
function listCourt() {
  const body = `
${phero({ k: 'For venues', h1: 'List Your Court', lede: 'We already built the traffic. You bring the court. Get your venue in front of players who are searching right now.', crumb: [['Home', '/'], ['List Your Court', '/list-your-court/']], img: 'live-cta-court', extra: ctas(btn('Register Now', '/sign-up/?role=owner&next=owner/list/'), btn('See pricing', '/pricing/#owners', 'btn--ghost'), btn('Talk to our team', '/contact/?subject=Listing+my+court', 'btn--line')) })}
<section class="band band--night lyc" aria-labelledby="hl-h">
  <div class="wrap">
    ${sh({ k: 'Three steps', h: '<span id="hl-h">How Listing Works</span>', lede: 'Three steps from sign up to your first booking.', cls: 'sh--center' })}
    <ol class="lyc__steps">
      <li class="lyc__step" data-reveal style="--i:0" data-spotlight><span class="lyc__n">01</span><h3>Create an owner account</h3><p>Register as a Court Owner. It takes a minute and costs nothing to start.</p><a class="link" href="${u('/sign-up/?role=owner')}">Register Now ${icon('arrow')}</a></li>
      <li class="lyc__step" data-reveal style="--i:1" data-spotlight><span class="lyc__n">02</span><h3>Build your venue page</h3><p>Add photos, courts, surface, hours and your hourly rate, then set your brand colour.</p><a class="link" href="${u('/courts/bgc-turf-pickleball-hub/')}">See an example ${icon('arrow')}</a></li>
      <li class="lyc__step" data-reveal style="--i:2" data-spotlight><span class="lyc__n">03</span><h3>Take bookings</h3><p>Players book and pay through Served. Track every reservation from the owner dashboard.</p><a class="link" href="${u('/pricing/#owners')}">See pricing ${icon('arrow')}</a></li>
    </ol>
  </div>
</section>
<section class="band band--iron dash" aria-labelledby="dh-h">
  <div class="wrap dash__in">
    <div data-reveal>${kicker('Owner tools')}<h2 class="d2" id="dh-h">Run the desk from one screen<span class="pd">.</span></h2><p class="lede">Everything below is part of the free listing.</p>
      <ul class="ticks ticks--lg">${['Unlimited venues and courts', 'Public listing with a live availability calendar', 'Online payments by GCash, Maya, QR Ph, bank and card', 'Owner dashboard and front-desk walk-in bookings', 'Payouts to your bank, GCash or Maya'].map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul></div>
    <div class="dash__ui board" aria-hidden="true" data-tilt>
      <div class="dash__top"><span class="logo logo--sm">${logoMark()}</span><em>Owner dashboard</em><span class="dash__dot"></span></div>
      <div class="dash__cal">${['A', 'B', 'C', 'D'].map((c, ci) => `<div class="dash__row"><b>Court ${c}</b>${Array.from({ length: 12 }, (_, h) => `<i class="${(h * 7 + ci * 5) % 9 < 3 ? 'on' : ''}${(h + ci) % 11 === 0 ? ' walk' : ''}"></i>`).join('')}</div>`).join('')}</div>
      <p class="dash__lg"><i class="on"></i>Online booking <i class="walk"></i>Walk-in</p>
      <p class="fine">Illustration of the dashboard layout.</p>
    </div>
  </div>
</section>
<section class="band band--cream owners owners--lyc" aria-labelledby="ow2-h">
  <div class="wrap owners__in owners__in--solo">
    <div class="owners__copy" data-reveal>
      ${kicker('Served. <span class="sep">/</span> Register Your Court')}
      <h2 class="d1" id="ow2-h"><span>We Already</span> <span>Built The Traffic.</span> <span class="hl">You Bring The Court.</span></h2>
      <p class="lede">Skip the cost of building your own booking site and running ads to fill it. List on Served and get in front of players who are already looking for a court.</p>
      <p class="owners__bh">Benefit from:</p>
      <ul class="ticks"><li>${icon('check')}Increase booking volume</li><li>${icon('check')}Build trust with verified players</li><li>${icon('check')}Save the cost of a standalone booking app and its marketing</li></ul>
      ${ctas(btn('Join Us Today!', '/sign-up/?role=owner&next=owner/list/', 'btn--ink'))}
    </div>
  </div>
</section>
<section class="band band--night faqp"><div class="wrap faqp__in">${sh({ k: 'Owners ask', h: 'Before you list<span class="pd">.</span>' })}<div>${faqList(FAQ.filter((f) => f.cat === 'Court owners'))}</div></div></section>`;
  return layout({ path: '/list-your-court/', title: 'List Your Court', desc: 'We already built the traffic. You bring the court. List your venue on Served for free: no subscription, no commission.', body, active: 'list', bodyCls: 'pg-list' });
}

// ============================================================ CONTACT
function contact() {
  const body = `
${phero({ k: 'Contact', h1: 'Contact Us', lede: 'Questions about a booking, or about listing your venue? Send a note and the team will come back to you.', crumb: [['Home', '/'], ['Contact Us', '/contact/']], cls: 'phero--short' })}
<section class="band band--night cnt">
  <div class="wrap cnt__grid">
    <form class="cform board" data-demo-form data-reveal>
      <h2 class="d3">Send a message</h2><p>We usually reply within one working day.</p>
      <div class="cform__row"><label class="field"><span class="field__l">Your name</span><input name="name" type="text" required placeholder="Juan Dela Cruz" autocomplete="name"></label>
      <label class="field"><span class="field__l">Email address</span><input name="email" type="email" required placeholder="you@email.com" autocomplete="email"></label></div>
      <label class="field"><span class="field__l">Subject</span><select name="subject"><option>A booking I made</option><option>Listing my court</option><option>Billing or pricing</option><option>Something else</option></select>${icon('chev', 'field__i')}</label>
      <label class="field"><span class="field__l">Message</span><textarea name="message" rows="5" required placeholder="How can we help?"></textarea></label>
      <button class="btn btn--accent btn--lg" type="submit"><span>Send message</span>${icon('arrow')}</button>
      ${demoNote()}
    </form>
    <div class="cnt__side">
      <a class="icard" href="mailto:${SITE.email}" data-reveal data-spotlight><span class="icard__ic">${icon('mail')}</span><b>Email</b><span>${SITE.email}</span></a>
      <div class="icard" data-reveal data-spotlight><span class="icard__ic">${icon('clock')}</span><b>Hours</b><span>${SITE.hours}</span></div>
      <a class="icard" href="${u('/list-your-court/')}" data-reveal data-spotlight><span class="icard__ic">${icon('court')}</span><b>List your court</b><span>Own a venue? See how listing works.</span></a>
      <a class="icard" href="${u('/help/')}" data-reveal data-spotlight><span class="icard__ic">${icon('info')}</span><b>Help centre</b><span>Fees, cancellations and payments, answered.</span></a>
    </div>
  </div>
</section>`;
  return layout({ path: '/contact/', title: 'Contact Us', desc: 'Questions about a booking, or about listing your venue? Send a note and the Served team will come back to you within one working day.', body, active: 'contact', bodyCls: 'pg-contact' });
}

// ============================================================ AUTH
function auth({ path, title, desc, side, form, photo = 'rallyx-ready-position', pos = '50% 30%' }) {
  const body = `<section class="auth">
  <div class="auth__vis" aria-hidden="true">${img(photo, { alt: '', sizes: '(min-width: 900px) 45vw, 100vw', eager: true, pos })}<span class="auth__scrim"></span><div class="auth__side">${side}</div></div>
  <div class="auth__main"><div class="auth__card">${form}</div></div>
</section>`;
  return layout({ path, title, desc, body, bodyCls: 'pg-auth', sticky: null, noFinal: true });
}
const roleSeg = (name = 'role') => `<fieldset class="seg seg--role" data-role-seg><legend class="field__l">${name === 'role' ? 'Sign in as' : 'Register as'}</legend><label><input type="radio" name="role" value="player" checked><span>${icon('user')}I am a Player</span></label><label><input type="radio" name="role" value="owner"><span>${icon('court')}I am a Court Owner</span></label></fieldset>`;
const pw = (n, ph, ac) => `<label class="field"><span class="field__l">${ph === 'Password' ? 'Password' : 'Confirm password'}</span><input name="${n}" type="password" required placeholder="${ph}" autocomplete="${ac}"><button class="field__eye" type="button" data-eye aria-label="Show password">${icon('sun')}</button></label>`;
function signIn() {
  return auth({ path: '/sign-in/', title: 'Sign in', desc: 'Sign in to Served as a player or court owner. Your game, your court, let’s play.', photo: 'signin-tennis', pos: '50% 45%',
    side: `<p class="kicker"><span class="kicker__ball"></span>Login User &amp; Court Owner</p><p class="auth__big">Your game, your court, Let’s play!</p>`,
    form: `<a class="logo" href="${u('/')}" aria-label="Served. home">${logoMark()}</a><h1 class="d2">You’re Up!</h1><p class="auth__sub">Ready for your next match?</p>
    <form data-auth="signin" novalidate>${roleSeg('role')}
      <label class="field"><span class="field__l">Email or username</span><input name="email" type="text" required placeholder="Email/Username" autocomplete="username"></label>${pw('password', 'Password', 'current-password')}
      <div class="auth__row"><label class="check"><input type="checkbox" name="remember"><span>Remember Password</span></label><a class="link" href="${u('/forgot-password/')}">Forgot Password</a></div>
      <button class="btn btn--accent btn--lg btn--block" type="submit"><span>Sign In</span>${icon('arrow')}</button>${demoNote('Preview: accounts live in this browser only. Register first, then sign in here.')}</form>
    <p class="auth__alt">Don’t have an account? <a href="${u('/sign-up/')}">Sign up!</a></p>` });
}
function signUp() {
  return auth({ path: '/sign-up/', title: 'Register', desc: 'Create your Served account. Book your court. Start playing, or list your venue as a court owner.', photo: 'rallyx-forehand', pos: '50% 35%',
    side: `<p class="kicker"><span class="kicker__ball"></span>Register Now</p><p class="auth__big">Find your court. Book it. Show up. That’s it.</p><p class="auth__small">Served cuts out the calls, the waiting, the guesswork. Just you, the game, and a slot that’s already yours. Register now.</p>`,
    form: `<a class="logo" href="${u('/')}" aria-label="Served. home">${logoMark()}</a><h1 class="d2">Get Served<span class="pd">.</span></h1><p class="auth__sub">Create your account. Book your court. Start playing.</p>
    <form data-auth="register" novalidate>${roleSeg('register')}
      <div class="cform__row"><label class="field"><span class="field__l">First name</span><input name="first_name" required placeholder="First name" autocomplete="given-name"></label><label class="field"><span class="field__l">Last name</span><input name="last_name" required placeholder="Last name" autocomplete="family-name"></label></div>
      <label class="field"><span class="field__l">Username</span><input name="username" required placeholder="Username" autocomplete="username"></label>
      <div class="cform__row"><label class="field"><span class="field__l">Email address</span><input name="email" type="email" required placeholder="Email" autocomplete="email"></label><label class="field"><span class="field__l">Phone number</span><input name="phone" type="tel" placeholder="Phone number (optional)" autocomplete="tel"></label></div>
      <div class="cform__row">${pw('password', 'Password', 'new-password')}${pw('password_confirm', 'Confirm Password', 'new-password')}</div>
      <label class="check"><input type="checkbox" name="terms" required><span>By continuing you indicate that you read and agreed to the Terms of Use</span></label>
      <button class="btn btn--accent btn--lg btn--block" type="submit"><span>Create Account</span>${icon('arrow')}</button>${demoNote('Preview: your account lives in this browser only. Players can then book any listed court; owners get the court page studio.')}</form>
    <p class="auth__alt">Have an account? <a href="${u('/sign-in/')}">Sign In!</a></p>` });
}
function forgot() {
  return auth({ path: '/forgot-password/', title: 'Forgot Password', desc: 'Reset your Served password with your registered email.', photo: 'rallyx-paddle-ball', pos: '50% 50%',
    side: `<p class="kicker"><span class="kicker__ball"></span>Happens to the best of us</p><p class="auth__big">Let’s get you back on court.</p>`,
    form: `<a class="logo" href="${u('/')}" aria-label="Served. home">${logoMark()}</a><h1 class="d2">Forgot Password</h1><p class="auth__sub">Enter registered email</p>
    <form data-demo-form><label class="field"><span class="field__l">Email address</span><input name="email" type="email" required placeholder="Email" autocomplete="email"></label><button class="btn btn--accent btn--lg btn--block" type="submit"><span>Submit</span>${icon('arrow')}</button>${demoNote()}</form>
    <p class="auth__alt">Remember Password? <a href="${u('/sign-in/')}">Sign In!</a></p>` });
}
function staff() {
  return auth({ path: '/staff/sign-in/', title: 'Staff sign in', desc: 'Front desk staff sign in on their venue’s own page. Open the link your venue gave you, or type its desk code.', photo: 'rallyx-paddle-wall-tall', pos: '50% 40%',
    side: `<p class="kicker"><span class="kicker__ball"></span>Front desk</p><p class="auth__big">Each venue has its own sign-in page for its staff.</p>`,
    form: `<a class="logo" href="${u('/')}" aria-label="Served. home">${logoMark()}</a><h1 class="d2">Staff sign in</h1><p class="auth__sub">Staff sign in on their venue’s own page. Open the link your venue gave you, or type its desk code.</p>
    <form data-demo-form><label class="field"><span class="field__l">Desk code</span><input name="code" required placeholder="Desk code, like up-diliman-4f2a" autocomplete="off"></label><button class="btn btn--accent btn--lg btn--block" type="submit"><span>Go to my venue’s sign-in</span>${icon('arrow')}</button>${demoNote()}</form>
    <p class="auth__alt">Not staff? <a href="${u('/sign-in/')}">Sign in as a player or court owner</a>.</p>` });
}

// ============================================================ SPORTS
function sportsHub() {
  const body = `
${phero({ k: 'Sports', h1: 'Pick your sport<span class="pd">.</span>', lede: 'Three sports are live on Served, each with its own courts and colour. More are on the way, and we mark them clearly until they are bookable.', crumb: [['Home', '/'], ['Sports', '/sports/']], img: 'rallyx-paddles-court' })}
<section class="band band--night shub">
  <div class="wrap shub__list">${SPORTS.map((s) => {
    const list = playsSport(s.name);
    return `<article class="srow${s.live ? '' : ' srow--soon'}" id="${s.slug}" data-tone="${s.tone}" data-reveal>
      <div class="srow__media">${s.img ? img(s.card || s.img, { alt: '', sizes: '(min-width: 900px) 40vw, 100vw' }) : `<span class="srow__ph">${icon(s.icon)}</span>`}</div>
      <div class="srow__copy"><p class="srow__k">${icon(s.icon)}${s.kicker}</p><h2 class="d1">${s.name}</h2><p class="srow__line">${s.line}</p><p class="lede">${s.intro}</p>
      ${s.live ? `<p class="srow__stats"><span><b>${list.length}</b> venue${list.length === 1 ? '' : 's'}</span><span><b>${list.reduce((n, v) => n + courtsFor(v, s.name), 0)}</b> courts</span><span>from <b>${peso(minRate(list))}</b> / hr</span></p>${ctas(btn(`Book ${s.name.toLowerCase()}`, `/courts/?sport=${s.name}`), btn(`About ${s.name.toLowerCase()} on Served`, `/sports/${s.slug}/`, 'btn--ghost'))}` : `<p class="soon soon--lg">Coming soon</p>${ctas(btn('List your court', '/list-your-court/', 'btn--ghost'))}`}</div></article>`;
  }).join('')}</div>
</section>`;
  return layout({ path: '/sports/', title: 'Sports on Served: pickleball, tennis, badminton', desc: 'Book pickleball, tennis and badminton courts on Served. Basketball and padel are coming soon.', body, active: 'courts', bodyCls: 'pg-sports' });
}
function sportPage(s) {
  const list = playsSport(s.name);
  const surfaces = [...new Set(list.map((v) => v.surface).filter(Boolean))];
  const cities = [...new Set(list.map((v) => v.city).filter(Boolean))];
  const others = SPORTS.filter((x) => x.live && x.slug !== s.slug);
  const body = `
${phero({ k: `${s.kicker}`, h1: `${s.name} courts`, lede: s.intro, crumb: [['Home', '/'], ['Sports', '/sports/'], [s.name, `/sports/${s.slug}/`]], img: s.img, tone: s.tone, cls: 'phero--sport', extra: `<p class="phero__stats"><span><b>${list.length}</b> venue${list.length === 1 ? '' : 's'}</span><span><b>${list.reduce((n, v) => n + courtsFor(v, s.name), 0)}</b> courts</span><span>from <b>${peso(minRate(list))}</b> / hr</span><span>${surfaces.join(', ')}</span></p>` })}
<section class="band band--night spg" data-tone="${s.tone}">
  <div class="wrap">
    ${sh({ k: s.line, h: `Book ${s.name.toLowerCase()} now<span class="pd">.</span>`, lede: `Open slots in ${cities.join(', ')}.`, cls: 'sh--split' })}
    <div class="more__grid">${list.map((v) => (v === RALLYX ? rallyCard() : vcard(v))).join('')}</div>
    ${ctas(btn(`All ${s.name.toLowerCase()} courts`, `/courts/?sport=${s.name}`, 'btn--ghost'))}
  </div>
</section>
<section class="band band--iron bring" data-tone="${s.tone}">
  <div class="wrap bring__in">
    <div data-reveal>${kicker('Before you go')}<h2 class="d2">What to bring<span class="pd">.</span></h2></div>
    <ul class="bring__list">${s.bring.map((b, i) => `<li data-reveal style="--i:${i}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(b)}</li>`).join('')}</ul>
  </div>
</section>
<section class="band band--night sother"><div class="wrap">${sh({ k: 'Switch sides', h: 'Other sports on Served.', cls: 'sh--split' })}<div class="sother__row">${others.map((o) => `<a class="scard scard--row" href="${u(`/sports/${o.slug}/`)}" data-tone="${o.tone}" data-tilt><span class="scard__img">${img(o.card || o.img, { alt: '', sizes: '50vw' })}</span><span class="scard__shade"></span><span class="scard__body"><span class="scard__line">${o.line}</span><span class="scard__name">${o.name}</span></span><span class="scard__go">${icon('arrow')}</span></a>`).join('')}</div></div></section>`;
  return layout({ path: `/sports/${s.slug}/`, title: `${s.name} courts in Metro Manila`, desc: `Book ${s.name.toLowerCase()} courts on Served: ${list.length} venue${list.length === 1 ? '' : 's'}, ${list.reduce((n, v) => n + courtsFor(v, s.name), 0)} courts, from ${peso(minRate(list))} an hour. ${s.intro}`, body, active: 'courts', bodyCls: 'pg-sport' });
}

// ============================================================ CITIES
const credit = (file) => CREDITS.find((c) => c.file === file);
function citiesHub() {
  const body = `
${phero({ k: 'Cities', h1: 'The city is the playground<span class="pd">.</span>', lede: 'Six cities, six ways to play. Pick yours and see what is open.', crumb: [['Home', '/'], ['Cities', '/cities/']], img: 'city-golden-hour' })}
<section class="band band--night chub"><div class="wrap"><div class="chub__grid">${CITIES.map((c, i) => {
    const list = VENUES.filter((v) => v.city === c.name);
    return `<a class="ccard ccard--big" href="${u(`/cities/${c.slug}/`)}" data-reveal style="--i:${i % 3}">${img(c.img, { alt: '', sizes: '(min-width: 900px) 33vw, 100vw' })}<span class="ccard__body"><small>${esc(c.area)}</small><b>${c.name}</b><em>${list.length} venue${list.length > 1 ? 's' : ''} <span class="sep">/</span> ${[...new Set(list.map((v) => v.sport))].join(', ')}</em></span><span class="ccard__go">${icon('arrow')}</span></a>`;
  }).join('')}</div>${ctas(btn('See them on the map', '/courts/?view=map'))}</div></section>`;
  return layout({ path: '/cities/', title: 'Courts by city', desc: `Book courts in ${CITIES.slice(0, -1).map((c) => c.name).join(', ')} and ${CITIES.at(-1).name} on Served.`, body, active: 'courts', bodyCls: 'pg-cities' });
}
function cityPage(c) {
  const list = VENUES.filter((v) => v.city === c.name);
  const cr = credit(c.img);
  const others = CITIES.filter((x) => x.slug !== c.slug);
  const body = `
${phero({ k: c.area, h1: `Courts in ${c.name}`, lede: c.intro, crumb: [['Home', '/'], ['Cities', '/cities/'], [c.name, `/cities/${c.slug}/`]], img: c.img, extra: `<p class="phero__stats"><span><b>${list.length}</b> venue${list.length > 1 ? 's' : ''}</span><span><b>${list.reduce((n, v) => n + v.courts, 0)}</b> courts</span><span>${[...new Set(list.map((v) => v.sport))].join(', ')}</span></p>` })}
${cr ? `<p class="credit-line wrap">Photo: ${esc(cr.title)}, ${esc(cr.author)}, ${esc(cr.license)}, via Wikimedia Commons</p>` : ''}
<section class="band band--night spg"><div class="wrap">${sh({ k: 'Open near you', h: `Book in ${c.name}<span class="pd">.</span>`, cls: 'sh--split' })}<div class="more__grid">${list.map((v) => vcard(v)).join('')}</div></div></section>
<section class="band band--iron"><div class="wrap">${sh({ k: 'Nearby', h: 'Other cities', cls: 'sh--split' })}<div class="chips chips--lg">${others.map((o) => `<a class="chip chip--lg" href="${u(`/cities/${o.slug}/`)}">${icon('pin')}${o.name}</a>`).join('')}</div></div></section>`;
  return layout({ path: `/cities/${c.slug}/`, title: `Courts in ${c.name}`, desc: `Book courts in ${c.name} on Served. ${c.intro}`, body, active: 'courts', bodyCls: 'pg-city' });
}

// ============================================================ PLAY (concept)
function play() {
  const example = {
    'open-play': `<div class="ex board"><p class="ex__h">${icon('users')}Open play <em>Example</em></p><p class="ex__t">Pickleball doubles, intermediate</p><p class="ex__m">Saturday evening <span class="sep">/</span> 4 of 8 spots left</p><div class="ex__slots">${Array.from({ length: 8 }, (_, i) => `<i class="${i < 4 ? 'on' : ''}"></i>`).join('')}</div><span class="btn btn--accent btn--sm">Claim a spot</span></div>`,
    'find-players': `<div class="ex board"><p class="ex__h">${icon('search')}Find players <em>Example</em></p><div class="ex__chips"><span class="chip">Tennis</span><span class="chip">Beginner</span><span class="chip">Weeknights</span></div><p class="ex__t">Looking for a hitting partner</p><p class="ex__m">Two players match your level and time</p><span class="btn btn--accent btn--sm">Say hi</span></div>`,
    clubs: `<div class="ex board"><p class="ex__h">${icon('flag')}Club ranking <em>Example</em></p><ol class="ex__rank"><li><b>1</b>Club one<span>1,240</span></li><li><b>2</b>Club two<span>1,180</span></li><li><b>3</b>Club three<span>1,095</span></li></ol></div>`,
    tournaments: `<div class="ex board"><p class="ex__h">${icon('trophy')}Bracket <em>Example</em></p><div class="ex__bracket"><span>Team A</span><span>Team B</span><span class="w">Team A</span><span>Team C</span><span>Team D</span><span class="w">Team D</span><span class="f">Final</span></div></div>`,
    events: `<div class="ex board"><p class="ex__h">${icon('ticket')}Events <em>Example</em></p><p class="ex__t">Beginner clinic</p><p class="ex__m">Hosted by a venue near you</p><span class="btn btn--ghost btn--sm">Save my spot</span></div>`,
  };
  const body = `
${phero({ k: 'Play mode <em class="soon">Coming soon</em>', h1: 'Who’s playing?', lede: 'Booking a court is the start. Play mode is where Served goes next: open play, players, clubs, tournaments and events. Everything on this page is a concept, marked as one, until it is live.', crumb: [['Home', '/'], ['Play', '/play/']], img: 'rallyx-ready-position', pos: '50% 30%' })}
<section class="band band--night playp">
  <div class="wrap playp__list">${PLAY.map((p, i) => `<article class="pfeat" id="${p.id}" data-reveal>
    <div class="pfeat__copy"><span class="stamp">Concept</span><p class="srow__k">${icon(p.icon)}${p.name}</p><h2 class="d2">${p.line}</h2><p class="lede">${p.text}</p></div>
    <div class="pfeat__ex" data-tilt>${example[p.id]}</div></article>`).join('')}</div>
</section>
<section class="band band--cream road" aria-labelledby="rd-h">
  <div class="wrap">
    ${sh({ k: 'Roadmap', h: '<span id="rd-h">Now, next, later<span class="pd">.</span></span>', lede: 'What works today, and what is planned. Plans are not promises; live features are marked live.', cls: 'sh--center' })}
    <ol class="road__list">${ROADMAP.map((r, i) => `<li class="road__col${i === 0 ? ' is-live' : ''}" data-reveal style="--i:${i}"><p class="road__when">${r.when}${i === 0 ? ' <em>Live</em>' : ''}</p><ul>${r.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></li>`).join('')}</ol>
  </div>
</section>
<section class="band band--night early"><div class="wrap early__in"><div data-reveal>${kicker('Early access')}<h2 class="d2">Want in first<span class="pd">?</span></h2><p class="lede">Leave your email and the sport you play. We will let you know when Play mode opens.</p></div>
  <form class="early__form board" data-demo-form><label class="field"><span class="field__l">Email address</span><input type="email" name="email" required placeholder="you@email.com" autocomplete="email"></label><label class="field"><span class="field__l">Sport</span><select name="sport">${SPORTS.map((s) => `<option>${s.name}</option>`).join('')}</select>${icon('chev', 'field__i')}</label><button class="btn btn--accent btn--lg" type="submit"><span>Get early access</span>${icon('arrow')}</button>${demoNote()}</form></div></section>`;
  return layout({ path: '/play/', title: 'Play mode: open play, players, clubs and tournaments', desc: 'Play mode is where Served goes next: open play, find players, clubs and club ranking, tournaments and events. Concept preview.', body, active: 'play', bodyCls: 'pg-play' });
}

// ============================================================ GALLERY
function gallery() {
  const items = [
    ...RALLYX.photos.map((p) => ({ p, g: 'Rally X', cap: RALLYX.captions[p] })),
    { p: 'live-pickleball', g: 'Venues', cap: 'Indoor pickleball courts' }, { p: 'live-tennis', g: 'Venues', cap: 'Outdoor tennis courts' }, { p: 'live-badminton', g: 'Venues', cap: 'Indoor badminton hall' },
    { p: 'live-cta-court', g: 'Venues', cap: 'Covered court at sunset' }, { p: 'live-hero-court', g: 'Venues', cap: 'Night session' },
    ...CREDITS.map((c) => ({ p: c.file, g: c.file.startsWith('sport') ? 'Sports' : 'Cities', cap: c.title.replace(/\.(jpe?g|png|tif)$/i, '').replace(/_/g, ' ') })),
  ];
  const groups = ['All', 'Rally X', 'Venues', 'Cities', 'Sports'];
  const body = `
${phero({ k: 'Court Gallery', h1: 'Court Gallery', lede: 'Courts, cities and the people on them. Real photos from venues, plus the places we play.', crumb: [['Home', '/'], ['Court Gallery', '/gallery/']], cls: 'phero--short' })}
<section class="band band--night galp">
  <div class="wrap">
    <div class="chips chips--filter" role="toolbar" aria-label="Filter photos" data-gal-filter>${groups.map((g, i) => `<button class="chip${i ? '' : ' is-on'}" type="button" data-g="${g}" aria-pressed="${i ? 'false' : 'true'}">${g}</button>`).join('')}</div>
    <div class="masonry masonry--4" data-gallery>${items.map((x, i) => `<figure class="mz${i % 7 === 0 ? ' mz--tall' : ''}" data-g="${x.g}" data-reveal style="--i:${i % 6}"><button class="mz__btn" type="button" data-lightbox="${a(`assets/img/${x.p}-${IMAGES[x.p].sizes.at(-1)}.webp`)}" aria-label="Open photo: ${esc(x.cap)}">${img(x.p, { alt: x.cap, sizes: '(min-width: 1000px) 25vw, 50vw' })}</button></figure>`).join('')}</div>
  </div>
</section>
<section class="band band--iron" id="credits" aria-labelledby="cr-h"><div class="wrap">
  ${sh({ k: 'Credits', h: '<span id="cr-h">Photo credits</span>', lede: 'Rally X photos are supplied by the venue. Venue photos marked as representative are from the current Served site. City and sport photos are from Wikimedia Commons under the licences below.', cls: 'sh--split' })}
  <div class="tbl"><table><thead><tr><th>Photo</th><th>Author</th><th>Licence</th></tr></thead><tbody>${CREDITS.map((c) => `<tr><td><a href="${esc(c.source)}" target="_blank" rel="noopener">${esc(c.title)}</a></td><td>${esc(c.author || 'Unknown')}</td><td>${esc(c.license)}</td></tr>`).join('')}</tbody></table></div>
</div></section>`;
  return layout({ path: '/gallery/', title: 'Court Gallery', desc: 'Courts, cities and the people on them: photos from Rally X, Served venues and the cities we play in.', body, bodyCls: 'pg-gallery' });
}

// ============================================================ HELP
function help() {
  const cats = [...new Set(FAQ.map((f) => f.cat))];
  const body = `
${phero({ k: 'Help', h1: 'Help centre', lede: 'Fees, cancellations, payments and listing, answered in plain words.', crumb: [['Home', '/'], ['Help', '/help/']], cls: 'phero--short', extra: `<label class="field field--xl helpsearch"><span class="sr">Search help</span><input type="search" placeholder="Search: refund, GCash, hours" data-help-q autocomplete="off">${icon('search', 'field__i')}</label>` })}
<section class="band band--night helpp">
  <div class="wrap helpp__grid">
    <nav class="helpp__nav" aria-label="Help topics"><p class="mega__h">Topics</p>${cats.map((c) => `<button class="chip" type="button" data-help-cat="${c}">${c}</button>`).join('')}<button class="chip is-on" type="button" data-help-cat="">All topics</button></nav>
    <div>${faqList(FAQ, 'faq--help')}<p class="empty-line" data-help-empty hidden>${icon('search')}Nothing matched. Try another word, or <a href="${u('/contact/')}">ask the team</a>.</p></div>
  </div>
</section>
<section class="band band--cream pol" aria-labelledby="pol-h"><div class="wrap">
  ${sh({ k: 'Policies', h: '<span id="pol-h">The fine print, not so fine<span class="pd">.</span></span>', cls: 'sh--center' })}
  <div class="pol__grid">
    <article class="polc" data-reveal><span>${icon('shield')}</span><h3>Booking</h3><p>Nothing is reserved until payment. The court is held while you pay, so nothing is double-booked.</p></article>
    <article class="polc" data-reveal><span>${icon('clock')}</span><h3>Cancellation</h3><p>Cancel up to 24 hours before your slot and the court price is refunded in full. Only the service fee is kept.</p></article>
    <article class="polc" data-reveal><span>${icon('wallet')}</span><h3>Service fee</h3><p>Served adds a 5% service fee at checkout, listed on the order summary before you pay.</p></article>
    <article class="polc" data-reveal><span>${icon('card')}</span><h3>Payments</h3><p>Online payments by GCash, Maya, QR Ph, bank and card.</p></article>
  </div>
</div></section>`;
  return layout({ path: '/help/', title: 'Help centre and FAQ', desc: 'How booking works on Served: the 5% service fee, 24-hour cancellation, payments by GCash, Maya, QR Ph, bank and card, and listing your court.', body, bodyCls: 'pg-help',
    schema: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) } });
}

// ============================================================ ABOUT
function about() {
  const body = `
${phero({ k: 'About', h1: 'Finding a game is the easy part<span class="pd">.</span>', lede: 'Served is a sports court discovery and booking platform that connects players to sports facilities, so it is easier to find where to play, check availability and book a court.', crumb: [['Home', '/'], ['About', '/about/']], img: 'city-makati' })}
<section class="band band--night abt">
  <div class="wrap abt__in">
    <p class="abt__big" data-reveal>No calls<span class="pd">.</span> No waiting<span class="pd">.</span> No guesswork<span class="pd">.</span></p>
    <div class="abt__cols">
      <div data-reveal>${kicker('Where we start')}<h2 class="d3">Racket sports, and the pickleball boom</h2><p>Served starts with racket sports and the growing pickleball community in the Philippines: pickleball, tennis and badminton, across ${CITIES.length} cities today.</p></div>
      <div data-reveal>${kicker('Who it is for')}<h2 class="d3">Players and the venues they love</h2><p>Casual players organising a spontaneous game, competitive players chasing their next session, barkadas planning weekend play, and court owners who want full courts without building their own booking site.</p></div>
      <div data-reveal>${kicker('Where it goes')}<h2 class="d3">Beyond the booking</h2><p>Open play, finding players, clubs, events and sports communities. Those are on the roadmap, and marked as concepts until they are live.</p></div>
    </div>
    <ul class="abt__stats"><li><b data-count="${VENUE_COUNT}">${VENUE_COUNT}</b><span>venues</span></li><li><b data-count="${TOTAL_COURTS}">${TOTAL_COURTS}</b><span>courts</span></li><li><b data-count="3">3</b><span>sports live</span></li><li><b>₱0</b><span>to list a venue</span></li></ul>
  </div>
</section>
<section class="band band--cream road"><div class="wrap">${sh({ k: 'Roadmap', h: 'Now, next, later<span class="pd">.</span>', cls: 'sh--center' })}<ol class="road__list">${ROADMAP.map((r, i) => `<li class="road__col${i === 0 ? ' is-live' : ''}" data-reveal style="--i:${i}"><p class="road__when">${r.when}${i === 0 ? ' <em>Live</em>' : ''}</p><ul>${r.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></li>`).join('')}</ol></div></section>`;
  return layout({ path: '/about/', title: 'About Served.', desc: 'Served is a sports court discovery and booking platform for the Philippines, starting with racket sports and the growing pickleball community.', body, bodyCls: 'pg-about' });
}

// ============================================================ 404
function notFound() {
  setPage('/');
  const body = `<section class="nf band band--night"><div class="band__clip" aria-hidden="true"><span class="band__grid"></span></div><div class="wrap nf__in"><p class="nf__code" aria-hidden="true">4<span class="nf__ball"></span>4</p><h1 class="d1">Out of bounds<span class="pd">.</span></h1><p class="lede">That page is not on the court. Try a search, or head back to the baseline.</p>${ctas(btn('Find a court', '/courts/'), btn('Home', '/', 'btn--ghost'))}</div></section>`;
  return layout({ path: '/', title: 'Out of bounds', desc: 'Page not found.', body, noFinal: true }).replace('<html lang="en-PH" class="no-js" data-root="./">', '<html lang="en-PH" class="no-js" data-root="./" data-404>');
}

// ============================================================ ACCOUNT: a player's bookings, an owner's links (rendered in the browser)
function account() {
  const body = `<section class="band band--night acct">
  <div class="wrap">
    <header class="sh">${kicker('Your account')}<h1 class="d1">My account<span class="pd">.</span></h1></header>
    <div class="acct__view" data-acct-view aria-live="polite"><p class="lede">Loading your account.</p></div>
    <noscript><p class="lede">Your account needs JavaScript in this preview.</p></noscript>
  </div>
</section>`;
  return layout({ path: '/account/', title: 'My account', desc: 'Your Served bookings and account.', body, sticky: null, noFinal: true });
}

// ============================================================ OWNER STUDIO: colours, hero photo and gallery for your court page
const STUDIO_ACCENTS = [['Served orange', '#ff6b18'], ['Gold', '#f5b301'], ['Sunset', '#ef4444'], ['Sky', '#38bdf8'], ['Violet', '#a78bfa'], ['Mint', '#34d399'], ['Chalk', '#f4f4f2']];
const STUDIO_BASES = [['Black', '#0a0a0a'], ['Navy', '#101a2e'], ['Court green', '#0c2419'], ['Clay', '#2a130b'], ['Plum', '#1f1230']];
function studio() {
  const venues = [...VENUES.map((v) => [v.slug, v.name]), ['rally-x', 'Rally X']];
  const body = `<section class="band band--night studio">
  <div class="wrap">
    <header class="sh sh--split">${kicker('For court owners')}<h1 class="d1">Your court page<span class="pd">.</span></h1><p class="lede">Make your venue's page feel like your own site: your colours, your hero photo, your gallery. A dark gradient always sits over the hero so your name and buttons stay easy to read.</p></header>
    <div class="studio__gate board" data-studio-gate hidden>
      <h2 class="d3">Sign in as a court owner</h2>
      <p>The studio is for court owners. Register as an owner, or sign in, and you will come straight back here.</p>
      ${ctas(btn('Register as an owner', '/sign-up/?role=owner&next=owner/studio/'), btn('Sign in', '/sign-in/?role=owner&next=owner/studio/', 'btn--ghost'))}
    </div>
    <div class="studio__grid" data-studio hidden>
      <div class="studio__tools"><a class="btn btn--accent btn--sm" href="${u('/owner/list/')}">${icon('plus')}<span>List a new venue</span></a><button class="btn btn--line btn--sm" type="button" data-mode-switch="player">${icon('user')}<span>Switch to player view</span></button></div>
      <form class="studio__panel board" data-studio-form>
        <fieldset class="studio__f"><legend class="field__l">Your venue</legend>
          <label class="field"><span class="sr">Your venue</span><select name="venue">${venues.map(([s, n]) => `<option value="${s}">${esc(n)}</option>`).join('')}</select></label>
          <p class="fine">In this preview you can claim any listed venue. On Served you would manage the venues on your owner account.</p></fieldset>
        <fieldset class="studio__f"><legend class="field__l">Accent colour</legend>
          <div class="swatches">${STUDIO_ACCENTS.map(([n, c]) => `<label class="swatch" style="--sw:${c}"><input type="radio" name="accent" value="${c}"><span><i></i>${n}</span></label>`).join('')}<label class="swatch swatch--pick"><input type="color" name="accentPick" value="#ff6b18" aria-label="Any colour"><span>Any colour</span></label></div>
          <p class="studio__warn" data-contrast role="status"></p></fieldset>
        <fieldset class="studio__f"><legend class="field__l">Background</legend>
          <div class="swatches">${STUDIO_BASES.map(([n, c]) => `<label class="swatch swatch--base" style="--sw:${c}"><input type="radio" name="base" value="${c}"><span><i></i>${n}</span></label>`).join('')}</div></fieldset>
        <fieldset class="studio__f"><legend class="field__l">Hero photo</legend>
          <div class="studio__hero" data-hero-prev><span>Default photo</span></div>
          <div class="studio__row"><label class="btn btn--ghost btn--sm studio__up">${icon('image')}<span>Upload a hero photo</span><input type="file" accept="image/*" name="hero"></label><button class="btn btn--line btn--sm" type="button" data-hero-reset>Use the default</button></div>
          <p class="fine">Landscape photos work best. The gradient over the hero stays so the text reads.</p></fieldset>
        <fieldset class="studio__f"><legend class="field__l">Gallery</legend>
          <div class="studio__gal" data-gal></div>
          <label class="btn btn--ghost btn--sm studio__up">${icon('plus')}<span>Add photos</span><input type="file" accept="image/*" name="gallery" multiple></label>
          <p class="fine">Up to 12 photos. They show in a Photos section on your page.</p></fieldset>
        <div class="ctas"><a class="btn btn--accent" href="#" target="_blank" rel="noopener" data-studio-view><span>Open your page</span>${icon('arrow-ne')}</a><button class="btn btn--line" type="button" data-studio-reset>Reset this page</button></div>
        ${demoNote('Preview: your settings and photos are saved in this browser only. On Served they would publish to your page for everyone.')}
      </form>
      <div class="studio__preview board" aria-label="Live preview">
        <div class="studio__bar" aria-hidden="true"><i></i><i></i><i></i><em data-studio-url></em></div>
        <iframe title="Your court page, live preview" data-studio-frame></iframe>
      </div>
    </div>
  </div>
</section>`;
  return layout({ path: '/owner/studio/', title: 'Court page studio', desc: 'Court owners: set your page colours, hero photo and gallery.', body, sticky: null, noFinal: true });
}

// ============================================================ OWNER: list a venue (kept in the owner's browser in this preview)
const LIST_SURFACES = ['Hard', 'Acrylic', 'Clay', 'Wood', 'Synthetic turf', 'Rubber'];
const LIST_AMENITIES = ['Lights', 'Parking', 'Showers', 'Lockers', 'Changing rooms', 'Equipment rental'];
const hourLabel = (h) => (h === 24 ? '12:00 AM (midnight)' : `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`);
const hourOpts = (from, to, sel) => Array.from({ length: to - from + 1 }, (_, i) => from + i).map((h) => `<option value="${h}"${h === sel ? ' selected' : ''}>${hourLabel(h)}</option>`).join('');
function ownerList() {
  const body = `<section class="band band--night olist"><div class="wrap">
  <header class="sh sh--split">${kicker('For court owners')}<h1 class="d1">List your venue<span class="pd">.</span></h1><p class="lede">Tell players what you have. Your listing gets its own page, shows in the courts directory and takes bookings straight away. You can change anything later.</p></header>
  <div class="studio__gate board" data-list-gate hidden><h2 class="d3">Sign in as a court owner</h2><p>Listing a venue is for court owners. Register as an owner, or sign in, and you will come straight back here.</p>${ctas(btn('Register as an owner', '/sign-up/?role=owner&next=owner/list/'), btn('Sign in', '/sign-in/?role=owner&next=owner/list/', 'btn--ghost'))}</div>
  <form class="olist__form board" data-list-form hidden novalidate>
    <div class="cform__row"><label class="field"><span class="field__l">Venue name</span><input name="name" required maxlength="60" placeholder="e.g. Kapitolyo Pickle Club" autocomplete="organization"></label><label class="field"><span class="field__l">Sport</span><select name="sport" required>${SPORTS.filter((s) => s.live).map((s) => `<option>${s.name}</option>`).join('')}</select>${icon('chev', 'field__i')}</label></div>
    <div class="cform__row"><label class="field"><span class="field__l">City</span><select name="city" required>${CITIES.map((c) => `<option>${c.name}</option>`).join('')}<option>Other</option></select>${icon('chev', 'field__i')}</label><label class="field"><span class="field__l">Street and area</span><input name="address" required maxlength="80" placeholder="e.g. 12 East Capitol Drive, Kapitolyo"></label></div>
    <div class="cform__row"><label class="field"><span class="field__l">Courts on site</span><input name="courts" type="number" required min="1" max="20" value="2"></label><label class="field"><span class="field__l">Surface</span><select name="surface">${LIST_SURFACES.map((s) => `<option>${s}</option>`).join('')}</select>${icon('chev', 'field__i')}</label></div>
    <div class="cform__row"><label class="field"><span class="field__l">Rate per hour (₱)</span><input name="rate" type="number" required min="100" max="10000" step="50" placeholder="e.g. 800"></label><label class="field"><span class="field__l">Evening rate from 6 PM (₱, optional)</span><input name="eveningRate" type="number" min="100" max="10000" step="50" placeholder="Leave empty for one rate"></label></div>
    <div class="cform__row"><label class="field"><span class="field__l">Opens</span><select name="open">${hourOpts(5, 12, 7)}</select>${icon('chev', 'field__i')}</label><label class="field"><span class="field__l">Closes</span><select name="close">${hourOpts(14, 24, 22)}</select>${icon('chev', 'field__i')}</label></div>
    <fieldset class="olist__am"><legend class="field__l">Amenities</legend><div class="olist__checks">${LIST_AMENITIES.map((x) => `<label class="check"><input type="checkbox" name="amenities" value="${x}"><span>${x}</span></label>`).join('')}</div></fieldset>
    <label class="field"><span class="field__l">About the venue</span><textarea name="desc" required maxlength="280" rows="3" placeholder="What makes your courts good to play on, in a sentence or two."></textarea></label>
    <label class="field"><span class="field__l">Contact number (optional)</span><input name="phone" type="tel" maxlength="20" placeholder="Shown on your page" autocomplete="tel"></label>
    <div class="ctas"><button class="btn btn--accent btn--lg" type="submit"><span data-list-label>Publish listing</span>${icon('arrow')}</button><a class="btn btn--ghost" href="${u('/owner/studio/')}"><span>Your court page studio</span></a></div>
    ${demoNote('Preview: your listing is kept in this browser only. On Served it would go live for players everywhere.')}
  </form>
</div></section>`;
  return layout({ path: '/owner/list/', title: 'List your venue', desc: 'Court owners: list your venue on Served.', body, sticky: null, noFinal: true });
}

// ============================================================ a listed venue's page: one template, filled in the browser from the owner's listing
const SPORT_PHOTO = { Pickleball: 'live-pickleball', Tennis: 'live-tennis', Badminton: 'live-badminton' };
function listingPage() {
  const tpl = { slug: 'listing', name: 'this venue', sport: 'Pickleball', rate: 0, open: [], full: [], address: '', booking: { hours: [], rates: null, courts: [{ id: 'c1', name: 'Court A' }], taken: {}, feeRate: SITE.feeRate, maxHours: SITE.maxHours } };
  const live = SPORTS.filter((s) => s.live);
  const art = Object.fromEntries(live.map((s) => [s.name, { court: courtSvg(s.name, 'cpk__court'), done: courtD(s.name, 10, 19, 180, 82, 6), img: img(SPORT_PHOTO[s.name], { alt: '', sizes: '100vw', eager: true }), chip: chipSport(s.name) }]));
  const amen = { Lights: 'bulb', Parking: 'parking', Showers: 'shower', Lockers: 'locker', 'Changing rooms': 'shirt', 'Equipment rental': 'racket' };
  const body = `
<section class="vhero band band--night" data-l-page>
  <div class="band__clip" aria-hidden="true"><figure class="vhero__bg" data-l-hero>${art.Pickleball.img}</figure><span class="vhero__scrim"></span></div>
  <div class="wrap vhero__in">
    <div class="vhero__grid">
      <div class="vhero__copy">
        <p class="chips"><span data-l-chip>${art.Pickleball.chip}</span><span class="chip" data-l="surface">Surface</span><span class="chip">${icon('sparkle')}New listing</span></p>
        <p class="vhero__by"><span class="vhero__mono" aria-hidden="true" data-l="mono">V</span>Listed by its owner</p>
        <h1 class="d1 vhero__h" data-l="name">Listing</h1>
        <p class="vhero__meta"><span data-l="place">City</span> <span class="sep">/</span> <span data-l="surface">Surface</span> surface <span class="sep">/</span> <span data-l="courts">0</span> courts available</p>
      </div>
      <div class="vhero__board board">
        <p class="price price--big"><b data-l="rate">₱0</b><span>/ hr</span><small>exclusive of service fees</small></p>
        ${ctas(`<a class="btn btn--accent btn--lg" href="#book"><span>Check availability</span>${icon('arrow')}</a>`)}
      </div>
    </div>
  </div>
  <p class="photo-note" data-photo-note>Representative photo</p>
</section>
<div data-l-page>${booking(tpl, 'venue')}</div>
<section class="band band--night vinfo" id="about" data-l-page>
  <div class="wrap vinfo__grid">
    <div class="vinfo__about">${kicker('The venue')}<h2 class="d2">About <span data-l="name">the venue</span></h2><p class="lede" data-l="desc"></p>
      <dl class="specs"><div><dt>Surface</dt><dd data-l="surface"></dd></div><div><dt>Courts on site</dt><dd data-l="courts"></dd></div><div><dt>Sport</dt><dd data-l="sport"></dd></div><div><dt>Open</dt><dd data-l="hours"></dd></div></dl></div>
    <div class="vinfo__am"><h2 class="d3">Amenities</h2><ul class="amen" data-l-amen></ul>
      <h2 class="d3">Good to know</h2>
      <ul class="rules"><li>${icon('shield')}<span>Nothing is reserved until payment.</span></li><li>${icon('clock')}<span>Book by the hour, or the whole day.</span></li><li>${icon('wallet')}<span>A 5% service fee is shown before you pay.</span></li></ul></div>
  </div>
</section>
<section class="band band--night vgal" id="photos" data-vgal hidden aria-labelledby="ph-h"><div class="wrap">${kicker('Photos')}<h2 class="d2" id="ph-h">Inside <span data-l="name">the venue</span></h2></div><div class="vgal__grid" data-vgal-grid></div></section>
<section class="band band--iron vloc" id="location" data-l-page><div class="wrap">${kicker('Location')}<h2 class="d2" data-l="address">Address</h2><p class="lede" data-l-phone-wrap hidden>Call the venue on <b data-l="phone"></b>.</p>${ctas(`<a class="btn btn--ghost" data-l-dir href="#" target="_blank" rel="noopener"><span>Get directions</span>${icon('arrow-ne')}</a>`)}</div></section>
<section class="band band--night" data-l-missing hidden><div class="wrap">${kicker('Listing')}<h1 class="d2">This listing lives in its owner's browser<span class="pd">.</span></h1><p class="lede">In this preview a new listing is kept in the browser of the owner who made it. Open it there, or browse the courts already on Served.</p>${ctas(btn('Browse courts', '/courts/'))}</div></section>
<script>(function(){var A=${JSON.stringify(art).replace(/</g, '\\u003c')},AM=${JSON.stringify(amen)};
var q=new URLSearchParams(location.search),id=q.get('id')||'',L=null;try{L=(JSON.parse(localStorage.getItem('srv.listings')||'[]')||[]).filter(function(x){return x.id===id;})[0]||null;}catch(e){}
var $=function(s){return document.querySelector(s);},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s));};
var none=function(){$$('[data-l-page]').forEach(function(e){e.hidden=true;});$('[data-l-missing]').hidden=false;};
if(!L||!A[L.sport]){none();document.addEventListener('DOMContentLoaded',none);return;}
document.body.dataset.venue='listing-'+L.id;document.title=L.name+' | Served.';
var peso=function(n){return '\\u20b1'+Number(n).toLocaleString('en-PH');},hl=function(h){return h===24?'midnight':((h%12||12)+':00 '+(h<12?'AM':'PM'));};
var set=function(k,v){$$('[data-l="'+k+'"]').forEach(function(e){e.textContent=v;});};
var place=L.city==='Other'?L.address:L.address+', '+L.city;
set('name',L.name);set('mono',L.name.charAt(0).toUpperCase());document.addEventListener('DOMContentLoaded',function(){set('name',L.name);set('mono',L.name.charAt(0).toUpperCase());set('address',place);});set('sport',L.sport);set('surface',L.surface);set('courts',String(L.courts));set('place',place);set('address',place);set('rate',peso(L.rate));set('desc',L.desc);set('hours',hl(L.open)+' to '+hl(L.close));
if(L.phone){set('phone',L.phone);$('[data-l-phone-wrap]').hidden=false;}
$('[data-l-chip]').innerHTML=A[L.sport].chip;$('[data-l-hero]').innerHTML=A[L.sport].img;
var t=$('[data-court-tpl]');if(t)t.innerHTML=A[L.sport].court;var dc=$('.done__court');if(dc)dc.setAttribute('d',A[L.sport].done);
$('[data-l-amen]').innerHTML=(L.amenities||[]).map(function(x){return '<li><svg class="ico" aria-hidden="true"><use href="#i-'+(AM[x]||'check')+'"/></svg><span></span></li>';}).join('');
$$('[data-l-amen] li span').forEach(function(s,i){s.textContent=L.amenities[i];});
$('[data-l-dir]').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(L.name+', '+place);
var today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Manila'}),day=function(iso,n){var d=new Date(iso+'T12:00:00+08:00');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
var hours=[],open=[],rates={},courts=[];for(var h=+L.open;h<+L.close;h++)hours.push(h);for(var i=0;i<60;i++)open.push(day(today,i));
if(L.eveningRate)hours.forEach(function(h){if(h>=18)rates[h]={rate:+L.eveningRate,label:'Evening'};});
for(var c=0;c<+L.courts;c++)courts.push({id:'c'+(c+1),name:'Court '+String.fromCharCode(65+c)});
var bk=$('[data-book]');bk.setAttribute('data-book',JSON.stringify({slug:'listing-'+L.id,name:L.name,rate:+L.rate,fee:${SITE.feeRate},max:${SITE.maxHours},hours:hours,rates:Object.keys(rates).length?rates:null,courts:courts,open:open,full:[],taken:{},address:place,links:{venue:'./?id='+L.id,availability:'./?id='+L.id+'#book',slots:'./?id='+L.id+'#book',courts:'../',signin:'../../sign-in/'}}));
})();</script>`;
  return layout({ path: '/courts/listing/', title: 'Venue listing', desc: 'A venue listed on Served by its owner.', body, active: 'courts', bodyCls: 'pg-venue', sticky: null, noFinal: true,
    own: { name: 'Listing', address: '', fill: true, home: '#top', links: [['Book', '#book'], ['About', '#about'], ['Photos', '#photos', ' data-vgal-link hidden'], ['Location', '#location']], cta: ['Book now', '#book'] } });
}

// ============================================================ LAB: section divider options (27 Nov 2026, for the client to pick one)
// Rule from the client: a divider only sits where the next section's background colour changes.
function labDividers() {
  const ballSvg = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="url(#dvg)"/><path d="M14 17c7 7 7 23 0 30M50 17c-7 7-7 23 0 30" fill="none" stroke="#0a0a0a" stroke-width="2.6" stroke-linecap="round" opacity=".55"/><defs><radialGradient id="dvg" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ff9a5a"/><stop offset=".5" stop-color="#ff6b18"/><stop offset="1" stop-color="#c2410c"/></radialGradient></defs></svg>';
  const sec = (bg, k, h, p, cls = '') => `<section class="dvx dvx--${bg}${cls ? ' ' + cls : ''}"><div class="wrap"><p class="kicker"><span class="kicker__ball" aria-hidden="true"></span>${k}</p><h2 class="d2">${h}</h2><p class="lede">${p}</p></div></section>`;
  const opt = (id, name, how) => `<div class="dvx__tag wrap"><b>${id}</b><span><strong>${name}</strong>${how}</span></div>`;
  // a wave 2880 wide (twice the view), one period every 720, so sliding it by 720 loops without a jump
  const wave = (y, amp) => `M0 ${y}Q180 ${y - amp} 360 ${y}${Array.from({ length: 7 }, (_, i) => `T${720 + i * 360} ${y}`).join('')}V120H0Z`;
  const tape = 'Pickleball<i></i>Tennis<i></i>Badminton<i></i>Book instantly<i></i>Game on<i></i>';
  const body = `
<section class="band band--night dvx-top"><div class="wrap">
  <p class="kicker"><span class="kicker__ball" aria-hidden="true"></span>Options to pick from</p>
  <h1 class="d1">Section dividers</h1>
  <p class="lede">Ten ways to mark the change from one section to the next: A to E from before, and five new transitions, F to J, that move with your scroll. None of them rounds the top corners. Each one is shown at a real change of background colour, because a divider only appears where the colour changes. Pick one and it goes on every colour change across the site.</p>
  <nav class="dvx-jump" aria-label="Options"><a href="#dv-a">A Baseline</a><a href="#dv-b">B Ball on the line</a><a href="#dv-c">C Serve arc</a><a href="#dv-d">D Sheet</a><a href="#dv-e">E Split word</a><a href="#dv-f">F Wipe</a><a href="#dv-g">G Angle</a><a href="#dv-h">H Court tape</a><a href="#dv-i">I Wave</a><a href="#dv-j">J Stack</a></nav>
  <p class="dvx-note">The motion follows your scroll in Chrome, Edge and Safari; other browsers and reduced motion show the finished state.</p>
</div></section>

<div id="dv-a">${opt('A', 'Baseline', 'An orange court baseline painted along the seam, its centre mark pointing into the next section. It draws out from the centre as the seam comes up the screen.')}</div>
${sec('night', 'Pick your sport', 'Three sports live.', 'Black section above the seam.')}
<div class="dv dv--base" aria-hidden="true"><span class="dv__line"></span><span class="dv__mark"></span></div>
${sec('cream', 'Featured venues', 'Courts now serving.', 'Light section below the seam.')}

<div id="dv-b">${opt('B', 'Ball on the line', 'A ball rides the seam, half in each colour, and rolls across as you scroll. On the line counts as in.')}</div>
${sec('cream', 'How it works', 'Sign up, find, play.', 'Light section above the seam.')}
<div class="dv dv--ball" aria-hidden="true"><span class="dv__ball">${ballSvg}</span></div>
${sec('night', 'Rally X', 'Now open for pickleball and tennis.', 'Black section below the seam.')}

<div id="dv-c">${opt('C', 'Serve arc', 'The next colour rises in a shallow arc and a serve traces it, landing as the ball at the far end.')}</div>
${sec('night', 'Cities', 'Courts near you.', 'Black section above the seam.')}
<div class="dv dv--arc dv--to-iron" aria-hidden="true"><svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path class="dv__fill" d="M0 120Q720-24 1440 120Z"/><path class="dv__trail" d="M120 108Q720 4 1320 108" pathLength="1"/></svg><span class="dv__land"></span></div>
${sec('iron', 'Play mode', 'Who is playing?', 'Navy section below the seam.')}

<div id="dv-d">${opt('D', 'Sheet', 'The next section rises over the last like a card being dealt, square-cornered, settling flat and full width as it reaches the top of the screen.')}</div>
${sec('iron', 'Pricing', 'Simple and transparent.', 'Navy section above the seam.')}
<section class="dvx dvx--accent dv-sheet"><div class="wrap"><p class="kicker"><span class="kicker__ball" aria-hidden="true"></span>Ready</p><h2 class="d2">Game on.</h2><p class="lede">Orange section rising over the navy one.</p></div></section>

<div id="dv-e">${opt('E', 'Split word', 'A word in giant type sits across the seam, each half in the colour that reads on its own background. It drifts sideways as you scroll.')}</div>
${sec('accent', 'List your court', 'Your venue, booked.', 'Orange section above the seam.')}
<div class="dv dv--word" aria-hidden="true"><span class="dv__w dv__w--top">GAME ON</span><span class="dv__w dv__w--bot">GAME ON</span></div>
${sec('night', 'Help centre', 'Questions, answered.', 'Black section below the seam.')}

<div id="dv-f">${opt('F', 'Wipe', 'The next colour sweeps across from left to right on a slanted edge as it comes up the screen, like a court being swept between games.')}</div>
${sec('night', 'Cities', 'Courts near you.', 'Black section above the seam.')}
${sec('cream', 'Featured venues', 'Courts now serving.', 'Light section, swept in from the left.', 'dv-wipe')}

<div id="dv-g">${opt('G', 'Angle', 'The seam tilts like a court line seen from the baseline: the next colour lifts on the right as the seam comes up the screen, and holds a shallow angle.')}</div>
${sec('cream', 'How it works', 'Sign up, find, play.', 'Light section above the seam.')}
<div class="dv dv--angle" aria-hidden="true"><svg viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 100L1440 0V100Z"/></svg></div>
${sec('iron', 'Rally X', 'Now open for pickleball and tennis.', 'Navy section below the seam.')}

<div id="dv-h">${opt('H', 'Court tape', 'A strip of orange court tape crosses the seam at a slight angle, its words running sideways as you scroll.')}</div>
${sec('iron', 'Pricing', 'Simple and transparent.', 'Navy section above the seam.')}
<div class="dv dv--tape" aria-hidden="true"><div class="dv__tape"><span>${tape.repeat(4)}</span></div></div>
${sec('night', 'Contact', 'Talk to the team.', 'Black section below the seam.')}

<div id="dv-i">${opt('I', 'Wave', 'Two soft waves of the next colour roll in from either side, like a net settling after a shot, and come to rest as a gentle curve.')}</div>
${sec('night', 'Play mode', 'Who is playing?', 'Black section above the seam.')}
<div class="dv dv--wave" aria-hidden="true"><svg viewBox="0 0 2880 120" preserveAspectRatio="none"><path class="dv__w1" d="${wave(46, 26)}"/><path class="dv__w2" d="${wave(70, 20)}"/></svg></div>
${sec('cream', 'List your court', 'Your venue, booked.', 'Light section below the seam.')}

<div id="dv-j">${opt('J', 'Stack', 'The section you are leaving holds still and dims back while the next one slides up over it on a straight edge, like pages stacking.')}</div>
<div class="dv-stack">
${sec('iron', 'About Served.', 'Every court, one tap away.', 'Navy section that holds still.', 'dv-stack__under')}
${sec('accent', 'Ready', 'Game on.', 'Orange section sliding up over it.', 'dv-stack__over')}
</div>
<div class="dvx-end"></div>
<style>
.dvx-top { padding-bottom: 40px; } .dvx-top .lede { margin-top: 14px; }
.dvx-jump { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; } .dvx-jump a { padding: 10px 14px; border-radius: 999px; border: 1px solid var(--line-2); color: var(--text); text-decoration: none; font: 700 14px/1 var(--f-ui); } .dvx-jump a:hover { border-color: var(--accent); color: var(--accent); }
.dvx-note { margin-top: 14px; font-size: 13.5px; color: var(--text-3); }
.dvx__tag { display: flex; gap: 16px; align-items: flex-start; padding-block: 56px 22px; } .dvx__tag b { flex: none; width: 44px; height: 44px; display: grid; place-items: center; border-radius: 12px; background: var(--accent); color: var(--ink); font: 900 20px/1 var(--f-display); } .dvx__tag span { max-width: 70ch; color: var(--text-2); } .dvx__tag strong { display: block; color: var(--text); font: 850 20px/1.2 var(--f-display); text-transform: uppercase; margin-bottom: 4px; }
.dvx { position: relative; padding-block: clamp(56px, 7vw, 96px); } .dvx .lede { margin-top: 10px; }
.dvx--night { background: var(--ink); } .dvx--iron { background: var(--iron); } .dvx--cream { background: var(--cream); color: var(--ink); } .dvx--accent { background: var(--accent); color: var(--ink); }
.dvx--cream .lede, .dvx--accent .lede { color: rgba(10, 10, 10, .72); } .dvx--accent .kicker { color: var(--ink); } .dvx--accent .kicker__ball { background: var(--ink); }
.dv { position: relative; height: 0; z-index: 3; }
/* A: baseline */
.dv--base .dv__line { position: absolute; left: 0; right: 0; top: -3px; height: 6px; background: var(--accent); }
.dv--base .dv__mark { position: absolute; left: 50%; top: -3px; width: 6px; height: 28px; translate: -50% 0; background: var(--accent); border-radius: 0 0 3px 3px; }
/* B: ball on the line */
.dv--ball .dv__ball { position: absolute; top: 0; left: 50%; width: clamp(44px, 5vw, 68px); aspect-ratio: 1; translate: -50% -50%; filter: drop-shadow(0 16px 18px rgba(0, 0, 0, .45)); }
.dv--ball .dv__ball svg { display: block; width: 100%; height: 100%; }
/* C: serve arc */
.dv--arc svg { position: absolute; left: 0; bottom: 0; width: 100%; height: clamp(48px, 7vw, 110px); overflow: visible; }
.dv--arc .dv__fill { fill: var(--iron); }
.dv--arc .dv__trail { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.dv--arc .dv__land { position: absolute; right: calc(120 / 1440 * 100%); bottom: calc(clamp(48px, 7vw, 110px) * 12 / 120); width: 16px; height: 16px; translate: 50% 50%; border-radius: 50%; background: var(--accent); box-shadow: 0 0 18px rgba(255, 107, 24, .7); }
/* D: sheet (square corners: no rounded top edges, client 27 Nov 2026) */
.dv-sheet { box-shadow: 0 -30px 60px -24px rgba(0, 0, 0, .6); transform-origin: 50% 0; }
/* E: split word */
.dv--word { height: 0; overflow: visible; }
.dv--word .dv__w { position: absolute; left: 50%; top: 0; translate: -50% -50%; white-space: nowrap; font: 900 clamp(36px, 11vw, 170px)/.8 var(--f-display); font-stretch: 125%; letter-spacing: -.02em; pointer-events: none; }
.dv--word .dv__w--top { color: var(--ink); clip-path: inset(-20% -20% 50% -20%); }
.dv--word .dv__w--bot { color: var(--accent); clip-path: inset(50% -20% -20% -20%); }
/* F: wipe (the black of the page shows where the light section has not been swept in yet) */
.dv-wipe { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
/* G: angle */
.dv--angle svg { position: absolute; left: 0; bottom: -1px; width: 100%; height: clamp(34px, 5vw, 80px); transform-origin: 50% 100%; }
.dv--angle path { fill: var(--iron); }
/* H: court tape (the tape is wider than the screen; the strip clips it sideways only) */
.dv--tape { overflow-x: clip; overflow-y: visible; z-index: 4; }
.dv__tape { position: absolute; left: -6%; right: -6%; top: 0; translate: 0 -50%; rotate: -2.2deg; padding-block: clamp(10px, 1.2vw, 16px); background: var(--accent); color: var(--ink); white-space: nowrap; overflow: hidden; box-shadow: 0 20px 40px -20px rgba(0, 0, 0, .7); }
.dv__tape span { display: inline-flex; align-items: center; gap: .7em; font: 900 clamp(15px, 1.7vw, 24px)/1 var(--f-display); font-stretch: 118%; letter-spacing: .05em; text-transform: uppercase; }
.dv__tape i { width: .5em; height: .5em; border-radius: 50%; background: var(--ink); flex: none; }
/* I: wave (twice the width of the screen, so it can slide a full period) */
.dv--wave { overflow-x: clip; overflow-y: visible; }
.dv--wave svg { position: absolute; left: 0; bottom: -1px; width: 200%; max-width: none; height: clamp(40px, 6vw, 96px); transform-origin: 50% 100%; overflow: visible; }
.dv--wave .dv__w1 { fill: var(--cream); opacity: .42; }
.dv--wave .dv__w2 { fill: var(--cream); }
/* J: stack */
.dv-stack { timeline-scope: --dvstack; }
.dv-stack__under { position: sticky; top: 0; z-index: 0; transform-origin: 50% 20%; }
.dv-stack__over { position: relative; z-index: 1; view-timeline-name: --dvstack; min-height: 70vh; box-shadow: 0 -34px 60px -30px rgba(0, 0, 0, .75); }
.dvx-end { height: 72px; }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .dv--base .dv__line { animation: dvGrow linear both; animation-timeline: view(); animation-range: entry 0% cover 45%; }
    .dv--base .dv__mark { animation: dvDrop linear both; animation-timeline: view(); animation-range: cover 30% cover 50%; }
    .dv--ball .dv__ball { animation: dvRoll linear both; animation-timeline: view(); animation-range: entry 0% exit 100%; }
    .dv--arc .dv__trail { stroke-dasharray: 1; animation: dvDraw linear both; animation-timeline: view(); animation-range: entry 10% cover 50%; }
    .dv--arc .dv__land { animation: dvLand linear both; animation-timeline: view(); animation-range: cover 40% cover 55%; }
    .dv-sheet { animation: dvSheet linear both; animation-timeline: view(); animation-range: entry 0% entry 90%; }
    .dv--word .dv__w { animation: dvDrift linear both; animation-timeline: view(); animation-range: entry 0% exit 100%; }
    .dv-wipe { animation: dvWipe linear both; animation-timeline: view(); animation-range: entry 0% entry 85%; }
    .dv--angle svg { animation: dvTilt linear both; animation-timeline: view(); animation-range: entry 0% cover 45%; }
    .dv__tape span { animation: dvTape linear both; animation-timeline: view(); animation-range: entry 0% exit 100%; }
    .dv--wave svg { animation: dvSettle linear both; animation-timeline: view(); animation-range: entry 0% cover 50%; }
    .dv--wave .dv__w1 { animation: dvWaveL linear both; animation-timeline: view(); animation-range: entry 0% exit 100%; }
    .dv--wave .dv__w2 { animation: dvWaveR linear both; animation-timeline: view(); animation-range: entry 0% exit 100%; }
    .dv-stack__under { animation: dvUnder linear both; animation-timeline: --dvstack; animation-range: entry 0% entry 100%; }
  }
}
@keyframes dvWipe { from { clip-path: polygon(0 0, 0 0, -12% 100%, 0 100%); } to { clip-path: polygon(0 0, 112% 0, 100% 100%, 0 100%); } }
@keyframes dvTilt { from { scale: 1 0; } to { scale: 1 1; } }
@keyframes dvTape { from { translate: 0 0; } to { translate: -32% 0; } }
@keyframes dvSettle { from { scale: 1 1.9; } to { scale: 1 1; } }
@keyframes dvWaveL { from { transform: translateX(0); } to { transform: translateX(-720px); } }
@keyframes dvWaveR { from { transform: translateX(-720px); } to { transform: translateX(0); } }
@keyframes dvUnder { to { scale: .93; filter: brightness(.45); } }
@keyframes dvGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes dvDrop { from { height: 0; } to { height: 28px; } }
@keyframes dvRoll { from { left: 6%; rotate: -200deg; } to { left: 94%; rotate: 360deg; } }
@keyframes dvDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes dvLand { from { scale: 0; } 70% { scale: 1.3; } to { scale: 1; } }
@keyframes dvSheet { from { scale: .9; translate: 0 48px; } to { scale: 1; translate: 0 0; } }
@keyframes dvDrift { from { translate: -40% -50%; } to { translate: -60% -50%; } }
</style>`;
  return layout({ path: '/lab/dividers/', title: 'Section divider options', desc: 'Section divider and transition options for the Served. concept.', body, bodyCls: 'pg-lab', sticky: null, noFinal: true });
}

// ============================================================ LAB: Rally X section layouts (27 Nov 2026, for the client to pick one)
// The section on the home page as it is now, then four new layouts, all with the same words and the venue's own photos.
const RX_ALT = {
  'rallyx-now-open': 'Rally X from the street: a NOW OPEN banner for pickleball and tennis under a city tower',
  'rallyx-forehand': 'A player swings a paddle low in the golden afternoon light at Rally X',
  'rallyx-backhand-net': 'A player reaches for a backhand, seen through the net',
  'rallyx-paddle-ball': 'A paddle and a pickleball in front of the Rally X banner',
  'rallyx-tennis-player': 'A player with a tennis racket on the Rally X court',
  'rallyx-paddle-wall': 'Pickleball paddles hanging on a wall',
  'rallyx-paddle-wall-tall': 'A wall of pickleball paddles and balls',
  'rallyx-target-net': 'A pickleball training target with a lime frame on the court',
  'rallyx-court-logo': 'The Rally X logo painted on the court floor',
  'rallyx-ready-position': 'A player waits in the ready position, seen through the net',
  'rallyx-paddles-court': 'Two paddles and two balls on a blue pickleball court',
  'rallyx-facade': 'Rally X from the car park: the NOW OPEN banner and a street-art wall',
};
function labRallyX() {
  const tag = (id, name, how) => `<div class="lab-tag wrap"><b>${id}</b><span><strong>${name}</strong>${how}</span></div>`;
  const thumbs = ['rallyx-now-open', 'rallyx-forehand', 'rallyx-tennis-player', 'rallyx-court-logo'];
  const reel = ['rallyx-now-open', 'rallyx-forehand', 'rallyx-paddle-ball', 'rallyx-backhand-net', 'rallyx-tennis-player', 'rallyx-paddle-wall-tall',
    'rallyx-target-net', 'rallyx-court-logo', 'rallyx-ready-position', 'rallyx-paddles-court', 'rallyx-facade', 'rallyx-paddle-wall'];
  const card = (p, dup) => `<figure class="lrxb__card">${img(p, { alt: dup ? '' : RX_ALT[p], sizes: '(min-width: 900px) 20vw, 45vw' })}</figure>`;
  const xPhoto = a(`assets/img/rallyx-paddle-wall-${IMAGES['rallyx-paddle-wall'].sizes.find((s) => s >= 1000)}.webp`);
  const body = `
<section class="band band--night lab-top"><div class="wrap">
  <p class="kicker"><span class="kicker__ball" aria-hidden="true"></span>Options to pick from</p>
  <h1 class="d1">Rally X section</h1>
  <p class="lede">The home page’s Rally X section, five ways: the layout it has now, then four new ones, A to D. Every option uses the same words and Rally X’s own photos. Pick one and it replaces the section on the home page.</p>
  <nav class="lab-jump" aria-label="Options"><a href="#lrx-now">Now: Collage</a><a href="#lrx-a">A Split poster</a><a href="#lrx-b">B Photo reel</a><a href="#lrx-c">C Bento</a><a href="#lrx-d">D X window</a></nav>
  <p class="lab-note">The motion follows your scroll in Chrome, Edge and Safari; other browsers and reduced motion show the finished state.</p>
</div></section>

<div id="lrx-now">${tag('Now', 'Collage', 'What the home page has today: three photos overlapping on the left, the name on the right.')}</div>
${rallySpot('lrx-now-h')}

<div id="lrx-a">${tag('A', 'Split poster', 'One big photo runs from the edge of the screen to the middle, with the name and booking on the other half. Tap the small photos to change the big one. The photo slides open as it comes up the screen.')}</div>
<section class="band band--iron lrx lrx--a" aria-labelledby="lrxa-h"><div class="lrxa" data-lrxa>
  <figure class="lrxa__photo">${thumbs.map((p, i) => img(p, { alt: RX_ALT[p], sizes: '(min-width: 900px) 50vw, 100vw', cls: i ? '' : 'is-on', attrs: i ? ' aria-hidden="true"' : '' })).join('')}</figure>
  <div class="lrxa__copy" data-reveal>
    ${kicker('New on the scene')}
    <h2 class="d1 lrxa__h" id="lrxa-h">Rally <span>X</span></h2>
    <p class="lede">${RX_LEDE}</p>
    ${rxChips()}
    ${rxCtas()}
    <div class="lrxa__thumbs" role="group" aria-label="Choose a photo">${thumbs.map((p, i) => `<button class="lrxa__t" type="button" aria-pressed="${i ? 'false' : 'true'}" aria-label="Show photo: ${esc(RX_ALT[p])}">${img(p, { alt: '', sizes: '84px' })}</button>`).join('')}</div>
  </div>
</div></section>

<div id="lrx-b">${tag('B', 'Photo reel', 'The name in giant type, then all twelve Rally X photos gliding past in a reel that speeds up while you scroll and pauses under the pointer.')}</div>
<section class="band band--iron lrx lrx--b" aria-labelledby="lrxb-h">
  <div class="wrap lrxb__head" data-reveal>
    ${kicker('New on the scene')}
    <h2 class="d1 lrxb__h" id="lrxb-h">Rally<span>X</span></h2>
    <p class="lede">${RX_LEDE}</p>
  </div>
  <div class="lrxb__reel" data-marquee="0.6"><div class="mq__track"><div class="mq__run">${reel.map((p) => card(p, false)).join('')}</div><div class="mq__run" aria-hidden="true">${reel.map((p) => card(p, true)).join('')}</div></div></div>
  <div class="wrap lrxb__foot" data-reveal>${rxChips()}${rxCtas()}</div>
</section>

<div id="lrx-c">${tag('C', 'Bento', 'A grid of tiles: the name and booking on a dark tile, Now open on an orange one, and three photos around them. The tiles rise in turn as they come into view.')}</div>
<section class="band band--iron lrx lrx--c" aria-labelledby="lrxc-h"><div class="wrap"><div class="lrxc">
  <figure class="lrxc__a" data-reveal style="--i:0">${img('rallyx-now-open', { alt: RX_ALT['rallyx-now-open'], sizes: '(min-width: 1000px) 25vw, (min-width: 561px) 50vw, 100vw' })}</figure>
  <div class="lrxc__t" data-reveal style="--i:1">
    ${kicker('New on the scene')}
    <h2 class="d1 lrxc__h" id="lrxc-h">Rally<span>X</span></h2>
    <p class="lede">${RX_LEDE}</p>
    ${rxCtas()}
  </div>
  <figure class="lrxc__b" data-reveal style="--i:2">${img('rallyx-forehand', { alt: RX_ALT['rallyx-forehand'], sizes: '(min-width: 1000px) 25vw, (min-width: 561px) 50vw, 100vw' })}</figure>
  <div class="lrxc__o" data-reveal style="--i:3"><span class="lrxc__live"><i aria-hidden="true"></i>Now open</span><b>Pickleball and tennis</b><small>Book on Served</small></div>
  <figure class="lrxc__w" data-reveal style="--i:4">${img('rallyx-paddles-court', { alt: RX_ALT['rallyx-paddles-court'], sizes: '(min-width: 1000px) 50vw, 100vw' })}</figure>
</div></div></section>

<div id="lrx-d">${tag('D', 'X window', 'The X of the name becomes a window onto the paddle wall. It turns upright and the photo pans inside it as you scroll.')}</div>
<section class="band band--iron lrx lrx--d" aria-labelledby="lrxd-h"><div class="wrap lrxd">
  <div class="lrxd__copy" data-reveal>
    ${kicker('New on the scene')}
    <h2 class="d1 lrxd__h" id="lrxd-h">Rally<span class="sr"> X</span><span class="lrxd__mini" aria-hidden="true" style="background-image:url('${xPhoto}')">X</span></h2>
    <p class="lede">${RX_LEDE}</p>
    ${rxChips()}
    ${rxCtas()}
  </div>
  <div class="lrxd__x"><span class="lrxd__glyph" role="img" aria-label="${esc(RX_ALT['rallyx-paddle-wall'])}, seen through a giant X" style="background-image:url('${xPhoto}')">X</span></div>
</div></section>
<div class="lab-end"></div>
<style>
.lab-top { padding-bottom: 40px; } .lab-top .lede { margin-top: 14px; max-width: 72ch; }
.lab-jump { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; } .lab-jump a { padding: 10px 14px; border-radius: 999px; border: 1px solid var(--line-2); color: var(--text); text-decoration: none; font: 700 14px/1 var(--f-ui); } .lab-jump a:hover { border-color: var(--accent); color: var(--accent); }
.lab-note { margin-top: 14px; font-size: 13.5px; color: var(--text-3); }
.lab-tag { display: flex; gap: 16px; align-items: flex-start; padding-block: 56px 22px; }
.lab-tag b { flex: none; min-width: 44px; height: 44px; padding-inline: 10px; display: grid; place-items: center; border-radius: 12px; background: var(--accent); color: var(--ink); font: 900 18px/1 var(--f-display); text-transform: uppercase; }
.lab-tag span { max-width: 72ch; color: var(--text-2); } .lab-tag strong { display: block; color: var(--text); font: 850 20px/1.2 var(--f-display); text-transform: uppercase; margin-bottom: 4px; }
.lab-end { height: 72px; }
.lrx .lede { max-width: 54ch; }
/* A: split poster */
.lrx--a { padding-block: 0; }
.lrxa { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-height: min(88vh, 780px); }
.lrxa__photo { position: relative; margin: 0; overflow: hidden; min-height: 460px; background: var(--ink); }
.lrxa__photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; scale: 1.05; transition: opacity .7s var(--ease), scale 1.4s var(--ease); }
.lrxa__photo img.is-on { opacity: 1; scale: 1; }
.lrxa__copy { align-self: center; max-width: 660px; padding: clamp(48px, 6vw, 96px) var(--gutter) clamp(48px, 6vw, 96px) clamp(32px, 5vw, 88px); }
.lrxa__h { font-size: clamp(3.6rem, 7.4vw, 7.6rem); line-height: .84; margin-top: 14px; } .lrxa__h span { color: var(--accent); }
.lrxa__copy .lede { margin-top: 20px; } .lrxa__copy .chips { margin-top: 22px; }
.lrxa__thumbs { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
.lrxa__t { width: clamp(60px, 6vw, 84px); aspect-ratio: 1; padding: 0; border: 0; border-radius: 14px; overflow: hidden; cursor: pointer; background: var(--ink); opacity: .5; outline: 2px solid transparent; outline-offset: 3px; transition: opacity .3s, outline-color .3s; }
.lrxa__t img { display: block; width: 100%; height: 100%; object-fit: cover; }
.lrxa__t:hover { opacity: .85; } .lrxa__t[aria-pressed="true"] { opacity: 1; outline-color: var(--accent); }
/* B: photo reel */
.lrxb__head { display: grid; justify-items: center; text-align: center; }
.lrxb__h { display: flex; align-items: flex-end; gap: .08em; font-size: clamp(4rem, 13vw, 13rem); line-height: .8; margin-top: 16px; }
.lrxb__h span { color: var(--accent); font-stretch: 125%; }
.lrxb__head .lede { margin-top: 20px; }
.lrxb__reel { margin-top: clamp(32px, 4vw, 56px); overflow: hidden; padding-block: 12px 34px; -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
.lrxb__card { flex: none; width: clamp(168px, 19vw, 280px); aspect-ratio: 3 / 4; margin: 0 clamp(12px, 1.4vw, 20px) 0 0; border-radius: 20px; overflow: hidden; background: var(--ink); }
.lrxb__card:nth-child(even) { translate: 0 20px; }
.lrxb__card img { display: block; width: 100%; height: 100%; object-fit: cover; }
.lrxb__foot { display: grid; justify-items: center; gap: 22px; margin-top: clamp(20px, 2.4vw, 36px); } .lrxb__foot .chips, .lrxb__foot .ctas { justify-content: center; }
@media (prefers-reduced-motion: reduce) { .lrxb__reel { overflow-x: auto; } }
/* C: bento */
.lrxc { display: grid; gap: clamp(10px, 1.2vw, 16px); grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: minmax(clamp(150px, 14vw, 215px), auto); grid-template-areas: "a t t b" "a t t b" "a o w w"; }
.lrxc > * { margin: 0; border-radius: 22px; }
.lrxc figure { overflow: hidden; background: var(--ink); }
.lrxc figure img { display: block; width: 100%; height: 100%; object-fit: cover; transition: scale .9s var(--ease); }
.lrxc figure:hover img { scale: 1.04; }
.lrxc__a { grid-area: a; } .lrxc__t { grid-area: t; } .lrxc__b { grid-area: b; } .lrxc__o { grid-area: o; } .lrxc__w { grid-area: w; }
.lrxc__t { display: flex; flex-direction: column; justify-content: center; padding: clamp(24px, 2.8vw, 44px); background: var(--ink); border: 1px solid var(--line); }
.lrxc__h { display: flex; align-items: flex-end; gap: .1em; font-size: clamp(3.2rem, 6.2vw, 6.4rem); line-height: .82; margin-top: 12px; } .lrxc__h span { color: var(--accent); font-stretch: 125%; }
.lrxc__t .lede { margin-top: 14px; } .lrxc__t .ctas { margin-top: 22px; }
.lrxc__o { display: flex; flex-direction: column; justify-content: space-between; gap: 14px; padding: clamp(18px, 2vw, 28px); background: var(--accent); color: var(--ink); }
.lrxc__live { display: inline-flex; align-items: center; gap: 8px; font: 800 12.5px/1 var(--f-ui); letter-spacing: .14em; text-transform: uppercase; }
.lrxc__live i { width: 8px; height: 8px; border-radius: 50%; background: var(--ink); animation: livePulse 1.6s var(--ease) infinite; }
.lrxc__o b { font: 900 clamp(24px, 2.4vw, 38px)/.92 var(--f-display); font-stretch: 112%; text-transform: uppercase; }
.lrxc__o small { font: 700 14px/1.3 var(--f-ui); }
@media (max-width: 999px) { .lrxc { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(clamp(140px, 26vw, 240px), auto); grid-template-areas: "t t" "a b" "a b" "o w"; } }
@media (max-width: 560px) { .lrxc { grid-template-columns: 1fr; grid-auto-rows: auto; grid-template-areas: "t" "a" "o" "b" "w"; } .lrxc__a, .lrxc__b { aspect-ratio: 4 / 5; } .lrxc__w { aspect-ratio: 4 / 3; } }
/* D: X window */
.lrxd { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: clamp(24px, 4vw, 64px); }
.lrxd__h { font-size: clamp(4rem, 10vw, 10.5rem); line-height: .82; margin-top: 14px; }
.lrxd__copy .lede { margin-top: 20px; } .lrxd__copy .chips { margin-top: 22px; }
.lrxd__x { display: grid; place-items: center; }
.lrxd__glyph, .lrxd__mini { display: block; font: 900 clamp(15rem, 36vw, 38rem)/.8 var(--f-display); font-stretch: 125%; color: transparent; background-color: var(--accent); background-size: cover; background-position: 50% 50%; -webkit-background-clip: text; background-clip: text; rotate: -6deg; filter: drop-shadow(0 0 48px rgba(255, 107, 24, .28)); user-select: none; }
.lrxd__mini { display: none; }
.lrxc .btn { white-space: nowrap; }
/* scroll-linked motion; without support or with reduced motion each option shows its finished state */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .lrxa__photo { animation: lrxOpen linear both; animation-timeline: view(); animation-range: entry 0% cover 45%; }
    .lrxd__glyph { animation: lrxTurn linear both; animation-timeline: view(); animation-range: entry 0% exit 40%; }
  }
}
@keyframes lrxOpen { from { clip-path: inset(0 42% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes lrxTurn { from { rotate: -18deg; background-position: 50% 0%; } to { rotate: -6deg; background-position: 50% 70%; } }
@media (max-width: 899px) {
  .lrxa { grid-template-columns: 1fr; min-height: 0; }
  .lrxa__photo { min-height: 0; aspect-ratio: 4 / 5; max-height: 76vh; }
  .lrxa__copy { max-width: none; padding: 40px var(--gutter) 60px; }
  .lrxd { grid-template-columns: 1fr; }
  /* phones: the photo X sits in the name itself, so it still reads RALLY X */
  .lrxd__x { display: none; }
  .lrxd__h { display: flex; align-items: flex-end; gap: .1em; }
  .lrxd__mini { display: inline-block; font-size: 1.45em; line-height: .76; background-position: 40% 30%; filter: brightness(1.45) saturate(1.2) drop-shadow(0 0 22px rgba(255, 107, 24, .35)); }
}
</style>
<script>
(function () {
  document.querySelectorAll('[data-lrxa]').forEach(function (box) {
    var imgs = box.querySelectorAll('.lrxa__photo img'), btns = box.querySelectorAll('.lrxa__t');
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        btns.forEach(function (x, j) { x.setAttribute('aria-pressed', String(i === j)); });
        imgs.forEach(function (im, j) { im.classList.toggle('is-on', i === j); if (i === j) im.removeAttribute('aria-hidden'); else im.setAttribute('aria-hidden', 'true'); });
      });
    });
  });
})();
</script>`;
  return layout({ path: '/lab/rally-x/', title: 'Rally X section options', desc: 'Layout options for the Rally X section on the Served. home page.', body, bodyCls: 'pg-lab', sticky: null, noFinal: true });
}

// ============================================================ registry
export function pages() {
  const out = [];
  // the page path is set BEFORE its body renders, so every relative URL in the body is computed for that page
  const add = (path, render) => { setPage(path === '/404' ? '/' : path); out.push({ path, html: render() }); };
  add('/', home);
  add('/courts/', courts);
  for (const v of VENUES) {
    add(`/courts/${v.slug}/`, () => venuePage(v));
    add(`/courts/${v.slug}/availability/`, () => bookPage(v, 'availability'));
    add(`/courts/${v.slug}/slots/`, () => bookPage(v, 'slots'));
  }
  add('/courts/rally-x/', rallyx);
  add('/courts/rally-x/availability/', () => bookPage(RALLYX, 'availability'));
  add('/courts/rally-x/slots/', () => bookPage(RALLYX, 'slots'));
  for (const x of SOON) add(`/courts/${x.slug}/`, () => soonPage(x));
  add('/pricing/', pricing);
  add('/list-your-court/', listCourt);
  add('/contact/', contact);
  add('/sign-in/', signIn);
  add('/sign-up/', signUp);
  add('/forgot-password/', forgot);
  add('/staff/sign-in/', staff);
  add('/sports/', sportsHub);
  for (const s of SPORTS.filter((x) => x.live)) add(`/sports/${s.slug}/`, () => sportPage(s));
  add('/cities/', citiesHub);
  for (const c of CITIES) add(`/cities/${c.slug}/`, () => cityPage(c));
  add('/play/', play);
  add('/gallery/', gallery);
  add('/help/', help);
  add('/account/', account);
  add('/owner/studio/', studio);
  add('/owner/list/', ownerList);
  add('/courts/listing/', listingPage);
  add('/lab/dividers/', labDividers);
  add('/lab/rally-x/', labRallyX);
  add('/about/', about);
  add('/404', notFound);
  return out;
}
