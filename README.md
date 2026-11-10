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
