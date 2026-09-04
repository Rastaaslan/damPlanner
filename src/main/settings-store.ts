import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { z } from 'zod';

export const settingsSchema = z.object({
  timezone: z.string().default('Europe/Paris'),
  googleDefaultCalendarId: z.string().default('primary'),
  googleAvailabilityCalendarIds: z.array(z.string()).default(['primary']),
  twitchClientId: z.string().default(''),
  availabilityLocal: z.boolean().default(true),
  availabilityGoogle: z.boolean().default(true),
  availabilityTwitch: z.boolean().default(true),
  onboardingDone: z.boolean().default(false),
});
export type AppSettings = z.infer<typeof settingsSchema>;

export class SettingsStore {
  constructor(private readonly path: string) {}
  async get(): Promise<AppSettings> {
    try { return settingsSchema.parse(JSON.parse(await readFile(this.path, 'utf8'))); }
    catch { return settingsSchema.parse({}); }
  }
  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const value = settingsSchema.parse({ ...(await this.get()), ...patch });
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, JSON.stringify(value, null, 2), { mode: 0o600 });
    return value;
  }
}
