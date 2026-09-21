# SSPL T10 — redesign workspace ("diginess temp")

Safe copy of the live site (`ssplt10.cloud/httpdocs`, Vite + React). **Never edit, push or deploy the real project (`../ssplt10.cloud`).** Promoting changes is a separate step, only when the user asks, on a new branch.

## Read first
- Brand rules: `docs/BRAND_GUIDE.md`. Tokens and shared classes: `src/styles/brand.css`.
- Reference section (copy its pattern): `src/components/StreetToStadium.tsx` + `.css`. Header: `Header.tsx`. Hero: `HeroBanner.tsx`.
- Originals of everything edited: `original/`. Verification tools: `tools/`.
- Run: `npx vite --host 127.0.0.1 --port 5199` (dummy `.env.local`; nothing reaches production).

## Assets: reuse what exists, do NOT ask the user for files that are already here
Before asking for any image/icon/logo, search the project. Only ask if it truly does not exist, or the user says a section needs new artwork.

| Need | Look in (under `public/`) |
|---|---|
| Player photos | `assets/players/`, `assets/players2/`, `images/`, root-level `*.webp/avif/jpg` |
| Banners / backgrounds | `assets/banners/`, `assets/backgrounds/`, `Website Banner Latest/` |
| Sponsors / partners / RPL | `Our-Sponsors/`, `Team-Advisors/` |
| Teams / state images | `Explore the teams/` |
| Match / event photos | `highlights/`, `assets/trials/`, `uploads/`, `lovable-uploads/` |
| Icons (3D set) | `assets/3d-icons/` (trophy, gavel, batsman, team, location, prize…) |
| Logos | colour logo `assets/img/sspl-logo-color.png` (light backgrounds); `logo.png` is WHITE (dark backgrounds only); `blue-logo.png`, `ssplt10-logo.*` |
| Social icons | `assets/img/social-media-*.png` |
| Hero art (user-supplied) | `assets/hero/` |
| Auction announcement art | `assets/announcement/` (helmet-ball, total-prize-pool-3crores; variants via `tools/build-announcement-assets.mjs`) |
| Fonts | `fonts/`, Google Fonts links in `index.html` |

Rules:
1. Search with `ls`/`find` (use `/usr/bin/head`, not `head`). Prefer the optimized variants that already exist: `*-480w/768w/1024w/1280w/1920w.avif|webp` with a `.png/.jpg` fallback — use `<picture>` + `srcSet` like `HeroSection` did.
2. Use line icons from Lucide (already installed) for UI icons; use existing 3D icons only where the section wants illustration.
3. Never crop/slice artwork out of a mockup screenshot — mockups are references, not asset sources. If a mockup shows a photo that isn't in the project, say so and ask for that one file.
4. Keep the real live content and links; do not copy invented copy from mockups.
5. New images the user adds go in the matching folder above (hero art in `assets/hero/`); do not duplicate existing files.

## Typography rule (mandatory — client asked for text uniformity)
Full spec: `docs/BRAND_GUIDE.md` → "Typography". Short version, applies to every section and page:
- Fonts: **IBM Plex Sans Condensed** (headings/labels/buttons/nav/numbers) + **Inter** (everything else). Nothing else (no Bebas/Poppins/Outfit/Rajdhani/Anton).
- Sizes/tracking come ONLY from tokens in `src/styles/brand.css` (`--brand-fs-*`, `--brand-ls-*`) or `.brand-*` role classes. No ad-hoc px/em on text, no fixed size on `p`/`span`/`div`.
- Same role = identical style everywhere. Uppercase tracking is only 0.14em (labels), 0.05em (buttons/nav), 0.04em (H3). Min text size 14px.
- Before finishing any UI work run `node tools/type-check.mjs --strict /` (and the path you changed); fix violations, don't add exceptions.

## Working rules
- One section at a time, mobile-first (check 320 / 390 / 820 / 1440 px, no horizontal scroll).
- Add section-specific CSS in the component's own file with a section prefix; use `--brand-*` tokens and `.brand-*` classes, no hard-coded colours.
- Be economical: targeted edits, no full-file rewrites unless needed, screenshots only when a visual check is requested or a layout is genuinely uncertain.
