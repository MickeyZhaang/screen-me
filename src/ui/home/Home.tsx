import { CaptureCard } from './CaptureCard';
import {
  CaptureButton,
  Empty,
  ErrorBanner,
  Eyebrow,
  Grid,
  Header,
  Page,
  StatusBar,
  StatusPill,
  Subtitle,
  Title,
} from './home.styles';
import { useCaptureInbox } from './useCaptureInbox';

export function Home() {
  const {
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
  } = useCaptureInbox();

  return (
    <Page>
      <Header>
        <div>
          <Eyebrow>Local screenshot notebook</Eyebrow>
          <Title>Capture what matters.</Title>
          <Subtitle>
            Take a screen capture or use the normal macOS screenshot flow. New
            images open ready for markup and stay in this local inbox.
          </Subtitle>
        </div>
        <CaptureButton disabled={busy} onClick={() => void capture()}>
          {busy ? 'Capturing…' : 'Capture screen'}
        </CaptureButton>
      </Header>

      <StatusBar>
        <StatusPill $tone={status?.shortcutRegistered ? 'good' : 'warn'}>
          Shortcut {status?.shortcut ?? '…'}
        </StatusPill>
        <StatusPill $tone={status?.screenshotWatcherRunning ? 'good' : 'warn'}>
          <label>
            <input
              type="checkbox"
              checked={status?.screenshotWatcherEnabled ?? false}
              onChange={(event) =>
                void setScreenshotWatcherEnabled(event.currentTarget.checked)
              }
            />
            Screenshot watcher {status?.screenshotWatcherRunning ? 'on' : 'off'}
          </label>
        </StatusPill>
        <StatusPill $tone={status?.screenPermission === 'granted' ? 'good' : 'warn'}>
          Screen permission {status?.screenPermission ?? 'unknown'}
        </StatusPill>
      </StatusBar>

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {captures.length ? (
        <Grid>
          {captures.map((captureItem) => (
            <CaptureCard
              key={captureItem.id}
              capture={captureItem}
              onDelete={(captureId) => {
                if (window.confirm('Delete this capture and its local files?')) {
                  void remove(captureId);
                }
              }}
            />
          ))}
        </Grid>
      ) : (
        <Empty>
          <strong>Your capture inbox is empty.</strong>
          Use the button, press {status?.shortcut ?? 'the global shortcut'}, or
          take a normal macOS screenshot.
        </Empty>
      )}
      {nextOffset !== null ? (
        <CaptureButton disabled={loadingMore} onClick={() => void loadMore()}>
          {loadingMore ? 'Loading…' : 'Load more'}
        </CaptureButton>
      ) : null}
    </Page>
  );
}
