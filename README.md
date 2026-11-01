# Aranya — Luxury Resort Website + Admin (CMS & CRM)

A Next.js 16 demo for a luxury resort. It has a public website with a lot of motion and an admin panel that controls everything on it.

## Quick start

```bash
npm install
npm run dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin
  - Email: `admin@aranya.resort`
  - Password: `aranya2026`
  - Change these with environment variables; see `.env.example`.

## Website

- **Intro animation:** three styles you pick in the admin (curtain, counter, letters). You can also set the text, image, duration and whether it plays only once per session.
- **"Island" navbar:**
  - A floating glass pill that sits at the bottom on mobile (easy to reach with a thumb) and at the top on desktop.
  - It morphs into a full menu with an image preview that changes as you hover each link.
  - It shows a scroll-progress ring, live resort time and weather, and hides when you scroll down.
- **Scroll effects:**
  - The hero image shrinks into a card as you scroll.
  - Story text brightens word by word, Apple-style.
  - Rooms scroll sideways while the section stays pinned.
  - Experience cards stack on top of each other.
  - Images move with parallax and reveal through a clip-path.
  - The two gallery rows slide in opposite directions.
  - The events image expands to full width.
- **Page transitions:** a curtain wipe between pages. Smooth scrolling uses Lenis. On desktop there is a custom cursor and buttons that pull toward it.
- **Pages:**
  - Home, with 13 sections. The admin can reorder them and turn each one on or off.
  - Rooms, with filters and sorting, and a page for each room with a gallery and a price calculator.
  - Booking in four steps: live availability, promo codes, taxes, and a booking reference at the end.
  - Experiences, Dining, Offers (copy the code), Gallery (masonry grid with a lightbox), and Contact (sends an enquiry to the CRM).
  - Newsletter sign-up, FAQ, map and getting-here section, testimonials carousel, and an announcement bar.

## Admin (`/admin`)

- **Dashboard:**
  - Occupancy, revenue, average daily rate, leads and subscribers.
  - Revenue for the last 6 months, bookings by source, revenue per room type.
  - Upcoming arrivals and departures, and recent activity.
- **CRM:**
  - **Bookings:** filters, status and payment updates, manual bookings, CSV export, and an occupancy calendar.
  - **Leads:** drag-and-drop board by stage, with a notes timeline.
  - **Guests:** VIP flag, tags, lifetime spend, and each guest's stay history.
  - **Subscribers.**
- **CMS:** add, edit, reorder and hide Rooms, Experiences, Dining, Offers, Gallery, Testimonials, FAQs and Venues. Images can be uploaded or added by URL.
- **Settings:** brand and contact details, theme colours (with a live preview), intro animation, navbar links, announcement bar, hero, story, spa, events, homepage section order, SEO and footer. **Reset demo data** restores the original content.

## Data

Everything is saved in `data/db.json`. If that file is missing, it is created from `lib/seed.ts`. On read-only hosts it falls back to the OS temp directory. For production, replace `lib/db.ts` with Postgres/Prisma or another database; its functions (`getDB`, `mutate`) are the only place that touches storage. Uploads are saved in `public/uploads`.

Photos come from Unsplash.
