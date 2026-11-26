# Served. redesign concept

A design concept for **Served.**, the sports court discovery and booking platform for the Philippines.
Static, dependency-free, and built from the current Served. site's own content and venue data.

**Preview:** https://amplifimktgplus.github.io/Served_redesigned/
Every page carries `noindex, nofollow`. Forms, sign-in and payment are demonstrations: nothing is sent, charged or booked.

## What is in it

| Area | Pages |
|---|---|
| Discovery | Home, Courts (list and map, filters, "near me"), 6 venue pages, Rally X |
| Booking | Availability and slot pages for every venue (live-style date rail, court picker, slot grid, summary, payment and confirmation) |
| Sports and cities | Sports hub plus pickleball, tennis and badminton; cities hub plus Taguig, Pasig, Quezon City, Marikina, Muntinlupa, Nasugbu |
| Community | Play mode (open play, find players, clubs and ranking, tournaments, events), marked as concepts |
| Company | Pricing, List Your Court, Help centre and FAQ, About, Contact, Court Gallery |
| Account | Sign in, Register, Forgot password, Staff sign in |
| App | Installable: web app manifest, a service worker that keeps visited pages readable offline, and an Install App button on the home hero |

44 pages in all, URLs kept from the current site (`/courts`, `/courts/<venue>`, `/courts/<venue>/availability`, `/courts/<venue>/slots`, `/pricing`, `/list-your-court`, `/contact`, `/sign-in`, `/sign-up`, `/forgot-password`, `/staff/sign-in`).

## Build

```bash
node src/build.mjs          # renders src/ into dist/
node tools/linkcheck.mjs    # every local link and image resolves; every Book link lands on bookable courts
python3 tools/images.py     # re-encodes the photo set to WebP (needs Pillow); pass names to redo only those
```

No npm packages. `dist/` is what GitHub Pages serves (branch `gh-pages`).

## Sources

- Words, venue facts, rates, slot boards, amenities and reviews: the current Served. site, captured 26 Nov 2026.
- Rally X photos: supplied by the venue.
- Tennis and badminton card photos: supplied for this concept on 26 Nov 2026; licence to be confirmed before launch.
- Sign-in photo: supplied for this concept on 27 Nov 2026 (Unsplash, Moises Alex).
- Home hero photo: the current Served. site's own hero image.
- Venue photos marked "Representative photo": the current Served. site's own sport images.
- City and sport photos: Wikimedia Commons, credited on the Court Gallery page.

Home hero: option B, "Live board", picked 27 Nov 2026, on the current site's own hero photo with the Served. wordmark up the right edge, and the current site's palette (black, navy, white, orange) across every page with no lime. No lines are drawn over photos anywhere.

See `docs/PITCH-NOTES.md` for what was kept, what is new, and the questions for the Served. team.
