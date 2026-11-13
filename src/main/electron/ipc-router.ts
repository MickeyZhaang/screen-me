import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import { z } from 'zod';
import {
  CaptureIdSchema,
  ListCapturesInputSchema,
  SaveAnnotationInputSchema,
} from '../../shared/captures/contracts';
import { channels, type AppStatus } from '../../shared/ipc/contracts';
import { CaptureController } from '../application/capture-controller';
import { WindowManager } from './window-manager';

export class IpcRouter {
  constructor(
    private readonly captures: CaptureController,
    private readonly windows: WindowManager,
    private readonly getStatus: () => AppStatus,
    private readonly setScreenshotWatcherEnabled: (
      enabled: boolean,
    ) => Promise<AppStatus>,
  ) {}

  start(): void {
    ipcMain.handle(channels.getStatus, (event) => {
      this.assertHome(event);
      return this.getStatus();
    });
    ipcMain.handle(channels.listCaptures, (event, input: unknown) => {
      this.assertHome(event);
      return this.captures.list(
        ListCapturesInputSchema.parse(input ?? {}).offset,
      );
    });
    ipcMain.handle(channels.getCapture, (event, captureId: unknown) => {
      const id = CaptureIdSchema.parse(captureId);
      this.assertAnnotation(event, id);
      return this.captures.get(id);
    });
    ipcMain.handle(channels.capturePrimary, (event) => {
      this.assertHome(event);
      return this.captures.capturePrimaryDisplay();
    });
    ipcMain.handle(channels.saveAnnotations, (event, input: unknown) => {
      const parsed = SaveAnnotationInputSchema.parse(input);
      this.assertAnnotation(event, parsed.captureId);
      return this.captures.saveAnnotations(parsed);
    });
    ipcMain.handle(channels.openAnnotation, (event, captureId: unknown) => {
      this.assertHome(event);
      return this.captures.openAnnotation(CaptureIdSchema.parse(captureId));
    });
    ipcMain.handle(channels.deleteCapture, (event, captureId: unknown) => {
      this.assertHome(event);
      return this.captures.delete(CaptureIdSchema.parse(captureId));
    });
    ipcMain.handle(
      channels.setScreenshotWatcherEnabled,
      (event, enabled: unknown) => {
        this.assertHome(event);
        return this.setScreenshotWatcherEnabled(z.boolean().parse(enabled));
      },
    );
    ipcMain.handle(channels.minimizeWindow, (event) => {
      this.assertHome(event);
      this.windows.minimize(event.sender);
    });
    ipcMain.handle(channels.toggleMaximizeWindow, (event) => {
      this.assertHome(event);
      this.windows.toggleMaximize(event.sender);
    });
    ipcMain.handle(channels.closeWindow, (event) => {
      this.assertHome(event);
      this.windows.close(event.sender);
    });
  }

  stop(): void {
    for (const channel of [
      channels.getStatus,
      channels.listCaptures,
      channels.getCapture,
      channels.capturePrimary,
      channels.saveAnnotations,
      channels.openAnnotation,
      channels.deleteCapture,
      channels.setScreenshotWatcherEnabled,
      channels.minimizeWindow,
      channels.toggleMaximizeWindow,
      channels.closeWindow,
    ]) {
      ipcMain.removeHandler(channel);
    }
  }

  private assertHome(event: IpcMainInvokeEvent): void {
    this.assertTrusted(event);
    if (!this.windows.isHome(event.sender)) {
      throw new Error('This action is not available in this window');
    }
  }

  private assertAnnotation(event: IpcMainInvokeEvent, captureId: string): void {
    this.assertTrusted(event);
    if (!this.windows.canAccessCapture(event.sender, captureId)) {
      throw new Error('This capture is not available in this window');
    }
  }

  private assertTrusted(event: IpcMainInvokeEvent): void {
    if (
      event.senderFrame !== event.sender.mainFrame ||
      !this.windows.isTrusted(event.sender)
    ) {
      throw new Error('Untrusted IPC sender');
    }
  }
}
