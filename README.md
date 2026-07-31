# The Marq Mohali — themarqmohali.com

Lead-gen landing page for **The Marq by Atlantis**, Airport Road, Block B,
Aerocity, Sector 82, Mohali. Pre-RERA project — no price, size, configuration,
or possession info is shown anywhere on the site.

## Stack
Plain HTML5 + hand-written CSS + vanilla JS. No build step, no frameworks —
everything can be edited directly and deployed as static files (GitHub Pages,
Cloudflare Pages/Workers, Netlify, etc.).

## Structure
```
index.html            Single-page site (all sections)
styles.css             Design tokens + all styling
script.js               Nav, modal, lead form, FAQ accordion, lightbox, video player
manifest.json          PWA metadata
robots.txt / sitemap.xml
privacy-policy.html / terms.html
assets/
  favicon.svg           Custom panther brand mark (used as favicon + icons)
  apple-touch-icon.png, icon-192.png, icon-512.png, favicon-32.png
  images/               Brand creatives (cover, panther mark, Crown Location map) + video posters
  videos/
    welcome-hero.mp4 / welcome-hero-web.mp4     Original + compressed hero loop (muted, autoplay)
    celebrating-life.mp4 / celebrating-life-web.mp4  Original + compressed showcase video (click-to-play)
```
The `-web` video files are the compressed versions actually used on the site
(H.264, scaled down, faststart) — kept the originals alongside them in case
you want to re-export at different settings later.

## Design tokens
- Wine `#3D0E18` / deep wine `#2A0A11` / wine accent `#8B1E3F`
- Near-black `#1A1A1A` (Crown Location, Gallery, Enquire sections)
- Gold `#C9A961` / bright gold `#E4CD94`
- Ivory `#F5EFE6`
- Display type: Fraunces (serif) — body: Inter

## Lead capture
Both the header/hero/section "Enquire Now" buttons (modal) and the bottom
Enquiry form post to the **same shared Google Apps Script endpoint** used by
Escon Primera / Vamana Arvindam / Aveda Arenium / Ananta Aspire, with
`project: "The Marq by Atlantis"` so leads land in the shared Leads sheet
under their own Project value. Submission is fire-and-forget (no-cors) so the
thank-you confirmation shows instantly regardless of script response time.

No phone number, click-to-call, or WhatsApp appears anywhere on the site, per
the brief — Enquire Now is the only conversion path.

## Compliance notes baked into the copy
- No price, unit size, carpet area, configuration, possession date, or RERA
  number anywhere on the page.
- FAQ explicitly states the project is not yet RERA registered and that this
  is an independent enquiry site, not the developer's official website.
- Footer carries the required "visuals/information are indicative" disclosure.

## Still to do before going live
- Swap the placeholder domain references (`themarqmohali.com`) if the final
  registered domain differs, and update canonical/OG/sitemap URLs.
- Point the Apps Script `LEAD_ENDPOINT` at your own script if you don't want
  this on the shared multi-project sheet.
- Add Google Analytics / GTM container once you're ready to run ads (same
  pattern as the other project sites — one container per project).
