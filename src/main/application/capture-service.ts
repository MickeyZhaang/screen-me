import { basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import type {
  Capture,
  CapturePage,
  SaveAnnotationInput,
} from '../../shared/captures/contracts';
import { validateAnnotation } from './annotation-validator';
import { AssetStore } from '../infrastructure/asset-store';
import {
  AppDatabase,
  type AssetRecord,
  type CaptureRecord,
} from '../infrastructure/database';

export interface ScreenCaptureProvider {
  capturePrimaryDisplay(): Promise<Buffer>;
}

const assetUrl = (assetId: string): string => `screen-me://app/assets/${assetId}`;

export class CaptureService {
  constructor(
    private readonly database: AppDatabase,
    private readonly assets: AssetStore,
    private readonly screenCapture: ScreenCaptureProvider,
  ) {}

  list(offset: number): CapturePage {
    const page = this.database.listCaptures(offset);
    return {
      captures: page.captures.map((capture) => this.toCapture(capture)),
      nextOffset: page.nextOffset,
    };
  }

  get(captureId: string): Capture {
    return this.toCapture(this.database.getCapture(captureId));
  }

  async capturePrimaryDisplay(): Promise<Capture> {
    const buffer = await this.screenCapture.capturePrimaryDisplay();
    return this.createCapture({
      title: `Capture ${new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })}`,
      source: 'app',
      buffer,
      writeAsset: () => this.assets.writePng(buffer),
    });
  }

  async importSystemScreenshot(filePath: string): Promise<Capture> {
    return this.createCapture({
      title: basename(filePath, basename(filePath).match(/\.[^.]+$/)?.[0]),
      source: 'system',
      writeAsset: () => this.assets.importFile(filePath),
    });
  }

  async saveAnnotations(input: SaveAnnotationInput): Promise<Capture> {
    validateAnnotation(input.annotationJson);
    const encoded = input.renderedDataUrl.replace(
      /^data:image\/png;base64,/,
      '',
    );
    const renderedAsset = await this.assets.writePng(
      Buffer.from(encoded, 'base64'),
    );
    try {
      const updated = this.database.updateAnnotations(
        input.captureId,
        input.annotationJson,
        renderedAsset,
      );
      if (updated.replacedAsset) {
        await this.assets.remove(updated.replacedAsset.relativePath).catch(() => undefined);
      }
      return this.toCapture(updated.capture);
    } catch (error) {
      await this.assets.remove(renderedAsset.relativePath);
      throw error;
    }
  }

  async delete(captureId: string): Promise<void> {
    const assets = this.database.deleteCapture(captureId);
    await Promise.all(
      assets.map((asset) => this.assets.remove(asset.relativePath).catch(() => undefined)),
    );
  }

  private async createCapture(input: {
    title: string;
    source: 'app' | 'system';
    buffer?: Buffer;
    writeAsset(): Promise<AssetRecord>;
  }): Promise<Capture> {
    const asset = await input.writeAsset();
    try {
      const buffer = input.buffer ?? await readFile(this.assets.resolvePath(asset.relativePath));
      const thumbnail = await this.assets.createThumbnail(buffer);
      try {
        return this.toCapture(
          this.database.createCapture({
            title: input.title,
            source: input.source,
            asset,
            thumbnail,
          }),
        );
      } catch (error) {
        await this.assets.remove(thumbnail.relativePath);
        throw error;
      }
    } catch (error) {
      await this.assets.remove(asset.relativePath);
      throw error;
    }
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
      thumbnailImageUrl: assetUrl(
        record.thumbnailAssetId ?? record.renderedAssetId ?? record.originalAssetId,
      ),
      annotationJson: record.annotationJson,
      width: record.width,
      height: record.height,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
