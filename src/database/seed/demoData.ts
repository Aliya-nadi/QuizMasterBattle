import { QUIZ_CATEGORIES, SOLO_QUESTIONS, ACHIEVEMENTS_DEF } from '../../constants/quizData';
import { getDatabase } from '../sqlite/connection';

export function seedDemoData(): void {
  const db = getDatabase();
  const catCount = db.execute('SELECT COUNT(*) as c FROM quiz_categories');
  const count = (catCount.rows?.item(0) as { c: number })?.c ?? 0;
  if (count > 0) {
    return;
  }

  for (const cat of QUIZ_CATEGORIES) {
    db.execute(
      'INSERT INTO quiz_categories (id, name, icon, color) VALUES (?, ?, ?, ?)',
      [cat.id, cat.name, cat.icon, cat.color],
    );
  }

  for (const [categoryId, questions] of Object.entries(SOLO_QUESTIONS)) {
    if (questions.length === 0) {
      continue;
    }
    questions.forEach(q => {
      db.execute(
        `INSERT INTO quiz_questions (category_id, question, options_json, correct_index)
         VALUES (?, ?, ?, ?)`,
        [categoryId, q.question, JSON.stringify(q.options), q.correctIndex],
      );
      const qIdResult = db.execute('SELECT last_insert_rowid() as id');
      const questionId = (qIdResult.rows?.item(0) as { id: number }).id;
      q.options.forEach((opt, optIdx) => {
        db.execute(
          'INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
          [questionId, opt, optIdx === q.correctIndex ? 1 : 0],
        );
      });
    });
  }
}

export function seedAchievementsForUser(userId: number): void {
  const db = getDatabase();
  for (const ach of ACHIEVEMENTS_DEF) {
    db.execute(
      'INSERT OR IGNORE INTO achievements (id, user_id, unlocked) VALUES (?, ?, 0)',
      [ach.id, userId],
    );
  }
}
