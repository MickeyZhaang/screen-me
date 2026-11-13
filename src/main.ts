import { join } from 'node:path';
import { app, systemPreferences } from 'electron';
import { CaptureController } from './main/application/capture-controller';
import { CaptureService } from './main/application/capture-service';
import {
  AssetProtocol,
  registerAssetScheme,
} from './main/electron/asset-protocol';
import { CaptureChangeNotifier } from './main/electron/capture-change-notifier';
import { DesktopCaptureProvider } from './main/electron/desktop-capture-provider';
import { IpcRouter } from './main/electron/ipc-router';
import {
  captureShortcut,
  ShortcutManager,
} from './main/electron/shortcut-manager';
import { configureSessionSecurity } from './main/electron/session-security';
import { WindowManager } from './main/electron/window-manager';
import { AssetStore } from './main/infrastructure/asset-store';
import { AppDatabase } from './main/infrastructure/database';
import { ScreenshotWatcher } from './main/infrastructure/screenshot-watcher';

registerAssetScheme();

let stopApplication: (() => void) | undefined;

const startApplication = async (): Promise<void> => {
  const dataDirectory = app.getPath('userData');
  const database = new AppDatabase(join(dataDirectory, 'screen-me.sqlite'));
  const assets = new AssetStore(join(dataDirectory, 'assets'));
  const windows = new WindowManager();
  const captureService = new CaptureService(
    database,
    assets,
    new DesktopCaptureProvider(),
  );
  const captures = new CaptureController(
    captureService,
    windows,
    new CaptureChangeNotifier(),
  );
  const screenshotWatcher = new ScreenshotWatcher((filePath) =>
    captures.importSystemScreenshot(filePath).then(() => undefined),
  );
  const shortcuts = new ShortcutManager();
  const assetProtocol = new AssetProtocol(database, assets);
  const getStatus = () => ({
    shortcut: captureShortcut,
    shortcutRegistered: shortcuts.registered,
    screenshotDirectory: screenshotWatcher.directory,
    screenshotWatcherRunning: screenshotWatcher.running,
    screenshotWatcherEnabled: database.getScreenshotWatcherEnabled(),
    screenPermission:
      process.platform === 'darwin'
        ? systemPreferences.getMediaAccessStatus('screen')
        : 'unknown',
  });
  const setScreenshotWatcherEnabled = async (enabled: boolean) => {
    if (enabled) {
      await screenshotWatcher.start();
    } else {
      screenshotWatcher.stop();
    }
    database.setScreenshotWatcherEnabled(enabled);
    return getStatus();
  };
  const ipc = new IpcRouter(
    captures,
    windows,
    getStatus,
    setScreenshotWatcherEnabled,
  );

  await assets.initialize();
  await assets.reconcile(database.listAssetPaths());
  configureSessionSecurity();
  if (database.getScreenshotWatcherEnabled()) {
    await screenshotWatcher.start();
  }
  assetProtocol.start();
  ipc.start();
  shortcuts.start(() => captures.capturePrimaryDisplay());
  await windows.openMain();

  app.on('activate', () => {
    void windows.openMain();
  });

  stopApplication = () => {
    screenshotWatcher.stop();
    shortcuts.stop();
    ipc.stop();
    assetProtocol.stop();
    database.close();
  };
};

void app
  .whenReady()
  .then(startApplication)
  .catch((error: unknown) => {
    console.error('Screen Me failed to start', error);
    app.quit();
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopApplication?.();
  stopApplication = undefined;
});
