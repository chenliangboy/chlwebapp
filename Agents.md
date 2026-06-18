# Agents Guide

This file gives future Codex/agent conversations a quick map of the project so they can start productively without re-discovering the basics.

## Project Summary

This is a Vite-powered single-page web app named `floating-image-bubbles`.

The current implementation is a Vue 3 + TypeScript bubble workspace. The main workspace renders a full-screen dark floating bubble wall. Each bubble can drift, collide, pause on hover, be dragged in free mode, switch into a grid layout, and be searched by title/category/tag/meta text. Clicking a bubble opens the appropriate modal panel, such as details, chat, game, agent tool, AI chat, or an embedded web panel.

The app also includes a left navigation shell, theme switching, route-based pages for workspace/friends/games/agents/settings, and a settings page for adding, editing, and deleting bubbles.

## Tech Stack

- Runtime/build tool: Vite 5
- Framework: Vue 3
- Language: TypeScript
- State management: Pinia
- Routing: Vue Router hash history
- HTTP client: Axios
- Styling: plain CSS in `src/style.css`
- Entry HTML: `index.html`
- App entry: `src/main.ts`
- Root component: `src/App.vue`
- Static local image assets: `public/images/`

There is no component library. Keep changes simple and consistent with the existing Vue + TypeScript + plain CSS structure unless the user explicitly asks for a larger migration.

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

Vite may use another port if `5174` is busy or if the dev server was started with a different port. If verifying UI changes, reload the in-app browser after edits.

## Important Files

### `index.html`

Defines the minimal Vue mount shell:

- `<div id="app"></div>`
- `<script type="module" src="/src/main.ts"></script>`

The workspace DOM is rendered by Vue components, not hardcoded in `index.html`.

### `src/main.ts`

Thin app bootstrap.

Key responsibilities:

- Creates the Vue app.
- Registers Pinia.
- Registers Vue Router.
- Imports `src/style.css`.
- Mounts `App.vue` to `#app`.

### `src/App.vue`

Top-level application shell.

Key responsibilities:

- Renders the left sidebar via `AppSidebar`.
- Renders the current route inside `.workspace-panel`.
- Auto-collapses the left sidebar on narrow viewports.
- Handles bubble edit events by selecting the bubble and routing to `settings?edit=<id>`.

### `src/router/index.ts`

Defines hash-history routes:

- `/`: `WorkspaceView`
- `/friends`: `FriendsView`
- `/games`: `GamesView`
- `/agents`: `AgentsView`
- `/settings`: `SettingsView`

### `src/views/WorkspaceView.vue`

Owns the main bubble workspace UI.

Key responsibilities:

- Renders `.stage`, layout toggle, bubble layer, search button, and search panel.
- Creates and destroys `BubbleWall`.
- Wires free/grid layout switching.
- Wires in-app search, `Ctrl+F` / `Command+F`, `Esc`, and outside-click close behavior.
- Opens a modal when a bubble is clicked.
- Resolves the active modal panel: detail, chat, game, agent tool, AI chat, or web.
- Watches Pinia bubble data and syncs it into the `BubbleWall` engine.
- Exposes the compatibility API at `window.bubbleWall`.

### `src/views/SettingsView.vue`

Owns bubble management.

Key responsibilities:

- Lists all bubbles from the Pinia store.
- Adds bubbles.
- Edits bubbles.
- Deletes bubbles.
- Opens the editor automatically when the route query contains `?edit=<bubbleId>`.

The current editor covers title, image URL, main color, pale color, and artwork type.

### `src/components/layout/AppSidebar.vue`

Owns the left navigation.

Key responsibilities:

- Shows the CHL brand area.
- Links to workspace, friends, games, agents, and settings.
- Provides theme switching through `useThemeStore`.
- Emits `hide` to collapse the sidebar.

### `src/components/detail/`

Owns modal/detail content displayed after opening a bubble.

Important modules:

- `BubbleDetail.vue`: default bubble detail view.
- `ChatPanel.vue`: friend/chat-style panel.
- `AiChatPanel.vue`: AI chat panel.
- `AgentToolPanel.vue`: form/tool panel for agent actions.
- `GamePanel.vue`: game panel.
- `WebPanel.vue`: embedded web panel.
- `EmptyDetail.vue`: empty detail state.
- `DetailPanel.vue`: older side-panel style detail component; the current main workspace flow uses modal panels.

### `src/data/initialItems.ts`

Defines the initial bubble data.

Local images live in `public/images/` and should be referenced through public paths, such as `/images/chl.png`, usually via the existing `publicAsset()` helper. Vite copies `public/` assets into `dist/` during production builds. Do not use `./images/...` for bundled local images.

The current initial data includes local images:

- `/images/chl.png`
- `/images/xiaoran.jpg`
- `/images/xuanxuan.jpg`

And remote images:

- `https://www.deepseek.com/favicon.ico`
- `https://supabase.com/dashboard/img/supabase-logo.svg`

### `src/data/bubbleTypes.ts`

Defines bubble category/type metadata used by the workspace, search text, and detail views. Categories are used to label and group bubbles such as friends, games, agents, AI chat, tools, and notes.

### `src/stores/bubbles.ts`

Owns the canonical in-memory bubble list.

Key responsibilities:

- Initializes items from `initialItems`.
- Tracks the selected bubble ID.
- Provides `selectedBubble`.
- Normalizes legacy and object bubble input.
- Adds, updates, removes, selects, and clears bubbles.

Current settings changes are stored in Pinia memory. Bubble positions are persisted separately by `BubbleWall` in `localStorage`.

### `src/stores/theme.ts`

Owns light/dark theme state and toggling.

### `src/stores/chat.ts`

Owns chat-related state.

### `src/core/`

Owns the non-Vue bubble engine behavior.

Important modules:

- `Bubble.ts`: single bubble DOM, state, movement, update, search state, and render logic.
- `BubbleWall.ts`: overall bubble state, animation loop, drag handling, search state, layout switching, localStorage position persistence, and public API behavior.
- `layout.ts`: grid target calculation.
- `physics.ts`: collision resolution.
- `artwork.ts`: generated fallback artwork when no image is provided.

The active implementation is DOM/CSS based, not canvas based.

### `src/workspace/actions.ts`

Resolves bubble actions into workspace behavior.

Key responsibilities:

- Opens external actions when needed.
- Resolves which panel should be shown for a bubble.
- Maps bubble action/category data to detail, chat, game, agent tool, AI chat, or web panels.

### `src/services/`

Contains API-related utilities:

- `http.ts`: shared HTTP client setup.
- `bubbleApi.ts`: bubble API helper surface.

The current bubble store does not rely on a backend for persistence unless future code wires these services in.

### `src/types/`

Contains shared TypeScript types:

- `bubble.ts`: bubble item/input/action/public API types.
- `chat.ts`: chat types.
- `legacy.d.ts`: global/legacy declarations, including compatibility surface such as `window.bubbleWall`.

### `src/utils/`

Contains shared helpers:

- `html.ts`: HTML/string utilities.
- `math.ts`: math helpers such as clamp/random helpers.
- `normalizeItem.ts`: image/path normalization helpers.

### `src/style.css`

Owns all visuals and animation polish.

Important classes:

- `.app-shell`: top-level application layout.
- `.sidebar-left`: left navigation.
- `.workspace-panel`: routed main content area.
- `.stage`: full-screen dark bubble workspace.
- `.layout-toggle`: layout icon button.
- `.search-toggle`: search icon button.
- `.search-panel`: glass search input.
- `.bubble-layer`: DOM container for engine-created bubbles.
- `.bubble`: moving outer wrapper; engine render should write translation only.
- `.bubble-visual`: inner visual layer; CSS controls smooth scaling.
- `.bubble::after`: visual outer ring/shadow layer; CSS controls smooth scaling.
- `.bubble.has-image`: image-backed bubble styling.
- `.bubble.is-search-match`: highlighted search result.
- `.bubble.is-search-miss`: shrunken non-matching search result.
- `.modal-root` / `.modal-dialog`: opened bubble panel surface.
- `.settings-view`: settings page.

The scale animation is deliberately split for smoothness:

- JS updates `.bubble` transform with translation only.
- CSS scales `.bubble-visual` and `.bubble::after` using `--bubble-scale`.

Do not put `scale(...)` back into `Bubble.render()` unless you also redesign the animation pipeline. Combining JS translation and CSS scale in one transform made hover scaling feel less smooth.

## Current Interaction Behavior

Free mode:

- Bubbles drift slowly.
- Bubbles avoid overlap via simple collision resolution.
- Hover pauses a bubble and shows its title.
- Dragging works only in free mode.
- Tap/click opens the bubble modal when the pointer did not move enough to count as a drag.
- Positions are saved to `localStorage` under `floating-image-bubbles:positions:v1`.

Grid mode:

- The layout button toggles grid/free mode.
- In grid mode, bubbles animate toward computed grid targets.
- Dragging is disabled.
- Switching back to free mode returns bubbles to their saved free positions.

Search:

- The search icon opens the glass search input.
- `Ctrl+F` / `Command+F` opens the in-app search and focuses the input.
- `Esc` closes search, or closes the active bubble modal first.
- Clicking outside the search button/panel closes search and clears the query.
- Search is live via the input event.
- Matching bubbles grow and highlight.
- Non-matching bubbles shrink and dim.
- Search text includes title, label, subtitle, category, category label, tags, and meta values.

Hover / scaling:

- Hover sets `--bubble-scale: 1.18`.
- Search match sets `--bubble-scale: 1.34`.
- Search miss sets `--bubble-scale: 0.66`.
- For image-backed bubbles, the image is slightly inset and clipped in a round inner layer so it does not overflow during scaling.

Modal panels:

- Clicking a bubble opens a modal.
- The panel is resolved from the bubble action/category.
- Supported panel modes include `detail`, `chat`, `game`, `agent-tool`, `ai-chat`, and `web`.
- Chat and AI chat use a more immersive modal body style.

Settings:

- The settings route lists all bubbles.
- Users can add, edit, or delete bubbles.
- Editing from a bubble detail routes to `settings?edit=<bubbleId>`.

## Public Compatibility API

`WorkspaceView.vue` exposes a legacy-compatible API at `window.bubbleWall`:

```js
window.bubbleWall.addBubble({
  title: 'example',
  image: '/images/example.png',
  color: '#ffc107',
  pale: '#fff3cd',
  type: 'note'
});

window.bubbleWall.updateBubble('example', {
  title: 'updated example'
});

window.bubbleWall.removeBubble('example');
window.bubbleWall.search('example');
window.bubbleWall.setLayoutMode('grid');
window.bubbleWall.setLayoutMode('free');
window.bubbleWall.getBubbles();
```

Supported bubble data fields:

- `title`, `label`, or `name`: bubble title used for display and search.
- `image`, `imageUrl`, `img`, or `src`: image source; can be local or remote.
- `color`: main fallback generated-art color.
- `pale`, `lightColor`, or `backgroundColor`: fallback generated-art highlight color.
- `type`: fallback icon/art type, such as `sun`, `mountain`, `flower`, `wave`, `note`, `film`, etc.
- `subtitle`, `category`, `tags`, `action`, and `meta`: richer workspace/detail behavior.

Array format is still supported for compatibility:

```js
['label', '#color', '#pale', 'type', 'image']
```

## Design Notes

- Keep the app as an actual usable tool, not a landing page.
- Keep controls icon-based where practical.
- Avoid decorative extra cards or explanatory text on the main screen.
- Preserve the dark, restrained, glassy UI language.
- Do not use emoji as UI icons.
- Prefer inline SVG icons for the existing controls to avoid adding dependencies.
- Respect `prefers-reduced-motion`; the CSS already includes reduced-motion handling.
- Keep Vue components focused and framework-native; keep the bubble motion engine in `src/core/` unless a larger architecture change is requested.

## Encoding Note

Some terminal reads in Windows PowerShell may show Chinese text as mojibake. The browser renders the page from UTF-8 HTML. When editing Chinese strings, make sure files remain UTF-8 and verify in the browser.

If source files contain visibly broken Chinese strings or malformed tags, fix the source rather than assuming it is only terminal output. Run `npm run build` after such edits to catch Vue template parse errors.

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
- The app has migrated from plain JavaScript to Vue 3 + TypeScript.
- `.codex/` is ignored via `.gitignore`.

## Verification Checklist For Future UI Changes

Before final response after UI edits:

1. Run:

```bash
npm run build
```

2. Reload the in-app browser at `http://localhost:5174/` or the actual Vite dev server URL.

3. Check the relevant interaction:

- hover bubble
- drag bubble in free mode
- click/tap a bubble and open its modal
- close the modal with the close button, overlay, or `Esc`
- toggle grid/free
- switch back from grid to free and confirm positions return smoothly
- open search with button
- open search with `Ctrl+F`
- type a search query and observe match/miss states
- click outside search to close
- add/edit/delete a bubble in settings if the change touched store or settings behavior

4. Mention clearly if browser verification could not be completed.
