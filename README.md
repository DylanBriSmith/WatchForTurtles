# Watch for Turtles

Static band site for **Watch for Turtles** (post-punk, Toronto).

## Live site

- **Production:** `index.html` (Peach Pit / `style2.2.css` theme)
- **Legacy Win95 layout:** `win95.html`
- **Older variants:** `index2.html`, `index2.2.html` (redirects to `/`)

No build step — open `index.html` in a browser, or serve the folder with any static host.

## Local preview

```bash
# Python
python -m http.server 8080

# Node (if you have npx)
npx serve .
```

Then open http://localhost:8080

## GitHub Pages

The repo includes `.github/workflows/deploy-pages.yml` to publish the site on every push to `main`.

**Important:** `WatchForTurtles` is a **private** repo. On a free GitHub plan, Pages only works on **public** repos. Either:

- **Recommended for a band promo site:** make the repo **public**, or
- Keep it private and use a **paid GitHub plan** (Pro+) that allows Pages on private repos.

### Enable Pages (one-time)

1. Open https://github.com/DylanBriSmith/WatchForTurtles/settings/pages
2. Under **Build and deployment** → **Source**, choose **GitHub Actions** (not “Deploy from branch”).
3. Push to `main` (or run the workflow manually: **Actions** → **Deploy to GitHub Pages** → **Run workflow**).
4. Wait 1–3 minutes. Site URL:
   - https://dylanbrismith.github.io/WatchForTurtles/
   - https://watchforturtles.ca (after Cloudflare + custom domain below)

The `CNAME` file points GitHub Pages at `watchforturtles.ca`.

### If you still see “There isn’t a GitHub Pages site here”

- Repo is still **private** on a free account → make it public under **Settings → General → Danger zone → Change visibility**.
- Pages source is not set to **GitHub Actions** → fix in **Settings → Pages**.
- First deploy still running → check **Actions** tab for a green checkmark.

## Cloudflare (custom domain)

In Cloudflare DNS for `watchforturtles.ca`:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| `CNAME` | `@` | `dylanbrismith.github.io` | DNS only (grey cloud) |
| `CNAME` | `www` | `dylanbrismith.github.io` | DNS only |

Also in GitHub → repo **Settings** → **Pages** → **Custom domain**, enter `watchforturtles.ca` and wait for the DNS check.

**Note:** GitHub Pages + Cloudflare proxy (orange cloud) can cause certificate issues. Start with **DNS only**, then try proxy once HTTPS works.

## Edit content

| What | Where |
|------|--------|
| Nav / windows / copy | `index.html` |
| Colors / layout | `style2.2.css` |
| Windows, drag, mailing list | `script.js` |
| GSAP intro + window animations | `gsap-peachpit.js` |
| Featured IG post (index2 scroll layout) | `instagram-config.js` |
| Photos | `media/photos/...` |

Mailing list posts to `listmonk.watchforturtles.ca` (handled in `script.js`).
