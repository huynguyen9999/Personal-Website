# Product

<!-- impeccable:product-schema 1 -->

Primary specification: [`personal-website-blueprint.md`](./personal-website-blueprint.md). This file does not override it. It is the Impeccable product record so design commands stay aligned with that brief.

## Platform

web

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Editorial CSS custom properties as the visual source of truth
- Tailwind CSS v4 utilities layered on those tokens (no Tailwind Preflight reset)
- CSS page-enter, scroll reveal, and a cursor trail (respects Reduce Motion)
- Supabase for auth, published copy, drafts, and photo placement
- Vercel hosting (`thehobbiest.vercel.app`)

## Users

Anyone who finds Huy Nguyen on the internet: classmates, future collaborators, readers, and people who want to understand the person, not a résumé. Recruiters may arrive; the site is still a personal archive, not a project-portfolio grid.

## Product Purpose

A living personal home on the internet. It should make a visitor understand origin, curiosity, engineering judgment, athletic discipline, creative work, and direction of travel. Credibility comes from real work, writing, and care in the experience.

## Positioning

Kinetic editorial autobiography (internal direction, never a public tagline). Closer to a digital archive / personal studio than a SaaS landing page, Linktree, or developer portfolio.

Unique claim a neighbor could not copy: Ho Chi Minh City → California, electrical engineering at UCSB, collegiate tennis, and public making, told without invented biography.

## Operating Context

Owner updates copy and photos from `/admin` without a code change. The route is intentionally unlinked from public chrome. Public pages fall back to local factual copy when Supabase is unset.

## Capabilities and Constraints

- Public navigation: Home, My Story, My Projects, Life. The compact, right-aligned menu gives each destination a dropdown; Life links directly to current, finished, and future reading shelves. My Projects points to GitHub until a separate portfolio is ready.
- Homepage: the original archive sequence (opening, present, manifesto, trajectory, continue) plus the interactive identity map; no V1 ORIGIN / ADAPTATION band.
- Owner: email/password gate, drafts, publish, Mac photo upload with page/slot placement.
- Do not invent jobs, internships, tennis records, awards, quotes, metrics, or childhood scenes beyond the blueprint.
- Motion must respect `prefers-reduced-motion`, remain keyboard-usable, and never hide information.
- Do not use generic developer-portfolio patterns (skill pills, logo clouds, “Hi I’m X”, gradient orbs).

## Brand Commitments

- Public name: Huy Nguyen
- Voice: specific, human, incomplete when the facts are incomplete. No “American Dream” or “against all odds” framing.
- Contact: `dominichuyn@gmail.com`, GitHub `huynguyen9999`
- Appearance: light, dark, and system; system follows the OS live.

## Evidence on Hand

See blueprint §14. Confirmed facts only: grew up in Ho Chi Minh City; moved to the U.S. at about 11; studies Electrical Engineering; collegiate tennis at UC Santa Barbara; creates social-media content; wants an authenticated editor.

## Product Principles

1. Design the person before the interface: identity → story → structure → design.
2. Trajectory over category boxes.
3. Fewer true elements beat a full sitemap of empty pages.
4. Admin is a control room; the public site is the presentation layer.
5. Taste shows as restraint. Memorable motion is rare and meaningful.

## Accessibility & Inclusion

Semantic HTML, skip link, visible focus, keyboard-equivalent nav (including the Shield-like focus veil), reduced-motion fallbacks, contrast that survives light and dark, alt text on placed photos.
