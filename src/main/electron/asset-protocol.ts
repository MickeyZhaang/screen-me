import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { protocol, type ProtocolRequest } from 'electron';
import { CaptureIdSchema } from '../../shared/captures/contracts';
import { AssetStore } from '../infrastructure/asset-store';
import { AppDatabase, type AssetRecord } from '../infrastructure/database';
import { appOrigin, isAppUrl, rendererOrigin } from './app-origin';

const contentSecurityPolicy = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self'",
  "connect-src 'self'",
].join('; ');

const staticContentTypes: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
};

export const registerAssetScheme = (): void => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'screen-me',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
      },
    },
  ]);
};

export class AssetProtocol {
  private readonly assetCache = new Map<string, AssetRecord>();
  private readonly rendererDirectory = join(
    __dirname,
    `../renderer/${MAIN_WINDOW_VITE_NAME}`,
  );

  constructor(
    private readonly database: AppDatabase,
    private readonly assets: AssetStore,
  ) {}

  start(): void {
    protocol.handle('screen-me', (request) =>
      this.handle(request as Request & ProtocolRequest),
    );
  }

  stop(): void {
    this.assetCache.clear();
    protocol.unhandle('screen-me');
  }

  private async handle(request: Request & ProtocolRequest): Promise<Response> {
    const url = new URL(request.url);
    if (!isAppUrl(url) || !['GET', 'HEAD'].includes(request.method)) {
      return new Response('Not found', { status: 404 });
    }
    const captureId = CaptureIdSchema.safeParse(
      url.pathname.replace(/^\/assets\//, ''),
    );
    if (url.pathname.startsWith('/assets/') && captureId.success) {
      return this.handleAsset(captureId.data, request);
    }
    return this.handleRenderer(url.pathname);
  }

  private async handleAsset(
    assetId: string,
    request: Request & ProtocolRequest,
  ): Promise<Response> {
    if (!this.isTrustedInitiator(request.initiatorOrigin)) {
      return new Response('Forbidden', { status: 403 });
    }
    try {
      const asset = this.assetCache.get(assetId) ?? this.database.getAsset(assetId);
      this.assetCache.set(assetId, asset);
      const headers = new Headers({ 'Content-Type': asset.mediaType });
      if (request.initiatorOrigin !== appOrigin) {
        headers.set('Access-Control-Allow-Origin', request.initiatorOrigin);
      }
      return new Response(
        request.method === 'HEAD'
          ? null
          : await readFile(this.assets.resolvePath(asset.relativePath)),
        {
          status: 200,
          headers,
        },
      );
    } catch {
      return new Response('Not found', { status: 404 });
    }
  }

  private async handleRenderer(pathname: string): Promise<Response> {
    const requestedPath = pathname === '/' ? '/index.html' : pathname;
    const resolvedPath = resolve(this.rendererDirectory, `.${requestedPath}`);
    if (
      !resolvedPath.startsWith(`${this.rendererDirectory}/`) &&
      resolvedPath !== this.rendererDirectory
    ) {
      return new Response('Not found', { status: 404 });
    }
    try {
      const headers = new Headers({
        'Content-Type':
          staticContentTypes[extname(resolvedPath)] ??
          'application/octet-stream',
      });
      if (requestedPath === '/index.html') {
        headers.set('Content-Security-Policy', contentSecurityPolicy);
      }
      return new Response(await readFile(resolvedPath), {
        status: 200,
        headers,
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  }

  private isTrustedInitiator(origin: string | undefined): origin is string {
    return origin === appOrigin || origin === rendererOrigin();
  }
}
