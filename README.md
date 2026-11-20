# Vice Cover Studio

![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)
![rank](https://make.fun/badge/gta6-cover-art-01/diablosan19/gta6-cover-art/rank.svg)
![reward](https://make.fun/badge/gta6-cover-art-01/diablosan19/gta6-cover-art/reward.svg)

An entry for the make.fun bounty [Make GTA 6 Cover Art](https://make.fun/c/gta6-cover-art-01).

Vice Cover Studio turns your own photos into a multi-panel, GTA-style
poster cover: pick a layout, drop a photo into each panel, grade the whole
thing like a Vice City sunset, type your title, and export a share-ready
PNG at 1080 × 1080, 1080 × 1350 or 1920 × 1080.

## What it does

- **Your photos, your machine.** Photos are read locally in the browser
  and never uploaded anywhere. Fill one panel at a time, or one photo
  across every panel.
- **Three poster layouts** — Poster (one full-bleed shot), Collage (a hero
  panel over smaller scenes and a title strip) and Strips (three vertical
  slices) — each adapting to the export shape.
- **Four colour grades** — Sunset, Neon, Noir and Clean — applied to every
  panel under cream poster gutters, with a studio masthead, a stacked
  display title with a hot-pink offset shadow, and the studio's own 18+
  badge. All artwork and branding is original to this entry.
- **Direct manipulation.** Click a panel to select it, drag to reposition
  its photo, slide to zoom, then export the PNG.

The four scenes in the sample tray (a sunset boulevard, a pier at dusk, a
neon downtown and a beach cruiser) are original illustrations drawn for
this entry — see `gen-samples.mjs`, which paints them as SVG and
photographs them into `app/samples/`.

## Run it

The app is plain static files under `app/` with no build step. Serve the
folder with any static server and open it in a desktop browser, e.g.:

```
npx serve app
```

Hand the entry in (copies `app/` and `screenshots/` to the output
directory and writes `dossier.json` with the kit's vendored library):

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The screenshots in `screenshots/` are the studio's own work: `shoot.mjs`
drives the app in a headless browser using the presets in `shots.json` —
the cover shots are the app's own canvas drawings of finished covers, and
the editor shot shows the studio with a sample photo loaded.

## License

MIT — see `LICENSE`.
