export type Tool = 'select' | 'pen';

export interface SavedAnnotation {
  width: number;
  height: number;
  canvas: Record<string, unknown>;
}
