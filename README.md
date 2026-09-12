# Personal website

Narrative personal archive built with Next.js for Vercel, with a Supabase-backed owner editor.

## Local development

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and add Supabase values when available.
3. Run `pnpm dev`.

The public site works without Supabase. `/admin` shows a setup state until the environment values are present. Once connected, the authorized owner can edit, save drafts, and publish the homepage and Story opening copy directly in the browser.

## Backend boundary

The initial migration creates an owner-scoped `content_items` model with Row Level Security. Anonymous visitors can read published records only; drafts and all mutations remain restricted to their authenticated owner. Every editor mutation also verifies `ADMIN_EMAIL` on the server.

## Appearance and navigation

The header includes light, dark, and system appearance modes. System mode follows live operating-system changes. Desktop navigation menus reveal contextual links and blur the page beneath them; keyboard focus provides the same menus and Escape closes them. A lightweight canvas cursor trail is limited to precise pointers and disabled when reduced motion is requested.
