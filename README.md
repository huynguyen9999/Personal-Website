# Huy Nguyen — personal website

A personal site for Huy Nguyen: a living archive, not a résumé and not a project-portfolio grid. Spec: [`personal-website-blueprint.md`](./personal-website-blueprint.md). Live site: [thehobbiest.vercel.app](https://thehobbiest.vercel.app/).

Visitors get the public pages. Huy signs in at `/admin` with email and password, then edits copy and places photos from the browser.

Repository: [github.com/huynguyen9999/Personal-Website](https://github.com/huynguyen9999/Personal-Website)

## What you can do here

- Read Index, Story, Writing, Now, and Contact.
- Switch appearance between light, dark, and system (follows the OS, including live changes).
- Move the cursor on a desktop pointer and see a colored trail (honors Reduce Motion).
- Sign in at **Edit** if you are the owner. Everyone else sees a login panel.

After sign-in the owner can:

- Draft or publish homepage, Story, Now, and Contact copy.
- Upload photos from a Mac and place each image on a page location.
- Add alt text and an optional caption.
- Remove a photo from the library and from the public site.

Unplaced photos stay in the admin library only.

`/work` and `/life` are intentionally absent until there is real material for them. Writing stays empty until there is writing in the owner's voice. No biographical facts were invented to fill gaps.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 App Router, React 19 |
| Language | TypeScript |
| Styles | One global CSS file, CSS custom properties, no Tailwind |
| Fonts | Instrument Serif (headlines), Inter (body), IBM Plex Mono (meta) via `next/font` |
| Data / auth / files | Supabase (Postgres, Auth, Storage) |
| Hosting | Vercel |
| Package manager | pnpm |

## Pages

| URL | Purpose |
| --- | --- |
| `/` | Index — present tense, field note, trajectory, invitation |
| `/about` | Story — Vietnam to California; labeled incomplete |
| `/writing` | Writing shelf; empty until there is real writing |
| `/now` | Present tense; last-updated when published from admin |
| `/contact` | Email (`dominichuyn@gmail.com`) and GitHub |
| `/admin` | Owner login, then the editor. Not indexed |

## Project layout

```
app/
  layout.tsx              Site chrome, fonts, theme bootstrap, cursor trail
  globals.css             All visual design
  page.tsx                Homepage
  about/page.tsx          Story
  writing/page.tsx        Writing
  now/page.tsx            Now
  contact/page.tsx        Contact
  admin/page.tsx          Login + editor
  admin/actions.ts        Sign-in, drafts, publish, photo placement
  sitemap.ts / robots.ts
components/
  navigation.tsx          Header, menus, Edit link
  site-footer.tsx         Shared footer
  theme-controls.tsx      Light / dark / system
  cursor-trail.tsx        Pointer trail
  placed-photos.tsx       Public photo renderer
  media-uploader.tsx      Admin upload + placement
  admin-submit.tsx        Draft / publish buttons
lib/
  content.ts              Fallback copy + published text from Supabase
  media.ts                Photo slots and public photo queries
  supabase/               Browser, server, public, and proxy clients
proxy.ts                  Refreshes the auth session on /admin
supabase/migrations/      Postgres tables, RLS, storage bucket
personal-website-blueprint.md   Product source of truth
```

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

1. Open `/admin` (or click **Edit**).
2. A login panel asks for email and password.
3. The email must match `ADMIN_EMAIL`.
4. First time: **Create owner account**, confirm the email if Supabase asks, then sign in.

Row Level Security also checks the owner email.

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

Editorial personal archive: serif headlines, four-to-five column header, Shield-like nav focus (active item, muted neighbors, page blur), sticky navigation, quiet writing shelf. Copy that has not been written is left empty. Theme preference is `site-theme` in `localStorage`.
