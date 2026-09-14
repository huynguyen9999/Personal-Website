# Huy Nguyen — personal website

A personal site for Huy Nguyen: a living archive, not a résumé and not a project-portfolio grid. Spec: [`personal-website-blueprint.md`](./personal-website-blueprint.md). Live site: [thehobbiest.vercel.app](https://thehobbiest.vercel.app/).

Visitors get the public pages. Huy signs in at `/admin` with email and password, then edits copy and places photos from the browser.

Repository: [github.com/huynguyen9999/Personal-Website](https://github.com/huynguyen9999/Personal-Website)

## What you can do here

- Read the original homepage archive and explore the interactive identity map.
- Switch appearance between light, dark, and system (follows the OS, including live changes).
- Move the cursor on a desktop pointer and see a colored trail (honors Reduce Motion).
- Sign in at the quiet **admin** line in the footer if you are the owner. Everyone else sees a simple sign-in panel.

After sign-in the owner can:

- Draft or publish homepage, Story, Now, and Contact copy.
- Upload photos from a Mac and place each image on a page location.
- Add alt text and an optional caption.
- Remove a photo from the library and from the public site.

Unplaced photos stay in the admin library only.

Making and Life begin as evidence-backed homepage chapters rather than generic portfolio pages. No biographical facts were invented to fill gaps.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 App Router, React 19 |
| Language | TypeScript |
| Styles | Editorial CSS tokens in `globals.css`; Tailwind v4 utilities on those tokens (no Preflight) |
| Motion | CSS page enter, scroll reveal, hiding header, nav veil, cursor trail |
| Design system | Impeccable (`PRODUCT.md`, `DESIGN.md`) plus `personal-website-blueprint.md` |
| Fonts | Instrument Serif (headlines), Inter (body), IBM Plex Mono (meta) via `next/font` |
| Data / auth / files | Supabase (Postgres, Auth, Storage) |
| Hosting | Vercel |
| Package manager | pnpm |

## Pages

| URL | Purpose |
| --- | --- |
| `/` | Home — original archive plus interactive identity map |
| `/about` | Story — Vietnam to California |
| `/what-i-do` | Engineer, creator, and student practices; GitHub; unpublished resume |
| `/who-i-am` | Name, origin map, reading shelf, drive, and work setup |
| `/reading` | Notes — current, finished, and next reading shelves |
| `/writing` | Permanent redirect to `/reading` |
| `/now` | Present tense; last-updated when published from admin |
| `/contact` | Email (`dominichuyn@gmail.com`) and GitHub |
| `/admin` | Direct owner sign-in, then the editor. Not indexed or linked in public chrome |

## Project layout

```
app/
  layout.tsx              Site chrome, fonts, theme bootstrap, cursor trail
  globals.css             Tokens, editorial layout, motion
  template.tsx            Page-enter animation wrapper
  page.tsx                Homepage
  what-i-do/page.tsx      Engineer / creator / student
  who-i-am/page.tsx       Origin, pronunciation, shelf, drive, setup
  about/page.tsx          Story
  reading/page.tsx        Reading shelf / Notes destination
  writing/page.tsx        Legacy redirect to Reading
  now/page.tsx            Now
  contact/page.tsx        Contact
  admin/page.tsx          Login + editor
  admin/actions.ts        Sign-in, drafts, publish, photo placement
  sitemap.ts / robots.ts
components/
  navigation.tsx          Compact header menus (Home, My Story, What I do, Who I am)
  identity-map.tsx        Interactive, keyboard-accessible relationship map
  site-footer.tsx         Shared public footer
  theme-controls.tsx      Light / dark / system
  cursor-trail.tsx        Pointer trail
  reveal.tsx              Scroll-triggered section reveal
  placed-photos.tsx       Public photo renderer
  media-uploader.tsx      Admin upload + placement
  admin-submit.tsx        Draft / publish buttons
lib/
  content.ts              Fallback copy + published text from Supabase
  admin.ts                Timing-safe owner email check
  auth-guard.ts            Auth rate limit, honeypot, payload caps
  security-headers.ts     Site + admin HTTP headers
  media.ts                Photo slots and public photo queries
  supabase/               Browser, server, public, and proxy clients
proxy.ts                  Refreshes the auth session on /admin and adds no-store headers
supabase/migrations/      Postgres tables, RLS, storage bucket
personal-website-blueprint.md   Product source of truth
PRODUCT.md / DESIGN.md          Impeccable product + visual records
tests/                          Vitest unit, component, and integration tests
e2e/                            Playwright smoke tests
```

## Tests

Stack: **Vitest** + **React Testing Library** for unit, component, and App Router integration tests; **Playwright** for localhost smoke tests. Supabase is mocked. Tests do not load `.env.local`, do not use the service-role key, and do not need the owner password.

```bash
pnpm test              # everything
pnpm test:unit         # lib/ helpers + UI components
pnpm test:integration  # public pages + admin login/setup gates
pnpm test:e2e          # Chromium smoke against http://127.0.0.1:3100
```

First-time Playwright setup:

```bash
pnpm exec playwright install chromium
```

If `node` is not on `PATH` (common in Cursor), put the Cursor helper directory first:

```bash
export PATH="/Applications/Cursor.app/Contents/Resources/app/resources/helpers:$PATH"
```

`playwright.config.ts` starts a dedicated Next dev server on **port 3100** (`next dev --port 3100 --hostname 127.0.0.1`) with `NEXT_DIST_DIR=.next-e2e` so it does not collide with a process already using `.next` on 3000. The Cursor Node helper directory and `node_modules/.bin` are prepended to `PATH`. Override the port with `PLAYWRIGHT_PORT` if 3100 is taken.

## Local setup

Requirements: Node.js 20+, pnpm.

```bash
pnpm install
cp .env.example .env.local
```

Fill in `.env.local` (see below), then:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The public site still renders if Supabase is missing; `/admin` shows a setup state until the environment values are present.

**Vercel (`thehobbiest.vercel.app`) only updates after a new deploy.** Editing files on your Mac does not change the live URL. To preview unpublished work:

1. In Terminal, `cd` into this folder (`personal-website`).
2. Run `pnpm install` once if `node_modules` is missing.
3. Run `pnpm dev`.
4. Open `http://localhost:3000`.
5. Check `/`, `/about`, `/writing`, `/now`, `/contact`, and `/admin`.

```bash
pnpm dev          # local preview server
pnpm build        # production build
pnpm start        # serve the production build
pnpm typecheck    # TypeScript, no emit
pnpm test         # unit + component + integration + e2e
pnpm test:unit    # Vitest: lib helpers and UI components
pnpm test:integration  # Vitest: App Router pages with mocked Supabase
pnpm test:e2e     # Playwright smoke against localhost:3100
```

## Environment variables

Copy from `.env.example`:

```
NEXT_PUBLIC_SITE_URL=https://thehobbiest.vercel.app
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
ADMIN_EMAIL=
```

| Variable | Who uses it | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | App metadata, sitemap, auth email redirect | Canonical site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server | Publishable (anon) key, not the service-role secret |
| `ADMIN_EMAIL` | Server only | The only email allowed to sign in and mutate content |

Set the same keys in Vercel for production. Never commit `.env.local`. Never put the Supabase service-role key in this app.

## Owner login

1. Open `/admin` directly.
2. A sign-in panel asks for email and password.
3. The email must match `ADMIN_EMAIL`.
4. First time: **Create account**, confirm the email if Supabase asks, then sign in.

Row Level Security also checks the owner email. Failed sign-in is generic on purpose: the page does not say whether the email or password was wrong.

## Admin security

This is a single-owner archive, not a product with public accounts. `/admin` is kept off the header, out of the sitemap, and out of robots. Auth mutations then apply:

- Per-address burst limit (8 tries / 15 minutes) and hourly cap (20 / hour), plus a global hourly ceiling. A 500-try hour is stopped at the gate and never reaches Supabase.
- A hidden honeypot field. Bots that fill it get the same generic failure as a bad password.
- Payload caps on email and password length.
- Timing-safe owner-email comparison. Non-owner emails never call Supabase Auth.
- Generic error copy (`Sign in failed.` / `Try again later.`).
- `X-Frame-Options: DENY`, `nosniff`, `no-store` on `/admin`, and `poweredByHeader` disabled.

Supabase Auth still owns password hashing and session cookies. There is no service-role key in this app; public pages cannot write content. Rate limits are in-memory per server isolate, so they are strongest on a warm instance and still block noisy bots. Vercel’s platform DDoS controls sit in front.

## Apply the photo-library SQL in Supabase

Photo upload and placement need two SQL files applied to project `vqvrwnicifqcmevssgdi`. Do this in the dashboard (no CLI required):

1. Open the project: [supabase.com/dashboard/project/vqvrwnicifqcmevssgdi](https://supabase.com/dashboard/project/vqvrwnicifqcmevssgdi).
2. Sign in if asked.
3. In the left sidebar, click **SQL Editor**.
4. Click **New query**.
5. On your Mac, open `supabase/migrations/20260912183000_media_assets.sql` in this repo. Select all, copy.
6. Paste into the SQL Editor. Click **Run** (or press Cmd+Enter).
7. If you see `success` / “Success. No rows returned”, the table exists.
8. If you see `relation "media_assets" already exists`, that file was already applied. Continue.
9. Click **New query** again.
10. Copy all of `supabase/migrations/20260912200000_media_slots_now_contact.sql`, paste, **Run**.
11. Confirm in **Table Editor** that `public.media_assets` is listed.
12. Refresh `/admin` on the site. The photo library should load instead of a “not connected” error.

Official reference: [SQL Editor](https://supabase.com/docs/guides/database/overview) — write SQL in the editor and run it from the browser.

Do **not** paste `.env.local` into SQL. Do **not** run this on a database that is not this project.

## Photos without touching code

1. Sign in at `/admin`.
2. Under **Photos / placement**, optionally choose a page and a location, plus alt text and caption.
3. **Choose photos** opens Finder. JPEG, PNG, WebP, GIF, AVIF, HEIC, or HEIF (8 MB max, 12 at a time).
4. **Upload selected** stores files in `site-media`.
5. In the library, move a photo to another location or delete it.

The `media_assets` table must exist. Follow **Apply the photo-library SQL in Supabase** above if admin says the photo library is not connected.

## Database

Migrations live in `supabase/migrations/`:

- `content_items` — published page copy
- `content_drafts` — owner-only working copies
- `media_assets` — photo metadata and page placement
- Storage bucket `site-media`

Owner policies currently pin writes to `dominichuyn@gmail.com`. That value must stay aligned with `ADMIN_EMAIL`.

## Deploy

Standard Next.js on Vercel (project `personal-website`). Local `pnpm dev` never updates `thehobbiest.vercel.app`. After this repo is pushed to GitHub and connected, production follows `main`. Until then, deploy from this folder with the Vercel CLI (`vercel`).

## Design notes

The Who I am globe is a live MapLibre map (no API token required). Visitor distance uses IP on the server and never prints the address.

Editorial personal archive: serif headlines, compact right-aligned four-part header, Shield-like nav focus with a shared orange-to-olive hover bar, and an interactive identity map on the homepage. What I do and Who I am are dedicated landings. Theme preference is `site-theme` in `localStorage`.

Route changes fade and rise the page content. The header tucks away on scroll down and returns on scroll up. Homepage and Story sections reveal once on scroll. A colored cursor trail follows a mouse or trackpad. Tailwind is available for new utilities; it does not reset the editorial CSS. Impeccable skills live under `.cursor/skills/`.
