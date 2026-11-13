import { CaptureCard } from './CaptureCard';
import { StatusNav } from './components/StatusNav';
import {
  CaptureButton,
  Empty,
  ErrorBanner,
  Eyebrow,
  Grid,
  Hero,
  InboxHeader,
  More,
  Page,
  Title,
  TitleAccent,
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
    <>
      <StatusNav
        status={status}
        onWatcherChange={(enabled) => void setScreenshotWatcherEnabled(enabled)}
      />
      <Page>
        <Hero>
        <div>
          <Eyebrow>Local screenshot notebook</Eyebrow>
          <Title>
            All your captures.<br />
            <TitleAccent>In one place.</TitleAccent>
          </Title>
        </div>
        <CaptureButton disabled={busy} onClick={() => void capture()}>
          {busy ? 'Capturing…' : 'New capture'}
        </CaptureButton>
        </Hero>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <InboxHeader>
          <h2>Inbox</h2>
          <p>
            {captures.length} {captures.length === 1 ? 'capture' : 'captures'}
          </p>
        </InboxHeader>

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
            Start a new capture or turn on the watcher to add macOS screenshots.
          </Empty>
        )}
        {nextOffset !== null ? (
          <More>
            <CaptureButton disabled={loadingMore} onClick={() => void loadMore()}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </CaptureButton>
          </More>
        ) : null}
      </Page>
    </>
  );
}
