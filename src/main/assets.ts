import { createHash, randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { nativeImage } from 'electron';
import type { AssetRecord } from './database';

const mediaTypes: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

export class AssetStore {
  constructor(private readonly rootDirectory: string) {}

  async initialize(): Promise<void> {
    await mkdir(this.rootDirectory, { recursive: true });
  }

  async importFile(filePath: string): Promise<AssetRecord> {
    const extension = extname(filePath).toLowerCase();
    const mediaType = mediaTypes[extension];
    if (!mediaType) {
      throw new Error('Unsupported screenshot format');
    }
    const id = randomUUID();
    const relativePath = `${id}${extension}`;
    const temporaryPath = join(this.rootDirectory, `${id}.partial`);
    const destinationPath = join(this.rootDirectory, relativePath);
    await copyFile(filePath, temporaryPath);
    await rename(temporaryPath, destinationPath);
    const buffer = await readFile(destinationPath);
    return this.createRecord(id, relativePath, mediaType, buffer);
  }

  async writePng(buffer: Buffer): Promise<AssetRecord> {
    const id = randomUUID();
    const relativePath = `${id}.png`;
    const temporaryPath = join(this.rootDirectory, `${id}.partial`);
    const destinationPath = join(this.rootDirectory, relativePath);
    await writeFile(temporaryPath, buffer);
    await rename(temporaryPath, destinationPath);
    return this.createRecord(id, relativePath, 'image/png', buffer);
  }

  resolvePath(relativePath: string): string {
    return join(this.rootDirectory, relativePath);
  }

  private createRecord(
    id: string,
    relativePath: string,
    mediaType: string,
    buffer: Buffer,
  ): AssetRecord {
    const image = nativeImage.createFromBuffer(buffer);
    const size = image.getSize();
    if (image.isEmpty() || size.width === 0 || size.height === 0) {
      throw new Error('The captured image could not be decoded');
    }
    return {
      id,
      relativePath,
      mediaType,
      width: size.width,
      height: size.height,
      byteSize: buffer.byteLength,
      sha256: createHash('sha256').update(buffer).digest('hex'),
      createdAt: new Date().toISOString(),
    };
  }
}
