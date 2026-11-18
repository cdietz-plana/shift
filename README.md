# Shift Coverage Agent · Concept Demo

Interactive sales-pitch prototype with two themes:

- **Casino** (`#casino`): views float center and drop onto a 3D felt table; chip-tray navigation.
- **Healthcare** (`#healthcare`): top nav drives a 3D carousel of views.

Single self-contained `index.html`. No build step, no dependencies (Google Fonts load from the web).

## Run locally
Open `index.html` in Chrome or Safari, or serve the folder:

```
npx serve .
```

## Deploy on GitHub Pages
1. Push this folder to a repo (files at the repo root).
2. Settings → Pages → Deploy from branch → `main` / root.
3. Open `https://<org>.github.io/<repo>/#casino` or `#healthcare`.

## Password
The demo opens behind a password prompt (`PlanA`). It is a client-side gate: it keeps casual visitors out, but anyone who reads the page source can get past it. For real protection, host it behind an auth layer (Cloudflare Access, Vercel/Netlify password protection, or a private repo + private Pages on GitHub Enterprise).

To change the password, replace `PW_HASH` in `index.html` with the SHA-256 hex of the new password and update the fallback string next to it.

## Demo tips
- **Reset demo** (top right) clears the agent flow before each pitch.
- Arrow keys move between views.
- Designed at 1600×900 and scaled to fit; best on a laptop or projector.
- All names and organizations are fictional.
