import { execFile } from 'node:child_process';
import { existsSync, watch, type FSWatcher } from 'node:fs';
import { stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';
import { promisify } from 'node:util';

const executeFile = promisify(execFile);
const supportedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const maxHandledPaths = 1_000;
const maxPendingPaths = 100;

export class ScreenshotWatcher {
  private watcher: FSWatcher | null = null;
  private readonly handled = new Set<string>();
  private readonly pending = new Map<string, NodeJS.Timeout>();
  private startedAt = 0;
  directory: string | null = null;

  constructor(
    private readonly onScreenshot: (filePath: string) => Promise<void>,
  ) {}

  async start(): Promise<void> {
    this.stop();
    this.directory = await this.resolveScreenshotDirectory();
    if (!this.directory || !existsSync(this.directory)) {
      return;
    }
    this.startedAt = Date.now();
    this.watcher = watch(this.directory, (_, filename) => {
      if (!filename) {
        return;
      }
      const filePath = join(this.directory as string, filename.toString());
      const existingTimer = this.pending.get(filePath);
      if (existingTimer) {
        clearTimeout(existingTimer);
      } else if (this.pending.size >= maxPendingPaths) {
        return;
      }
      this.pending.set(
        filePath,
        setTimeout(() => {
          this.pending.delete(filePath);
          void this.inspect(filePath);
        }, 500),
      );
    });
  }

  stop(): void {
    this.watcher?.close();
    this.watcher = null;
    for (const timer of this.pending.values()) {
      clearTimeout(timer);
    }
    this.pending.clear();
  }

  get running(): boolean {
    return this.watcher !== null;
  }

  private async inspect(filePath: string): Promise<void> {
    if (
      this.handled.has(filePath) ||
      !supportedExtensions.has(extname(filePath).toLowerCase())
    ) {
      return;
    }
    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile() || fileStat.mtimeMs < this.startedAt - 1_000) {
        return;
      }
      if (!(await this.isScreenshot(filePath))) {
        return;
      }
      this.addHandledPath(filePath);
      await this.onScreenshot(filePath);
    } catch {
      this.handled.delete(filePath);
    }
  }

  private addHandledPath(filePath: string): void {
    this.handled.add(filePath);
    if (this.handled.size > maxHandledPaths) {
      const oldest = this.handled.values().next().value;
      if (oldest) {
        this.handled.delete(oldest);
      }
    }
  }

  private async isScreenshot(filePath: string): Promise<boolean> {
    if (/^(screen ?shot|screenshot)/i.test(basename(filePath))) {
      return true;
    }
    try {
      const { stdout } = await executeFile('/usr/bin/mdls', [
        '-raw',
        '-name',
        'kMDItemIsScreenCapture',
        filePath,
      ]);
      return stdout.trim() === '1';
    } catch {
      return false;
    }
  }

  private async resolveScreenshotDirectory(): Promise<string> {
    try {
      const { stdout } = await executeFile('/usr/bin/defaults', [
        'read',
        'com.apple.screencapture',
        'location',
      ]);
      const configured = stdout.trim();
      if (configured) {
        return resolve(configured.replace(/^~/, homedir()));
      }
    } catch {
      return join(homedir(), 'Desktop');
    }
    return join(homedir(), 'Desktop');
  }
}
