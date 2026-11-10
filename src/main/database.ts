import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';

export interface AssetRecord {
  id: string;
  relativePath: string;
  mediaType: string;
  width: number;
  height: number;
  byteSize: number;
  sha256: string;
  createdAt: string;
}

export interface CaptureRecord {
  id: string;
  documentId: string;
  title: string;
  source: 'app' | 'system';
  originalAssetId: string;
  renderedAssetId: string | null;
  annotationJson: string | null;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

interface CaptureRow {
  id: string;
  document_id: string;
  title: string;
  source: 'app' | 'system';
  original_asset_id: string;
  rendered_asset_id: string | null;
  annotation_json: string | null;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

interface AssetRow {
  id: string;
  relative_path: string;
  media_type: string;
  width: number;
  height: number;
  byte_size: number;
  sha256: string;
  created_at: string;
}

export class AppDatabase {
  private readonly connection: Database.Database;
  readonly inboxDocumentId = 'inbox';

  constructor(databasePath: string) {
    this.connection = new Database(databasePath);
    this.connection.pragma('journal_mode = WAL');
    this.connection.pragma('foreign_keys = ON');
    this.migrate();
  }

  close(): void {
    this.connection.close();
  }

  createCapture(input: {
    title: string;
    source: 'app' | 'system';
    asset: AssetRecord;
  }): CaptureRecord {
    const now = new Date().toISOString();
    const captureId = randomUUID();
    const blockId = randomUUID();
    const transaction = this.connection.transaction(() => {
      this.insertAsset(input.asset);
      this.connection
        .prepare(
          `INSERT INTO captures (
            id, document_id, title, source, original_asset_id,
            width, height, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          captureId,
          this.inboxDocumentId,
          input.title,
          input.source,
          input.asset.id,
          input.asset.width,
          input.asset.height,
          now,
          now,
        );
      const position = (
        this.connection
          .prepare(
            'SELECT COALESCE(MAX(position), -1) + 1 AS position FROM document_blocks WHERE document_id = ?',
          )
          .get(this.inboxDocumentId) as { position: number }
      ).position;
      this.connection
        .prepare(
          'INSERT INTO document_blocks (id, document_id, capture_id, position, created_at) VALUES (?, ?, ?, ?, ?)',
        )
        .run(blockId, this.inboxDocumentId, captureId, position, now);
    });
    transaction();
    return this.getCapture(captureId);
  }

  updateAnnotations(
    captureId: string,
    annotationJson: string,
    renderedAsset: AssetRecord,
  ): CaptureRecord {
    const transaction = this.connection.transaction(() => {
      this.insertAsset(renderedAsset);
      const result = this.connection
        .prepare(
          `UPDATE captures
           SET annotation_json = ?, rendered_asset_id = ?, updated_at = ?
           WHERE id = ?`,
        )
        .run(
          annotationJson,
          renderedAsset.id,
          new Date().toISOString(),
          captureId,
        );
      if (result.changes !== 1) {
        throw new Error('Capture not found');
      }
    });
    transaction();
    return this.getCapture(captureId);
  }

  listCaptures(): CaptureRecord[] {
    const rows = this.connection
      .prepare(
        `SELECT captures.*
         FROM document_blocks
         JOIN captures ON captures.id = document_blocks.capture_id
         WHERE document_blocks.document_id = ?
         ORDER BY document_blocks.position DESC`,
      )
      .all(this.inboxDocumentId) as CaptureRow[];
    return rows.map(this.mapCapture);
  }

  getCapture(captureId: string): CaptureRecord {
    const row = this.connection
      .prepare('SELECT * FROM captures WHERE id = ?')
      .get(captureId) as CaptureRow | undefined;
    if (!row) {
      throw new Error('Capture not found');
    }
    return this.mapCapture(row);
  }

  getAsset(assetId: string): AssetRecord {
    const row = this.connection
      .prepare('SELECT * FROM assets WHERE id = ?')
      .get(assetId) as AssetRow | undefined;
    if (!row) {
      throw new Error('Asset not found');
    }
    return {
      id: row.id,
      relativePath: row.relative_path,
      mediaType: row.media_type,
      width: row.width,
      height: row.height,
      byteSize: row.byte_size,
      sha256: row.sha256,
      createdAt: row.created_at,
    };
  }

  private insertAsset(asset: AssetRecord): void {
    this.connection
      .prepare(
        `INSERT INTO assets (
          id, relative_path, media_type, width, height, byte_size, sha256, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        asset.id,
        asset.relativePath,
        asset.mediaType,
        asset.width,
        asset.height,
        asset.byteSize,
        asset.sha256,
        asset.createdAt,
      );
  }

  private migrate(): void {
    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        relative_path TEXT NOT NULL UNIQUE,
        media_type TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        byte_size INTEGER NOT NULL,
        sha256 TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS captures (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL REFERENCES documents(id),
        title TEXT NOT NULL,
        source TEXT NOT NULL CHECK (source IN ('app', 'system')),
        original_asset_id TEXT NOT NULL REFERENCES assets(id),
        rendered_asset_id TEXT REFERENCES assets(id),
        annotation_json TEXT,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS document_blocks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL REFERENCES documents(id),
        capture_id TEXT NOT NULL UNIQUE REFERENCES captures(id),
        position INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(document_id, position)
      );

      CREATE INDEX IF NOT EXISTS document_blocks_document_position
      ON document_blocks(document_id, position);
    `);
    const now = new Date().toISOString();
    this.connection
      .prepare(
        `INSERT OR IGNORE INTO documents (id, title, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
      )
      .run(this.inboxDocumentId, 'Capture inbox', now, now);
  }

  private mapCapture(row: CaptureRow): CaptureRecord {
    return {
      id: row.id,
      documentId: row.document_id,
      title: row.title,
      source: row.source,
      originalAssetId: row.original_asset_id,
      renderedAssetId: row.rendered_asset_id,
      annotationJson: row.annotation_json,
      width: row.width,
      height: row.height,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
