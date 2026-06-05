import { getDatabase } from '../sqlite/connection';

const MIGRATIONS: { version: number; sql: string[] }[] = [
  {
    version: 1,
    sql: [
      `CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pseudo TEXT NOT NULL UNIQUE,
        email TEXT,
        password_hash TEXT,
        is_guest INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        avatar_id TEXT DEFAULT 'avatar_1',
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        games_played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS quiz_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id TEXT NOT NULL,
        question TEXT NOT NULL,
        options_json TEXT NOT NULL,
        correct_index INTEGER NOT NULL,
        FOREIGN KEY (category_id) REFERENCES quiz_categories(id)
      )`,
      `CREATE TABLE IF NOT EXISTS quiz_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        answer_text TEXT NOT NULL,
        is_correct INTEGER DEFAULT 0,
        FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
      )`,
      `CREATE TABLE IF NOT EXISTS game_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        mode TEXT NOT NULL,
        category_id TEXT,
        score INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        duration_seconds INTEGER DEFAULT 0,
        won INTEGER DEFAULT 0,
        played_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS battle_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        topic_id TEXT,
        players_count INTEGER,
        placement INTEGER,
        won INTEGER DEFAULT 0,
        duration_seconds INTEGER DEFAULT 0,
        played_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS royale_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        topic_id TEXT,
        bid_amount INTEGER,
        won INTEGER DEFAULT 0,
        answers_count INTEGER DEFAULT 0,
        played_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        unlocked INTEGER DEFAULT 0,
        unlocked_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        user_id INTEGER PRIMARY KEY,
        dark_mode INTEGER DEFAULT 1,
        music INTEGER DEFAULT 1,
        sound_effects INTEGER DEFAULT 1,
        notifications INTEGER DEFAULT 1,
        language TEXT DEFAULT 'fr',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    ],
  },
];

export async function runMigrations(): Promise<void> {
  const db = getDatabase();
  let currentVersion = 0;
  try {
    const versionResult = db.execute('SELECT version FROM schema_version LIMIT 1');
    if (versionResult.rows && versionResult.rows.length > 0) {
      currentVersion = (versionResult.rows.item(0) as { version: number }).version;
    }
  } catch {
    currentVersion = 0;
  }

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      db.execute('BEGIN TRANSACTION');
      try {
        for (const sql of migration.sql) {
          db.execute(sql);
        }
        if (currentVersion === 0) {
          db.execute('INSERT INTO schema_version (version) VALUES (?)', [migration.version]);
        } else {
          db.execute('UPDATE schema_version SET version = ?', [migration.version]);
        }
        db.execute('COMMIT');
        currentVersion = migration.version;
      } catch (e) {
        db.execute('ROLLBACK');
        throw e;
      }
    }
  }
}
