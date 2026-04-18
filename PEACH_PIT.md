# Peach Pit site (`index2.html`) — architecture & handoff

This document is for **humans** and **AI tools** maintaining the band’s **Peach Pit** layout (retro desktop + scrollable Instagram panel).

## Entry point

| File | Role |
|------|------|
| `index2.html` | Main page: markup, script order, `class="theme-peachpit"` on `<body>`, `class="peach-pit-scroll"` on `<html>`. |
| `style2.css` | Peach Pit styles: theme variables, fixed collage layer, scroll panel, components. |
| `script.js` | Shared app shell: windows, drag, lightbox, mailing form, clock. **Peach Pit** hooks optional globals (below). |
| `instagram-config.js` | One public string: featured post URL (Instagram has no “latest” on static sites without API). |
| `gsap-peachpit.js` | GSAP only for Peach Pit: intro, window animations, Instagram embed + ScrollTrigger. |
| `effects.js` | Turtles / cursor trail — **skipped** when `body` has `theme-peachpit`. |

## Theme markers (CSS / HTML contract)

- **`html.peach-pit-scroll`** — Enables document scroll (`overflow-y` on `<html>`). Needed alongside the base `html, body { overflow: hidden }` rule in `style2.css`.
- **`body.theme-peachpit`** — Turns on Peach Pit–specific rules: fixed collage `::before`, scroll panel, desktop `pointer-events` tweak, etc.
- **`#ig-scroll-panel`** — Full-width band below the first `100vh`; solid background `--ig-scroll-bg`.
- **`#ig-latest`** — Inner section for titles + embed frame.

Changing these names requires updating **`style2.css`**, **`index2.html`**, and **`gsap-peachpit.js`** (search for each id/class).

## JavaScript contracts (integration surface)

### `window.peachPitGsap` (set by `gsap-peachpit.js` only on Peach Pit pages)

`script.js` calls these **if present** (optional chaining). No Peach Pit file loaded → windows still work, no animation.

| Method | Called from | Purpose |
|--------|-------------|---------|
| `prepareOpen(win)` | `openWindow`, taskbar restore | Set initial opacity/scale before `visibility: visible`. |
| `animateOpen(win)` | After window shown | GSAP timeline for shell + inner content. |
| `animateClose(win, done)` | `closeWindow` | Animate out, then `done()` hides window + taskbar. |

### `window.PEACH_PIT_INSTAGRAM_POST_URL` (set by `instagram-config.js`)

- Empty string → fallback UI in `#ig-embed-fallback`.
- Full Instagram post permalink → `blockquote.instagram-media` + `instagram.com/embed.js`.

### Globals from `script.js` (used by inline patterns / devtools)

- `openWindow(id)`, `closeWindow(id)` — kept as global `function` declarations for `<button>`-free pages and debugging.

## Z-index mental model (fixed UI vs scroll panel)

Rough order (see `style2.css`): fixed collage `::before` (0) → `.bg-overlay` (1) → `.ig-scroll-panel` (15) → `.desktop` (10) is **below** panel so scroll content shows; header/nav (~50), windows (~200), scanlines (high), lightbox (9000+).

## Migrating to Next.js (or similar)

**Goal:** Same UX — server-rendered or static export is fine; **GSAP must run only in the browser** (no `window`/`document` in server components).

1. **Create app** — `npx create-next-app@latest` (TypeScript optional). Use **App Router** if starting fresh.
2. **Assets** — Move `media/`, `style2.css`, images under `public/` (e.g. `public/media/...`). Update CSS `url(...)` paths to `/media/...`.
3. **Page** — One route (e.g. `app/peach-pit/page.tsx`) that composes the same DOM structure as `index2.html` (or import raw HTML via `dangerouslySetInnerHTML` only if you accept the tradeoff — prefer JSX components).
4. **Scripts** — Load GSAP in a **client component** (`'use client'`) with `useEffect(() => import('./gsap-peachpit'), [])` or dynamic `import('gsap')` / `import('gsap/ScrollTrigger')`. Do **not** import `gsap-peachpit.js` in a Server Component.
5. **Config** — Replace `instagram-config.js` with `process.env.NEXT_PUBLIC_INSTAGRAM_POST_URL` (or `import.meta.env` in Vite). Document in `.env.example`.
6. **`script.js`** — Split into ES modules (`windows.ts`, `lightbox.ts`, …) and `import` from the client page or a single `initBandsiteShell()` called from `useEffect` once.
7. **CSS** — Import global CSS in `app/layout.tsx`: `import '../styles/style2.css'` or use CSS Modules for new code while keeping class names stable (`theme-peachpit`, etc.).
8. **Effects** — Keep turtle/trail behind a `useEffect` + `if (!document.body.classList.contains('theme-peachpit'))` guard.
9. **Build** — Run `npm run build` / `npm run start`; confirm ScrollTrigger after hydration (call `ScrollTrigger.refresh()` after layout if needed).

**Commands (reference)**

```bash
npx create-next-app@latest watchforturtles-web --typescript --eslint --app --src-dir
cd watchforturtles-web
npm install gsap
# Copy bandsite assets into public/ and port components incrementally
```

## Checklist before editing

- [ ] Peach Pit only? Confirm `index2.html` / `theme-peachpit` — `index.html` uses `gsap-animations.js`, not `gsap-peachpit.js`.
- [ ] Changing IDs (`ig-scroll-panel`, `ig-latest`) — update `gsap-peachpit.js` and CSS.
- [ ] New animation — prefer extending `gsap-peachpit.js`; keep `script.js` free of GSAP imports.
