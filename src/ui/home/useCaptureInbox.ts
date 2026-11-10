import { useCallback, useEffect, useState } from 'react';
import type { Capture } from '../../shared/captures/contracts';
import type { AppStatus } from '../../shared/ipc/contracts';

export const useCaptureInbox = () => {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [nextCaptures, nextStatus] = await Promise.all([
      window.screenMe.listCaptures(),
      window.screenMe.getStatus(),
    ]);
    setCaptures(nextCaptures);
    setStatus(nextStatus);
  }, []);

  useEffect(() => {
    void refresh().catch((reason: unknown) =>
      setError(reason instanceof Error ? reason.message : String(reason)),
    );
    return window.screenMe.onCapturesChanged(() => {
      void refresh();
    });
  }, [refresh]);

  const capture = async () => {
    setBusy(true);
    setError(null);
    try {
      await window.screenMe.capturePrimary();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };

  return { captures, status, busy, error, capture };
};
