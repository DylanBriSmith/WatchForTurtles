# Watch for Turtles — Project Knowledge

## Project Overview

**Watch for Turtles** (WFT) is a static promotional website for a post-punk band of the same name. The site presents band info, music releases, contact details, and photos through a retro-styled interface with nostalgic 90s/early-2000s web design aesthetics.

- Genre: Post-punk
- Active since: 2022
- Members: Four people
- Influences: Wire, Fugazi, radiator noise

---

## Directory Structure

```
/home/drdp/bandsite/
├── index.html           # Primary Windows 95-style interface
├── index2.html          # Main "Peach Pit" interface (production)
├── PEACH_PIT.md         # Peach Pit architecture, JS contracts, Next.js migration notes
├── script.js            # Core interaction logic (drag, windows, clock); shared by index + index2
├── gsap-peachpit.js     # GSAP animations (Peach Pit only; requires body.theme-peachpit)
├── instagram-config.js  # Featured Instagram post URL for index2 embed
├── effects.js           # Visual effects (turtle animation, cursor trails); skipped on Peach Pit
├── style.css            # Theme for index.html (Windows 95)
├── style2.css           # Theme for index2.html (Peach Pit)
├── media/
│   ├── Background.jpeg
│   ├── Background2.png
│   ├── Background3.JPG
│   └── logos/
│       ├── music.gif
│       ├── music2.gif
│       ├── mail.gif
│       └── notebook.gif
└── .claude/
    └── settings.local.json   # Claude Code permissions
```

---

## Tech Stack

- **HTML5** — vanilla, no templating
- **CSS3** — no preprocessors, custom properties (variables)
- **JavaScript (ES6+)** — vanilla, no frameworks or build tools
- **GSAP 3 + ScrollTrigger (CDN)** — Peach Pit page only (`gsap-peachpit.js`)
- **Google Fonts (CDN)** — VT323, Press Start 2P
- **Font Awesome 6.6.0 (CDN)** — icons

**No package.json, no npm, no build step.** Open in a browser and it works.

---

## Key Files

### `index.html`
- Windows 95-style desktop UI
- Draggable icons: Music, Bio, Photos, Contact, Instagram, TikTok
- Four draggable popup windows with band content
- Scrolling ticker bar at top
- Sticky notes on desktop
- Taskbar at bottom with a live clock
- Visitor counter (`00413`), "now playing" indicator
- Font: VT323 (retro pixel)

### `index2.html`
- Alternative "Peach Pit" aesthetic
- Header with band name and "post-punk" tagline
- Navigation buttons instead of desktop icons
- Same draggable window system, different style
- Yellow text on dark background, aqua accents
- Sticky notes with band members' informal messages
- Ticker bar at bottom (reversed from index.html)

### `script.js`
- **Icon randomization** — scatters desktop icons at page load
- **Drag system** — mouse + touch events, 4px threshold to distinguish drag from click
- **Z-index management** — brings dragged/clicked windows to front
- **`openWindow(id)`** — shows a window, cascades position (22px offset per open window)
- **`closeWindow(id)`** — hides a window, removes its taskbar button
- **Taskbar** — dynamically adds/removes buttons as windows open/close
- **Clock** — updates `HH:MM` format every second

### `effects.js`
- **Turtle animation**
  - Spawns packs of 3 animated turtle emoji characters
  - Sine-wave "walking bob" motion
  - Bounce off screen edges
  - Two packs: one from left, one from right, staggered by 1600ms
  - Runs at 60fps via `requestAnimationFrame`
- **Cursor trail**
  - Spawns `✦ · ✧ ⋆` symbols following the mouse
  - 40ms throttle
  - Fades out over 700ms
  - Color: semi-transparent yellow (`#f9f086`)
- Injects its own CSS dynamically

---

## CSS Themes

### `style.css` — Windows 95
| Property | Value |
|---|---|
| Background | `#0d0d0d` |
| Accent | `#ff3c78` (hot pink) |
| Font | VT323 (monospace pixel) |
| Icon labels | Comic Sans |
| Windows | Beveled 3D borders (bright top-left, dark bottom-right) |
| Titlebar | Gradient blue (`#000c7a` → `#0050c8`), white text |
| Taskbar | Gray chrome, fixed bottom |
| Overlay | CRT scanlines (repeating linear gradient, pointer-events: none) |

Z-index tiers: `10, 20, 200, 500, 8000, 9000, 9999`

### `style2.css` — Peach Pit
| Property | Value |
|---|---|
| Background | `#000` + 62% dark overlay |
| Primary color | `#f9f086` (yellow) |
| Accent | `#b7fff7` (aqua) |
| Font | Times New Roman (serif) |
| Buttons | Yellow with aqua outset border |
| Windows | Aqua borders, dark background |
| Clock | Fixed corner, no taskbar |
| Icons | Hidden (`display: none`) |

Both themes share: sticky notes (yellow, rotated 2.8deg), `@media (max-width: 768px)` responsive adjustments, and the same window/drag mechanics.

---

## Hardcoded Content

### Releases
| Title | Year |
|---|---|
| SHELL SHOCK | 2026 |
| Concrete Garden | 2025 |
| NOISE COMPLAINT | 2025 |
| Hollow Frequencies | 2024 |

### Contact Emails
- `booking@watchforturtles.com`
- `press@watchforturtles.com`
- `hello@watchforturtles.com`

### Links (currently `#` — not live)
- Spotify, Apple Music, Bandcamp
- Instagram, TikTok, Facebook

---

## Current Development State

- Social links point to `#` (placeholders)
- Sticky note in index2.html: "No music out yet"
- Ticker contains informal/profane messages — suggests casual dev state
- Instagram and TikTok links flagged in sticky notes as needing updates

---

## Architecture Notes

- **Two-theme pattern** — `index.html` + `style.css` (authentic retro) vs. `index2.html` + `style2.css` (modern retro)
- **Desktop metaphor** — UI mimics a Windows 95 OS environment
- **Data attributes for behavior** — `data-window` and `data-href` drive the JS logic declaratively
- **Custom drag** — no jQuery or library; raw mouse/touch delta calculations
- **Touch support** — full mobile compatibility alongside mouse events
- **Static-first** — zero dependencies, no backend, no API calls
- **Separated concerns** — `script.js` (logic) vs. `effects.js` (visual flair)

---

## Claude Code Settings

`.claude/settings.local.json` permits `WebFetch` from:
- `www.peachpitmusic.com` — likely design inspiration
- `www.kinkygirlsfrombigcities.com` — likely another band reference
