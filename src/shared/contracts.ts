import { z } from 'zod';

export const CaptureSourceSchema = z.enum(['app', 'system']);

export const CaptureSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  title: z.string(),
  source: CaptureSourceSchema,
  originalImageUrl: z.string(),
  displayImageUrl: z.string(),
  annotationJson: z.string().nullable(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SaveAnnotationInputSchema = z.object({
  captureId: z.string().min(1),
  annotationJson: z.string().min(1),
  renderedDataUrl: z.string().startsWith('data:image/png;base64,'),
});

export const CaptureIdSchema = z.string().min(1);

export const AppStatusSchema = z.object({
  shortcut: z.string(),
  shortcutRegistered: z.boolean(),
  screenshotDirectory: z.string().nullable(),
  screenshotWatcherRunning: z.boolean(),
  screenPermission: z.string(),
});

export type Capture = z.infer<typeof CaptureSchema>;
export type SaveAnnotationInput = z.infer<typeof SaveAnnotationInputSchema>;
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
