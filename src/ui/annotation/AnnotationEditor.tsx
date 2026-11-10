import { useEffect, useRef, useState } from 'react';
import { Canvas, FabricObject, IText, PencilBrush, Rect } from 'fabric';
import type { Capture } from '../../shared/captures/contracts';
import { AnnotationToolbar } from './AnnotationToolbar';
import {
  CanvasFrame,
  ErrorMessage,
  Loading,
  Page,
  Workspace,
} from './annotation.styles';
import type { SavedAnnotation, Tool } from './annotation.types';
import {
  loadImage,
  renderAnnotatedImage,
  serializeAnnotation,
} from './image';

export function AnnotationEditor({ captureId }: { captureId: string }) {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const [capture, setCapture] = useState<Capture | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [tool, setTool] = useState<Tool>('select');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const nextCapture = await window.screenMe.getCapture(captureId);
      const image = await loadImage(nextCapture.originalImageUrl);
      if (cancelled) {
        return;
      }
      const maxWidth = Math.max(620, window.innerWidth - 72);
      const maxHeight = Math.max(420, window.innerHeight - 126);
      const scale = Math.min(
        1,
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight,
      );
      setCapture(nextCapture);
      sourceImageRef.current = image;
      setCanvasSize({
        width: Math.round(image.naturalWidth * scale),
        height: Math.round(image.naturalHeight * scale),
      });
    };
    void initialize().catch((reason: unknown) =>
      setError(reason instanceof Error ? reason.message : String(reason)),
    );
    return () => {
      cancelled = true;
    };
  }, [captureId]);

  useEffect(() => {
    if (!canvasElementRef.current || !capture || !canvasSize.width) {
      return;
    }
    const canvas = new Canvas(canvasElementRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      preserveObjectStacking: true,
      selectionColor: 'rgba(255, 91, 53, 0.12)',
      selectionBorderColor: '#ff5b35',
      selectionLineWidth: 2,
    });
    fabricRef.current = canvas;
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = '#ff3b24';
    canvas.freeDrawingBrush.width = 4;
    const restore = async () => {
      if (!capture.annotationJson) {
        return;
      }
      const saved = JSON.parse(capture.annotationJson) as SavedAnnotation;
      await canvas.loadFromJSON(saved.canvas);
      const scaleX = canvasSize.width / saved.width;
      const scaleY = canvasSize.height / saved.height;
      for (const object of canvas.getObjects()) {
        object.set({
          left: (object.left ?? 0) * scaleX,
          top: (object.top ?? 0) * scaleY,
          scaleX: (object.scaleX ?? 1) * scaleX,
          scaleY: (object.scaleY ?? 1) * scaleY,
        });
        object.setCoords();
      }
      canvas.requestRenderAll();
    };
    void restore().catch((reason: unknown) =>
      setError(reason instanceof Error ? reason.message : String(reason)),
    );
    return () => {
      fabricRef.current = null;
      canvas.dispose();
    };
  }, [canvasSize.height, canvasSize.width, capture]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) {
      return;
    }
    canvas.isDrawingMode = tool === 'pen';
    canvas.selection = tool === 'select';
    for (const object of canvas.getObjects()) {
      object.selectable = tool === 'select';
      object.evented = tool === 'select';
    }
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, [tool]);

  const addRectangle = () => {
    const canvas = fabricRef.current;
    if (!canvas) {
      return;
    }
    setTool('select');
    const rectangle = new Rect({
      left: canvas.width / 2 - 100,
      top: canvas.height / 2 - 60,
      width: 200,
      height: 120,
      fill: 'rgba(255, 59, 36, 0.06)',
      stroke: '#ff3b24',
      strokeWidth: 4,
      rx: 8,
      ry: 8,
    });
    canvas.add(rectangle);
    canvas.setActiveObject(rectangle);
    canvas.requestRenderAll();
  };

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) {
      return;
    }
    setTool('select');
    const text = new IText('Add a note', {
      left: canvas.width / 2 - 80,
      top: canvas.height / 2 - 20,
      fill: '#ff3b24',
      fontFamily: 'Arial',
      fontSize: 32,
      fontWeight: 700,
      backgroundColor: 'rgba(255, 255, 255, 0.86)',
      padding: 7,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    canvas.requestRenderAll();
  };

  const removeSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) {
      return;
    }
    const selected = canvas.getActiveObjects();
    canvas.discardActiveObject();
    for (const object of selected) {
      canvas.remove(object);
    }
    canvas.requestRenderAll();
  };

  const save = async () => {
    const canvas = fabricRef.current;
    const image = sourceImageRef.current;
    if (!canvas || !image || !capture) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      await window.screenMe.saveAnnotations({
        captureId: capture.id,
        annotationJson: serializeAnnotation(canvas),
        renderedDataUrl: await renderAnnotatedImage(canvas, image),
      });
      window.close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        const active = fabricRef.current?.getActiveObject();
        if (active && !(active instanceof IText && active.isEditing)) {
          event.preventDefault();
          removeSelected();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <Page>
      <AnnotationToolbar
        title={capture?.title ?? 'Loading screenshot…'}
        tool={tool}
        saving={saving}
        canSave={Boolean(capture)}
        selectTool={() => setTool('select')}
        drawTool={() => setTool('pen')}
        addRectangle={addRectangle}
        addText={addText}
        removeSelected={removeSelected}
        save={() => void save()}
      />
      <Workspace>
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        {!error && capture && canvasSize.width ? (
          <CanvasFrame $width={canvasSize.width} $height={canvasSize.height}>
            <img src={capture.originalImageUrl} alt="" />
            <canvas ref={canvasElementRef} />
          </CanvasFrame>
        ) : null}
        {!error && !capture ? <Loading>Preparing the capture…</Loading> : null}
      </Workspace>
    </Page>
  );
}

FabricObject.customProperties = [];
