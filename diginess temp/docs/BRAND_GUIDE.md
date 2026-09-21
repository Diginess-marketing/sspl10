# SSPL T10 — Brand & UI guide (v1)

One page. Every section of the site follows this. Code lives in `src/styles/brand.css`.

## Look in one line
Light, energetic, professional: white and pale-sky backgrounds, navy condensed headings, brand-blue accents, one lime action colour, brush-style accent words, big sharp photography.

## Colour
| Role | Token | Value |
|---|---|---|
| Headings / text on light | `--brand-navy` | `#0a1240` |
| Solid dark surfaces | `--brand-navy-deep` | `#021447` |
| Eyebrows, links, icons, accent words | `--brand-blue` | `#1f57d6` |
| Main action (buttons) | `--brand-lime` → `--brand-lime-deep` | `#dffc35` → `#a6cc00` |
| Light tints | `--brand-sky`, `--brand-sky-2` | `#eef5ff`, `#dfeeff` |
| Secondary text | `--brand-muted` | navy at 68% |
| Dividers | `--brand-line` | navy at 10% |

Rules: lime is for **one primary action per section**. Never put lime text on white. Body text is always navy or muted navy, never pure black.

## Typography — MANDATORY RULE (uniform text across the whole site)
Client feedback: text was inconsistent. This is the single source of truth; the tokens live in `src/styles/brand.css`, and the same scale is mirrored in the global heading/body rules in `src/index.css`. **Never type an ad-hoc px/em/rem for text — use a token or a `.brand-*` role class.**

**Two font families only**
- **IBM Plex Sans Condensed** (700, italic 700) — headings, labels, buttons, nav, numbers. Token `--brand-font-display`, Tailwind `font-display` / `font-heading`.
- **Inter** (400 / 500 / 600) — every running text, links, captions. Token `--brand-font-body`, Tailwind `font-body` / `font-sans`.
- Exceptions: **Roboto Condensed** only for the hero tagline (`.hero-banner`); **brush lettering** only as supplied/generated image files (never imitated with a font). Bebas Neue, Anton, Poppins, Outfit, Rajdhani are retired — do not reintroduce.

**The scale (one style per role; sizes are fluid where shown)**
| Role | Token / class | Size | Weight · case · tracking |
|---|---|---|---|
| Section title (H2) | `--brand-fs-h2` · `.brand-h2` | 38–64px | 700 · italic · UPPER · -0.005em |
| Sub-section title on inner pages (h2 in body copy) | `--brand-fs-h2-sub` | 28–40px | 700 · UPPER |
| Card / row / question title (H3) | `--brand-fs-h3` · `.brand-h3` | 17–20px | 700 · UPPER · 0.04em |
| Big figure (phone, hours, prize) | `--brand-fs-num` | 22–28px | 700 |
| Decorative ghost numeral (01–05, rank) | `--brand-fs-numeral` | 48px | 700 · italic |
| Lead (line under a title) | `--brand-fs-lead` · `.brand-lead` | 16–18px | Inter 500 · navy |
| Body (paragraphs, card text, links) | `--brand-fs-body` · `.brand-body` | 15px | Inter 400 · muted navy · line-height 1.6 |
| Small (captions, legal, fine print) | `--brand-fs-small` · `.brand-small` | 14px | Inter · **never smaller than 14px** |
| Label (eyebrow, badge, pill) | `--brand-fs-label` · `.brand-label` / `.brand-eyebrow` | 14px | 700 · UPPER · **0.14em** |
| Column / category heading | `--brand-fs-label-lg` · `.brand-label--lg` | 16px | 700 · UPPER · 0.14em |
| Button, nav link | `--brand-fs-btn` · `.brand-btn` | 15px | 700 (nav 600) · UPPER · 0.05em |

**Rules**
1. **Every uppercase text uses one of three trackings:** 0.14em (labels), 0.05em (buttons/nav), 0.04em (H3) — H2 is -0.005em. No other letter-spacing on text.
2. **Only one style per role, everywhere.** Same role = same font, size, weight, case, tracking, colour, in every section and page. If two things do the same job, they look identical.
3. **Body text is never a fixed size on `p`/`span`/`div`** — they inherit (global rule in index.css removed the old forced 17px/14px). Set size only on the element that owns the role.
4. **Italic** is for display type only: H2, the accent word, ghost numerals, player names, hashtag. Never in paragraphs.
5. **Colour:** headings navy (`--brand-navy`), lead navy, body `--brand-muted`, accent/eyebrow `--brand-blue`. On navy/dark surfaces: white headings, white 80% body, lime for one label. Never lime text on white.
6. **Case:** headings, labels, buttons, nav = UPPERCASE; sentences and paragraphs = sentence case. Titles are never mixed-case.
7. **Section titles** are either brush-lettering images (sized to the same visual weight as `--brand-fs-h2`) or `.brand-h2` — never a third style.
8. **One documented exception:** header buttons and the floating "Register Now" pill at small widths use `--brand-fs-btn-compact` (13px) so they fit at 320px.
9. New sizes are added to the tokens **first** (and to this table), never inline.

**Enforcement (run before saying a page is done)**
```
node tools/type-check.mjs --strict /          # redesigned pages: fonts + sizes + tracking must all be on the scale
node tools/type-check.mjs /faqs /how-it-works # legacy pages: fonts must be on-brand
node tools/type-audit.mjs / 1440              # prints every distinct text style per role, to spot drift
```
The check probes the tokens at the current viewport, so fluid sizes are validated at 1440 and 390px.

## Section pattern
```
<section class="brand-section [brand-section--tint]">
  <div class="brand-container">
    <p class="brand-eyebrow">Small blue label</p>
    <h2 class="brand-h2">Heading with <span class="brand-accent">accent</span></h2>
    <p class="brand-lead">One or two lines of support text.</p>
    …content…
  </div>
</section>
```
Sections are full-width bands with a thin top divider, alternating white and a soft sky tint. Vertical padding = `--brand-section-y`.

## Components
- **Buttons:** `.brand-btn--primary` (lime) and `.brand-btn--outline` (navy). Pill shape, 48px tall, uppercase condensed text.
- **Cards:** `.brand-card` — white, 1px line, 18px radius, soft shadow. **Icons:** line icons (Lucide) inside `.brand-icon` circles.
- **Photos:** real players, natural light, sharp; rounded 18px; never stretched or blurry.

## Responsive
Design mobile-first. Below 900px sections stack to one column; touch targets ≥ 44px; no horizontal scroll at 320px.

## Adding a redesigned section — checklist
1. Use the section pattern and tokens above; add only section-specific CSS in the component's own file (prefix classes with the section name).
2. Keep the real live content and links.
3. Check 320 / 390 / 820 / 1440 px.

## Assets
Before asking the user for any image/icon/logo, search the project first — see the asset map and reuse rules in `CLAUDE.md`. Optimized variants (`-480w…-1920w`, avif/webp) already exist for most photos; use them.
