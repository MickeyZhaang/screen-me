# Screen Me

A local-first Electron spike for capturing, annotating, and keeping screenshots in a persistent inbox.

## What works

- Capture the primary display from the app.
- Capture from anywhere with `CommandOrControl+Shift+2`.
- Detect new macOS screenshots in the configured screenshot directory.
- Annotate captures with freehand drawing, rectangles, and text.
- Reopen and edit saved annotations.
- Store metadata in SQLite and image assets in the application data directory.
- Keep the React renderer isolated behind a typed preload API.

## Architecture

```text
src/main/application  Capture workflows and capture-change coordination
src/main/electron     Windows, IPC, shortcuts, screen capture, and protocols
src/main/infrastructure  SQLite, asset files, and screenshot directory watching
src/shared/captures   Capture data contracts and validation
src/shared/ipc        IPC contract and typed preload API
src/ui/home           Inbox page, capture card, and local inbox state
src/ui/annotation     Annotation page, toolbar, image helpers, and styles
```

`src/main.ts` is the composition root. It creates the dependencies, starts the
Electron adapters, and owns application shutdown. The React renderer can only
use the typed API exposed by `src/preload.ts`.

## Run locally

```sh
npm install
npm start
```

macOS asks for Screen Recording permission the first time Screen Me captures the display. Normal macOS screenshots are detected only while the app is running.

## Verify

```sh
npm run typecheck
npm test
npm run package
```

## Local data

Development data is stored under Electron's `userData` directory in `screen-me.sqlite` and `assets/`. The app does not run a local server or send captures over the network.
