import { contextBridge, ipcRenderer } from 'electron';
import type {
  AnnotationApi,
  HomeApi,
  ScreenMeApi,
} from './shared/ipc/contracts';
import { channels } from './shared/ipc/contracts';

const annotationMode =
  new URL(window.location.href).searchParams.get('mode') === 'annotation';

const home: HomeApi = {
  getStatus: () => ipcRenderer.invoke(channels.getStatus),
  listCaptures: (input) => ipcRenderer.invoke(channels.listCaptures, input),
  capturePrimary: () => ipcRenderer.invoke(channels.capturePrimary),
  openAnnotation: (captureId) =>
    ipcRenderer.invoke(channels.openAnnotation, captureId),
  deleteCapture: (captureId) =>
    ipcRenderer.invoke(channels.deleteCapture, captureId),
  setScreenshotWatcherEnabled: (enabled) =>
    ipcRenderer.invoke(channels.setScreenshotWatcherEnabled, enabled),
  minimizeWindow: () => ipcRenderer.invoke(channels.minimizeWindow),
  toggleMaximizeWindow: () => ipcRenderer.invoke(channels.toggleMaximizeWindow),
  closeWindow: () => ipcRenderer.invoke(channels.closeWindow),
  onCapturesChanged: (listener) => {
    const handler = () => listener();
    ipcRenderer.on(channels.capturesChanged, handler);
    return () => ipcRenderer.removeListener(channels.capturesChanged, handler);
  },
};

const annotation: AnnotationApi = {
  getCapture: (captureId) => ipcRenderer.invoke(channels.getCapture, captureId),
  saveAnnotations: (input) =>
    ipcRenderer.invoke(channels.saveAnnotations, input),
};

const api: ScreenMeApi = {
  home: annotationMode ? null : home,
  annotation: annotationMode ? annotation : null,
};

contextBridge.exposeInMainWorld('screenMe', api);
