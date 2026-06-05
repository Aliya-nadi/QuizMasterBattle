import { getDatabase } from '../sqlite/connection';
import type { QuizCategoryId, QuizQuestion } from '../../types';

export const quizRepository = {
  getQuestionsByCategory(categoryId: QuizCategoryId): QuizQuestion[] {
    const db = getDatabase();
    const result = db.execute(
      'SELECT * FROM quiz_questions WHERE category_id = ? ORDER BY id',
      [categoryId],
    );
    const questions: QuizQuestion[] = [];
    if (!result.rows) {
      return questions;
    }
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i) as Record<string, unknown>;
      questions.push({
        id: row.id as number,
        categoryId: row.category_id as QuizCategoryId,
        question: row.question as string,
        options: JSON.parse(row.options_json as string) as string[],
        correctIndex: row.correct_index as number,
      });
    }
    return questions;
  },

  getCategories() {
    const db = getDatabase();
    const result = db.execute('SELECT * FROM quiz_categories ORDER BY name');
    const list: { id: string; name: string; icon: string; color: string }[] = [];
    if (!result.rows) {
      return list;
    }
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i) as Record<string, unknown>;
      list.push({
        id: row.id as string,
        name: row.name as string,
        icon: row.icon as string,
        color: row.color as string,
      });
    }
    return list;
  },
};
