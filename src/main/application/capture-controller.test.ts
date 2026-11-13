import { describe, expect, it, vi } from "vitest";
import type {
  Capture,
  SaveAnnotationInput,
} from "../../shared/captures/contracts";
import {
  CaptureController,
  type CaptureChangePublisher,
  type CaptureUseCases,
  type AnnotationOpener,
} from "./capture-controller";

const capture: Capture = {
  id: "capture-id",
  documentId: "inbox",
  title: "Capture",
  source: "app",
  originalImageUrl: "screen-me://assets/original",
  displayImageUrl: "screen-me://assets/original",
  thumbnailImageUrl: "screen-me://assets/thumbnail",
  annotationJson: null,
  width: 1280,
  height: 720,
  createdAt: "2026-11-10T00:00:00.000Z",
  updatedAt: "2026-11-10T00:00:00.000Z",
};

const createDependencies = () => {
  const captures: CaptureUseCases = {
    list: vi.fn(() => ({ captures: [capture], nextOffset: null })),
    get: vi.fn(() => capture),
    capturePrimaryDisplay: vi.fn(async () => capture),
    importSystemScreenshot: vi.fn(async () => capture),
    saveAnnotations: vi.fn(async () => capture),
    delete: vi.fn(async () => undefined),
  };
  const annotations: AnnotationOpener = {
    openAnnotation: vi.fn(async () => undefined),
  };
  const changes: CaptureChangePublisher = {
    publish: vi.fn(),
  };
  return { captures, annotations, changes };
};

describe("CaptureController", () => {
  it("publishes and opens the editor after a direct capture", async () => {
    const dependencies = createDependencies();
    const controller = new CaptureController(
      dependencies.captures,
      dependencies.annotations,
      dependencies.changes,
    );

    await expect(controller.capturePrimaryDisplay()).resolves.toBe(capture);
    expect(dependencies.changes.publish).toHaveBeenCalledOnce();
    expect(dependencies.annotations.openAnnotation).toHaveBeenCalledWith(
      capture.id,
    );
  });

  it("publishes and opens the editor after a system screenshot import", async () => {
    const dependencies = createDependencies();
    const controller = new CaptureController(
      dependencies.captures,
      dependencies.annotations,
      dependencies.changes,
    );

    await controller.importSystemScreenshot("/Desktop/Screenshot.png");
    expect(dependencies.captures.importSystemScreenshot).toHaveBeenCalledWith(
      "/Desktop/Screenshot.png",
    );
    expect(dependencies.changes.publish).toHaveBeenCalledOnce();
    expect(dependencies.annotations.openAnnotation).toHaveBeenCalledWith(
      capture.id,
    );
  });

  it("publishes without opening a new editor after saving", async () => {
    const dependencies = createDependencies();
    const controller = new CaptureController(
      dependencies.captures,
      dependencies.annotations,
      dependencies.changes,
    );
    const input: SaveAnnotationInput = {
      captureId: capture.id,
      annotationJson: '{"objects":[]}',
      renderedDataUrl: "data:image/png;base64,cG5n",
    };

    await controller.saveAnnotations(input);
    expect(dependencies.captures.saveAnnotations).toHaveBeenCalledWith(input);
    expect(dependencies.changes.publish).toHaveBeenCalledOnce();
    expect(dependencies.annotations.openAnnotation).not.toHaveBeenCalled();
  });
});
