import { BATTLE_TOPICS } from '../constants/quizData';
import { POINTS_PER_CORRECT, XP_PER_SOLO_CORRECT, XP_PER_WIN, getLevelFromXp } from '../constants/levels';

export function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function isValidBattleAnswer(topicId: string, answer: string, usedAnswers: string[]): boolean {
  const topic = BATTLE_TOPICS.find(t => t.id === topicId);
  if (!topic) {
    return false;
  }
  const normalized = normalizeAnswer(answer);
  if (!normalized) {
    return false;
  }
  if (usedAnswers.includes(normalized)) {
    return false;
  }
  return topic.validAnswers.some(
    v => normalizeAnswer(v) === normalized || normalized.includes(normalizeAnswer(v)),
  );
}

export function validateRoyaleAnswers(
  topicId: string,
  answers: string[],
  requiredCount: number,
): { success: boolean; validCount: number } {
  const topic = BATTLE_TOPICS.find(t => t.id === topicId);
  if (!topic) {
    return { success: false, validCount: 0 };
  }
  const used = new Set<string>();
  let validCount = 0;
  for (const ans of answers) {
    const normalized = normalizeAnswer(ans);
    if (used.has(normalized)) {
      continue;
    }
    const isValid = topic.validAnswers.some(v => normalizeAnswer(v) === normalized);
    if (isValid) {
      used.add(normalized);
      validCount++;
    }
  }
  return { success: validCount >= requiredCount, validCount };
}

export function calculateSoloScore(correctCount: number): number {
  return correctCount * POINTS_PER_CORRECT;
}

export function calculateXpGain(mode: 'solo' | 'battle' | 'royale', won: boolean, correctCount = 0): number {
  if (won) {
    return XP_PER_WIN;
  }
  if (mode === 'solo') {
    return correctCount * XP_PER_SOLO_CORRECT;
  }
  return 0;
}

export function getLevelNumber(xp: number): number {
  return getLevelFromXp(xp).id;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
