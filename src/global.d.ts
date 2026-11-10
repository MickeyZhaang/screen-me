import type { ScreenMeApi } from './shared/contracts';

declare global {
  interface Window {
    screenMe: ScreenMeApi;
  }
}

export {};
