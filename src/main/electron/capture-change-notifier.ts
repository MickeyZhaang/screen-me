import { BrowserWindow } from 'electron';
import { channels } from '../../shared/contracts';
import type { CaptureChangePublisher } from '../application/capture-controller';

export class CaptureChangeNotifier implements CaptureChangePublisher {
  publish(): void {
    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        window.webContents.send(channels.capturesChanged);
      }
    }
  }
}
