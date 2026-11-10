import { pathToFileURL } from 'node:url';
import { net, protocol } from 'electron';
import { CaptureIdSchema } from '../../shared/contracts';
import { AssetStore } from '../infrastructure/asset-store';
import { AppDatabase } from '../infrastructure/database';

export const registerAssetScheme = (): void => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'screen-me',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
  ]);
};

export class AssetProtocol {
  constructor(
    private readonly database: AppDatabase,
    private readonly assets: AssetStore,
  ) {}

  start(): void {
    protocol.handle('screen-me', async (request) => {
      const url = new URL(request.url);
      if (url.hostname !== 'assets') {
        return new Response('Not found', { status: 404 });
      }
      try {
        const assetId = CaptureIdSchema.parse(url.pathname.replace(/^\//, ''));
        const asset = this.database.getAsset(assetId);
        const response = await net.fetch(
          pathToFileURL(this.assets.resolvePath(asset.relativePath)).toString(),
        );
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Content-Type', asset.mediaType);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch {
        return new Response('Not found', { status: 404 });
      }
    });
  }

  stop(): void {
    protocol.unhandle('screen-me');
  }
}
