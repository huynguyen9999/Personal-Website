# Personal Website Blueprint

> **Purpose:** A reusable starting specification for designing and building this person's personal website. Use it as context for AI collaborators, designers, writers, and engineers. It defines the intended direction—not final copy, a fixed visual style, or an excuse to invent biographical details.

## 1. The Core Premise

This site is **a personal archive and living home on the internet**, not merely a polished developer portfolio or a résumé in web form.

It should make a visitor understand the person behind the work: their origin, curiosity, engineering judgment, athletic discipline, creative output, evolving interests, and direction of travel. Professional credibility should emerge from real work, thoughtful writing, and care in the experience—not from exaggerated self-promotion.

### Project philosophy

- Design the person before designing the interface: **identity → story → structure → design**.
- Let the site grow over years. It should support changing interests, new work, and new writing without needing a redesign.
- Favor specificity, evidence, and real artifacts over broad claims, buzzwords, or “personal-brand” theater.
- Make the implementation sophisticated, but make the experience feel simple.
- Treat the public site as the presentation layer and a private, authenticated editor as the owner's control room.

## 2. Desired Outcome and Visitor Perception

The site should leave visitors with a layered impression:

> “I understand what kind of person this is—and I would like to learn more, work with them, or follow what they do next.”

More specifically, it should communicate that this person is:

- technically curious and capable;
- thoughtful, articulate, and intellectually honest;
- disciplined and resilient;
- culturally grounded and shaped by a meaningful move from Vietnam to the United States;
- more dimensional than a conventional engineer, student, athlete, or creator label;
- someone with taste, judgment, and genuine interests.

The desired balance is not “professional versus personal.” It is the intersection of **personal, professional, and technical**.

## 3. Personal Website vs. Portfolio

### A portfolio answers

- What has this person made?
- What tools do they know?
- Are they qualified for this role or engagement?

### This personal website must also answer

- Who is this person, beyond their résumé?
- What shaped them, and what are they trying to understand?
- How do they think, learn, work, and communicate?
- What do they care about outside work?
- What are they doing now, and where might they be heading?

Projects, credentials, and a résumé can exist here, but they are **evidence within a bigger story**. The site must not become a grid of project cards, a skills inventory, or an online LinkedIn profile.

## 4. Narrative-First Identity Framework

Before final copy, page hierarchy, or visual direction is decided, elicit enough real material to establish the person's narrative. Do not fill gaps with generic “builder,” “innovator,” or “passionate about technology” language.

### Working identity threads to explore

1. **Origin and adaptation** — childhood in Vietnam, move to the U.S., learning English, family, community, continuity, change, and opportunity.
2. **Curiosity about systems** — an early instinct to explore how things work, including technology, cars, games, and the internet.
3. **The engineer** — technical interests, education, projects, problem-solving habits, strengths, failures, and evolving direction.
4. **The athlete** — collegiate tennis, competitive discipline, training, teamwork, family connection, and what sport reveals about character.
5. **The creator** — social-media content, communication, audience, experiments, voice, and craft.
6. **The person in progress** — current interests, books, food, places, culture, friendships, hobbies, questions, and future ambitions.

These are threads, not labels to stack in a headline. The final story should show how they connect.

### Discovery directive for an AI collaborator

Run a real discovery interview before drafting final copy. Ask for stories and examples—not résumé bullet points—about:

- childhood, family, Vietnam, the move, and adapting to English and American life;
- formative curiosities, technical obsessions, first things built, and meaningful failures;
- the reason for studying Electrical Engineering and the relationship between hardware, software, systems, and the internet;
- tennis history, team experience, routines, lessons, and memorable matches or moments;
- content-creation goals, audience, formats, and the kind of public voice the person wants;
- current projects, interests, media, books, food, travel, and collections or “rabbit holes”;
- values, changes of mind, goals, and the feeling they want visitors to leave with.

Use the answers as source material. Preserve the person's natural language where it has character; edit for clarity without sanding away their voice.

## 5. Proposed Information Architecture

Start lean. A recommended first navigation is:

```text
Home · Work · Writing · About · Now · Contact
```

“Life” can be a dedicated page or woven through the site, depending on the amount and quality of real material. Avoid creating empty top-level pages simply because a conventional sitemap includes them.

### Home (`/`)

The entry point and narrative sampler—not a generic hero followed by cards.

Include, in an intentional sequence:

- a concise, distinctly personal introduction rooted in the present;
- a glimpse of what the person is building, studying, competing in, or thinking about now;
- selected work with context, not an exhaustive portfolio;
- recent or featured writing;
- a controlled glimpse of life outside work (e.g., tennis, food, photographs, cultural touchstones, an active obsession);
- pathways to deeper pages;
- a clear, human invitation to connect or continue exploring.

### About / Story (`/about`)

Tell a coherent story rather than reproduce a chronological résumé. A useful arc is:

```text
Origin → curiosity → adaptation → engineering / tennis / creating → today → direction
```

Include only personal details the owner is comfortable publishing. A timeline may support the story, but must not replace it.

### Work (`/work`)

Curate a small number of substantial projects, experiments, research efforts, team contributions, or technical case studies. Each featured item should answer:

1. What was the problem or question?
2. Why did it matter to this person?
3. What did they actually do or build?
4. What was difficult, uncertain, or surprising?
5. What decisions did they make and why?
6. What did they learn or change their mind about?
7. What is the outcome, artifact, or next step?

Technology names, links, and visuals are supporting evidence—not the story. Be transparent about individual contribution in team work.

### Writing (`/writing`)

The intellectual layer of the site. Prefer “Writing,” “Notes,” or another authentic label over “Blog” if that better matches the voice.

Potential content types:

- technical explanations and systems rabbit holes;
- longer essays and reflections;
- observations and smaller notes;
- content about learning, competition, culture, creativity, and changing one's mind.

Writing should show how the person reasons and communicates. Organize it with clear titles, dates, reading time where helpful, stable URLs, tags only when useful, and durable archives.

### Life (`/life`) — optional but valuable when material is real

Use artifacts and stories, not a generic emoji hobby grid. Possible material includes photographs, tennis, food, cars, games, books, music, travel, personal collections, or current fascinations. It should make the visitor feel they could have a real conversation with the person.

### Now (`/now`)

A lightweight, periodically updated present-tense page: what the owner is currently building, learning, reading, thinking about, training for, enjoying, or trying to improve. Include a “last updated” date.

This keeps the site alive without forcing the homepage to become a feed.

### Contact (`/contact`)

Simple and human. Provide the desired channels (email and relevant professional or social platforms), a short closing line in the owner's voice, and no unnecessary contact form if direct contact is preferable.

### Optional later additions

Add only after content exists: `/uses`, `/books`, `/photos`, `/ideas`, `/principles`, `/changelog`, or a carefully moderated guestbook. Small discoveries or easter eggs are welcome only if they arise naturally from the person's character.

## 6. Content Model

The CMS/content system should use structured, reusable fields while allowing rich, personal writing.

| Content type | Essential fields | Purpose |
| --- | --- | --- |
| Profile / About | narrative sections, selected facts, photos, links, visibility | Personal story and enduring identity |
| Project / Case study | title, role, status, problem, motivation, process, decisions, outcome, lessons, media, links, publish state | Evidence of engineering judgment and execution |
| Writing piece | title, subtitle/dek, body, category, tags, date, featured media, draft/published | Durable archive of thinking |
| Now update | current focus, building, learning, reading, thinking, outside-work focus, last updated | Present-tense context |
| Life artifact | type, story/caption, media, date/location when appropriate, visibility | Human specificity without a résumé feel |
| Social / creator item | platform, format, topic, link/embed, context, featured flag | Connect creator work to the larger site story |
| Site settings | social links, navigation, homepage features/order, SEO defaults, contact details | Owner-controlled presentation |

Every publishable item should support at least: draft/published status, preview, stable URL/slug, featured control, timestamps, image alt text where relevant, and future editability.

## 7. Presenting the Key Dimensions

### Engineering and work

- Show the *why*, tradeoffs, and learning—not just screenshots and a technology stack.
- Make technical credibility legible to both technical and nontechnical visitors.
- Prefer a few substantial stories over many shallow projects.
- Reveal limits and uncertainty honestly; this demonstrates judgment.

### Writing and thinking

- Publish because there is a useful observation, analysis, story, or question—not to satisfy a content calendar or SEO quota.
- Make pieces scannable: strong titles, visible hierarchy, readable typography, summaries when useful, and intentional internal links.
- Allow nontechnical writing. The whole person is more compelling than a narrow stream of tutorials.

### Social / content-creator dimension

- Treat social content as a real creative practice, not a row of follower counts.
- Select work that shows voice, craft, ideas, community, or useful communication.
- Link outward where appropriate, but ensure the owned website remains the durable hub and archive.
- Use platform embeds sparingly; they must not dominate performance or the page's visual language.

### Collegiate tennis dimension

- Present tennis as a meaningful part of life and character, not a decorative extracurricular badge.
- Explore competition, discipline, resilience, team culture, training, family history, and lessons that genuinely connect to the person's approach to work and life.
- Use real stories, photographs, results, or reflections only with context and permission; do not create a generic athletics résumé section.

### Vietnam-to-U.S. / immigrant dimension

- Center the person’s own framing: origin, family, language, adaptation, opportunity, and continuity.
- Do not reduce this story to a sentimental origin story or a generic “overcoming adversity” trope.
- Show specificity through sensory memories, routines, places, food, language, and meaningful turning points when the owner chooses to share them.
- Keep agency visible: adaptation and determination matter as much as difficulty.

## 8. Homepage Narrative Principles

The homepage should progressively reveal the person instead of trying to state every identity at once.

Recommended progression:

```text
Present self → current world → selected evidence → thinking → life → invitation
```

Directives:

- The first screen should be clear, calm, and specific; it may be surprising, but it must answer who the person is and why explore further.
- Avoid a generic “Hi, I’m [Name], a passionate [role]” opening.
- Use modular sections with strong editorial transitions, not a dashboard of interchangeable cards.
- Give every section a reason to exist. The homepage should curate; deeper pages should archive.
- Keep calls to action modest. Discovery and understanding are more important than conversion pressure.

## 9. UX and Visual Principles

- Let visual language emerge after discovery; do not begin by choosing “brutalist,” “minimal,” “editorial,” or “futuristic.”
- Favor typography, spacing, hierarchy, photography/artifacts, and editorial restraint over decorative effects.
- Make navigation compact, predictable, and useful.
- Design for reading and exploration across mobile, tablet, and desktop.
- Use animation only when it communicates hierarchy, spatial relationship, state, or genuine delight. Respect reduced-motion preferences.
- Build intentional empty space. Density should serve the content, not signal technical sophistication.
- Use accessible contrast, visible focus states, meaningful headings, semantic page structure, and keyboard-operable interactions.
- Present media with captions or context where they add meaning.
- Treat details—URLs, image quality, loading states, broken links, and responsive behavior—as part of the personal signal.

## 10. Explicit Anti-Patterns

Do **not** produce a generic developer or AI-generated personal site. Avoid:

- a hero that reads “passionate developer,” “digital craftsman,” or “turning coffee into code”;
- giant technology-skill clouds, proficiency bars, or logo walls;
- fifteen indistinguishable project cards;
- résumé chronology masquerading as an About page;
- vague claims without projects, writing, outcomes, or stories to support them;
- generic stock imagery, default developer illustrations, or AI-generated filler art;
- excessive gradients, glassmorphism, giant rounded cards, blur effects, or motion used as decoration;
- fake personality, overconfident brand language, or invented anecdotes;
- content written for keywords or platform trends with no personal point of view;
- too many navigation categories, novelty interactions, or content types with no actual content;
- social feeds, follower counts, and embeds that make the owned website feel secondary;
- an admin panel so complex that ordinary updates still require code changes.

## 11. Quality: SEO, Accessibility, and Performance

### SEO

- Create people-first, original content grounded in genuine experience and useful thought.
- Use descriptive titles, concise meta descriptions, canonical URLs, social sharing metadata, and clean stable slugs.
- Use semantic HTML and logical heading structures; this supports both discoverability and accessibility.
- Build internal links that genuinely help readers explore related work and writing.
- Do not chase keyword-heavy, low-substance content. Search visibility is a consequence of a useful archive, not the site’s personality.

### Accessibility

- Meet a high bar for keyboard navigation, focus visibility, semantic landmarks, heading order, color contrast, form labels, and alt text.
- Captions/transcripts should be available for meaningful video or audio.
- Never convey information solely by color, motion, or hover state.
- Test with mobile zoom, screen readers where possible, and reduced-motion settings.

### Performance

- Prioritize fast loading, responsive interactions, visual stability, and a clean mobile experience.
- Optimize images and use appropriately sized, modern formats; lazy-load noncritical media.
- Avoid shipping large video, animation, font, embed, or JavaScript payloads without a clear benefit.
- Keep third-party scripts and social embeds intentional and deferred where feasible.
- Treat Core Web Vitals and real-device testing as product-quality requirements.

## 12. Admin / Editorial CMS Requirement

The site must include an authenticated owner-facing administration experience, ideally available at a predictable route such as `/admin`.

### Owner should be able to update without code

- bio and About-page copy;
- projects and project order;
- writing, drafts, publishing dates, tags, and featured images;
- `/now` content and last-updated date;
- life artifacts, photographs, links, and captions;
- social links and creator content;
- homepage feature choices and ordering;
- navigation labels and basic site settings.

### Editorial requirements

- secure authentication and owner-only authorization;
- structured editors appropriate to each content type;
- draft, preview, publish/unpublish, and scheduled publishing where useful;
- upload/media management with accessible alt-text prompts;
- guardrails against accidental publication and irreversible deletion;
- good mobile and desktop usability;
- a simple dashboard that surfaces current content and recent changes.

This is a custom, purpose-built editorial layer—not a mandate to reproduce a full general-purpose CMS. The source code may still live in version control for functional or design changes; the CMS owns normal content updates.

## 13. Starting Specification, Not Final Truth

This blueprint defines the product direction and constraints. It does **not** authorize an AI to invent final biography, achievements, personal values, work history, visual motifs, or writing voice.

Before implementation or final content/design decisions:

- [ ] Complete the discovery interview and record accurate source material.
- [ ] Confirm audiences and the primary visitor action.
- [ ] Choose what personal material is public, private, or omitted.
- [ ] Identify the first 3–5 real projects or artifacts worth featuring.
- [ ] Identify initial writing/topics that the owner genuinely wants to publish.
- [ ] Decide whether Life merits a dedicated page in v1.
- [ ] Establish an authentic visual direction from the material—not a template.
- [ ] Select a technical stack and CMS only after the editorial workflow is clear.
- [ ] Define a v1 scope that can ship polished and expand over time.

## 14. Known Personal Context (Only What Has Been Shared)

Use the following as factual starting context. Do not embellish or infer unprovided details.

- The owner grew up in **Ho Chi Minh City, Vietnam**.
- Childhood memories shared include riding a bike around the neighborhood, a close-knit community, long school days, after-school lessons, and spending significant time on tennis courts.
- The owner spent time with their father around clients and companies.
- The owner moved to the United States at approximately **11 years old**, less than ten years before the conversation in which this was shared.
- Early impressions of the U.S. included major differences in weather, food, people, language, and community.
- There was a significant language barrier, but the owner described being motivated and determined to learn English, adapt, and succeed rather than being shy or embarrassed.
- Things missed about Vietnam include food, family, language, people, and routines—particularly getting dinner at a specific place after tennis with their father and sister.
- The owner sees the U.S. as a place offering opportunity to turn dreams into reality.
- As a child, the owner was fascinated by breaking or “hacking” systems, cars, how things work behind the scenes, multiplayer games, and how the internet works.
- The owner is studying **Electrical Engineering**.
- The owner is a **collegiate tennis player at the University of California, Santa Barbara**.
- The owner creates social-media content.
- The owner wants an authenticated, website-based admin interface so normal site edits can be made without touching the codebase.

## 15. Instruction to Future AI Collaborators

Use this document as a north star. Protect the distinction between a living personal archive and an ordinary developer portfolio. Ask before assuming. Prefer fewer, more truthful elements over a full site of generic sections. Make every page earn its place, make every claim supportable, and preserve the owner's voice.

The correct next move is discovery and curation—not visual production or implementation until the underlying person, story, priorities, and available artifacts are understood.

## 16. Implementation Status — Interactive Editor Slice (September 12, 2026)

The owner asked to begin implementation and specified Vercel hosting, with Supabase for any required backend. Because the authenticated `/admin` requirement creates a real backend need, the current reversible architecture is:

- Next.js App Router for the public site and owner interface;
- Vercel as the deployment target;
- Supabase Auth, Postgres, and Storage as the intended editorial backend;
- structured content separated from presentation;
- local factual content as a temporary public fallback until the Supabase project is connected.

Implemented in the first vertical slice:

- global application shell and responsive navigation;
- Shield-inspired navigation focus behavior with equivalent keyboard treatment and a separate mobile interaction;
- a narrative homepage using only facts already recorded in this blueprint;
- a first Story page that explicitly labels itself incomplete;
- a deliberately empty Writing archive rather than invented articles;
- an `/admin` shell with a Supabase-aware setup, sign-in, and owner-verification path;
- an initial owner-scoped content schema with Row Level Security;
- basic metadata, sitemap, robots policy, reduced-motion handling, and a custom favicon.

Implemented in the interactive editor slice:

- the canonical Vercel URL changed to `https://thehobbiest.vercel.app`;
- an explicit light / dark / system appearance control, with system mode tracking live operating-system changes;
- a restrained light-purple, light-orange, and red accent system across both appearances;
- an efficient canvas cursor trail with easing that creates a light air-drag effect, limited to precise pointers and disabled for reduced-motion preferences;
- a contextual dropdown for every desktop navigation tab, with matching keyboard focus behavior, Escape dismissal, and a temporary blur over background content;
- real `/admin` forms for the homepage opening, homepage field note, and Story opening;
- private draft and immediate publish actions, server-side owner re-verification, public published-content reads, and safe local-copy fallbacks;
- explicit Supabase table grants and Row Level Security policies so anonymous visitors can only read published records.

The canonical deployment target is now `https://thehobbiest.vercel.app`. Until Supabase environment variables and the authorized owner account are connected, `/admin` presents a safe setup state and the public pages continue to use the factual local copy.

No job history, projects, tennis results, dates, metrics, quotes, achievements, or social statistics were invented. The editor currently covers three high-value page sections; larger collections such as Work, Writing, Now, and Media remain later slices.

### Decisions still requiring owner input

- Exact public display name and preferred short name.
- Primary audience and the one action a first-time visitor should most often take.
- Which biographical details are public, private, or omitted.
- Three to five real projects or artifacts for the first Work collection.
- The first writing piece or draft in the owner’s own voice.
- Preferred contact email and which social profiles should be public.
- Supabase project connection and the single authorized owner email.
- Whether Life should be a first-release page or remain woven into the other pages.
