import type { ScreenMeApi } from "./shared/ipc/contracts";

declare global {
  interface Window {
    screenMe: ScreenMeApi;
  }
}

export {};
