export const appOrigin = 'screen-me://app';

export const isAppUrl = (url: URL): boolean =>
  url.protocol === 'screen-me:' && url.host === 'app';

export const rendererOrigin = (): string =>
  MAIN_WINDOW_VITE_DEV_SERVER_URL
    ? new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL).origin
    : appOrigin;

export const isTrustedRendererUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return MAIN_WINDOW_VITE_DEV_SERVER_URL
      ? parsed.origin === rendererOrigin()
      : isAppUrl(parsed);
  } catch {
    return false;
  }
};
