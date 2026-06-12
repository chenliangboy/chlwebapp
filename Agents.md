# Agents Guide

This file gives future Codex/agent conversations a quick map of the project so they can start productively without re-discovering the basics.

## Project Summary

This is a Vite-powered single-page web app named `floating-image-bubbles`.

The app renders a full-screen dark floating bubble wall. Each bubble can drift, collide, pause on hover, be dragged in free mode, switch into a grid layout, and be searched by title. Bubbles can use either generated color artwork or an image URL/local image.

## Tech Stack

- Runtime/build tool: Vite 5
- Language: plain JavaScript ES modules
- Styling: plain CSS
- Entry HTML: `index.html`
- App entry: `src/main.js`
- Stylesheet: `src/style.css`
- Static local image assets: `public/images/`

There is no React/Vue framework and no component library. Keep changes simple and framework-free unless the user explicitly asks for a larger migration.

## Common Commands

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The user commonly has the app open at:

```text
http://localhost:5174/
```

If verifying UI changes, reload the in-app browser after edits.

## Important Files

### `index.html`

Defines the static page shell:

- `<main class="stage">` full-screen app container
- `#layoutToggle` top-right icon button for free/grid layout
- `#bubbleLayer` container where JS-created bubbles are inserted
- `#searchToggle` bottom-right search icon button
- `#searchPanel` top-center glass search input

The old visible hint text was intentionally removed. Do not re-add the "drag image / hover text" hint unless the user asks.

### `src/main.js`

Thin app bootstrap.

Key responsibilities:

- Imports `src/style.css`
- Creates the `BubbleWall`
- Wires layout and search UI controls
- Exposes `window.bubbleWall`

### `src/data/initialItems.js`

Defines the initial bubble data.

Local images live in `public/images/` and should be referenced with root-absolute public paths, such as `/images/chl.png`. Vite copies `public/` assets into `dist/` during production builds. Do not use `./images/...` for bundled local images.

### `src/core/`

Owns the app behavior.

Important modules:

- `Bubble.js`: single bubble DOM, state, movement, and render logic
- `BubbleWall.js`: overall bubble state, animation loop, drag handling, search state, layout switching, and public API behavior
- `layout.js`: grid target calculation
- `physics.js`: collision resolution
- `artwork.js`: generated fallback SVG artwork when no image is provided

### `src/ui/`

Owns DOM event wiring for controls:

- `controls.js`: grid/free layout button behavior
- `search.js`: search panel, search button, keyboard shortcuts, and outside-click close behavior

Important public API:

```js
window.bubbleWall.addBubble({
  title: 'example',
  image: '/images/example.png',
  color: '#ffc107',
  pale: '#fff3cd',
  type: 'note'
});

window.bubbleWall.search('example');
window.bubbleWall.setLayoutMode('grid');
window.bubbleWall.setLayoutMode('free');
window.bubbleWall.getBubbles();
```

Supported bubble data fields:

- `title`, `label`, or `name`: bubble title used for display and search
- `image`, `imageUrl`, `img`, or `src`: image source; can be local or remote
- `color`: main fallback generated-art color
- `pale`, `lightColor`, or `backgroundColor`: fallback generated-art highlight color
- `type`: fallback icon/art type, such as `sun`, `mountain`, `flower`, `wave`, `note`, `film`, etc.

Array format is still supported for compatibility:

```js
['label', '#color', '#pale', 'type', 'image']
```

The current initial data includes local images:

- `/images/chl.png`
- `/images/xiaoran.jpg`
- `/images/xuanxuan.jpg`

And remote images:

- `https://www.deepseek.com/favicon.ico`
- `https://supabase.com/dashboard/img/supabase-logo.svg`

### `src/style.css`

Owns all visuals and animation polish.

Important classes:

- `.stage`: full-screen dark grid background
- `.layout-toggle`: top-right layout icon button
- `.search-toggle`: bottom-right search icon button
- `.search-panel`: top-center glass search input
- `.bubble`: moving outer wrapper; JS writes only `translate3d(...)`
- `.bubble-visual`: inner visual layer; CSS controls smooth scaling
- `.bubble::after`: visual outer ring/shadow layer; CSS controls smooth scaling
- `.bubble.has-image`: image-backed bubble styling
- `.bubble.is-search-match`: highlighted search result
- `.bubble.is-search-miss`: shrunken non-matching search result

The scale animation was deliberately split for smoothness:

- JS updates `.bubble` transform with translation only.
- CSS scales `.bubble-visual` and `.bubble::after` using `--bubble-scale`.

Do not put `scale(...)` back into `Bubble.render()` unless you also redesign the animation pipeline. Combining JS translation and CSS scale in one transform made hover scaling feel less smooth.

## Current Interaction Behavior

Free mode:

- Bubbles drift slowly.
- Bubbles avoid overlap via simple collision resolution.
- Hover pauses a bubble and shows its title.
- Dragging works only in free mode.

Grid mode:

- Top-right button toggles grid/free mode.
- In grid mode, bubbles animate toward computed grid targets.
- Dragging is disabled.
- The layout button shows an icon only and updates `title` / `aria-label`:
  - free mode: "switch to grid layout"
  - grid mode: "switch to free layout"

Search:

- Bottom-right search icon opens the top-center glass input.
- `Ctrl+F` / `Command+F` opens the in-app search and focuses the input.
- `Esc` closes search.
- Clicking outside the search button/panel closes search and clears the query.
- Search is live via the input event.
- Matching bubbles grow and highlight.
- Non-matching bubbles shrink and dim.

Hover / scaling:

- Hover sets `--bubble-scale: 1.18`.
- Search match sets `--bubble-scale: 1.34`.
- Search miss sets `--bubble-scale: 0.66`.
- For image-backed bubbles, the image is slightly inset and clipped in a round inner layer so it does not overflow during scaling.

## Design Notes

- Keep the app as an actual usable tool, not a landing page.
- Keep controls icon-based where practical.
- Avoid decorative extra cards or explanatory text on the main screen.
- Preserve the dark, restrained, glassy UI language.
- Do not use emoji as UI icons.
- Prefer inline SVG icons for the existing controls to avoid adding dependencies.
- Respect `prefers-reduced-motion`; the CSS already includes reduced-motion handling.

## Encoding Note

Some terminal reads in Windows PowerShell may show Chinese text as mojibake. The browser renders the page from UTF-8 HTML. When editing Chinese strings, make sure files remain UTF-8 and verify in the browser.

## Git / Repo Notes

Remote:

```text
origin https://github.com/chenliangboy/chlwebapp.git
```

Main branch:

```text
main
```

Recent project direction:

- The previous `canvas-demo.html` was removed.
- The active implementation is DOM/CSS based, not canvas based.
- `.codex/` is ignored via `.gitignore`.

## Verification Checklist For Future UI Changes

Before final response after UI edits:

1. Run:

```bash
npm run build
```

2. Reload the in-app browser at `http://localhost:5174/`.

3. Check the relevant interaction:

- hover bubble
- drag bubble in free mode
- toggle grid/free
- open search with button
- open search with `Ctrl+F`
- type a search query and observe match/miss states
- click outside search to close

4. Mention clearly if browser verification could not be completed.
