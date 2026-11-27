// src/content.mjs: site facts and new-page copy.
// Venue facts come from src/data/venues.json (extracted from the capture by tools/extract.mjs).
// Captured copy is marked CAPTURED; everything else is new glue or new-page copy written for Served.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const vj = JSON.parse(readFileSync(join(HERE, 'data/venues.json'), 'utf8'));
export const IMAGES = JSON.parse(readFileSync(join(HERE, 'data/images.json'), 'utf8'));
// the official logo, traced from the supplied art by tools/logo.py: the S, the joined letters, the full stop
export const LOGO = JSON.parse(readFileSync(join(HERE, 'data/logo.json'), 'utf8'));
const CREDITS_ALL = JSON.parse(readFileSync(join(HERE, '../refs/commons/credits.json'), 'utf8'));
export const CAPTURED_ON = vj.capturedOn;

export const SITE = {
  name: 'Served.',
  url: 'https://amplifimktgplus.github.io/Served_redesigned/',
  email: 'contact@served.ph', // CAPTURED
  hours: 'Monday to Saturday, 9am to 6pm', // CAPTURED (contact page)
  reply: 'We usually reply within one working day.', // CAPTURED
  tagline: 'Every court. One tap away.', // CAPTURED (hero kicker)
  blurb: 'Served puts every court in one place, with live availability and instant booking. No calls, no waiting, no guesswork. Find your court, lock your slot, and show up ready to play.', // CAPTURED (footer)
  feeRate: 0.05, // CAPTURED (pricing: 5% service fee)
  maxHours: null, // the current site caps a court at 4 hours; the client lifted the cap (27 Nov 2026): any hours, or the whole day
};

// ---------- sports ----------
export const SPORTS = [
  { slug: 'pickleball', name: 'Pickleball', live: true, tone: 'heat', icon: 'pickleball', img: 'rallyx-paddles-court',
    line: 'Paddles up.', kicker: 'The game everyone is picking up',
    intro: 'A paddle, a plastic ball and a kitchen you cannot volley in. Easy to learn in one session, hard to put down after. Doubles is where the noise is.',
    bring: ['Paddle (or rent one where the venue offers equipment rental)', 'Court shoes with lateral grip', 'Water, and a fourth player'] },
  { slug: 'tennis', name: 'Tennis', live: true, tone: 'cream', icon: 'tennis', img: 'rallyx-tennis-player', card: 'card-tennis',
    line: 'First serve.', kicker: 'Hard courts and clay',
    intro: 'The classic. Club courts in Alabang, clay on campus in Diliman. Book an hour to rally, or block out a full match.',
    bring: ['Racket and a fresh can of balls', 'Clay-friendly shoes for clay courts', 'A towel for the changeover'] },
  { slug: 'badminton', name: 'Badminton', live: true, tone: 'aqua', icon: 'badminton', img: 'sport-badminton', card: 'card-badminton',
    line: 'Smash hour.', kicker: 'Indoor wood floors',
    intro: 'Indoor wood courts, high ceilings and the fastest racket sport there is. Built for quick games after work and regular group sessions.',
    bring: ['Racket and shuttles', 'Non-marking indoor shoes', 'Your regular group, or a new one'] },
  { slug: 'basketball', name: 'Basketball', live: false, tone: 'rust', icon: 'basketball', img: 'sport-basketball',
    line: 'Next up.', kicker: 'Coming to Served.',
    intro: 'Covered courts, barangay runs, weekend leagues. Basketball is not bookable on Served yet. It is on the roadmap.' },
  { slug: 'padel', name: 'Padel', live: false, tone: 'cream', icon: 'padel', img: null,
    line: 'On our radar.', kicker: 'Coming to Served.',
    intro: 'Walls in play, doubles only. Padel is not bookable on Served yet. Venue owners with padel courts can tell us they are ready.' },
];

// Batangas (Nasugbu and its one venue, Pico de Loro) is off the site for now (client, 27 Nov 2026). Its data stays
// here, so taking it off this list brings the city page, the venue and its collection back.
const PAUSED = { cities: ['nasugbu'], venues: ['pico-de-loro-badminton-court'] };

// ---------- cities (approximate centroids, used for the stylised map and "near me" distances) ----------
const ALL_CITIES = [
  { slug: 'taguig', name: 'Taguig', area: 'BGC and around', img: 'city-taguig', lat: 14.5509, lng: 121.0503,
    intro: 'Bright courts in the middle of BGC, with flexible evening slots for the after-work crowd.' },
  { slug: 'pasig', name: 'Pasig', area: 'Ortigas Center', img: 'city-pasig', lat: 14.5866, lng: 121.0614,
    intro: 'Ortigas Center, where quick games and regular group sessions fit between meetings.' },
  { slug: 'quezon-city', name: 'Quezon City', area: 'UP Diliman', img: 'city-quezon-city', lat: 14.6537, lng: 121.0687,
    intro: 'Clay courts on campus in Diliman, with lights until ten for late sessions.' },
  { slug: 'marikina', name: 'Marikina', area: 'FVR Road', img: 'city-marikina', lat: 14.6507, lng: 121.1029,
    intro: 'Covered courts in Marikina with reliable lighting and room for group play.' },
  { slug: 'muntinlupa', name: 'Muntinlupa', area: 'Alabang', img: 'city-muntinlupa', lat: 14.4231, lng: 121.0300,
    intro: 'A welcoming club in Alabang for casual rallies, lessons and competitive matches.' },
  { slug: 'nasugbu', name: 'Nasugbu', area: 'Pico de Loro, Batangas', img: 'city-nasugbu', lat: 14.2050, lng: 120.6120,
    intro: 'Indoor wood courts at Pico de Loro, for the weekend you take your game out of the city.' },
];
export const CITIES = ALL_CITIES.filter((c) => !PAUSED.cities.includes(c.slug));
// photo credits (and the gallery built from them) leave out the photos of a paused city
export const CREDITS = CREDITS_ALL.filter((c) => !ALL_CITIES.some((x) => PAUSED.cities.includes(x.slug) && x.img === c.file));

// ---------- venues ----------
const SPORT_IMG = {
  'bgc-turf-pickleball-hub': ['live-pickleball', 'city-taguig'],
  'vantage-pickleball-marikina': ['live-pickleball', 'city-marikina'],
  'alabang-tennis-club': ['live-tennis', 'city-muntinlupa'],
  'pico-de-loro-badminton-court': ['live-badminton', 'city-nasugbu'],
  'ortigas-smash-badminton': ['live-badminton', 'city-pasig'],
  'up-diliman-tennis-court': ['live-tennis', 'place-up-diliman'],
};
export const VENUES = vj.venues.filter((v) => !v.test && !PAUSED.venues.includes(v.slug)).map((v) => {
  const city = CITIES.find((c) => c.name === v.city);
  const sport = SPORTS.find((s) => s.name === v.sport);
  const [img, place] = SPORT_IMG[v.slug];
  return { ...v, citySlug: city.slug, sportSlug: sport.slug, tone: sport.tone, img, place, lat: city.lat, lng: city.lng, bookable: true };
});
export const TEST_VENUES = vj.venues.filter((v) => v.test).map((v) => v.slug);

// Rally X: the client supplied its photos, and on 27 Nov 2026 asked for it to show as live and bookable on Served.
// From its own signage: "NOW OPEN! PICKLEBALL and TENNIS", "BOOK NOW FOR SCHEDULE AND BOOKING".
// Its address, rates, hours and courts are not on the capture and were not supplied, so the booking runs on SAMPLE
// values, marked "Sample" wherever they show. They are the most common values among the captured pickleball and
// tennis venues (₱700 an hour, 4 courts, 8 AM to 8 PM), split two pickleball and two tennis. Swap in the real ones here.
const RX_HOURS = Array.from({ length: 12 }, (_, i) => 8 + i);
export const RALLYX = {
  slug: 'rally-x', name: 'Rally X', sport: 'Pickleball', sports: ['Pickleball', 'Tennis'], tone: 'heat', bookable: true, sample: true,
  status: 'Now open', address: 'Metro Manila, address to be confirmed', city: '', area: '',
  img: 'rallyx-court-logo', hero: 'rallyx-now-open', featured: false, rating: 0, reviewCount: 0,
  desc: 'Pickleball and tennis under one roof, now open and taking bookings on Served.',
  rate: 700, courts: 4, bySport: { Pickleball: 2, Tennis: 2 },
  open: [...new Set(VENUES.flatMap((v) => v.open))].sort(), full: [],
  booking: {
    courts: [{ id: 'p1', name: 'Pickleball 1', sport: 'Pickleball' }, { id: 'p2', name: 'Pickleball 2', sport: 'Pickleball' }, { id: 't1', name: 'Tennis 1', sport: 'Tennis' }, { id: 't2', name: 'Tennis 2', sport: 'Tennis' }],
    feeRate: SITE.feeRate, hours: RX_HOURS, rates: Object.fromEntries(RX_HOURS.map((h) => [h, { rate: 700, label: 'Standard' }])), taken: {},
  },
  photos: ['rallyx-now-open', 'rallyx-forehand', 'rallyx-court-logo', 'rallyx-paddle-ball', 'rallyx-tennis-player', 'rallyx-paddle-wall',
    'rallyx-backhand-net', 'rallyx-target-net', 'rallyx-ready-position', 'rallyx-paddles-court', 'rallyx-paddle-wall-tall', 'rallyx-facade'],
  captions: {
    'rallyx-now-open': 'Now open: pickleball and tennis, as the sign says.',
    'rallyx-forehand': 'Low and early. Courtside at golden hour.',
    'rallyx-court-logo': 'The Rally X baseline.',
    'rallyx-paddle-ball': 'Paddle down, ball up.',
    'rallyx-tennis-player': 'Tennis on the same floor.',
    'rallyx-paddle-wall': 'The paddle wall.',
    'rallyx-backhand-net': 'Through the net.',
    'rallyx-target-net': 'Lime lines, after dark.',
    'rallyx-ready-position': 'Ready position.',
    'rallyx-paddles-court': 'Two paddles, one court.',
    'rallyx-paddle-wall-tall': 'Pick your paddle.',
    'rallyx-facade': 'Street side, between the towers.',
  },
};

// Rally X is live, so venue counts and sport lists include it. Its court count is a sample, so court totals leave it
// out until it is confirmed (set sample: false above and they count it, per sport through bySport).
export const VENUE_COUNT = VENUES.length + 1;
export const COURT_COUNT = VENUES.reduce((n, v) => n + v.courts, 0) + (RALLYX.sample ? 0 : RALLYX.courts);
export const playsSport = (name) => [...VENUES.filter((v) => v.sport === name), ...(RALLYX.sports.includes(name) ? [RALLYX] : [])];
export const courtsFor = (v, name) => (v.sample ? 0 : v.bySport ? v.bySport[name] || 0 : v.courts);

// The "opening soon" sample, named by the client on 27 Nov 2026 in place of Rally X. Only its name, its sport and its
// campus are known, so its page says what is still to be confirmed and offers a notify form. Photos: representative.
export const SOON = [
  { slug: 'up-chk-tennis-courts', name: 'UP College of Human Kinetics Tennis Courts', short: 'UP CHK Tennis Courts', sport: 'Tennis', tone: 'cream',
    city: 'Quezon City', address: 'UP Diliman, Quezon City', img: 'sport-tennis', hero: 'place-up-diliman' },
];

// ---------- curated collections (each rule is stated, and computed from venue facts) ----------
export const COLLECTIONS = [
  { id: 'after-work', name: 'After-work games', rule: 'Lights listed as an amenity', test: (v) => v.amenities.includes('Lights') },
  { id: 'under-800', name: 'Under ₱800 an hour', rule: 'Standard rate below ₱800 an hour', test: (v) => v.rate < 800 },
  { id: 'indoor', name: 'Indoor and covered', rule: 'Described by the venue as indoor or covered', test: (v) => /indoor|covered/i.test(v.desc) },
  { id: 'weekend', name: 'Weekend getaway', rule: 'Outside Metro Manila', test: (v) => v.city === 'Nasugbu' },
  { id: 'big-groups', name: 'Big group nights', rule: 'Six courts or more on site', test: (v) => v.courts >= 6 },
].filter((c) => VENUES.some(c.test)); // a collection with no live venue (Weekend getaway while Batangas is paused) is not shown

// ---------- FAQ: every answer is built from captured copy ----------
export const FAQ = [
  { cat: 'Booking', q: 'How do I book a court?', a: 'Find your court, pick an orange day, choose your time and court, then pay online. Nothing is reserved until payment, and the court is held while you pay, so nothing is double-booked.' },
  { cat: 'Booking', q: 'How many hours can I book at once?', a: 'As many as you need, up to the whole day. Pick single hours, or tap Whole day to take every open hour on a court. The hours do not have to be next to each other, and you can book more than one court in the same booking.' },
  { cat: 'Booking', q: 'What does a struck-through slot mean?', a: 'Struck-through slots are already taken on the selected court. Switch courts to see what is open there.' },
  { cat: 'Booking', q: 'Is every court on Served real?', a: 'Every court on Served is real and ready to book.' },
  { cat: 'Payments and fees', q: 'How much does Served cost a player?', a: 'Searching and comparing courts costs nothing. You pay the venue’s rate plus a 5% service fee, shown before you pay.' },
  { cat: 'Payments and fees', q: 'How can I pay?', a: 'Online payments by GCash, Maya, QR Ph, bank and card.' },
  { cat: 'Payments and fees', q: 'Is the service fee refunded?', a: 'Served adds a 5% service fee at checkout, listed on the order summary before you pay. It is not refunded if you cancel.' },
  { cat: 'Cancellations', q: 'Can I cancel a booking?', a: 'Cancel up to 24 hours before your slot and the court price is refunded in full. Only the service fee is kept.' },
  { cat: 'Cancellations', q: 'Will I get a confirmation?', a: 'Confirmations and reminders for every reservation, kept in your account alongside your booking history.' },
  { cat: 'Court owners', q: 'What does it cost to list my court?', a: '₱0 to list, every month. No subscription, no commission: you receive the full court price on every booking.' },
  { cat: 'Court owners', q: 'How do payouts work?', a: 'Served sends your earnings to your bank, GCash or Maya, with every booking listed in your dashboard. Payouts go to the account you verify with us.' },
  { cat: 'Court owners', q: 'Can my front desk take walk-ins?', a: 'Yes. The owner dashboard includes front-desk walk-in bookings, and staff sign in on their venue’s own page with a desk code.' },
  { cat: 'Account', q: 'Do I need an account?', a: 'Create your account in seconds. Register as a Player to start booking, or as a Court Owner to get your facility listed.' },
  { cat: 'Account', q: 'Can I review a court?', a: 'Sign in to review a court you have played at.' },
  { cat: 'Account', q: 'How fast does the team reply?', a: 'We usually reply within one working day, Monday to Saturday, 9am to 6pm.' },
];

// ---------- Play mode (concept layer, clearly marked as not live) ----------
export const PLAY = [
  { id: 'open-play', name: 'Open play', icon: 'users', line: 'Who’s playing?', text: 'See open sessions at courts near you, claim a spot and split the court. No group chat required.' },
  { id: 'find-players', name: 'Find players', icon: 'search', line: 'Need a fourth?', text: 'Post your sport, level and time. Get matched with players who want the same game.' },
  { id: 'clubs', name: 'Clubs and club ranking', icon: 'flag', line: 'Your crew, organised.', text: 'Give your club a home: members, regular slots and a ranking that settles the argument.' },
  { id: 'tournaments', name: 'Tournaments', icon: 'trophy', line: 'Brackets, courts, done.', text: 'Draws, schedules and court bookings in one place, for organisers and players.' },
  { id: 'events', name: 'Events', icon: 'ticket', line: 'Clinics and socials.', text: 'Clinics, demo days and socials from the venues you already play at.' },
];

export const ROADMAP = [
  { when: 'Now', items: ['Find and compare courts for pickleball, tennis and badminton', 'Live availability and instant booking', 'Online payment by GCash, Maya, QR Ph, bank and card', 'Free listings, owner dashboard, walk-ins and payouts'] },
  { when: 'Next', items: ['Open play: join a game at a court near you', 'Find players by sport, level and time'] },
  { when: 'Later', items: ['Clubs and club ranking', 'Tournaments and events', 'More sports: basketball, padel and beyond'] },
];
