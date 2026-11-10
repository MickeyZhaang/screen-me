import { z } from 'zod';
import type {
  Capture,
  CapturePage,
  ListCapturesInput,
  SaveAnnotationInput,
} from '../captures/contracts';

export const AppStatusSchema = z.object({
  shortcut: z.string(),
  shortcutRegistered: z.boolean(),
  screenshotDirectory: z.string().nullable(),
  screenshotWatcherRunning: z.boolean(),
  screenshotWatcherEnabled: z.boolean(),
  screenPermission: z.string(),
});

export type AppStatus = z.infer<typeof AppStatusSchema>;

export const channels = {
  getStatus: 'app:get-status',
  listCaptures: 'captures:list',
  getCapture: 'captures:get',
  capturePrimary: 'captures:capture-primary',
  saveAnnotations: 'captures:save-annotations',
  openAnnotation: 'captures:open-annotation',
  deleteCapture: 'captures:delete',
  setScreenshotWatcherEnabled: 'app:set-screenshot-watcher-enabled',
  capturesChanged: 'captures:changed',
} as const;

export interface HomeApi {
  getStatus(): Promise<AppStatus>;
  listCaptures(input?: ListCapturesInput): Promise<CapturePage>;
  capturePrimary(): Promise<Capture>;
  openAnnotation(captureId: string): Promise<void>;
  deleteCapture(captureId: string): Promise<void>;
  setScreenshotWatcherEnabled(enabled: boolean): Promise<AppStatus>;
  onCapturesChanged(listener: () => void): () => void;
}

export interface AnnotationApi {
  getCapture(captureId: string): Promise<Capture>;
  saveAnnotations(input: SaveAnnotationInput): Promise<Capture>;
}

export interface ScreenMeApi {
  home: HomeApi | null;
  annotation: AnnotationApi | null;
}
