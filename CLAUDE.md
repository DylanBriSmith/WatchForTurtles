# CLAUDE.md — Watch for Turtles

Vanilla HTML/CSS/JS band website. No build step — open `index.html` directly in a browser or push to GitHub Pages (auto-deploys via Actions in ~60s).

## Files

- `index.html` — main page
- `site.css` — all styles (cache-bust query param `?v=N` on the `<link>` tag when making CSS changes)
- `script.js` — draggable windows, nav, lightbox, mailing list, clock
- `gsap-peachpit.js` — GSAP 3 page intro + window open/close animations
- `config.js` — mailing list UUID/URL, Instagram embed URL
- `media/` — background + show photos (WebP + JPEG fallbacks)
- `fonts.md` — random font pool reference

## Random Font Picker

Inline `<script>` in `<head>` picks a random font from a 23-entry array on every page load and sets `--band-font` / `--font-serif` CSS variables. To add a font: append `['Font Name', 'Font+Name+URL+Encoded']` to the array. All fonts are loaded from Google Fonts.

## Deployment

```bash
git add -A && git commit -m "..." && git push origin main
# GitHub Actions deploys to watchforturtles.ca in ~60s
```

## gstack

Install gstack so you have the full skill suite:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```

Use `/browse` from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available skills:

`/office-hours` `/plan-ceo-review` `/plan-eng-review` `/plan-design-review` `/design-consultation` `/design-shotgun` `/design-html` `/review` `/ship` `/land-and-deploy` `/canary` `/benchmark` `/browse` `/connect-chrome` `/qa` `/qa-only` `/design-review` `/setup-browser-cookies` `/setup-deploy` `/setup-gbrain` `/retro` `/investigate` `/document-release` `/document-generate` `/codex` `/cso` `/autoplan` `/plan-devex-review` `/devex-review` `/careful` `/freeze` `/guard` `/unfreeze` `/gstack-upgrade` `/learn`
