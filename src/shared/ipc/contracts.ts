import { z } from 'zod';
import type { Capture, SaveAnnotationInput } from '../captures/contracts';

export const AppStatusSchema = z.object({
  shortcut: z.string(),
  shortcutRegistered: z.boolean(),
  screenshotDirectory: z.string().nullable(),
  screenshotWatcherRunning: z.boolean(),
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
  capturesChanged: 'captures:changed',
} as const;

export interface ScreenMeApi {
  getStatus(): Promise<AppStatus>;
  listCaptures(): Promise<Capture[]>;
  getCapture(captureId: string): Promise<Capture>;
  capturePrimary(): Promise<Capture>;
  saveAnnotations(input: SaveAnnotationInput): Promise<Capture>;
  openAnnotation(captureId: string): Promise<void>;
  onCapturesChanged(listener: () => void): () => void;
}
