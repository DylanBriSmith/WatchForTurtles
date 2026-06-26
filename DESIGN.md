# DESIGN.md — Watch for Turtles

Generated via /design-consultation — 2026-06-26

## North Star

**"Funny — the lowkey meme people."**

This site is not trying to look like a band website. It is trying to look like it was made by people who share weird niche internet humor in a group chat and then made a band. The humor is dry, not performed. The jokes are for people paying attention. Anyone who screenshots the ticker and sends it to a friend is the target audience.

The Windows 95 aesthetic is not nostalgia — it's the joke. A web app from 1996 serving a post-punk band in 2026 is inherently absurd. Lean into that. Don't explain it.

---

## Color Tokens

```css
--bg:      #0a0f0a   /* near-black, dark forest — the page base */
--card:    #141f14   /* slightly lighter dark green — minor use */
--muted:   #2a3a2a   /* dark forest — borders, secondary */
--primary: #c8e6c9   /* sage green — main text, nav borders */
--accent:  #ff6b35   /* warm orange — tagline, decorative dividers, focus rings */

/* Win95 chrome — do not deviate */
--win-bg:      #c0c0c0
--win-title:   #000080
--win-border-light: #ffffff
--win-border-dark:  #808080
--win-text:    #000000
--win-section: #000080
```

The background is a real photo of the band (Background3.webp). The dark overlay (`rgba(0,0,0,0.4)`) + vignette + scanline flicker layer on top of it. The palette is meant to read as a CRT monitor displaying a green terminal at night.

---

## Typography

### The Random Font IS the System

Every page load picks one font from the 23-entry pool in `index.html` and sets it as `--band-font` and `--font-serif`. This is the signature. It means the site looks different every time.

The font pool should stay within a specific vibe: horror display, grunge, experimental, or ostentatious. No clean sans-serifs. No "professional" fonts. Every entry should feel slightly wrong.

Current pool (see `fonts.md` for full list and vibes): Metal Mania, Creepster, Permanent Marker, Pirata One, Black Ops One, Rubik Glitch, Monoton, Rock Salt, Bungee Shade, Butcherman, Nosifer, Rubik Wet Paint, Eater, Rubik Burned, Rubik Beastly, Rubik Dirt, Rubik Puddles, New Rocker, Lacquer, Warnes, Climate Crisis, Miltonian Tattoo, Wallpoet.

**To add a font:** append `['Font Name', 'Font+URL+Encoded']` to the array in `<head>`. Test that it doesn't break layout (some fonts are very wide). All fonts must load from Google Fonts.

### Typography Roles

| Role | Property | Value |
|------|----------|-------|
| Band name / hero | `--band-font` | Random — changes each load |
| Body / nav / tagline | `--font-serif` | Same as `--band-font` |
| Window titles | `--font-serif` | Same as `--band-font` |
| Window section headers | `--font-serif` | `#000080`, borderline, `0.9rem` |
| Window body text | `--font-serif` | `#000`, `1rem`, bold |
| Press window (exception) | `!important` override | `'Comic Sans MS', cursive` |

The Comic Sans exception on `#window-press` is a deliberate joke. A press kit in Comic Sans. Do not remove it.

`--font-px` (`'Press Start 2P'`) is defined but unused. Reserve it for future easter eggs.

---

## Layout: The Windows 95 Desktop

The page is a fake operating system. The header is the taskbar (top). The desktop area is the icon zone. The mailing list bar is pinned to the bottom. The ticker is below that.

Users open windows by clicking nav buttons. Windows are draggable, closeable, and layered (z-index). The desktop metaphor is the entire interaction model.

### Z-Index Stack

```
9999  .scanlines       (CRT overlay — always on top)
 200  .window          (popup windows)
  50  .pp-header       (nav + band name — fixed top)
  10  .desktop         (icon drag zone)
   2  .vignette
   1  .bg-overlay
   0  .bg-photo
```

### Window Anatomy

```
┌─────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓  titlebar (#000080)  ▓▓▓ [✕] │
├─────────────────────────────────────────┤
│  // section-name                        │
│  ─────────────────────────────          │
│  body content                           │
│                                         │
│  [btn-link]  [btn-link--soon]           │
└─────────────────────────────────────────┘
```

- Border: `2px solid; border-color: #fff #808080 #808080 #fff` (Win95 emboss)
- Shadow: `2px 2px 0 #000`
- Default width: `380px` / photos: `440px` / shows: `420px`
- All windows: `max-width: 88vw`, `max-height: 80vh`

### Window Naming Convention

Window IDs end in a file extension that fits the content:
- `.exe` — interactive / executable (press.exe, music.exe)
- `.txt` — plain information (contact.txt)
- Section headers inside windows: `// noun` — always lowercase, looks like a code comment

---

## Voice and Copy

**The rules:**
- Lowercase where possible. UPPERCASE only for Win95-style button labels (nav buttons, link buttons inside windows).
- Direct and honest. "nothing out yet" beats "coming soon."
- Self-aware. The site knows it exists. It is allowed to make fun of itself.
- No marketing. No "we can't wait to share this with you." No "stay tuned."
- First person is fine. "no music out yet -Dylan" is better than any polished placeholder.

**The ticker (`marquee`) is the pressure valve.** It's where the unhinged stuff lives. Current: `"★ Sign up to our fucking newsletter ★   ★ Fuck you ★   ★ Stop gooning ★   ★ Maybe keep gooning actually ★   ★ Hi Ben ★   ★ Hi Julia ★"`. This tone is correct. New entries: short, lowercase-adjacent, funny in a way that rewards close reading. No announcements or promotional copy in the ticker.

**Asymmetry is a feature.** "Hi Ben ★ Hi Julia" targeting specific people who will see this and laugh is the whole joke.

---

## Mobile (≤768px)

### Current Behavior (shipped)

Windows become centered floating cards:
- `position: fixed; top: 12vh; left/right: 0; margin: auto`
- `width: 88vw; max-width: 400px; max-height: 75vh`
- Dragging is disabled (titlebar cursor reset to `default`)
- Nav goes to a stacked column, stretched full-width within side padding

This works. The Win95 chrome reads well on mobile. It does not need to be Linktree.

### Next Evolution (not yet shipped)

On narrow screens (≤480px), the overlay should be full-screen rather than a floating card. This removes the small-card-on-a-small-screen problem and keeps the Win95 identity:

```css
@media (max-width: 480px) {
  .window {
    top: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    border: none !important;
    box-shadow: none !important;
  }
  .window-titlebar {
    padding: 14px 16px;
    font-size: 1.1rem;
  }
}
```

The titlebar still shows (`music.exe`, `press.exe`, etc.) and the close button still works. It feels like a Win95 app going full-screen, not a mobile drawer.

This is a separate improvement — implement when the current mobile layout feels like a blocker for real users.

---

## What NOT to Do

- **Don't add anything that looks "professional" or "modern."** No gradients that go with the times. No glassmorphism. No skeleton loaders.
- **Don't make the fonts consistent across loads.** The randomness is the point.
- **Don't remove Comic Sans from press.exe.** It's the joke.
- **Don't put marketing copy in the ticker.** It's not a band news feed.
- **Don't add more windows without a reason.** Every window should earn its place by either making someone laugh or giving a booker/journalist something they need.
- **Don't make the site responsive in a generic way.** The weird, slightly-wrong experience is the experience.
- **Don't explain the aesthetic.** A band that explains the joke has killed the joke.

---

## One Risk Worth Taking

The site currently has no music. The "no music out yet -Dylan" sticky note is the best thing on the page — it's honest, it's funny, it's first-person. When music comes out, the temptation will be to add a clean Spotify embed and remove the joke. **Don't.** Replace the sticky with something equally honest: "first single is out. it's okay. -Dylan" or similar. The voice is more important than the feature.

---

## Design Log

| Date | Change |
|------|--------|
| 2026-06 | Created press.exe EPK window (Comic Sans, lean bio) |
| 2026-06 | Removed CSS fire animation; replaced with 10 extreme Google Fonts |
| 2026-06 | Random font pool expanded to 23 entries |
| 2026-06 | DESIGN.md created via /design-consultation |
