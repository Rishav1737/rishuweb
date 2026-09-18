# Creative Portfolio

A Next.js (App Router) creative portfolio template with scroll-driven animations, a showreel, testimonials, and a collaboration form.

## Getting started

```bash
bun install   # or npm install / pnpm install
bun dev       # or npm run dev
```

## Environment variables

Create a `.env.local` with:

```bash
RESEND_API_KEY=      # required for the /api/collab contact form (resend.com)
NEXT_PUBLIC_GA_ID=   # optional, Google Analytics measurement ID
```

## Configure your branding

This is a template — before deploying, update the placeholders left throughout the codebase:

- `src/lib/constants.ts` — `BASE_URL` (your production domain)
- `src/lib/seo.ts` — default author name, site name, Twitter handle
- `src/app/layout.tsx` — page title/description/OG & Twitter metadata
- `src/app/manifest.ts` — PWA manifest name/description
- `src/components/common/structured-data.tsx` — JSON-LD Person/Organization info and social links
- `src/components/layout/navbar.tsx` and `src/components/layout/footer.tsx` — social links, contact email, Cal.com booking link
- `src/app/api/collab/route.ts` — sender/recipient email addresses (must match a domain verified in your Resend account)
- `src/components/sections/about/about-scroll-section.tsx` — swap the Picsum placeholder sequence for your own 47 sequential frames hosted on ImageKit/Cloudinary/S3/etc. for a real scrubbing animation
- `src/data/user-data.ts` and `src/data/show-reel.ts` — replace the example testimonials and showreel entries with your own (names, photos, Vimeo IDs)

## Replace placeholder media

This template ships with **working placeholder images** (via `images.unsplash.com` and `picsum.photos`) instead of personal photos, so it runs out of the box. Swap these out before deploying:

| Location | Currently uses |
|---|---|
| `about-me.tsx` — hero background | Unsplash placeholder photo |
| `about-me.tsx` — hero centerpiece | `public/ichigo.png` |
| `about-section.tsx` — profile photo | Unsplash placeholder portrait |
| `cal-booking.tsx` — booking section photo | `public/ichigo.png` |
| `about-scroll-section.tsx` — 47-frame scroll sequence | Picsum seeded placeholder photos (a slideshow, not a real scrub — see TODO in that file) |
| `public/testimonials/placeholder-*.png` | Referenced but not included — add your own testimonial avatars |
| `OG_IMAGE` in `src/lib/constants.ts` (`/og-image.png`) | Not included — add your own Open Graph image |
| `src/app/favicon.ico` | Not included — add your own favicon |

`public/md-red-logo.svg` and `src/app/icon.tsx` ship with a generic placeholder mark — replace with your own logo.

## License

MIT — see [LICENSE](LICENSE).
