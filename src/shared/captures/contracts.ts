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

export type Capture = z.infer<typeof CaptureSchema>;
export type SaveAnnotationInput = z.infer<typeof SaveAnnotationInputSchema>;
