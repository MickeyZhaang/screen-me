import { globalShortcut } from "electron";

export const captureShortcut = "CommandOrControl+Shift+2";

export class ShortcutManager {
  registered = false;

  start(action: () => Promise<unknown>): void {
    this.registered = globalShortcut.register(captureShortcut, () => {
      void action().catch((error: unknown) => {
        console.error("Screen capture failed", error);
      });
    });
  }

  stop(): void {
    globalShortcut.unregister(captureShortcut);
    this.registered = false;
  }
}
