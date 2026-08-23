import type { SupabaseClient } from '@supabase/supabase-js';
import { pathways } from '@/data/pathways';
import { defaultProgress } from '@/lib/storage';
import type { AssessmentRecord, PathwayId, PracticeEntry, UserProgress } from '@/lib/types';

type PathwayRow = {
  pathway_id: PathwayId;
  selected: boolean;
  current_level: number;
};

type PracticeRow = {
  id: string;
  date: string;
  pathway_id: PathwayId;
  exercise_id: string;
  exercise_title: string;
  sets: number | null;
  amount: number | null;
  metric: PracticeEntry['metric'];
  difficulty: number;
  body_during: string;
  body_after: string;
  notes: string;
  video_url: string;
};

type AssessmentRow = {
  id: string;
  date: string;
  pathway_id: PathwayId;
  level_index: number;
  level_title: string;
};

function throwIfError(result: { error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
}

function uniqueById<T extends { id: string }>(preferred: T[], fallback: T[]) {
  const records = new Map(fallback.map((record) => [record.id, record]));
  preferred.forEach((record) => records.set(record.id, record));
  return [...records.values()].sort((a, b) => {
    const aDate = 'date' in a && typeof a.date === 'string' ? a.date : '';
    const bDate = 'date' in b && typeof b.date === 'string' ? b.date : '';
    return bDate.localeCompare(aDate);
  });
}

export function mergeProgress(local: UserProgress, cloud: UserProgress, preferLocal: boolean): UserProgress {
  const preferred = preferLocal ? local : cloud;
  const fallback = preferLocal ? cloud : local;
  return {
    selectedGoals: preferred.selectedGoals.length ? [...preferred.selectedGoals] : [...fallback.selectedGoals],
    currentLevels: { ...fallback.currentLevels, ...preferred.currentLevels },
    practices: uniqueById(preferred.practices, fallback.practices),
    assessments: uniqueById(preferred.assessments, fallback.assessments),
    milestones: [...new Set([...preferred.milestones, ...fallback.milestones])],
  };
}

export function hasMeaningfulLocalProgress(progress: UserProgress) {
  return JSON.stringify(progress) !== JSON.stringify(defaultProgress);
}

export async function loadCloudProgress(client: SupabaseClient, userId: string): Promise<UserProgress | null> {
  const [pathwayResult, practiceResult, assessmentResult, milestoneResult] = await Promise.all([
    client.from('user_pathways').select('pathway_id, selected, current_level').eq('user_id', userId),
    client.from('practice_sessions').select('id, date, pathway_id, exercise_id, exercise_title, sets, amount, metric, difficulty, body_during, body_after, notes, video_url').eq('user_id', userId).order('date', { ascending: false }),
    client.from('assessment_results').select('id, date, pathway_id, level_index, level_title').eq('user_id', userId).order('date', { ascending: false }),
    client.from('milestones').select('title').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  [pathwayResult, practiceResult, assessmentResult, milestoneResult].forEach(throwIfError);
  const pathwayRows = (pathwayResult.data ?? []) as PathwayRow[];
  const practiceRows = (practiceResult.data ?? []) as PracticeRow[];
  const assessmentRows = (assessmentResult.data ?? []) as AssessmentRow[];
  const milestoneRows = (milestoneResult.data ?? []) as { title: string }[];

  if (!pathwayRows.length && !practiceRows.length && !assessmentRows.length && !milestoneRows.length) return null;

  const currentLevels = { ...defaultProgress.currentLevels };
  pathwayRows.forEach((row) => { currentLevels[row.pathway_id] = row.current_level; });

  return {
    selectedGoals: pathwayRows.filter((row) => row.selected).map((row) => row.pathway_id),
    currentLevels,
    practices: practiceRows.map((row) => ({
      id: row.id,
      date: row.date,
      pathwayId: row.pathway_id,
      exerciseId: row.exercise_id,
      exerciseTitle: row.exercise_title,
      sets: row.sets,
      amount: row.amount,
      metric: row.metric,
      difficulty: row.difficulty,
      bodyDuring: row.body_during,
      bodyAfter: row.body_after,
      notes: row.notes,
      videoUrl: row.video_url,
    })),
    assessments: assessmentRows.map((row) => ({
      id: row.id,
      date: row.date,
      pathwayId: row.pathway_id,
      levelIndex: row.level_index,
      levelTitle: row.level_title,
    })),
    milestones: milestoneRows.map((row) => row.title),
  };
}

export async function saveCloudProgress(client: SupabaseClient, userId: string, progress: UserProgress) {
  const updatedAt = new Date().toISOString();
  const results = await Promise.all([
    client.from('user_pathways').upsert(
      pathways.map((pathway) => ({
        user_id: userId,
        pathway_id: pathway.id,
        selected: progress.selectedGoals.includes(pathway.id),
        current_level: progress.currentLevels[pathway.id] ?? 0,
        updated_at: updatedAt,
      })),
      { onConflict: 'user_id,pathway_id' },
    ),
    progress.practices.length
      ? client.from('practice_sessions').upsert(
          progress.practices.map((entry) => ({
            id: entry.id,
            user_id: userId,
            date: entry.date,
            pathway_id: entry.pathwayId,
            exercise_id: entry.exerciseId,
            exercise_title: entry.exerciseTitle,
            sets: entry.sets,
            amount: entry.amount,
            metric: entry.metric,
            difficulty: entry.difficulty,
            body_during: entry.bodyDuring,
            body_after: entry.bodyAfter,
            notes: entry.notes,
            video_url: entry.videoUrl,
            updated_at: updatedAt,
          })),
          { onConflict: 'user_id,id' },
        )
      : Promise.resolve({ error: null }),
    progress.assessments.length
      ? client.from('assessment_results').upsert(
          progress.assessments.map((entry: AssessmentRecord) => ({
            id: entry.id,
            user_id: userId,
            date: entry.date,
            pathway_id: entry.pathwayId,
            level_index: entry.levelIndex,
            level_title: entry.levelTitle,
            updated_at: updatedAt,
          })),
          { onConflict: 'user_id,id' },
        )
      : Promise.resolve({ error: null }),
    progress.milestones.length
      ? client.from('milestones').upsert(
          progress.milestones.map((title) => ({ user_id: userId, title })),
          { onConflict: 'user_id,title' },
        )
      : Promise.resolve({ error: null }),
  ]);

  results.forEach(throwIfError);
}
