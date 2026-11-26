# Pitch notes: Served. redesign concept

Captured from the Served. staging site on 26 Nov 2026. Preview: https://amplifimktgplus.github.io/Served_redesigned/

## Art direction: "Baseline City"

The court is the city grid. Black grounds lit by one key light per section, court lines that draw
themselves, and an orange ball as the full stop in "Served.". Palette (since 27 Nov 2026): the current site's
own black, navy panels, white and orange #ff6b18 as the single accent. No lime or neon green anywhere.
Sport tones: pickleball orange, tennis white, badminton sky blue, basketball orange (coming soon).
Lines never sit on photos (client rule, 27 Nov 2026). Court icons and the booking court picker are drawn
from the real courts: pickleball kitchen lines, tennis service boxes, badminton service lines.
Type: Archivo variable (width and weight axes, used for kinetic headlines), Plus Jakarta Sans (the current
UI face), Pacifico (the current wordmark face) for the logo and one script accent per heading.

## Kept exactly

- Every heading and line of copy from the home, courts, venue, availability, slots, pricing, list-your-court,
  contact, sign-in, sign-up, forgot-password and staff sign-in pages.
- All six live venues with their rates, surfaces, court counts, amenities, owners, ratings and reviews.
- Real slot boards: opening hours per venue, per-court taken slots, the UP Diliman evening rate (₱1,100 from
  6 PM), the 5% service fee, the 4-hours-per-court rule, the 24-hour refund rule.
- The URL structure, including `/courts?sport=`, `/pricing#players`, `/pricing#owners`, `/sign-up?role=owner`.
- One captured line changed by a word: "Green days have open slots" reads "Orange days have open slots",
  because open days are orange in this palette.

## New in the concept

- Booking in one place: date rail, month calendar, court picker drawn as mini courts, slot grid with price
  states, live summary, payment sheet (GCash, Maya, QR Ph, card, bank), confirmation ticket and calendar file.
- Discovery: sport, city, surface, price and date filters, a branded map view, "Play near me" distances.
- New pages: sports (3), cities (6), Rally X, Play mode, Court Gallery, Help centre, About, 404.
- Mobile: thumb-zone sticky bar (past the hero, hides at the footer, x hides it for the session), booking
  summary bar, full-screen filters, swipe rails, centred heads, full-width CTAs.
- Installable app: Install App on the home hero opens the browser's own install prompt (Chrome, Edge, Android
  browsers); Safari and Firefox show the steps instead. A service worker keeps pages you have opened readable
  offline, and every deploy replaces its cache.
- Motion: one-time splash serve, line draws, masked photo reveals, parallax, tilt and glint cards, magnetic
  buttons, click sparks, scroll-velocity marquee, pressure type, rotating sport word. All off under reduced motion.

## Home hero (decided 27 Nov 2026)

Two compact, full-width heroes were shown on 26 Nov on the supplied orange duotone photo: A, "Motion search",
and B, "Live board". B was picked, with the staging palette across the whole site minus its neon green.

- Live board: "Find your [pickleball, tennis, badminton] court." with the sport word rotating in orange; one-tap
  sport buttons; a pill search with a date; an orange light that follows the pointer; a board of the next open
  slots per venue scrolling along the bottom, each linking to that venue's booking page.
- The option pages (`/lab/`) were removed once B was picked.
- Since 27 Nov: it runs on the current site's own hero photo, shade and orange glow, with the Served. wordmark
  turned to read upward along the right edge, its baseline on the edge (it steps out below 900px wide). The
  sport buttons are compact and the search is exactly their combined width; Install App sits under them.
- Fixed with the change: the splash wordmark no longer clips the top of the "d", and the final "GAME ON." band
  no longer pushes its copy and buttons off screen (it was cut off on desktop and on phones).

## Marked as concept, not live

- Play mode: open play, find players, clubs and ranking, tournaments, events (stamped "Concept", examples
  labelled "Example").
- Basketball and padel: "Coming soon", no booking buttons.
- Rally X booking: the page shows a notify form until Rally X rates and slots are on Served.

## Found on the staging site

1. Footer location reads "Lorem Ipsum Dolor St. Amet, City" and the phone is 123-456-7890. Not shown here.
2. Footer social icons all link to "#". Not shown here.
3. Two test listings are live, one of them featured on the home page ("Test Venue", description "test") and
   one with 0 courts. Hidden here; the "Quezon" location option comes from a test listing.
4. Footer links point to unrelated pages (Tournaments and Court Gallery open Courts, Events opens Pricing).
   Here they open Play mode sections and a real Court Gallery.
5. Venue reviews come from demo accounts (admin, demo_owner, demo_player). Shown as captured, with a note.
6. The CodeIgniter debug toolbar and view-path comments are served publicly. Turn them off before launch.
7. No robots.txt or sitemap.
8. Venues share three generic sport photos. They are labelled "Representative photo" here.

## Questions for the Served. team

1. Rally X: address, hours, number of courts and rates, so its page can take bookings.
2. Real contact phone, office address and social handles.
3. Real photos for each venue (or permission to use the venues' own).
4. Which Play mode feature comes first: open play or find players?
5. Timeline for basketball and padel.
6. Keep the script wordmark? The concept keeps it and turns the full stop into an orange ball.
7. Confirm the 5% service fee and the 24-hour cancellation rule are current.
8. Is a native app planned? The concept's Install App button installs the website itself as an app.
