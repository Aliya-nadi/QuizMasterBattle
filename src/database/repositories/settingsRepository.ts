import { getDatabase } from '../sqlite/connection';
import type { AppSettings } from '../../types';

export const settingsRepository = {
  getSettings(userId: number): AppSettings {
    const db = getDatabase();
    const result = db.execute('SELECT * FROM settings WHERE user_id = ?', [userId]);
    if (!result.rows || result.rows.length === 0) {
      return {
        darkMode: true,
        music: true,
        soundEffects: true,
        notifications: true,
        language: 'fr',
      };
    }
    const row = result.rows.item(0) as Record<string, unknown>;
    return {
      darkMode: Boolean(row.dark_mode),
      music: Boolean(row.music),
      soundEffects: Boolean(row.sound_effects),
      notifications: Boolean(row.notifications),
      language: (row.language as 'fr' | 'en') ?? 'fr',
    };
  },

  updateSettings(userId: number, settings: Partial<AppSettings>): void {
    const db = getDatabase();
    const map: Record<string, string> = {
      darkMode: 'dark_mode',
      music: 'music',
      soundEffects: 'sound_effects',
      notifications: 'notifications',
      language: 'language',
    };
    const fields: string[] = [];
    const values: unknown[] = [];
    Object.entries(settings).forEach(([key, val]) => {
      if (map[key] !== undefined && val !== undefined) {
        fields.push(`${map[key]} = ?`);
        values.push(typeof val === 'boolean' ? (val ? 1 : 0) : val);
      }
    });
    if (fields.length === 0) {
      return;
    }
    values.push(userId);
    db.execute(`UPDATE settings SET ${fields.join(', ')} WHERE user_id = ?`, values);
  },
};
