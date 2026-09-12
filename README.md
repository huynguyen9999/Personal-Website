# Personal website

First vertical slice of a narrative personal archive built with Next.js and prepared for Vercel + Supabase.

## Local development

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and add Supabase values when available.
3. Run `pnpm dev`.

The public site works without Supabase. `/admin` shows a setup state until the environment values are present.

## Backend boundary

The initial migration creates an owner-scoped `content_items` model with RLS. Public publishing is intentionally not opened directly through the Data API in this first slice. This keeps drafts private while the preview/publish workflow is designed.
