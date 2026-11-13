import {
  BrowserWindow,
  desktopCapturer,
  screen,
  type DesktopCapturerSource,
} from "electron";
import type { ScreenCaptureProvider } from "../application/capture-service";

export class DesktopCaptureProvider implements ScreenCaptureProvider {
  async capturePrimaryDisplay(): Promise<Buffer> {
    const visibleWindows = BrowserWindow.getAllWindows().filter(
      (window) => window.isVisible() && !window.isDestroyed(),
    );
    for (const window of visibleWindows) {
      window.hide();
    }
    await new Promise((resolve) => setTimeout(resolve, 180));
    try {
      const display = screen.getPrimaryDisplay();
      const thumbnailSize = {
        width: Math.round(display.size.width * display.scaleFactor),
        height: Math.round(display.size.height * display.scaleFactor),
      };
      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize,
      });
      const source = this.pickSource(sources, display.id);
      if (!source || source.thumbnail.isEmpty()) {
        throw new Error(
          "Screen capture is unavailable. Allow Screen Me in System Settings → Privacy & Security → Screen & System Audio Recording.",
        );
      }
      return source.thumbnail.toPNG();
    } finally {
      for (const window of visibleWindows) {
        if (!window.isDestroyed()) {
          window.show();
        }
      }
    }
  }

  private pickSource(
    sources: DesktopCapturerSource[],
    displayId: number,
  ): DesktopCapturerSource | undefined {
    return (
      sources.find((source) => source.display_id === String(displayId)) ??
      sources[0]
    );
  }
}
