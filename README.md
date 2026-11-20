# Shift Coverage Agent · Concept Demos

Static site, no build step. Open `index.html` for the version picker.

| Folder | What it is |
|---|---|
| `v2-resort/` | **V2 · The Resort.** Game-like isometric resort hub with a "Needs you" mission board. Drill into Casino Floor (felt table, embeds `classic/`), Hotel (elevator), Ember & Oak (fine dining), Resort Shop (storefront) and Back of House (ops console). **Resort setup** (top bar) connects a dummy org chart, maps departments to themed worlds, and shapes which buildings appear on the map. |
| `v1-pulse/` | **V1 Draft A · Resort Pulse.** Abstract dark glass. Departments as lanes of light across Saturday; gaps crack the line. |
| `v1-disk/` | **V1 Draft B · Coverage Rings.** DaisyDisk-style sunburst: resort > division > department > role > shift. Click to zoom, red spikes are open shifts. |
| `standard/` | **V3 · Standard.** Generic, white and clinical, no industry theme. Carousel navigation with tables, filters and bulk actions, plus Day, Week and Month views (month shows patterns; projected gaps after the published schedule). Open with `#light` or `#dark`. |
| `classic/` | **Round 1.** Casino-only and Healthcare themes. `#casino`, `#healthcare`. `#embed` is used by V2. |

Shared: `gate.js` (password prompt), `face.js` (the agent's animated face).

## Run locally
The casino department uses an iframe, so serve the folder:

```
npx serve .
```

## Deploy on GitHub Pages
Push the contents to a repo root, then Settings > Pages > Deploy from branch > `main` / root.

## Password
Every page opens behind a shared prompt (`PlanA`), remembered for the browser tab. Client-side only: it keeps casual visitors out, but anyone reading the source can get past it. For real protection use Cloudflare Access, Netlify/Vercel password protection, or private Pages.
To change it, replace the hash in `gate.js` (SHA-256 hex of the new password) and the fallback string next to it. `classic/index.html` has its own copy of the same check.

## Demo script (V2)
1. Land on the resort. The agent and the "Needs you" board explain fight night.
2. Answer "how does this get set up?" with **Resort setup**: connect Workday, let the agent map departments, turn off a restaurant and watch it leave the map, review the rules, build.
3. Open a department or two (Hotel elevator, Ember & Oak's Pass, Casino Floor).
4. Back on the resort, **Approve the whole plan** and watch staff move across departments.

Reload the page to reset. All names and organizations are fictional.
