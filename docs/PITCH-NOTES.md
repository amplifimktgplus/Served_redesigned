# Pitch notes: Served. redesign concept

Captured from the Served. staging site on 26 Nov 2026. Preview: https://amplifimktgplus.github.io/Served_redesigned/

## Art direction: "Baseline City"

The court is the city grid. Ink grounds lit by one golden-hour key light per section, court lines that draw
themselves, and the lime ball as the full stop in "Served.". Palette: Iron Core, Industrial Aqua, Rust Signal,
Heat Marker and Architectural Cream, plus the current site's lime lifted for dark grounds. Each sport has its
own tone: tennis lime, pickleball heat orange, badminton aqua, basketball rust (coming soon).
Type: Archivo variable (width and weight axes, used for kinetic headlines), Plus Jakarta Sans (the current
UI face), Pacifico (the current wordmark face) for the logo and one script accent per heading.

## Kept exactly

- Every heading and line of copy from the home, courts, venue, availability, slots, pricing, list-your-court,
  contact, sign-in, sign-up, forgot-password and staff sign-in pages.
- All six live venues with their rates, surfaces, court counts, amenities, owners, ratings and reviews.
- Real slot boards: opening hours per venue, per-court taken slots, the UP Diliman evening rate (₱1,100 from
  6 PM), the 5% service fee, the 4-hours-per-court rule, the 24-hour refund rule.
- The URL structure, including `/courts?sport=`, `/pricing#players`, `/pricing#owners`, `/sign-up?role=owner`.

## New in the concept

- Booking in one place: date rail, month calendar, court picker drawn as mini courts, slot grid with price
  states, live summary, payment sheet (GCash, Maya, QR Ph, card, bank), confirmation ticket and calendar file.
- Discovery: sport, city, surface, price and date filters, a branded map view, "Play near me" distances.
- New pages: sports (3), cities (6), Rally X, Play mode, Court Gallery, Help centre, About, 404.
- Mobile: thumb-zone sticky bar (past the hero, hides at the footer, x hides it for the session), booking
  summary bar, full-screen filters, swipe rails, centred heads, full-width CTAs.
- Motion: one-time splash serve, line draws, masked photo reveals, parallax, tilt and glint cards, magnetic
  buttons, click sparks, scroll-velocity marquee, pressure type, rotating sport word. All off under reduced motion.

## Hero options (26 Nov 2026)

Two compact, full-width heroes built on the supplied orange duotone photo, in the staging site's palette
(black grounds, white, orange #ff6b18 primary, lime #b7d60f secondary, navy #101a2e text on white). The option
pages apply that palette to the whole page as a theme; the main preview keeps its own until a hero is picked.

- A, Motion search (`/lab/hero-a/`): speed streaks, a light sweep and a slow settle on the photo; a white
  staging-style search bar (sport, where, when, orange Search), popular sports and live counts.
- B, Live board (`/lab/hero-b/`): the sport word rotates through pickleball, tennis and badminton; one-tap
  sport buttons; an orange light follows the pointer; a board of next open slots scrolls along the bottom.

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
6. Keep the script wordmark? The concept keeps it and turns the full stop into the lime ball.
7. Confirm the 5% service fee and the 24-hour cancellation rule are current.
