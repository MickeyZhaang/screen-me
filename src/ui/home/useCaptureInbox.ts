import { useCallback, useEffect, useState } from 'react';
import type { Capture } from '../../shared/captures/contracts';
import type { AppStatus } from '../../shared/ipc/contracts';

export const useCaptureInbox = () => {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const home = window.screenMe.home;
    if (!home) {
      throw new Error('The inbox API is unavailable in this window');
    }
    const [nextCaptures, nextStatus] = await Promise.all([
      home.listCaptures(),
      home.getStatus(),
    ]);
    setCaptures(nextCaptures.captures);
    setNextOffset(nextCaptures.nextOffset);
    setStatus(nextStatus);
  }, []);

  useEffect(() => {
    const home = window.screenMe.home;
    if (!home) {
      setError('The inbox API is unavailable in this window');
      return;
    }
    void refresh().catch((reason: unknown) =>
      setError(reason instanceof Error ? reason.message : String(reason)),
    );
    return home.onCapturesChanged(() => {
      void refresh();
    });
  }, [refresh]);

  const capture = async () => {
    const home = window.screenMe.home;
    if (!home) {
      setError('The inbox API is unavailable in this window');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await home.capturePrimary();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };

  const loadMore = async () => {
    const home = window.screenMe.home;
    if (!home || nextOffset === null) {
      return;
    }
    setLoadingMore(true);
    setError(null);
    try {
      const page = await home.listCaptures({ offset: nextOffset });
      setCaptures((current) => [...current, ...page.captures]);
      setNextOffset(page.nextOffset);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoadingMore(false);
    }
  };

  const remove = async (captureId: string) => {
    const home = window.screenMe.home;
    if (!home) {
      setError('The inbox API is unavailable in this window');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await home.deleteCapture(captureId);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };

  const setScreenshotWatcherEnabled = async (enabled: boolean) => {
    const home = window.screenMe.home;
    if (!home) {
      setError('The inbox API is unavailable in this window');
      return;
    }
    setError(null);
    try {
      setStatus(await home.setScreenshotWatcherEnabled(enabled));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  return {
    captures,
    status,
    busy,
    loadingMore,
    nextOffset,
    error,
    capture,
    loadMore,
    remove,
    setScreenshotWatcherEnabled,
  };
};
