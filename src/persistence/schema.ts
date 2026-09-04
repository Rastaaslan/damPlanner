import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
export const events=sqliteTable('planner_events',{id:text().primaryKey(),json:text().notNull(),deletedAt:text('deleted_at')});
export const publications=sqliteTable('event_publications',{eventId:text('event_id').notNull(),provider:text().notNull(),json:text().notNull()},t=>[primaryKey({columns:[t.eventId,t.provider]})]);
export const attempts=sqliteTable('sync_attempts',{id:text().primaryKey(),json:text().notNull()});
