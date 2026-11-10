import type { Capture, SaveAnnotationInput } from '../../shared/contracts';

export interface CaptureUseCases {
  list(): Capture[];
  get(captureId: string): Capture;
  capturePrimaryDisplay(): Promise<Capture>;
  importSystemScreenshot(filePath: string): Promise<Capture>;
  saveAnnotations(input: SaveAnnotationInput): Promise<Capture>;
}

export interface AnnotationOpener {
  openAnnotation(captureId: string): Promise<void>;
}

export interface CaptureChangePublisher {
  publish(): void;
}

export class CaptureController {
  constructor(
    private readonly captures: CaptureUseCases,
    private readonly annotations: AnnotationOpener,
    private readonly changes: CaptureChangePublisher,
  ) {}

  list(): Capture[] {
    return this.captures.list();
  }

  get(captureId: string): Capture {
    return this.captures.get(captureId);
  }

  async capturePrimaryDisplay(): Promise<Capture> {
    const capture = await this.captures.capturePrimaryDisplay();
    this.changes.publish();
    await this.annotations.openAnnotation(capture.id);
    return capture;
  }

  async importSystemScreenshot(filePath: string): Promise<Capture> {
    const capture = await this.captures.importSystemScreenshot(filePath);
    this.changes.publish();
    await this.annotations.openAnnotation(capture.id);
    return capture;
  }

  async saveAnnotations(input: SaveAnnotationInput): Promise<Capture> {
    const capture = await this.captures.saveAnnotations(input);
    this.changes.publish();
    return capture;
  }

  async openAnnotation(captureId: string): Promise<void> {
    await this.annotations.openAnnotation(captureId);
  }
}
