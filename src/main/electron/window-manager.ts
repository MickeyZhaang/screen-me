import { join } from 'node:path';
import { BrowserWindow, screen } from 'electron';
import type { AnnotationOpener } from '../application/capture-controller';

export class WindowManager implements AnnotationOpener {
  private mainWindow: BrowserWindow | null = null;
  private readonly annotationWindows = new Map<string, BrowserWindow>();

  async openMain(): Promise<void> {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.show();
      this.mainWindow.focus();
      return;
    }
    const window = new BrowserWindow({
      ...this.secureWindowOptions(),
      width: 1040,
      height: 760,
      minWidth: 760,
      minHeight: 560,
      title: 'Screen Me',
      backgroundColor: '#f4f1ea',
    });
    this.mainWindow = window;
    this.lockNavigation(window);
    window.on('closed', () => {
      if (this.mainWindow === window) {
        this.mainWindow = null;
      }
    });
    await this.loadRenderer(window);
  }

  async openAnnotation(captureId: string): Promise<void> {
    const existing = this.annotationWindows.get(captureId);
    if (existing && !existing.isDestroyed()) {
      existing.show();
      existing.focus();
      return;
    }
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const window = new BrowserWindow({
      ...this.secureWindowOptions(),
      width: Math.min(1220, display.workAreaSize.width - 48),
      height: Math.min(860, display.workAreaSize.height - 48),
      minWidth: 760,
      minHeight: 600,
      title: `Annotate ${captureId}`,
      backgroundColor: '#151515',
      show: false,
    });
    this.annotationWindows.set(captureId, window);
    this.lockNavigation(window);
    window.on('closed', () => {
      if (this.annotationWindows.get(captureId) === window) {
        this.annotationWindows.delete(captureId);
      }
    });
    await this.loadRenderer(window, { mode: 'annotation', captureId });
    window.show();
  }

  private secureWindowOptions() {
    return {
      webPreferences: {
        preload: join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    };
  }

  private lockNavigation(window: BrowserWindow): void {
    window.webContents.on('will-navigate', (event) => event.preventDefault());
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  }

  private async loadRenderer(
    window: BrowserWindow,
    query: Record<string, string> = {},
  ): Promise<void> {
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
  }
}
