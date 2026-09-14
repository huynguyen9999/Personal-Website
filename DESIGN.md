---
name: Huy Nguyen personal archive
colors:
  paper: "#f3f0f5"
  ink: "#17131c"
  muted: "#696170"
  signal: "#ff5656"
  lavender: "#c9a8ff"
  orange: "#ffb067"
  panel: "#18141c"
  panelInk: "#f8f3ff"
  darkPaper: "#16131b"
  darkInk: "#f4eef8"
  darkMuted: "#c0b6c8"
  darkSelection: "#d7bcff"
typography:
  display: "Instrument Serif"
  body: "Inter"
  meta: "IBM Plex Mono"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1.25rem, 4vw, 4.5rem)"
---

# Design

Incumbent visual system extracted from the live editorial CSS. Agents must match this, not a Tailwind/shadcn default. Tokens live in `app/globals.css` as CSS custom properties. Tailwind maps onto those tokens; it does not replace them.

## Overview

Calm, precise, readable, sophisticated. Editorial foundation with rare experimental moments (nav veil, cursor trail, route transitions). Asymmetry and large serif headlines. Tennis influence is geometry (baselines, court lines), not green palettes or tennis-ball décor. Engineering influence is coordinates and labels, not circuit-board wallpaper.

## Colors

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#f3f0f5` | `#16131b` | Page ground |
| `--ink` | `#17131c` | `#f4eef8` | Primary text |
| `--muted` | `#696170` | `#c0b6c8` | Supporting text |
| `--rule` | ink at 21% | ink at 18% | Hairline dividers |
| `--signal` | `#ff5656` | `#ff7a7a` | Current-page mark, emphasis |
| `--lavender` | `#c9a8ff` | `#d7bcff` | Cursor trail, dark selection |
| `--orange` | `#ffb067` | `#ffc089` | Trail, warm accent |
| `--nav-accent-from` | `#ffc44d` | `#ffd27a` | Shared nav hover gradient start |
| `--nav-accent-to` | `#6f8f5a` | `#8fb56a` | Shared nav hover gradient end (olive, not tennis-ball green) |
| `--panel` | `#18141c` | `#0c0a10` | Inverse bands, admin |
| `--selection` | `#17131c` | `#d7bcff` | Text highlight fill |
| `--selection-ink` | `#f3f0f5` | `#16131b` | Text on a highlight |

## Typography

- Display: Instrument Serif 400 — openings and section titles. Tight tracking, line-height ~0.82–0.95.
- Body: Inter — reading size ~1rem, line-height 1.55, measure around 42rem.
- Meta: IBM Plex Mono — eyebrows, coordinates, nav numbers, footer. 0.65–0.75rem, wide tracking, uppercase where it is already used.

Do not introduce a fourth family. Do not use Inter as a display face.

## Layout

- Max conceptual width `--max: 1440px`. Gutter `--gutter`.
- Sticky header with hairline rule. Theme controls sit under the header, top-right, not inside the nav cells.
- Homepage: original archive sections plus the interactive identity map beneath the compact, right-aligned header; no ORIGIN / ADAPTATION or other V1-only narrative bands.
- Writing / Now / Contact are quiet pages: large title, intro aligned toward the trailing edge on wide screens.
- Hairline rules, not cards, are the primary grouping device.

## Elevation & Depth

Flat. Depth comes from blur on the nav veil (`backdrop-filter`) and the inverse panel band, not drop shadows on every block. Admin login uses a dimmed overlay.

## Shapes

Radius **0** on controls, inputs, and panels. Circles only for moment markers and the current-page dot. No rounded-rectangle card language.

## Motion

Three families only (plus the existing cursor trail):

1. **Page enter** — CSS fade-and-rise on `app/template.tsx` remounts. Header hide/show on scroll is separate.
2. **Nav focus veil** — Shield-like: focused item, muted neighbors, page blur. Keyboard equivalent. Disabled as a blur on small screens (accordion instead).
3. **Scroll reveal** — short opacity/translate on section entry. Once. No scroll hijacking.
4. **What I do / Who I am** — Motion (`framer-motion`) for in-view section fades, the Pacific route drawing, and reduced-motion fallbacks. Do not spread this library to the rest of the archive.

Respect `prefers-reduced-motion`: durations → 0; cursor trail off. Keep transitions short (~150–800ms).

Do not add marquee, text scramble, or animate-every-element libraries on Home, Story, Reading, Now, or Contact.

## Components

- **Header / nav:** masthead name in the left cell (Instrument Serif, stacked Huy / Nguyen), numbered destination cells, notes, dropdowns, current-page signal dot. Hover/focus uses one yellowish-orange → olive gradient bar on every tab.
- **What I do:** ruled engineer / creator / student bands, not a 3-column project grid.
- **Who I am:** MapLibre globe of the real Earth (OpenFreeMap), click-to-hear name, a reading shelf, and a Hobbies interactive selector (`components/ui/interactive-selector.tsx`): expanding strips with lucide icons, site typography, and smooth flex transitions. Machines and Cubes ship local photo archives; Adventures, Work setup, and Tennis also accept admin placements (`being-adventures`, `being-drive`, `being-cubes`, `being-setup`, `being-tennis`). Empty categories show a short note instead of stock fallbacks in the panel. The globe pins Visalia 93291 and an IP-derived visitor location. Nearby visitors zoom into California; farther ones pull back to the continent or the globe.
- **Opening:** serif headline, coordinates, optional photo or court geometry.
- **Trajectory list:** numbered rows, not identity-category chips.
- **Identity map:** connected place, study, sport, curiosity, and making nodes; hover, focus, tap, and arrow-key behavior must match.
- **Placed photos:** full-bleed figures with mono captions; omit empty slots.
- **Admin:** utilitarian dark panel; not a showcase.
- **Buttons:** rectangular, inherited type, ink/paper inversion for primary.

## Do's and Don'ts

**Do**

- Leave empty writing empty.
- Prefer native CSS over animation libraries unless a problem truly requires it.
- Use Tailwind utilities for new layout/motion helpers that consume existing tokens.
- Keep photo placement owner-driven.

**Don't**

- Invent biography to fill a layout.
- Turn the site into a Tailwind/shadcn dashboard.
- Enable Tailwind Preflight (it would reset this system).
- Slide the header during route changes.
- Use “Hi, I’m Huy”, skill pills, logo clouds, or 3-column project cards as the homepage.
