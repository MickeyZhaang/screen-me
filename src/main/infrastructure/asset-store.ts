import { createHash, randomUUID } from 'node:crypto';
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { nativeImage } from 'electron';
import {
  maxImageBytes,
  maxImagePixels,
  thumbnailWidth,
} from '../../shared/captures/limits';
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
    const fileStat = await stat(filePath);
    this.assertByteSize(fileStat.size);
    return this.writeBuffer(await readFile(filePath), extension, mediaType);
  }

  async writePng(buffer: Buffer): Promise<AssetRecord> {
    return this.writeBuffer(buffer, '.png', 'image/png');
  }

  async createThumbnail(buffer: Buffer): Promise<AssetRecord> {
    this.assertByteSize(buffer.byteLength);
    const image = nativeImage.createFromBuffer(buffer);
    const size = image.getSize();
    this.assertImageSize(size.width, size.height);
    const width = Math.min(thumbnailWidth, size.width);
    const height = Math.max(1, Math.round((size.height / size.width) * width));
    return this.writePng(image.resize({ width, height }).toPNG());
  }

  async remove(relativePath: string): Promise<void> {
    await rm(this.resolvePath(relativePath), { force: true });
  }

  async reconcile(referencedPaths: Iterable<string>): Promise<void> {
    const referenced = new Set(referencedPaths);
    const entries = await readdir(this.rootDirectory, { withFileTypes: true });
    await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .filter((entry) => !referenced.has(entry.name))
        .map((entry) =>
          rm(join(this.rootDirectory, entry.name), { force: true }),
        ),
    );
  }

  resolvePath(relativePath: string): string {
    if (basename(relativePath) !== relativePath) {
      throw new Error('Invalid asset path');
    }
    return join(this.rootDirectory, relativePath);
  }

  private async writeBuffer(
    buffer: Buffer,
    extension: string,
    mediaType: string,
  ): Promise<AssetRecord> {
    this.assertByteSize(buffer.byteLength);
    const id = randomUUID();
    const relativePath = `${id}${extension}`;
    const record = this.createRecord(id, relativePath, mediaType, buffer);
    const temporaryPath = join(this.rootDirectory, `${id}.partial`);
    const destinationPath = this.resolvePath(relativePath);
    try {
      await writeFile(temporaryPath, buffer);
      await rename(temporaryPath, destinationPath);
      return record;
    } catch (error) {
      await rm(temporaryPath, { force: true });
      await rm(destinationPath, { force: true });
      throw error;
    }
  }

  private createRecord(
    id: string,
    relativePath: string,
    mediaType: string,
    buffer: Buffer,
  ): AssetRecord {
    const image = nativeImage.createFromBuffer(buffer);
    const size = image.getSize();
    if (image.isEmpty()) {
      throw new Error('The captured image could not be decoded');
    }
    this.assertImageSize(size.width, size.height);
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

  private assertByteSize(byteSize: number): void {
    if (byteSize > maxImageBytes) {
      throw new Error('The image exceeds the maximum file size');
    }
  }

  private assertImageSize(width: number, height: number): void {
    if (width <= 0 || height <= 0 || width * height > maxImagePixels) {
      throw new Error('The image exceeds the maximum dimensions');
    }
  }
}
