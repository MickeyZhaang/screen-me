import { basename } from 'node:path';
import {
  BrowserWindow,
  desktopCapturer,
  screen,
  type DesktopCapturerSource,
} from 'electron';
import type { Capture } from '../shared/contracts';
import { AssetStore } from './assets';
import { AppDatabase, type CaptureRecord } from './database';

const assetUrl = (assetId: string): string => `screen-me://assets/${assetId}`;

export class CaptureService {
  constructor(
    private readonly database: AppDatabase,
    private readonly assets: AssetStore,
  ) {}

  list(): Capture[] {
    return this.database.listCaptures().map((capture) => this.toCapture(capture));
  }

  get(captureId: string): Capture {
    return this.toCapture(this.database.getCapture(captureId));
  }

  async capturePrimaryDisplay(): Promise<Capture> {
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
        types: ['screen'],
        thumbnailSize,
      });
      const source = this.pickSource(sources, display.id);
      if (!source || source.thumbnail.isEmpty()) {
        throw new Error(
          'Screen capture is unavailable. Allow Screen Me in System Settings → Privacy & Security → Screen & System Audio Recording.',
        );
      }
      const asset = await this.assets.writePng(source.thumbnail.toPNG());
      return this.toCapture(
        this.database.createCapture({
          title: `Capture ${new Date().toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}`,
          source: 'app',
          asset,
        }),
      );
    } finally {
      for (const window of visibleWindows) {
        if (!window.isDestroyed()) {
          window.show();
        }
      }
    }
  }

  async importSystemScreenshot(filePath: string): Promise<Capture> {
    const asset = await this.assets.importFile(filePath);
    return this.toCapture(
      this.database.createCapture({
        title: basename(filePath, basename(filePath).match(/\.[^.]+$/)?.[0]),
        source: 'system',
        asset,
      }),
    );
  }

  async saveAnnotations(input: {
    captureId: string;
    annotationJson: string;
    renderedDataUrl: string;
  }): Promise<Capture> {
    const encoded = input.renderedDataUrl.replace(
      /^data:image\/png;base64,/,
      '',
    );
    const renderedAsset = await this.assets.writePng(
      Buffer.from(encoded, 'base64'),
    );
    return this.toCapture(
      this.database.updateAnnotations(
        input.captureId,
        input.annotationJson,
        renderedAsset,
      ),
    );
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

  private toCapture(record: CaptureRecord): Capture {
    return {
      id: record.id,
      documentId: record.documentId,
      title: record.title,
      source: record.source,
      originalImageUrl: assetUrl(record.originalAssetId),
      displayImageUrl: assetUrl(
        record.renderedAssetId ?? record.originalAssetId,
      ),
      annotationJson: record.annotationJson,
      width: record.width,
      height: record.height,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
