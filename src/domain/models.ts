import { z } from 'zod';

export const providerSchema = z.enum(['GOOGLE', 'TWITCH']);
export type Provider = z.infer<typeof providerSchema>;

export const publicationStatusSchema = z.enum([
  'NOT_REQUESTED',
  'PENDING',
  'PUBLISHING',
  'SYNCED',
  'ERROR',
  'REAUTH_REQUIRED',
  'REMOTE_MISSING',
  'DELETED',
]);
export type PublicationStatus = z.infer<typeof publicationStatusSchema>;

const eventBaseSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(['LIVE', 'PERSONAL']),
  title: z.string().trim().min(1),
  description: z.string().default(''),
  startAtUtc: z.string().datetime(),
  endAtUtc: z.string().datetime(),
  timezone: z.string().default('Europe/Paris'),
  syncGoogle: z.boolean(),
  syncTwitch: z.boolean(),
  googleCalendarId: z.string().nullable().default(null),
  twitchTitle: z.string().nullable().default(null),
  twitchCategoryId: z.string().nullable().default(null),
  twitchCategoryName: z.string().nullable().default(null),
  twitchCategoryBoxArtUrl: z.string().nullable().default(null),
  conflictOverrideHash: z.string().nullable().default(null),
  conflictOverrideAt: z.string().datetime().nullable().default(null),
  status: z.enum(['DRAFT','PUBLISHED']).default('PUBLISHED'),
  bufferBeforeMinutes: z.number().int().min(0).max(1440).nullable().default(null),
  bufferAfterMinutes: z.number().int().min(0).max(1440).nullable().default(null),
  checklist: z.array(z.object({id:z.string(),label:z.string().min(1),done:z.boolean()})).default([]),
  recurrence: z.object({frequency:z.enum(['DAILY','WEEKLY']),interval:z.number().int().min(1).max(365),weekdays:z.array(z.number().int().min(1).max(7)).default([]),until:z.string().datetime().nullable().default(null),count:z.number().int().min(1).max(500).nullable().default(null)}).nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().default(null),
});

type EventRefinementValue = {
  startAtUtc: string;
  endAtUtc: string;
  syncTwitch: boolean;
  twitchTitle: string | null;
  twitchCategoryId: string | null;
};

function refineEvent(value: EventRefinementValue, context: z.RefinementCtx) {
  if (new Date(value.endAtUtc) <= new Date(value.startAtUtc)) {
    context.addIssue({
      code: 'custom',
      message: 'La fin doit suivre le début',
      path: ['endAtUtc'],
    });
  }

  if (!value.syncTwitch) return;

  if (!value.twitchTitle || !value.twitchCategoryId) {
    context.addIssue({
      code: 'custom',
      message: 'Titre public et catégorie Twitch requis',
      path: ['twitchTitle'],
    });
  }

  const minutes = (Date.parse(value.endAtUtc) - Date.parse(value.startAtUtc)) / 60_000;
  if (minutes < 30 || minutes > 1380) {
    context.addIssue({
      code: 'custom',
      message: 'Un segment Twitch doit durer entre 30 minutes et 23 heures',
      path: ['endAtUtc'],
    });
  }

  if ((value.twitchTitle?.length ?? 0) > 140) {
    context.addIssue({
      code: 'custom',
      message: 'Le titre Twitch est limité à 140 caractères',
      path: ['twitchTitle'],
    });
  }
}

export const eventSchema = eventBaseSchema.superRefine(refineEvent);
// Input typing keeps additive fields optional for records created before the
// daily-hub migration; parsing still materialises every default at runtime.
export type PlannerEvent = z.input<typeof eventSchema>;

export interface EventPublication {
  eventId: string;
  provider: Provider;
  status: PublicationStatus;
  externalId: string | null;
  lastError: string | null;
  payloadHash: string | null;
  lastSyncedAt: string | null;
}

export interface SyncAttempt {
  id: string;
  eventId: string;
  provider: Provider;
  operation: string;
  status: string;
  error: string | null;
  createdAt: string;
}

export const eventInputSchema = eventBaseSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    conflictOverrideHash: true,
    conflictOverrideAt: true,
  })
  .superRefine(refineEvent);

export type EventInput = z.input<typeof eventInputSchema>;

export const templateSchema=z.object({id:z.string().uuid(),name:z.string().trim().min(1),kind:z.enum(['LIVE','PERSONAL']),durationMinutes:z.number().int().min(1).max(1440),description:z.string().default(''),syncGoogle:z.boolean().default(false),syncTwitch:z.boolean().default(false),twitchTitle:z.string().nullable().default(null),twitchCategoryId:z.string().nullable().default(null),twitchCategoryName:z.string().nullable().default(null),bufferBeforeMinutes:z.number().int().min(0).nullable().default(null),bufferAfterMinutes:z.number().int().min(0).nullable().default(null),checklist:z.array(z.string().min(1)).default([])});
export type EventTemplate=z.infer<typeof templateSchema>;
