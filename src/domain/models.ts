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
export type PlannerEvent = z.infer<typeof eventSchema>;

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

export type EventInput = z.infer<typeof eventInputSchema>;
