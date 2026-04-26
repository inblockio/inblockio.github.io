# Prototype landing page design alignment

**Date:** 2026-04-26
**Scope:** `prototype/en/` and `prototype/de/` (shared CSS in `prototype/css/`)
**Goal:** Make the prototype landing page (the future uniform inblock.io landing for all projects) visually coherent with the established `index-v2.html` design system, plus two surgical content fixes.

## Background

`index-v2.html` is the agentic.inblock.io landing page. It uses a refined dark/stone aesthetic with Sora display + body, JetBrains Mono accents, warm orange `#E8611A`, and structured component patterns (mono kickers, badges, dashed/solid card borders).

`prototype/en/index.html` and `prototype/de/index.html` share the structure that will become the uniform landing for all inblock.io projects. They currently use Clash Display + Satoshi, neon orange `#ef5401`, white surfaces, and a light-themed nav. The structure is right; the skin is wrong.

The About Us backlink badge (linking agentic.inblock.io → inblock.io) was completed by another agent and is out of scope here.

## Approach

In-place restyle. Keep prototype's existing HTML structure, mega-menu nav scaffolding, and i18n setup. Retune the shared CSS bundle so both `/en/` and `/de/` get the upgrade in one pass.

## Design tokens (target)

Adopt index-v2's token vocabulary in `prototype/css/variables.css`:

| Token | New value | Replaces |
|---|---|---|
| `--bg` | `#fafaf9` (stone) | `#ffffff` |
| `--surface` | `#ffffff` | `#ffffff` (kept) |
| `--surface2` | `#f5f5f4` | `#fafafa` |
| `--ink` | `#0c0a09` | (new) |
| `--ink-soft` | `#1c1917` | (new, replaces `#1a1a1a`) |
| `--text` | `#1c1917` | `#1a1a1a` |
| `--dim` | `#78716c` | `--text-light` (`#6b7280`) |
| `--border` | `#e7e5e4` | `#e5e7eb` |
| `--primary` / `--accent` | `#E8611A` | `#ef5401` |
| `--accent-hover` | `#D4570F` | `#c44400` |
| `--accent-soft` | `rgba(232,97,26,0.10)` | (new) |
| `--accent-glow` | `rgba(232,97,26,0.15)` | (new) |
| `--proof-green` | `#2a8a5a` | (new) |
| `--proof-green-soft` | `rgba(42,138,90,0.12)` | (new) |
| `--ease-cross` | `cubic-bezier(0.7,0,0.3,1)` | (new) |

Typography:
- `--font-display: 'Sora', -apple-system, sans-serif;` (replaces Clash Display)
- `--font-body: 'Sora', -apple-system, sans-serif;` (replaces Satoshi — index-v2 uses Sora for both)
- `--font-mono: 'JetBrains Mono', 'Menlo', monospace;` (new)

Load via Google Fonts in each entry HTML (or via `@import` in `variables.css`). Drop the local `.woff2` `@font-face` rules for Clash + Satoshi.

## Component changes

### Nav (`nav.css`)
Move from light, in-flow nav to fixed dark translucent bar:
- Position fixed, height 56px, collapses to 48px on `.scrolled`.
- Background `rgba(12,10,9,0.92)` with `backdrop-filter: blur(16px) saturate(1.2)`.
- Bottom border `1px rgba(255,255,255,0.06)`.
- Nav link colour `rgba(255,255,255,0.55)`, hover white on `rgba(255,255,255,0.06)`.
- CTA button uses `--accent` with glow on hover.
- Lang switch + hamburger keep existing affordances, restyled to dark.
- Mega menus: dark surface, light text, mono section headings.

### Hero (`hero.css`)
Replace white hero with dark hero matching index-v2:
- Full-bleed `--ink` background, min-height 100dvh.
- Animated grid pulse layer (60px grid, accent-tinted, radial mask).
- Centred radial glow blob behind headline.
- Mono kicker label above H1 (e.g. `OPERATIONAL TRUST FOR DIGITAL SOVEREIGNTY` in JetBrains Mono, letter-spaced, dim accent).
- H1 uses Sora 600/700, white.
- Sub copy in `rgba(255,255,255,0.7)`.
- CTA buttons keep dark-mode treatment from index-v2.

### Sections (`sections.css`)
- Section header: optional mono kicker line above H2, then H2 in Sora, then sub paragraph in `--dim`.
- Drop alternating `--section-1`/`--section-2`/`--section-3` strong tonal split. Replace with subtle `--bg` ↔ `--surface2` swaps, separated by hairline borders rather than colour blocks.
- `--section-dark` keeps for the CTA banner; restyle with stone palette.

### Cards (`cards.css`)
- Card surface `--surface`, 1px solid `--border`, radius 12px.
- Hover: lift 2px + soft shadow, no colour shift.
- Product/team/news cards: title in Sora 600, mono micro-label (role / date / spec) in JetBrains Mono small caps `--dim`, body in `--text`.
- Feature lists: bullet replaced by mono `▸` glyph in `--accent`.

### Footer
Restyle to stone: `--ink-soft` background, `--dim` body text, mono micro-bottom-row, accent links on hover. Drop the canvas decoration if it clashes with the new aesthetic; keep it if it fits.

## Content + link fixes (Wave 2)

These are unrelated to the visual restyle but get bundled into the same release.

1. **Mega menu Products → Aqua-Secured Agents list item:**
   - `prototype/en/index.html:90`: `<li><a href="https://agentic.inblock.io">Agent Framework</a></li>` → `<li><a href="https://agentic.inblock.io">Trust Infrastructure for High-Risk Agents</a></li>`
   - Mirror in `prototype/de/index.html`.
   - The `<p class="mega-menu__desc">Verifiable AI Agent Operations</p>` descriptor stays as-is per user.

2. **Solutions → AI Operational Security:**
   - Mega menu list item `prototype/en/index.html:106`: change `href="#"` → `href="https://agentic.inblock.io"` (with `target="_blank" rel="noopener"`).
   - Use Case panel card `prototype/en/index.html:322-324`: wrap card content (or add a "Learn more" link) pointing to `https://agentic.inblock.io`.
   - Mirror both in `prototype/de/index.html`.

## Out of scope

- Animations from `index-v2.html` (`.proof-arena`, `.cap-arena`) are NOT ported into the prototype landing.
- About Us backlink badge: already done by another agent.
- `notarization-demo.html`: untouched.
- Section copy/structure: only the link/string fixes above. Hero copy, products, solutions text remain.

## Risks / things to watch

- **Font swap risk:** existing local Clash/Satoshi font files become orphaned. Plan to keep them in `prototype/assets/fonts/` for one release in case rollback is needed, then prune.
- **Section background simplification** could read flatter than today. Mitigation: hairline borders between sections + restrained accent treatments to keep visual rhythm.
- **i18n coupling:** all CSS changes affect `/de/` automatically. No de-only tweaks expected.

## Sequencing

1. Restyle `variables.css` (tokens + fonts).
2. Restyle `nav.css`.
3. Restyle `hero.css`.
4. Restyle `sections.css` + `cards.css` + footer rules.
5. Apply Wave 2 content/link fixes in `en/` + `de/`.
6. Visual diff check against `index-v2.html`.

## Acceptance

- Prototype landing nav, hero, sections, cards, and footer are visually coherent with `index-v2.html` (same fonts, palette, spacing rhythm, component motifs).
- Mega-menu copy and AI Operational Security links updated in both `en/` and `de/`.
- No regression in mega-menu interaction, mobile responsiveness, or scroll transitions.
