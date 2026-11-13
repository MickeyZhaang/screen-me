import inboxDot from '../assets/figma/inbox-dot.svg';
import navigationDot from '../assets/figma/navigation-dot.svg';
import { CaptureCard } from './CaptureCard';
import {
  AppFrame,
  AppShell,
  Brand,
  BrandName,
  Canvas,
  CaptureButton,
  CaptureGrid,
  Count,
  EmptyActions,
  EmptyContent,
  EmptyIcon,
  EmptyState,
  ErrorBanner,
  HelperRow,
  LibraryItem,
  LibraryLabel,
  LibraryNav,
  MainContent,
  Mark,
  NavDot,
  NavLabel,
  ScreenStatus,
  SecondaryButton,
  Sidebar,
  SidebarStatus,
  Toolbar,
  ToolbarActions,
  ToolbarTitle,
  WatcherButton,
} from './home.styles';
import { useCaptureInbox } from './useCaptureInbox';

export function Home() {
  const {
    captures,
    status,
    busy,
    error,
    capture,
    remove,
    setScreenshotWatcherEnabled,
  } = useCaptureInbox();
  const screenAccessGranted = status?.screenPermission === 'granted';
  const watcherEnabled = status?.screenshotWatcherEnabled ?? false;

  return (
    <AppFrame>
      <AppShell>
        <Sidebar>
          <Brand>
            <Mark>S</Mark>
            <BrandName>screen me</BrandName>
          </Brand>
          <LibraryLabel>Library</LibraryLabel>
          <LibraryNav aria-label="Capture library">
            <LibraryItem $active type="button">
              <NavLabel>
                <NavDot src={inboxDot} alt="" />
                Inbox
              </NavLabel>
              <Count>{captures.length}</Count>
            </LibraryItem>
            <LibraryItem disabled type="button">
              <NavLabel>
                <NavDot src={navigationDot} alt="" />
                Favorites
              </NavLabel>
              <Count>0</Count>
            </LibraryItem>
            <LibraryItem disabled type="button">
              <NavLabel>
                <NavDot src={navigationDot} alt="" />
                Archive
              </NavLabel>
              <Count>0</Count>
            </LibraryItem>
          </LibraryNav>
          <SidebarStatus>
            <ScreenStatus $granted={screenAccessGranted}>
              ● Screen access {screenAccessGranted ? 'granted' : 'needed'}
            </ScreenStatus>
            <p>
              ⌘ Shortcut {status?.shortcutRegistered ? 'ready' : 'unavailable'}
            </p>
          </SidebarStatus>
        </Sidebar>
        <MainContent>
          <Toolbar>
            <ToolbarTitle>
              <h1>Inbox</h1>
              <p>
                {captures.length}{' '}
                {captures.length === 1 ? 'capture' : 'captures'}
              </p>
            </ToolbarTitle>
            <ToolbarActions>
              <WatcherButton
                $enabled={watcherEnabled}
                type="button"
                onClick={() =>
                  void setScreenshotWatcherEnabled(!watcherEnabled)
                }
              >
                Watcher {watcherEnabled ? 'on' : 'off'}
              </WatcherButton>
              <CaptureButton disabled={busy} onClick={() => void capture()}>
                + {busy ? 'Capturing…' : 'New capture'}
              </CaptureButton>
            </ToolbarActions>
          </Toolbar>
          <Canvas>
            <HelperRow>
              <p>Screenshots appear here automatically when Watcher is on.</p>
              <strong>All captures&nbsp;⌄</strong>
            </HelperRow>
            {captures.length ? (
              <CaptureGrid>
                {captures.map((captureItem) => (
                  <CaptureCard
                    key={captureItem.id}
                    capture={captureItem}
                    onDelete={(captureId) => {
                      if (
                        window.confirm(
                          'Delete this capture and its local files?',
                        )
                      ) {
                        void remove(captureId);
                      }
                    }}
                  />
                ))}
              </CaptureGrid>
            ) : (
              <EmptyState>
                <EmptyContent>
                  <EmptyIcon>
                    <span />
                  </EmptyIcon>
                  <h2>No captures yet</h2>
                  <p>
                    Start a capture now, or turn on Watcher to collect macOS
                    screenshots automatically.
                  </p>
                  <EmptyActions>
                    <CaptureButton
                      disabled={busy}
                      onClick={() => void capture()}
                    >
                      New capture
                    </CaptureButton>
                    <SecondaryButton
                      type="button"
                      onClick={() => void setScreenshotWatcherEnabled(true)}
                    >
                      Enable Watcher
                    </SecondaryButton>
                  </EmptyActions>
                </EmptyContent>
              </EmptyState>
            )}
          </Canvas>
        </MainContent>
      </AppShell>
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}
    </AppFrame>
  );
}
