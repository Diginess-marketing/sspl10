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

## Type
- **Display** (headings, nav, buttons, labels): IBM Plex Sans Condensed, 600/700, UPPERCASE. Italic 700 for the accent word.
- **Body**: Inter 400–600, sentence case.
- **Tagline / hero support**: Roboto Condensed 700.
- **Brush lettering** (hero title, "Real Players…", future "It's a Movement"): supplied image/SVG files only. Never imitate with a font.

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
