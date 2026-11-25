# CR8 Snaps

A retro-theatre photobooth built with React, Vite and Tailwind CSS. Red velvet curtains, marquee lights, live webcam filters, a 3-2-1 countdown, per-frame retakes (max 2) and a canvas-composited strip you can download.

## Run it

Requires Node 18+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). Camera access works on `localhost` and on HTTPS sites only.

Production build: `npm run build`, then `npm run preview`.

## What's in the app

| Area | Details |
| --- | --- |
| Landing | Curtain backdrop, marquee title, "Enter the Booth" CTA |
| Curtain transition | Closes, holds with a loading label, then opens on every view change (lobby ↔ booth, booth → result, edit, new session) |
| Capture | Four frames per session, with per-frame retakes |
| Camera | `getUserMedia`, loading state, friendly errors (blocked, no camera, in use, unsupported), 3-2-1 countdown, flash |
| Retakes | Each frame can be retaken at most 2 times. Counter reads "Retakes left: 2/2 → 1/2 → 0/2" and the button disables at 0. Cancelled shots don't use a retake |
| Filters | Original, Vintage Warm, Noir, Sepia, Retro Film (grain + halftone + vignette), Vivid. Live on the video, applied to captured frames, and baked into the export. Can be changed after capture |
| Frame design | 4 built-in sample designs plus your own PNG upload (click or drag and drop) |
| Export | Strip is drawn on an HTML5 canvas and saved as a PNG |

## Custom frames

Upload a transparent PNG sized **640 × 1036 px** (2 frames) or **640 × 1920 px** (4 frames), with cutout windows of **552 × 414 px**. It is drawn on top of the photos, so the cutouts act as windows. Click **Download guide** in the Frame Design panel for a PNG showing exactly where each window goes. Images with other proportions are stretched to fit, and the app warns you.

## Structure

```
src/
  App.jsx                    view state + curtain transition controller
  components/
    CurtainTransition.jsx    full-screen curtain (closing / closed / opening / open)
    TheatreCurtains.jsx      decorative backdrop (valance, drapes, spotlight)
    MarqueeBulbs.jsx
    LandingPage.jsx
    Photobooth.jsx           booth + result screens, owns the session state
    CameraView.jsx           webcam, countdown, flash (imperative snap())
    FrameSlots.jsx           captured frames + retake counters
    FilterSelector.jsx
    FrameCustomizer.jsx      presets, upload slot, guide download
    PhotoStripPreview.jsx    live canvas strip
  lib/
    filters.js               filter specs, CSS output, pixel fallback, effects
    composeStrip.js          strip layout, frame presets, compositor, export
    capture.js               4:3 mirrored still from the video
    fonts.js                 makes sure canvas fonts are loaded
```

## Notes

- Raw (unfiltered) captures are kept in memory, which is why the filter can change after shooting.
- Browsers without canvas `ctx.filter` support (Safari) use a built-in pixel-math fallback so exports still match the preview. The grain effect on Retro Film shows only in the captured strip, not on the live video.
- Nothing is uploaded anywhere. Photos never leave the browser.
- There is no checkout or payment flow.
