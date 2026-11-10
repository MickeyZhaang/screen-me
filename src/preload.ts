import { contextBridge, ipcRenderer } from 'electron';
import type { ScreenMeApi } from './shared/ipc/contracts';
import { channels } from './shared/ipc/contracts';

const api: ScreenMeApi = {
  getStatus: () => ipcRenderer.invoke(channels.getStatus),
  listCaptures: () => ipcRenderer.invoke(channels.listCaptures),
  getCapture: (captureId) =>
    ipcRenderer.invoke(channels.getCapture, captureId),
  capturePrimary: () => ipcRenderer.invoke(channels.capturePrimary),
  saveAnnotations: (input) =>
    ipcRenderer.invoke(channels.saveAnnotations, input),
  openAnnotation: (captureId) =>
    ipcRenderer.invoke(channels.openAnnotation, captureId),
  onCapturesChanged: (listener) => {
    const handler = () => listener();
    ipcRenderer.on(channels.capturesChanged, handler);
    return () => ipcRenderer.removeListener(channels.capturesChanged, handler);
  },
};

contextBridge.exposeInMainWorld('screenMe', api);
