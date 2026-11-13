import type {
  Capture,
  CapturePage,
  SaveAnnotationInput,
} from '../../shared/captures/contracts';

export interface CaptureUseCases {
  list(offset: number): CapturePage;
  get(captureId: string): Capture;
  capturePrimaryDisplay(): Promise<Capture>;
  importSystemScreenshot(filePath: string): Promise<Capture>;
  saveAnnotations(input: SaveAnnotationInput): Promise<Capture>;
  delete(captureId: string): Promise<void>;
}

export interface AnnotationOpener {
  openAnnotation(captureId: string): Promise<void>;
}

export interface CaptureChangePublisher {
  publish(): void;
}

export class CaptureController {
  private mutation: Promise<void> = Promise.resolve();
  constructor(
    private readonly captures: CaptureUseCases,
    private readonly annotations: AnnotationOpener,
    private readonly changes: CaptureChangePublisher,
  ) {}

  list(offset: number): CapturePage {
    return this.captures.list(offset);
  }

  get(captureId: string): Capture {
    return this.captures.get(captureId);
  }

  async capturePrimaryDisplay(): Promise<Capture> {
    return this.runExclusive(async () => {
      const capture = await this.captures.capturePrimaryDisplay();
      this.changes.publish();
      await this.annotations.openAnnotation(capture.id);
      return capture;
    });
  }

  async importSystemScreenshot(filePath: string): Promise<Capture> {
    return this.runExclusive(async () => {
      const capture = await this.captures.importSystemScreenshot(filePath);
      this.changes.publish();
      await this.annotations.openAnnotation(capture.id);
      return capture;
    });
  }

  async saveAnnotations(input: SaveAnnotationInput): Promise<Capture> {
    return this.runExclusive(async () => {
      const capture = await this.captures.saveAnnotations(input);
      this.changes.publish();
      return capture;
    });
  }

  async openAnnotation(captureId: string): Promise<void> {
    await this.annotations.openAnnotation(captureId);
  }

  async delete(captureId: string): Promise<void> {
    await this.runExclusive(async () => {
      await this.captures.delete(captureId);
      this.changes.publish();
    });
  }

  private runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.mutation.then(operation, operation);
    this.mutation = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}
