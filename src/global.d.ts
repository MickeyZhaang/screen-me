import type { ScreenMeApi } from './shared/ipc/contracts';

declare module '*.svg' {
  const source: string;
  export default source;
}

declare global {
  interface Window {
    screenMe: ScreenMeApi;
  }
}

export {};
