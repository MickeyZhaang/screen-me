import { basename } from 'node:path';
import type {
  Capture,
  SaveAnnotationInput,
} from '../../shared/captures/contracts';
import { AssetStore } from '../infrastructure/asset-store';
import {
  AppDatabase,
  type CaptureRecord,
} from '../infrastructure/database';

export interface ScreenCaptureProvider {
  capturePrimaryDisplay(): Promise<Buffer>;
}

const assetUrl = (assetId: string): string => `screen-me://assets/${assetId}`;

export class CaptureService {
  constructor(
    private readonly database: AppDatabase,
    private readonly assets: AssetStore,
    private readonly screenCapture: ScreenCaptureProvider,
  ) {}

  list(): Capture[] {
    return this.database.listCaptures().map((capture) => this.toCapture(capture));
  }

  get(captureId: string): Capture {
    return this.toCapture(this.database.getCapture(captureId));
  }

  async capturePrimaryDisplay(): Promise<Capture> {
    const buffer = await this.screenCapture.capturePrimaryDisplay();
    const asset = await this.assets.writePng(buffer);
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

  async saveAnnotations(input: SaveAnnotationInput): Promise<Capture> {
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
