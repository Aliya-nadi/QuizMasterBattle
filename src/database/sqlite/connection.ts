import { open } from 'react-native-quick-sqlite';

const DB_NAME = 'quizmaster.db';

type QuickDb = ReturnType<typeof open>;

let database: QuickDb | null = null;

export function getDatabase(): QuickDb {
  if (!database) {
    database = open({ name: DB_NAME });
  }
  return database;
}

export function closeDatabase(): void {
  if (database) {
    database.close();
    database = null;
  }
}
