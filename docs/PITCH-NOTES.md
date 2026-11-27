# Pitch notes: Served. redesign concept

Captured from the Served. staging site on 26 Nov 2026. Preview: https://amplifimktgplus.github.io/Served_redesigned/

## Art direction: "Baseline City"

The court is the city grid. Black grounds lit by one key light per section, court lines that draw
themselves, and the official Served. logo (supplied 27 Nov 2026) in white, its full stop the one part that
moves: it hops on hover, is served in by the splash and drops into the footer sign-off. Palette (since 27 Nov 2026): the current site's
own black, navy panels, white and orange #ff6b18 as the single accent. No lime or neon green anywhere.
Sport tones: pickleball orange, tennis white, badminton sky blue, basketball orange (coming soon).
Lines never sit on photos (client rule, 27 Nov 2026). Court icons and the booking court picker are drawn
from the real courts: pickleball kitchen lines, tennis service boxes, badminton service lines.
Type: Archivo variable (width and weight axes, used for kinetic headlines), Plus Jakarta Sans (the current
UI face), Pacifico for one script accent per heading. Sizes run compact (27 Nov): section spacing and display
type about a fifth smaller than the first pass, no oversized lead cards.

## Kept exactly

- Every heading and line of copy from the home, courts, venue, availability, slots, pricing, list-your-court,
  contact, sign-in, sign-up, forgot-password and staff sign-in pages.
- All six live venues with their rates, surfaces, court counts, amenities, owners, ratings and reviews.
- Real slot boards: opening hours per venue, per-court taken slots, the UP Diliman evening rate (₱1,100 from
  6 PM), the 5% service fee, the 24-hour refund rule.
- Changed at the client's request (27 Nov 2026): the current site's 4 hours per court is lifted. Players pick any
  number of hours, or tap Whole day to take every open hour on a court, priced at the venue's own hourly rates.
- The URL structure, including `/courts?sport=`, `/pricing#players`, `/pricing#owners`, `/sign-up?role=owner`.
- One captured line changed by a word: "Green days have open slots" reads "Orange days have open slots",
  because open days are orange in this palette.

## New in the concept

- Booking in one place: date rail, month calendar, court picker drawn as mini courts, slot grid with price
  states, live summary, payment sheet (GCash, Maya, QR Ph, card, bank), confirmation ticket and calendar file.
- Discovery: sport, city, surface, price and date filters, a branded map view, "Play near me" distances.
- New pages: sports (3), cities (5; Nasugbu, Batangas is paused for now with its venue), Rally X, Play mode,
  Court Gallery, Help centre, About, 404.
- Court photos (Rally X, and an owner's own photos) sit on a concave carousel: swipe, drag or use the arrows,
  and tap to open full size. The logo's full stop moves like a serve toss, up to the top of the d.
- Mobile: thumb-zone sticky bar (past the hero, hides at the footer, x hides it for the session), booking
  summary bar, full-screen filters, swipe rails, centred heads, full-width CTAs.
- Installable app: Install App on the home hero opens the browser's own install prompt (Chrome, Edge, Android
  browsers); Safari and Firefox show the steps instead. A service worker keeps pages you have opened readable
  offline, and every deploy replaces its cache.
- Motion: one-time splash serve, line draws, masked photo reveals, parallax, tilt and glint cards, magnetic
  buttons, click sparks, scroll-velocity marquee, a split-flap board on the closing band, rotating sport word. All off
  under reduced motion.

## Home hero (decided 27 Nov 2026)

Two compact, full-width heroes were shown on 26 Nov on the supplied orange duotone photo: A, "Motion search",
and B, "Live board". B was picked, with the staging palette across the whole site minus its neon green.

- Live board: "Find your [pickleball, tennis, badminton] court." with the sport word rotating in orange; one-tap
  sport buttons; a pill search with a date; an orange light that follows the pointer; a board of the next open
  slots per venue scrolling along the bottom, each linking to that venue's booking page.
- The option pages (`/lab/`) were removed once B was picked.
- Since 27 Nov: it runs on the current site's own hero photo, graded to a cinematic golden hour (warm sun from
  the right, film grain, deep blacks held behind the type) with no pointer effects. The official logo is turned
  to read upward along the right edge, the bottom of its S on the edge (it steps out below 900px wide). The
  sport buttons are compact; under them the search and Install App share one row of exactly the same width.
- Fixed with the change: the splash wordmark no longer clips the top of the "d", and the final "GAME ON." band
  no longer pushes its copy and buttons off screen (it was cut off on desktop and on phones).

## Accounts, bookings and court pages (27 Nov 2026)

- Register as a player and book any listed court. A guest who picks times is asked to sign up or sign in, and
  their date and times are waiting when they come back. Bookings show under My account and can be cancelled
  (the 24-hour refund rule is applied to the message).
- Register as a court owner and the court page studio opens: pick your venue, an accent colour and a background,
  upload a hero photo (the dark gradient over it always stays, so text reads) and up to 12 gallery photos. A live
  preview sits beside the controls, and a contrast check warns when button text would be hard to read.
- Every venue page now reads as the venue's own site: its own bar with its name and sections, a Photos section
  once photos are added, and a sign-off band with "Bookings by Served.". The owner's colours carry onto the
  venue's booking pages too.
- Since 27 Nov (client): a court page is the venue's own site, so an owner can share its link or a QR code and their
  players never land among other venues. On a venue's page, its booking pages, Rally X, a listing and a venue opening
  soon, the venue's bar is the header and its sign-off is the footer. There are no Served menus, no splash, no closing
  band, no "More courts like this", no "More courts in" a city and no "Back to all courts"; after a booking the next
  step is "Book another time" at the same venue. Served shows only as "Bookings by Served.". The links that remain
  are utilities: My bookings, sign in to review, photo credits.
- Preview limits: there is no server, so accounts, bookings and page settings live in the visitor's own browser.
  Passwords are salted and hashed, never stored as typed. Other visitors do not see an owner's changes.
- Owners list their venues: name, sport, city, address, courts, surface, rates (with an optional evening rate),
  hours, amenities and a description. A listing gets its own venue page, shows under "New on Served" in the
  courts directory, takes bookings at the owner's own rates and hours, and can be edited or removed.
- Guests can book without an account: name, mobile number and email at the account step, then payment. The
  confirmation carries a reference, and registering later with the same email brings the booking into the account.
- Owners have two views. The owner view is the court page studio; the player view books courts and shows
  bookings. An owner who tries to book from the owner view is offered a one-tap switch to player.
- `contact?subject=Listing my court` opens the contact form with that subject picked, as on the current site.
- What the capture could not see: on the current site the owner dashboard and a player's bookings sit behind
  sign-in, so the concept builds its own versions of them rather than copying them.
- Section dividers (client's pick, 27 Nov: a mix of three of the ten options shown). No rounded top edges; a divider
  sits only where the background colour changes, chosen from the two colours: into a light section the light colour
  sweeps in on a slanted edge (wipe); into or out of a light or orange section the next one rises over the last,
  square-cornered (sheet); between two different darks a strip of orange court tape crosses the seam, its words running
  with the scroll (never two tapes in a row). On a venue's own page the tape carries the venue's name; into the Rally X
  section it is Rally X's neon with its words. Motion follows the scroll in Chrome, Edge and Safari; elsewhere, and
  with reduced motion, each seam shows its finished state.
- Rally X on the home page (client's pick, 27 Nov, option D of five layouts shown): the venue's own black and neon
  green, and the venue's photo of a player with his paddle, in its natural colours, seen through the brush-stroke X of
  the Rally X logo, traced from the banner in the venue's photo (`tools/rallyx-x.py`) and sunk in with an inner shadow.
  `tools/rallyx-fit.py` places the photo so his face and his paddle both show through the X; the same photo, blurred,
  fills the rest of the X. The X takes the larger half of the section. The only neon green on the site.
- Splash (client, 27 Nov, after the idea of React Bits' "Dodge Field", written for this site), desktop only: once the
  logo has served in, a CTA asks "Are you ready to play?", slips away from the pointer and asks "Are you sure?", then
  gives in and glides home as "Get Served.", which opens the site. Keyboard: each Enter is a try; Skip intro, Escape or
  scrolling leave at any time; the page behind is inert while it shows. Phones and tablets keep the classic splash,
  which closes on its own. Once per session, as before.
- How it works (client's pick, 27 Nov, of three layouts shown): step tabs, three numbered tabs and the chosen step
  large on a dark panel, moving on every five seconds until a visitor picks one. The current site's words.
- Prices shown as examples are labelled as such (client, 27 Nov): the home page's payout receipt is a small calculator
  with a court-rate slider and a note that the figures are for illustration only and may not match an actual court's
  rate; the pricing page's calculator carries the same note; the Pricing menu card says "Rate + 5%" instead of a fixed
  amount, since each court sets its own rate.
- Corners eased site-wide (client, 27 Nov): cards and panels 16px (large panels 22px), smaller cards 12-14px; buttons
  and chips stay pill-shaped.
- The option pages (`/lab/rally-x/`, `/lab/dividers/`, `/lab/how/`) were removed once the client picked.
- Footer: the base row's line sits clear of the Served. logo (client, 27 Nov).

## Marked as concept, not live

- Play mode: open play, find players, clubs and ranking, tournaments, events (stamped "Concept", examples
  labelled "Example").
- Basketball and padel: "Coming soon", no booking buttons.
- Rally X is live and bookable (client, 27 Nov 2026), on SAMPLE rates, hours and courts until it confirms its own:
  ₱700 an hour, 8 AM to 8 PM, four courts (two pickleball, two tennis). These are the most common values among the
  captured pickleball and tennis venues, and every place they show is marked "Sample". Its venue count is included;
  court totals and "from" prices leave the samples out. Its address shows as "to be confirmed".
- "Opening soon" sample: UP College of Human Kinetics Tennis Courts (client, 27 Nov 2026), in the courts directory
  and on its own page with a notify form. Only its name, sport and campus are shown; its photos are representative.

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

1. Rally X: address, hours, number of courts and rates, to replace the samples its booking runs on now.
2. Real contact phone, office address and social handles.
3. Real photos for each venue (or permission to use the venues' own).
4. Which Play mode feature comes first: open play or find players?
5. Timeline for basketball and padel.
6. Logo: the concept uses the official artwork supplied on 27 Nov exactly as drawn, traced to vector from a
   PNG. Is there a master vector file to swap in? The favicon and app icon use its S.
7. Confirm the 5% service fee and the 24-hour cancellation rule are current.
8. Is a native app planned? The concept's Install App button installs the website itself as an app.
9. Which court listings can the concept show? Venue data comes only from your own site; a full partner list (or
   the venues' permission) would let the directory grow.
10. Court page studio: should owner changes publish at once or go through a review first?
11. Whole-day bookings: should there be a day rate, a minimum or a cap per player? The concept charges the
    hourly rates added up.
12. UP College of Human Kinetics Tennis Courts: your current site already lists "UP Diliman Tennis Court" (UP
    Diliman, Quezon City, four clay courts). If those are the same courts, the directory now shows them twice.
13. Owner links: should each venue get a short link (for example served.com/rallyx) and a QR code to print?
