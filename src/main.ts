import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  net,
  protocol,
  screen,
  systemPreferences,
} from 'electron';
import {
  CaptureIdSchema,
  channels,
  SaveAnnotationInputSchema,
} from './shared/contracts';
import { AssetStore } from './main/assets';
import { CaptureService } from './main/capture-service';
import { AppDatabase } from './main/database';
import { ScreenshotWatcher } from './main/screenshot-watcher';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'screen-me',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const shortcut = 'CommandOrControl+Shift+2';
let mainWindow: BrowserWindow | null = null;
let database: AppDatabase;
let assets: AssetStore;
let captures: CaptureService;
let screenshotWatcher: ScreenshotWatcher;
let shortcutRegistered = false;

const loadRenderer = async (
  window: BrowserWindow,
  query: Record<string, string> = {},
): Promise<void> => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const url = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
    await window.loadURL(url.toString());
    return;
  }
  await window.loadFile(
    join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    { query },
  );
};

const secureWindowOptions = {
  webPreferences: {
    preload: join(__dirname, 'preload.cjs'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  },
};

const lockNavigation = (window: BrowserWindow): void => {
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
};

const createMainWindow = async (): Promise<BrowserWindow> => {
  const window = new BrowserWindow({
    ...secureWindowOptions,
    width: 1040,
    height: 760,
    minWidth: 760,
    minHeight: 560,
    title: 'Screen Me',
    backgroundColor: '#f4f1ea',
  });
  lockNavigation(window);
  await loadRenderer(window);
  window.on('closed', () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });
  return window;
};

const openAnnotation = async (captureId: string): Promise<void> => {
  const existing = BrowserWindow.getAllWindows().find(
    (window) => window.getTitle() === `Annotate ${captureId}`,
  );
  if (existing) {
    existing.show();
    existing.focus();
    return;
  }
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const width = Math.min(1220, display.workAreaSize.width - 48);
  const height = Math.min(860, display.workAreaSize.height - 48);
  const window = new BrowserWindow({
    ...secureWindowOptions,
    width,
    height,
    minWidth: 760,
    minHeight: 600,
    title: `Annotate ${captureId}`,
    backgroundColor: '#151515',
  });
  lockNavigation(window);
  await loadRenderer(window, { mode: 'annotation', captureId });
  window.show();
};

const notifyCapturesChanged = (): void => {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.webContents.send(channels.capturesChanged);
    }
  }
};

const captureAndAnnotate = async (): Promise<void> => {
  const capture = await captures.capturePrimaryDisplay();
  notifyCapturesChanged();
  await openAnnotation(capture.id);
};

const registerProtocol = (): void => {
  protocol.handle('screen-me', async (request) => {
    const url = new URL(request.url);
    if (url.hostname !== 'assets') {
      return new Response('Not found', { status: 404 });
    }
    try {
      const assetId = CaptureIdSchema.parse(url.pathname.replace(/^\//, ''));
      const asset = database.getAsset(assetId);
      const response = await net.fetch(
        pathToFileURL(assets.resolvePath(asset.relativePath)).toString(),
      );
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Content-Type', asset.mediaType);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
};

const registerIpc = (): void => {
  ipcMain.handle(channels.getStatus, () => ({
    shortcut,
    shortcutRegistered,
    screenshotDirectory: screenshotWatcher.directory,
    screenshotWatcherRunning: screenshotWatcher.running,
    screenPermission:
      process.platform === 'darwin'
        ? systemPreferences.getMediaAccessStatus('screen')
        : 'unknown',
  }));
  ipcMain.handle(channels.listCaptures, () => captures.list());
  ipcMain.handle(channels.getCapture, (_, captureId: unknown) =>
    captures.get(CaptureIdSchema.parse(captureId)),
  );
  ipcMain.handle(channels.capturePrimary, async () => {
    const capture = await captures.capturePrimaryDisplay();
    notifyCapturesChanged();
    await openAnnotation(capture.id);
    return capture;
  });
  ipcMain.handle(channels.saveAnnotations, async (_, input: unknown) => {
    const capture = await captures.saveAnnotations(
      SaveAnnotationInputSchema.parse(input),
    );
    notifyCapturesChanged();
    return capture;
  });
  ipcMain.handle(channels.openAnnotation, async (_, captureId: unknown) => {
    await openAnnotation(CaptureIdSchema.parse(captureId));
  });
};

app.whenReady().then(async () => {
  const dataDirectory = app.getPath('userData');
  database = new AppDatabase(join(dataDirectory, 'screen-me.sqlite'));
  assets = new AssetStore(join(dataDirectory, 'assets'));
  await assets.initialize();
  captures = new CaptureService(database, assets);
  screenshotWatcher = new ScreenshotWatcher(async (filePath) => {
    const capture = await captures.importSystemScreenshot(filePath);
    notifyCapturesChanged();
    await openAnnotation(capture.id);
  });
  await screenshotWatcher.start();
  registerProtocol();
  registerIpc();
  shortcutRegistered = globalShortcut.register(shortcut, () => {
    void captureAndAnnotate();
  });
  mainWindow = await createMainWindow();
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = await createMainWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  screenshotWatcher?.stop();
  globalShortcut.unregisterAll();
  database?.close();
});
