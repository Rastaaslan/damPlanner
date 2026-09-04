import { contextBridge, ipcRenderer } from 'electron';
import type { EventInput } from '../domain/models.js';

const invoke = (channel: string, payload?: unknown) => ipcRenderer.invoke(channel, payload);

const api = {
  list: () => invoke('events:list'),
  preview: (input: EventInput, id?: string) => invoke('events:preview', { input, id }),
  save: (input: EventInput, id?: string, overrideHash?: string) => invoke('events:save', { input, id, overrideHash }),
  remove: (id: string) => invoke('events:delete', id),
  retry: (id: string, provider: 'GOOGLE' | 'TWITCH') => invoke('events:retry', { id, provider }),
  settings: () => invoke('settings:get'),
  updateSettings: (value: Record<string, unknown>) => invoke('settings:update', value),
  importGoogle: () => invoke('google:import'),
  connectGoogle: () => invoke('google:connect'),
  disconnectGoogle: () => invoke('google:disconnect'),
  calendars: () => invoke('google:calendars'),
  beginTwitch: () => invoke('twitch:begin'),
  completeTwitch: (state: unknown) => invoke('twitch:complete', state),
  disconnectTwitch: () => invoke('twitch:disconnect'),
  categories: (query: string) => invoke('twitch:categories', query),
  openExternal: (url: string) => invoke('external:open', url),
};

contextBridge.exposeInMainWorld('damplanner', api);

export type DamPlannerApi = typeof api;
