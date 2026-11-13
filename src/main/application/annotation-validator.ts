import { maxAnnotationObjects } from "../../shared/captures/limits";

export const validateAnnotation = (annotationJson: string): void => {
  const parsed: unknown = JSON.parse(annotationJson);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The annotation is invalid");
  }
  const canvas = (parsed as { canvas?: unknown }).canvas;
  if (!canvas || typeof canvas !== "object" || Array.isArray(canvas)) {
    throw new Error("The annotation canvas is invalid");
  }
  const objects = (canvas as { objects?: unknown }).objects;
  if (!Array.isArray(objects) || objects.length > maxAnnotationObjects) {
    throw new Error("The annotation contains too many objects");
  }
};
