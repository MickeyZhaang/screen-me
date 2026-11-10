import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import type { AppStatus, Capture } from '../shared/contracts';

const Page = styled.main`
  min-height: 100vh;
  padding: 48px clamp(24px, 6vw, 72px) 80px;
`;

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  max-width: 1180px;
  margin: 0 auto 38px;
`;

const Eyebrow = styled.p`
  margin: 0 0 10px;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(44px, 7vw, 76px);
  font-weight: 500;
  letter-spacing: -0.055em;
  line-height: 0.96;
`;

const Subtitle = styled.p`
  max-width: 560px;
  margin: 18px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 17px;
  line-height: 1.55;
`;

const CaptureButton = styled.button`
  flex: 0 0 auto;
  min-width: 172px;
  padding: 15px 22px;
  border: 0;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.accent};
  box-shadow: 0 10px 28px rgba(255, 91, 53, 0.3);
  font-weight: 800;
  transition:
    transform 140ms ease,
    background 140ms ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentDark};
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
`;

const StatusBar = styled.section`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 1180px;
  margin: 0 auto 24px;
`;

const StatusPill = styled.div<{ $tone?: 'good' | 'warn' }>`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 999px;
  color: ${({ theme, $tone }) =>
    $tone === 'good' ? theme.colors.success : $tone === 'warn' ? theme.colors.warning : theme.colors.muted};
  background: rgba(255, 253, 248, 0.76);
  font-size: 12px;
  font-weight: 700;
`;

const ErrorBanner = styled.div`
  max-width: 1180px;
  margin: 0 auto 20px;
  padding: 14px 16px;
  border: 1px solid rgba(166, 60, 49, 0.25);
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ theme }) => theme.colors.error};
  background: rgba(255, 244, 241, 0.9);
  line-height: 1.45;
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 20px;
  max-width: 1180px;
  margin: 0 auto;
`;

const Card = styled.article`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

const PreviewButton = styled.button`
  display: block;
  width: 100%;
  height: 210px;
  padding: 0;
  border: 0;
  background: #ded8ce;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardBody = styled.div`
  padding: 17px 18px 19px;
`;

const CardTitle = styled.h2`
  overflow: hidden;
  margin: 0 0 8px;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
`;

const Empty = styled.section`
  max-width: 1180px;
  margin: 0 auto;
  padding: 80px 24px;
  border: 1px dashed ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.large};
  color: ${({ theme }) => theme.colors.muted};
  text-align: center;

  strong {
    display: block;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.ink};
    font-family: Georgia, "Times New Roman", serif;
    font-size: 28px;
    font-weight: 500;
  }
`;

export function Home() {
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
          Screenshot watcher {status?.screenshotWatcherRunning ? 'on' : 'off'}
        </StatusPill>
        <StatusPill $tone={status?.screenPermission === 'granted' ? 'good' : 'warn'}>
          Screen permission {status?.screenPermission ?? 'unknown'}
        </StatusPill>
      </StatusBar>

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {captures.length ? (
        <Grid>
          {captures.map((captureItem) => (
            <Card key={captureItem.id}>
              <PreviewButton
                aria-label={`Annotate ${captureItem.title}`}
                onClick={() => void window.screenMe.openAnnotation(captureItem.id)}
              >
                <img src={captureItem.displayImageUrl} alt="" />
              </PreviewButton>
              <CardBody>
                <CardTitle>{captureItem.title}</CardTitle>
                <CardMeta>
                  <span>{captureItem.source === 'app' ? 'Screen Me' : 'macOS screenshot'}</span>
                  <time dateTime={captureItem.createdAt}>
                    {new Date(captureItem.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </time>
                </CardMeta>
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : (
        <Empty>
          <strong>Your capture inbox is empty.</strong>
          Use the button, press {status?.shortcut ?? 'the global shortcut'}, or
          take a normal macOS screenshot.
        </Empty>
      )}
    </Page>
  );
}
