import { getDatabase } from '../sqlite/connection';
import { DEFAULT_AVATAR } from '../../constants/avatars';
import { seedAchievementsForUser } from '../seed/demoData';
import type { Profile, User } from '../../types';

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as number,
    pseudo: row.pseudo as string,
    email: row.email as string | undefined,
    isGuest: Boolean(row.is_guest),
    createdAt: row.created_at as string,
  };
}

function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    avatarId: row.avatar_id as string,
    level: row.level as number,
    xp: row.xp as number,
    gamesPlayed: row.games_played as number,
    wins: row.wins as number,
    losses: row.losses as number,
    totalScore: row.total_score as number,
  };
}

export const userRepository = {
  createUser(pseudo: string, isGuest = false, email?: string): User {
    const db = getDatabase();
    db.execute('INSERT INTO users (pseudo, email, is_guest) VALUES (?, ?, ?)', [
      pseudo,
      email ?? null,
      isGuest ? 1 : 0,
    ]);
    const idResult = db.execute('SELECT last_insert_rowid() as id');
    const userId = (idResult.rows?.item(0) as { id: number }).id;
    db.execute(
      `INSERT INTO profiles (user_id, avatar_id, level, xp) VALUES (?, ?, 1, 0)`,
      [userId, DEFAULT_AVATAR],
    );
    db.execute(
      `INSERT INTO settings (user_id, dark_mode, music, sound_effects, notifications, language)
       VALUES (?, 1, 1, 1, 1, 'fr')`,
      [userId],
    );
    seedAchievementsForUser(userId);
    return this.getUserById(userId)!;
  },

  getUserById(id: number): User | null {
    const db = getDatabase();
    const result = db.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return rowToUser(result.rows.item(0) as Record<string, unknown>);
  },

  getUserByPseudo(pseudo: string): User | null {
    const db = getDatabase();
    const result = db.execute('SELECT * FROM users WHERE pseudo = ?', [pseudo]);
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return rowToUser(result.rows.item(0) as Record<string, unknown>);
  },

  getProfile(userId: number): Profile | null {
    const db = getDatabase();
    const result = db.execute('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return rowToProfile(result.rows.item(0) as Record<string, unknown>);
  },

  updateProfile(userId: number, updates: Partial<Profile>): void {
    const db = getDatabase();
    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, string> = {
      avatarId: 'avatar_id',
      level: 'level',
      xp: 'xp',
      gamesPlayed: 'games_played',
      wins: 'wins',
      losses: 'losses',
      totalScore: 'total_score',
    };
    Object.entries(updates).forEach(([key, val]) => {
      if (map[key] && val !== undefined) {
        fields.push(`${map[key]} = ?`);
        values.push(val);
      }
    });
    if (fields.length === 0) {
      return;
    }
    values.push(userId);
    db.execute(`UPDATE profiles SET ${fields.join(', ')} WHERE user_id = ?`, values);
  },

  getWinRatio(userId: number): number {
    const profile = this.getProfile(userId);
    if (!profile || profile.gamesPlayed === 0) {
      return 0;
    }
    return Math.round((profile.wins / profile.gamesPlayed) * 100);
  },

  getAllUsersRanked(): (User & { profile: Profile })[] {
    const db = getDatabase();
    const result = db.execute(
      `SELECT u.*, p.* FROM users u
       JOIN profiles p ON p.user_id = u.id
       ORDER BY p.xp DESC LIMIT 20`,
    );
    const list: (User & { profile: Profile })[] = [];
    if (!result.rows) {
      return list;
    }
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i) as Record<string, unknown>;
      list.push({
        ...rowToUser(row),
        profile: rowToProfile(row),
      });
    }
    return list;
  },
};
