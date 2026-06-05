export interface LevelGrade {
  id: number;
  name: string;
  minXp: number;
  title: string;
}

export const LEVEL_GRADES: LevelGrade[] = [
  { id: 1, name: 'Débutant', minXp: 0, title: 'Novice' },
  { id: 2, name: 'Challenger', minXp: 500, title: 'Compétiteur' },
  { id: 3, name: 'Expert', minXp: 1500, title: 'Stratège' },
  { id: 4, name: 'Maître', minXp: 3500, title: 'Champion' },
  { id: 5, name: 'Légende', minXp: 7000, title: 'Légende' },
];

export const XP_PER_WIN = 50;
export const XP_PER_SOLO_CORRECT = 5;
export const POINTS_PER_CORRECT = 10;

export function getLevelFromXp(xp: number): LevelGrade {
  let grade = LEVEL_GRADES[0];
  for (const g of LEVEL_GRADES) {
    if (xp >= g.minXp) {
      grade = g;
    }
  }
  return grade;
}

export function getXpProgress(xp: number): { current: number; next: number; percent: number } {
  const grade = getLevelFromXp(xp);
  const idx = LEVEL_GRADES.findIndex(g => g.id === grade.id);
  const nextGrade = LEVEL_GRADES[idx + 1];
  if (!nextGrade) {
    return { current: xp - grade.minXp, next: 1000, percent: 100 };
  }
  const range = nextGrade.minXp - grade.minXp;
  const current = xp - grade.minXp;
  return { current, next: range, percent: Math.min(100, (current / range) * 100) };
}
