export type ExerciseVideoSource = {
  videoId: string;
  status: 'placeholder' | 'approved';
  sourceLabel: string;
  watchUrl: string;
};

/**
 * Keep exercise videos here so a temporary public demonstration can be
 * replaced with a Happy Body recording without changing any screen code.
 * Only add a video after it has been checked for that exact exercise.
 */
export const exerciseVideoLibrary: Record<string, ExerciseVideoSource> = {
  'supported-sit-to-stand': {
    videoId: 'ITv-_BkcrD0',
    status: 'placeholder',
    sourceLabel: 'Baptist Health',
    watchUrl: 'https://www.youtube.com/watch?v=ITv-_BkcrD0',
  },
};

export function getExerciseVideoSource(exerciseId: string) {
  return exerciseVideoLibrary[exerciseId] ?? null;
}
