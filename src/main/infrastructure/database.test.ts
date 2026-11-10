import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { AppDatabase, type AssetRecord } from './database';

const directories: string[] = [];

const createAsset = (id: string): AssetRecord => ({
  id,
  relativePath: `${id}.png`,
  mediaType: 'image/png',
  width: 1280,
  height: 720,
  byteSize: 2048,
  sha256: id.padEnd(64, '0'),
  createdAt: new Date().toISOString(),
});

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe('AppDatabase', () => {
  it('persists captures in newest-first document order', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'screen-me-test-'));
    directories.push(directory);
    const database = new AppDatabase(join(directory, 'test.sqlite'));

    const first = database.createCapture({
      title: 'First capture',
      source: 'app',
      asset: createAsset('first'),
    });
    const second = database.createCapture({
      title: 'Second capture',
      source: 'system',
      asset: createAsset('second'),
    });

    expect(database.listCaptures().map((capture) => capture.id)).toEqual([
      second.id,
      first.id,
    ]);
    database.close();
  });

  it('stores editable annotations and a rendered asset atomically', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'screen-me-test-'));
    directories.push(directory);
    const database = new AppDatabase(join(directory, 'test.sqlite'));
    const capture = database.createCapture({
      title: 'Annotated capture',
      source: 'app',
      asset: createAsset('original'),
    });

    const updated = database.updateAnnotations(
      capture.id,
      '{"objects":[]}',
      createAsset('rendered'),
    );

    expect(updated.annotationJson).toBe('{"objects":[]}');
    expect(updated.renderedAssetId).toBe('rendered');
    database.close();
  });
});
