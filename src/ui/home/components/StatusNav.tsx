import type { AppStatus } from "../../../shared/ipc/contracts";
import {
  Brand,
  Dot,
  Mark,
  Nav,
  Status,
  Statuses,
  Watcher,
  WatcherLabel,
} from "./StatusNav.styles";

export function StatusNav({
  status,
  onWatcherChange,
}: {
  status: AppStatus | null;
  onWatcherChange(enabled: boolean): void;
}) {
  const screenAccess = status?.screenPermission === "granted";
  const shortcutReady = status?.shortcutRegistered ?? false;
  const watcherEnabled = status?.screenshotWatcherEnabled ?? false;

  return (
    <Nav>
      <Brand>
        <Mark>S</Mark>
        screen me
      </Brand>
      <Statuses>
        <Status $tone={screenAccess ? "good" : "warning"}>
          <Dot $tone={screenAccess ? "good" : "warning"} />
          <span>
            Screen {screenAccess ? "access granted" : "access needed"}
          </span>
        </Status>
        <Status $tone={shortcutReady ? "good" : "warning"}>
          <Dot $tone={shortcutReady ? "good" : "warning"} />
          <span>Shortcut {shortcutReady ? "ready" : "unavailable"}</span>
        </Status>
        <Status $tone={watcherEnabled ? "good" : "warning"}>
          <WatcherLabel>
            <Watcher
              aria-label="Enable screenshot watcher"
              checked={watcherEnabled}
              type="checkbox"
              onChange={(event) => onWatcherChange(event.currentTarget.checked)}
            />
            <span>Watcher</span>
          </WatcherLabel>
        </Status>
      </Statuses>
    </Nav>
  );
}
