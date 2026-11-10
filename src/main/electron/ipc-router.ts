import { ipcMain } from 'electron';
import type { AppStatus } from '../../shared/contracts';
import {
  CaptureIdSchema,
  channels,
  SaveAnnotationInputSchema,
} from '../../shared/contracts';
import { CaptureController } from '../application/capture-controller';

export class IpcRouter {
  constructor(
    private readonly captures: CaptureController,
    private readonly getStatus: () => AppStatus,
  ) {}

  start(): void {
    ipcMain.handle(channels.getStatus, () => this.getStatus());
    ipcMain.handle(channels.listCaptures, () => this.captures.list());
    ipcMain.handle(channels.getCapture, (_, captureId: unknown) =>
      this.captures.get(CaptureIdSchema.parse(captureId)),
    );
    ipcMain.handle(channels.capturePrimary, () =>
      this.captures.capturePrimaryDisplay(),
    );
    ipcMain.handle(channels.saveAnnotations, (_, input: unknown) =>
      this.captures.saveAnnotations(SaveAnnotationInputSchema.parse(input)),
    );
    ipcMain.handle(channels.openAnnotation, (_, captureId: unknown) =>
      this.captures.openAnnotation(CaptureIdSchema.parse(captureId)),
    );
  }

  stop(): void {
    for (const channel of [
      channels.getStatus,
      channels.listCaptures,
      channels.getCapture,
      channels.capturePrimary,
      channels.saveAnnotations,
      channels.openAnnotation,
    ]) {
      ipcMain.removeHandler(channel);
    }
  }
}
