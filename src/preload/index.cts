import { contextBridge, ipcRenderer } from 'electron';
import type { EventInput } from '../domain/models.js';

const invoke = (channel: string, payload?: unknown) => ipcRenderer.invoke(channel, payload);

const api = {
  list: () => invoke('events:list'),
  preview: (input: EventInput, id?: string) => invoke('events:preview', { input, id }),
  save: (input: EventInput, id?: string, overrideHash?: string) => invoke('events:save', { input, id, overrideHash }),
  remove: (id: string) => invoke('events:delete', id),
  retry: (id: string, provider: 'GOOGLE' | 'TWITCH') => invoke('events:retry', { id, provider }),
  publish: (id:string,overrideHash?:string)=>invoke('events:publish',{id,overrideHash}),
  hub: (start:string,end:string,refresh=false)=>invoke('hub:load',{start,end,refresh}),
  adopt: (event:unknown)=>invoke('hub:adopt',event),
  duplicate: (id:string,startAtUtc:string,endAtUtc:string)=>invoke('hub:duplicate',{id,startAtUtc,endAtUtc}),
  templates: ()=>invoke('templates:list'),
  saveTemplate: (template:unknown)=>invoke('templates:save',template),
  deleteTemplate: (id:string)=>invoke('templates:delete',id),
  settings: () => invoke('settings:get'),
  updateSettings: (value: Record<string, unknown>) => invoke('settings:update', value),
  importGoogle: () => invoke('google:import'),
  connectGoogle: () => invoke('google:connect'),
  disconnectGoogle: () => invoke('google:disconnect'),
  calendars: () => invoke('google:calendars'),
  testConnections:()=>invoke('connections:test'),
  beginTwitch: () => invoke('twitch:begin'),
  completeTwitch: (state: unknown) => invoke('twitch:complete', state),
  disconnectTwitch: () => invoke('twitch:disconnect'),
  categories: (query: string) => invoke('twitch:categories', query),
  openExternal: (url: string) => invoke('external:open', url),
};

contextBridge.exposeInMainWorld('damplanner', api);

export type DamPlannerApi = typeof api;
