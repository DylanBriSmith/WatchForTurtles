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

Pages is configured to publish from the **`main`** branch, root folder.

After push, the site is available at:

- https://dylanbrismith.github.io/WatchForTurtles/ (until custom domain is wired)
- https://watchforturtles.ca (after Cloudflare + GitHub custom domain)

The `CNAME` file points GitHub Pages at `watchforturtles.ca`.

### Enable Pages (one-time, if not already on)

1. Repo → **Settings** → **Pages**
2. **Source:** Deploy from branch → `main` → `/ (root)`
3. Save. Wait 1–3 minutes for the first deploy.

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
