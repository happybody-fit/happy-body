import type { PathwayId, UserProgress } from './types';

const STORAGE_KEY = 'happy-body-progress-v1';

export const defaultProgress: UserProgress = {
  selectedGoals: ['squat', 'push-up', 'pull-up'],
  currentLevels: { squat: 0, 'push-up': 1, 'pull-up': 1 },
  practices: [],
  assessments: [],
  milestones: [],
};

export interface ProgressRepository {
  load(): UserProgress;
  save(progress: UserProgress): void;
  clear(): void;
}

export const browserProgressRepository: ProgressRepository = {
  load() {
    if (typeof window === 'undefined') return defaultProgress;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultProgress;
      const parsed = JSON.parse(saved) as Partial<UserProgress>;
      return {
        ...defaultProgress,
        ...parsed,
        currentLevels: { ...defaultProgress.currentLevels, ...parsed.currentLevels },
      };
    } catch {
      return defaultProgress;
    }
  },
  save(progress) {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  },
  clear() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  },
};

export function isPathwayId(value: string): value is PathwayId {
  return value === 'squat' || value === 'push-up' || value === 'pull-up';
}
