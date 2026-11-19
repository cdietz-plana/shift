# Shift Coverage Agent · Concept Demos

Static site, no build step. Open `index.html` for the version picker.

| Folder | What it is |
|---|---|
| `v2-resort/` | **V2 · The Resort.** Game-like isometric resort hub with a mission board of proposals, conflicts and approvals. Drill into each department: Casino Floor (felt table, embeds `classic/`), Hotel (elevator), Ember & Oak (fine dining), Resort Shop (storefront), Back of House (ops console). |
| `v1-pulse/` | **V1 Draft A · Resort Pulse.** Abstract dark glass. Departments as lanes of light across Saturday; gaps crack the line. |
| `v1-orbit/` | **V1 Draft B · Orbit.** Agent at the center, departments in orbit sized by headcount. |
| `classic/` | **Round 1.** Casino-only and Healthcare themes. `#casino`, `#healthcare`. `#embed` is used by V2. |

## Run locally
Serve the folder (the casino department uses an iframe, so a local server is best):

```
npx serve .
```

## Deploy on GitHub Pages
Push the contents to a repo root, then Settings → Pages → Deploy from branch → `main` / root.

## Password
Every page opens behind a shared prompt (`PlanA`), remembered for the browser tab. It's client-side only: it keeps casual visitors out, but anyone reading the source can get past it. For real protection put the site behind Cloudflare Access, Netlify/Vercel password protection, or private Pages.

To change it, replace the hash in `gate.js` (SHA-256 hex of the new password) and the fallback string next to it. `classic/index.html` has its own copy of the same check.

## Demo script (V2)
1. Land on the resort. The agent and the "Needs you" board explain fight night.
2. Hover pins, click **Show me on the map**.
3. Open a department or two (Hotel elevator, Ember & Oak's Pass, Casino Floor).
4. Back on the resort, **Approve the whole plan** and watch staff move across departments.

Reload the page to reset. All names and organizations are fictional.
