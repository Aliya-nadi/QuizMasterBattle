import AsyncStorage from '@react-native-async-storage/async-storage';
import { runMigrations } from './migrations';
import { seedDemoData } from './seed/demoData';

const CURRENT_USER_KEY = '@quizmaster/current_user_id';

export async function initializeDatabase(): Promise<void> {
  await runMigrations();
  seedDemoData();
}

export async function getStoredUserId(): Promise<number | null> {
  const value = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return value ? parseInt(value, 10) : null;
}

export async function setStoredUserId(userId: number | null): Promise<void> {
  if (userId === null) {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  } else {
    await AsyncStorage.setItem(CURRENT_USER_KEY, String(userId));
  }
}

export async function getPreference<T>(key: string, defaultValue: T): Promise<T> {
  const raw = await AsyncStorage.getItem(`@quizmaster/pref/${key}`);
  if (raw === null) {
    return defaultValue;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export async function setPreference<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(`@quizmaster/pref/${key}`, JSON.stringify(value));
}
