import { getDatabase } from '../sqlite/connection';
import type { GameHistoryEntry, GameMode } from '../../types';

export const historyRepository = {
  addGameHistory(
    userId: number,
    mode: GameMode,
    data: {
      categoryId?: string;
      score: number;
      correctAnswers: number;
      durationSeconds: number;
      won: boolean;
    },
  ): void {
    const db = getDatabase();
    db.execute(
      `INSERT INTO game_history (user_id, mode, category_id, score, correct_answers, duration_seconds, won)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        mode,
        data.categoryId ?? null,
        data.score,
        data.correctAnswers,
        data.durationSeconds,
        data.won ? 1 : 0,
      ],
    );
  },

  addBattleHistory(
    userId: number,
    data: {
      topicId: string;
      playersCount: number;
      placement: number;
      won: boolean;
      durationSeconds: number;
    },
  ): void {
    const db = getDatabase();
    db.execute(
      `INSERT INTO battle_history (user_id, topic_id, players_count, placement, won, duration_seconds)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.topicId,
        data.playersCount,
        data.placement,
        data.won ? 1 : 0,
        data.durationSeconds,
      ],
    );
  },

  addRoyaleHistory(
    userId: number,
    data: {
      topicId: string;
      bidAmount: number;
      won: boolean;
      answersCount: number;
    },
  ): void {
    const db = getDatabase();
    db.execute(
      `INSERT INTO royale_history (user_id, topic_id, bid_amount, won, answers_count)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, data.topicId, data.bidAmount, data.won ? 1 : 0, data.answersCount],
    );
  },

  getGameHistory(userId: number, limit = 20): GameHistoryEntry[] {
    const db = getDatabase();
    const result = db.execute(
      `SELECT * FROM game_history WHERE user_id = ? ORDER BY played_at DESC LIMIT ?`,
      [userId, limit],
    );
    const list: GameHistoryEntry[] = [];
    if (!result.rows) {
      return list;
    }
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i) as Record<string, unknown>;
      list.push({
        id: row.id as number,
        userId: row.user_id as number,
        mode: row.mode as GameMode,
        categoryId: row.category_id as string | undefined,
        score: row.score as number,
        correctAnswers: row.correct_answers as number,
        durationSeconds: row.duration_seconds as number,
        won: Boolean(row.won),
        playedAt: row.played_at as string,
      });
    }
    return list;
  },
};
