import { expect, test, type Locator, type Page } from '@playwright/test';

async function mockPreload(page: Page) {
  await page.addInitScript(() => {
    const rows: any[] = [];
    (window as any).damplanner = {
      list: async () => [...rows],
      hub: async () => ({
        rows: [...rows], warnings: [], fetchedAt: Date.now(), fromCache: false,
        items: rows.map(row => ({
          id: `local:${row.event.id}`, source: 'DAMPLANNER', ownership: 'LOCAL', title: row.event.title,
          description: row.event.description, startAtUtc: row.event.startAtUtc, endAtUtc: row.event.endAtUtc,
          allDay: false, editable: true, localEventId: row.event.id, kind: row.event.kind,
          draft: row.event.status === 'DRAFT', google: row.google, twitch: row.twitch,
          metadata: { conflictAccepted: row.event.conflictOverrideHash ? 'true' : undefined, checklist: '0/0' },
        })),
      }),
      settings: async () => ({
        timezone: 'Europe/Paris', googleDefaultCalendarId: 'primary', googleAvailabilityCalendarIds: ['primary'],
        twitchClientId: 'test', availabilityLocal: true, availabilityGoogle: false, availabilityTwitch: false,
        onboardingDone: true, googleConfigured: true, googleConnected: true, twitchConfigured: true, twitchConnected: true,
      }),
      preview: async (input: any, id?: string) => {
        const conflict = rows.find(x => x.event.id !== id && x.event.startAtUtc < input.endAtUtc && x.event.endAtUtc > input.startAtUtc);
        return { event: input, availability: { status: conflict ? 'CONFLICT' : 'AVAILABLE', hash: 'accepted', errors: [], conflicts: conflict ? [{ ...conflict.event, source: 'LOCAL' }] : [] } };
      },
      save: async (input: any, id?: string, hash?: string) => {
        const event = { ...input, id: id ?? crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null, conflictOverrideHash: hash ?? null, conflictOverrideAt: hash ? new Date().toISOString() : null };
        const index = rows.findIndex(x => x.event.id === id);
        const row = { event, google: input.syncGoogle ? { status: 'SYNCED' } : undefined, twitch: input.syncTwitch ? { status: 'SYNCED' } : undefined };
        if (index < 0) rows.push(row); else rows[index] = row;
        return event;
      },
      remove: async (id: string) => { const index = rows.findIndex(x => x.event.id === id); if (index >= 0) rows.splice(index, 1); },
      retry: async () => {}, publish: async () => ({}), adopt: async () => {}, duplicate: async () => {},
      templates: async () => [], saveTemplate: async () => {}, deleteTemplate: async () => {}, testConnections: async () => ({ google: { connected: true, calendars: 1 }, twitch: { connected: true, schedule: true } }),
      categories: async () => [{ id: '1', name: 'Just Chatting', boxArtUrl: '' }], updateSettings: async () => {},
      importGoogle: async () => true, connectGoogle: async () => {}, disconnectGoogle: async () => {}, calendars: async () => [],
      beginTwitch: async () => ({}), completeTwitch: async () => {}, disconnectTwitch: async () => {}, openExternal: async () => {},
    };
  });
}

async function fill(page: Page, title: string, kind = 'LIVE') {
  await page.getByRole('button', { name: '+ Nouvel événement' }).click();
  await page.getByLabel('Type').selectOption(kind);
  await page.getByLabel('Titre', { exact: true }).fill(title);
  await page.getByLabel('Date').fill('2026-09-03');
  await page.getByLabel('Début').fill('20:00');
  await page.getByLabel('Fin').fill('22:00');
}

async function previewAndSave(page: Page) {
  await page.getByRole('button', { name: 'Prévisualiser et vérifier' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Événement prêt à enregistrer' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
}

function eventCard(page: Page, title: string): Locator {
  return page.locator('article.event').filter({ has: page.getByText(title, { exact: true }) });
}

test.beforeEach(async ({ page }) => { await mockPreload(page); await page.goto('/'); });

test('création LIVE Google+Twitch, modification et suppression', async ({ page }) => {
  await fill(page, 'Soirée Twitch');
  await page.getByLabel('Google Calendar').check();
  await page.getByLabel('Twitch', { exact: true }).check();
  await page.getByLabel('Titre public Twitch').fill('Live public');
  await page.getByLabel('Catégorie Twitch').fill('Just');
  await page.getByRole('button', { name: 'Just Chatting' }).click();
  await previewAndSave(page);

  let card = eventCard(page, 'Soirée Twitch');
  await expect(card).toBeVisible();
  await expect(card.getByText('✓ Google')).toBeVisible();
  await expect(card.getByText('✓ Twitch')).toBeVisible();
  await card.getByRole('button', { name: 'Modifier' }).click();
  await page.getByLabel('Titre', { exact: true }).fill('Soirée modifiée');
  await previewAndSave(page);

  card = eventCard(page, 'Soirée modifiée');
  await expect(card).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await card.getByRole('button', { name: 'Supprimer' }).click();
  await expect(card).toHaveCount(0);
});

test('PERSONAL Google only', async ({ page }) => {
  await fill(page, 'Rendez-vous', 'PERSONAL');
  await page.getByLabel('Google Calendar').check();
  await expect(page.getByLabel('Twitch', { exact: true })).not.toBeChecked();
  await previewAndSave(page);

  const card = eventCard(page, 'Rendez-vous');
  await expect(card).toBeVisible();
  await expect(card.getByText('✓ Google')).toBeVisible();
});

test('deux événements simultanés sont conservés après confirmation', async ({ page }) => {
  await fill(page, 'Premier');
  await previewAndSave(page);
  await expect(eventCard(page, 'Premier')).toBeVisible();

  await fill(page, 'Second');
  await page.getByRole('button', { name: 'Prévisualiser et vérifier' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Chevauchement détecté' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Valider quand même' }).click();

  await expect(eventCard(page, 'Premier')).toBeVisible();
  const second = eventCard(page, 'Second');
  await expect(second).toBeVisible();
  await expect(second.getByText('Chevauchement accepté')).toBeVisible();
});

test('navigation Agenda et Aujourd’hui reste disponible', async ({ page }) => {
  await page.getByRole('button', { name: 'Agenda', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Semaine' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mois' })).toBeVisible();
  await page.getByRole('button', { name: 'Aujourd’hui', exact: true }).first().click();
  await expect(page.getByText('PROCHAIN ÉVÉNEMENT')).toBeVisible();
});
