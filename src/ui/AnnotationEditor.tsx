import { useEffect, useRef, useState } from 'react';
import {
  Canvas,
  FabricObject,
  IText,
  PencilBrush,
  Rect,
} from 'fabric';
import styled from 'styled-components';
import type { Capture } from '../shared/contracts';

type Tool = 'select' | 'pen';

interface SavedAnnotation {
  width: number;
  height: number;
  canvas: Record<string, unknown>;
}

const Page = styled.main`
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.dark};
`;

const Toolbar = styled.header`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 68px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(20, 19, 18, 0.96);
`;

const Brand = styled.div`
  min-width: 160px;
  margin-right: 12px;

  strong {
    display: block;
    font-size: 14px;
  }

  span {
    display: block;
    overflow: hidden;
    max-width: 220px;
    margin-top: 3px;
    color: rgba(255, 255, 255, 0.55);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(255, 91, 53, 0.9)' : 'rgba(255, 255, 255, 0.15)')};
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ $active }) =>
    $active ? 'rgba(255, 91, 53, 0.18)' : 'rgba(255, 255, 255, 0.05)'};
  font-size: 12px;
  font-weight: 750;

  &:hover {
    background: rgba(255, 255, 255, 0.11);
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const SaveButton = styled.button`
  min-height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.accent};
  font-size: 13px;
  font-weight: 850;

  &:disabled {
    cursor: wait;
    opacity: 0.55;
  }
`;

const Workspace = styled.section`
  position: relative;
  display: grid;
  place-items: center;
  min-height: 0;
  padding: 24px;
  overflow: auto;
  background:
    radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.08), transparent 42%),
    #11100f;
`;

const CanvasFrame = styled.div<{ $width: number; $height: number }>`
  position: relative;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  overflow: hidden;
  background: #262320;
  box-shadow: ${({ theme }) => theme.shadow.floating};

  > img {
    position: absolute;
    z-index: 0;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  .canvas-container {
    position: absolute !important;
    z-index: 1;
    inset: 0;
  }
`;

const Loading = styled.div`
  color: rgba(255, 255, 255, 0.62);
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  max-width: 560px;
  padding: 18px 20px;
  border: 1px solid rgba(255, 91, 53, 0.35);
  border-radius: ${({ theme }) => theme.radius.medium};
  color: #ffb8a7;
  background: rgba(255, 91, 53, 0.08);
  line-height: 1.5;
`;

const loadImage = (source: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The screenshot could not be loaded'));
    image.crossOrigin = 'anonymous';
    image.src = source;
  });

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
      const multiplier = image.naturalWidth / canvas.width;
      const overlayDataUrl = canvas.toDataURL({
        format: 'png',
        multiplier,
      });
      const overlay = await loadImage(overlayDataUrl);
      const output = document.createElement('canvas');
      output.width = image.naturalWidth;
      output.height = image.naturalHeight;
      const context = output.getContext('2d');
      if (!context) {
        throw new Error('The annotated image could not be rendered');
      }
      context.drawImage(image, 0, 0, output.width, output.height);
      context.drawImage(overlay, 0, 0, output.width, output.height);
      const saved: SavedAnnotation = {
        width: canvas.width,
        height: canvas.height,
        canvas: canvas.toJSON() as Record<string, unknown>,
      };
      await window.screenMe.saveAnnotations({
        captureId: capture.id,
        annotationJson: JSON.stringify(saved),
        renderedDataUrl: output.toDataURL('image/png'),
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
      <Toolbar>
        <Brand>
          <strong>Annotate capture</strong>
          <span>{capture?.title ?? 'Loading screenshot…'}</span>
        </Brand>
        <ToolButton $active={tool === 'select'} onClick={() => setTool('select')}>
          Select
        </ToolButton>
        <ToolButton $active={tool === 'pen'} onClick={() => setTool('pen')}>
          Draw
        </ToolButton>
        <ToolButton onClick={addRectangle}>Rectangle</ToolButton>
        <ToolButton onClick={addText}>Text</ToolButton>
        <ToolButton onClick={removeSelected}>Delete</ToolButton>
        <Spacer />
        <SaveButton disabled={saving || !capture} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save annotation'}
        </SaveButton>
      </Toolbar>
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
