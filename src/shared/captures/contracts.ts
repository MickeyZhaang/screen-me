import { z } from 'zod';
import {
  capturePageSize,
  maxAnnotationBytes,
  maxImageBytes,
} from './limits';

export const CaptureSourceSchema = z.enum(['app', 'system']);

export const CaptureSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  title: z.string(),
  source: CaptureSourceSchema,
  originalImageUrl: z.string(),
  displayImageUrl: z.string(),
  thumbnailImageUrl: z.string(),
  annotationJson: z.string().nullable(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SaveAnnotationInputSchema = z.object({
  captureId: z.string().uuid(),
  annotationJson: z.string().min(1).max(maxAnnotationBytes),
  renderedDataUrl: z
    .string()
    .startsWith('data:image/png;base64,')
    .max(Math.ceil((maxImageBytes * 4) / 3) + 128),
});

export const CaptureIdSchema = z.string().uuid();

export const ListCapturesInputSchema = z.object({
  offset: z.number().int().min(0).default(0),
});

export type Capture = z.infer<typeof CaptureSchema>;
export type SaveAnnotationInput = z.infer<typeof SaveAnnotationInputSchema>;
export type ListCapturesInput = z.infer<typeof ListCapturesInputSchema>;

export interface CapturePage {
  captures: Capture[];
  nextOffset: number | null;
}
