# Tri 🌳

**A calmer layer on top of Instagram.** Tri shows the people you follow as a
living *tree of faces and names* — no posts, no feed, no scrolling. When the
friends you used to follow move to Tri, you find each other again.

## Why this design (the important part)

Instagram's official API **deliberately does not expose who you follow**, and
scraping it violates their Terms. So Tri never touches Instagram's servers.
Instead it ingests the **official "Download Your Information" export** that
Instagram gives every user — specifically the `following.json` file. That data
is the user's own, the export is permitted, and nothing is scraped.

The matching key between people is the **Instagram username**. When someone you
followed later claims their handle on Tri, their node in your tree lights up.

## How it works

1. **Claim your handle** — create a Tri profile with your Instagram username.
2. **Import your data** — upload `following.json` from your Instagram export.
3. **Reconnect** — see everyone as a radial tree; anyone already on Tri glows,
   and new arrivals appear over time.

## Tech stack

- **Next.js 16** (App Router, Server Actions) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Prisma 6** + **SQLite** (zero external services for local dev)
- Lightweight HMAC-signed cookie sessions, bcrypt password hashing
- The tree is a hand-rolled, pan/zoom/pinch **SVG radial graph** (no heavy graph lib)
- **Installable PWA**: web manifest, service worker, offline fallback, mobile
  bottom-nav, and add-to-home-screen prompt — runs full-screen on iOS & Android

## Phone web app (PWA)

Tri is a mobile-first **Progressive Web App**, so you can run and test it on any
phone with no app store:

1. Deploy it (or run it locally over HTTPS — see below) and open the URL on your
   phone's browser.
2. **Android/Chrome:** an "Install Tri" prompt appears (or use ⋮ → *Install app*).
   **iOS/Safari:** tap Share → *Add to Home Screen*.
3. It launches full-screen in standalone mode with the Tri icon, a bottom tab bar
   (Tree · Import · You), and offline shell.

> Install/standalone mode and the service worker require **HTTPS**. Locally you
> can use `next dev --experimental-https`, or just deploy to any HTTPS host. Over
> plain `http://localhost` the app works fully; only the install prompt is gated.

App icons are generated (no design tools needed) with `npm run icons`.

## Getting started

```bash
npm install            # also runs `prisma generate`
npx prisma migrate dev # create the SQLite database
npm run db:seed        # optional: demo world with reconnections
npm run dev            # http://localhost:3000
```

Demo login (after seeding): **demo@tri.app / password123**

A sample export lives at `sample-data/following.json` for testing the importer.

## Project layout

```
src/
  app/
    page.tsx            landing
    signup, login/      auth pages
    import/             upload your following.json
    tree/               the radial tree (matching + reconnection stats)
    u/[username]/       public profile
  components/
    TreeGraph.tsx       the SVG radial visualization (client)
    Avatar.tsx          image or deterministic fallback avatar
    AuthForm, ImportForm, SiteHeader
  lib/
    instagram.ts        tolerant parser for the IG data export
    actions.ts          server actions (signup/login/import)
    session.ts          cookie sessions
    prisma.ts           db client
prisma/
  schema.prisma         User + Follow models
  seed.mjs              demo data
```

## Data model

- **User** — `email`, `igUsername` (unique, the match key), `displayName`,
  `passwordHash`, optional `bio` / `avatarUrl`.
- **Follow** — one row per account the user followed on Instagram
  (`ownerId` → `targetUsername`). Matched against `User.igUsername`.

## Roadmap ideas

- Accept the raw `.zip` export directly (extract `following.json` server-side).
- Avatar uploads (object storage) instead of URL field.
- Email notification when someone you followed joins.
- Mutual-follow clustering and second-degree suggestions.
- Real OAuth / password reset, rate limiting.

---

Built as the first working slice of the Tri concept — compliant, private, and
end-to-end functional.
