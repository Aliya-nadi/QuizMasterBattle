import { userRepository } from '../database/repositories/userRepository';
import { historyRepository } from '../database/repositories/historyRepository';
import { getLevelFromXp } from '../constants/levels';
import { calculateXpGain, getLevelNumber } from '../utils/gameLogic';
import type { GameMode } from '../types';

export const profileService = {
  recordGameResult(
    userId: number,
    mode: GameMode,
    data: {
      score: number;
      correctAnswers: number;
      durationSeconds: number;
      won: boolean;
      categoryId?: string;
    },
  ): void {
    historyRepository.addGameHistory(userId, mode, data);
    const profile = userRepository.getProfile(userId);
    if (!profile) {
      return;
    }
    const xpGain = calculateXpGain(mode, data.won, data.correctAnswers);
    const newXp = profile.xp + xpGain;
    userRepository.updateProfile(userId, {
      xp: newXp,
      level: getLevelNumber(newXp),
      gamesPlayed: profile.gamesPlayed + 1,
      wins: data.won ? profile.wins + 1 : profile.wins,
      losses: data.won ? profile.losses : profile.losses + 1,
      totalScore: profile.totalScore + data.score,
    });
  },

  getPlayerStats(userId: number) {
    const profile = userRepository.getProfile(userId);
    const user = userRepository.getUserById(userId);
    if (!profile || !user) {
      return null;
    }
    const grade = getLevelFromXp(profile.xp);
    return {
      user,
      profile,
      grade,
      winRatio: userRepository.getWinRatio(userId),
      history: historyRepository.getGameHistory(userId),
    };
  },
};
