import type {PlannerEvent} from '../domain/models.js';
export interface RemoteSlot{id:string;startAtUtc:string;endAtUtc:string;title:string;categoryId?:string;damplannerEventId?:string}
export interface CalendarProvider{availability(start:string,end:string,calendarIds:string[]):Promise<RemoteSlot[]>;create(e:PlannerEvent):Promise<string>;update(id:string,e:PlannerEvent):Promise<void>;delete(id:string):Promise<void>;get(id:string):Promise<RemoteSlot|undefined>}
export interface TwitchProvider{schedule(start:string,end:string):Promise<RemoteSlot[]>;create(e:PlannerEvent):Promise<string>;update(id:string,e:PlannerEvent):Promise<void>;delete(id:string):Promise<void>;searchCategories(q:string):Promise<{id:string;name:string;boxArtUrl:string}[]>}
export class AmbiguousCreateError extends Error{constructor(){super('Création distante ambiguë')}} export class ReauthRequiredError extends Error{}
