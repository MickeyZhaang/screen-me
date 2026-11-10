import { Canvas } from 'fabric';
import type { SavedAnnotation } from './annotation.types';

export const loadImage = (source: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The screenshot could not be loaded'));
    image.crossOrigin = 'anonymous';
    image.src = source;
  });

export const renderAnnotatedImage = async (
  canvas: Canvas,
  image: HTMLImageElement,
): Promise<string> => {
  const multiplier = image.naturalWidth / canvas.width;
  const overlay = await loadImage(
    canvas.toDataURL({ format: 'png', multiplier }),
  );
  const output = document.createElement('canvas');
  output.width = image.naturalWidth;
  output.height = image.naturalHeight;
  const context = output.getContext('2d');
  if (!context) {
    throw new Error('The annotated image could not be rendered');
  }
  context.drawImage(image, 0, 0, output.width, output.height);
  context.drawImage(overlay, 0, 0, output.width, output.height);
  return output.toDataURL('image/png');
};

export const serializeAnnotation = (canvas: Canvas): string => {
  const saved: SavedAnnotation = {
    width: canvas.width,
    height: canvas.height,
    canvas: canvas.toJSON() as Record<string, unknown>,
  };
  return JSON.stringify(saved);
};
