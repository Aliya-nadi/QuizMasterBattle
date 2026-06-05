export type GameMode = 'solo' | 'battle' | 'royale';

export type QuizCategoryId = 'culture' | 'informatique' | 'react_native' | 'git_commands';

export interface User {
  id: number;
  pseudo: string;
  email?: string;
  isGuest: boolean;
  createdAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  avatarId: string;
  level: number;
  xp: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalScore: number;
}

export interface QuizQuestion {
  id: number;
  categoryId: QuizCategoryId;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface BattleTopic {
  id: string;
  title: string;
  categoryId: QuizCategoryId;
  validAnswers: string[];
  hint?: string;
}

export interface GameHistoryEntry {
  id: number;
  userId: number;
  mode: GameMode;
  categoryId?: string;
  score: number;
  correctAnswers: number;
  durationSeconds: number;
  won: boolean;
  playedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  music: boolean;
  soundEffects: boolean;
  notifications: boolean;
  language: 'fr' | 'en';
}

export interface BattlePlayer {
  id: string;
  name: string;
  avatarId: string;
  isEliminated: boolean;
  score: number;
}

export interface MultiplayerRoom {
  id: string;
  code: string;
  hostId: string;
  mode: 'battle' | 'royale';
  players: BattlePlayer[];
  maxPlayers: number;
  isPrivate: boolean;
}
