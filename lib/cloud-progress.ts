import type { SupabaseClient } from '@supabase/supabase-js';
import { pathways } from '@/data/pathways';
import { createDefaultData, migrateLegacyProgress, normalizeHappyBodyData } from '@/lib/storage';
import type { AssessmentRecord, HappyBodyData, LegacyPathwayId, LegacyUserProgress, PathwayId, PracticeEntry } from '@/lib/types';

type CloudError = { code?: string; message: string } | null;

function throwIfError(result: { error: CloudError }) {
  if (result.error) throw new Error(result.error.message);
}

function isMissingStateTable(error: CloudError) {
  return Boolean(error && (error.code === 'PGRST205' || /happy_body_state|schema cache|does not exist/i.test(error.message)));
}

function uniqueById<T extends { id: string }>(preferred: T[], fallback: T[]) {
  const records = new Map(fallback.map((record) => [record.id, record]));
  preferred.forEach((record) => records.set(record.id, record));
  return [...records.values()];
}

export function mergeProgress(local: HappyBodyData, cloud: HappyBodyData, preferLocal: boolean): HappyBodyData {
  const preferred = preferLocal ? local : cloud;
  const fallback = preferLocal ? cloud : local;
  const checkIns = new Map(fallback.dailyCheckIns.map((item) => [item.date, item]));
  preferred.dailyCheckIns.forEach((item) => checkIns.set(item.date, item));
  return {
    ...fallback,
    ...preferred,
    version: 2,
    profile: { ...fallback.profile, ...preferred.profile },
    movementStates: { ...fallback.movementStates, ...preferred.movementStates },
    practices: uniqueById(preferred.practices, fallback.practices).sort((a, b) => b.date.localeCompare(a.date)),
    assessments: uniqueById(preferred.assessments, fallback.assessments).sort((a, b) => b.date.localeCompare(a.date)),
    painFlags: uniqueById(preferred.painFlags, fallback.painFlags),
    dailyCheckIns: [...checkIns.values()].sort((a, b) => b.date.localeCompare(a.date)),
    milestones: [...new Set([...preferred.milestones, ...fallback.milestones])],
    preferences: { ...fallback.preferences, ...preferred.preferences },
    updatedAt: new Date().toISOString(),
  };
}

export function hasMeaningfulLocalProgress(data: HappyBodyData) {
  return data.profile.onboardingCompleted || data.practices.length > 0 || data.assessments.length > 0;
}

async function loadLegacyCloudProgress(client: SupabaseClient, userId: string): Promise<HappyBodyData | null> {
  const [pathwayResult, practiceResult, assessmentResult, milestoneResult] = await Promise.all([
    client.from('user_pathways').select('pathway_id, selected, current_level').eq('user_id', userId),
    client.from('practice_sessions').select('id, date, pathway_id, exercise_id, exercise_title, sets, amount, metric, difficulty, body_during, body_after, notes, video_url').eq('user_id', userId).order('date', { ascending: false }),
    client.from('assessment_results').select('id, date, pathway_id, level_index, level_title').eq('user_id', userId).order('date', { ascending: false }),
    client.from('milestones').select('title').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);
  [pathwayResult, practiceResult, assessmentResult, milestoneResult].forEach(throwIfError);
  const pathwaysData = pathwayResult.data ?? [];
  const practices = practiceResult.data ?? [];
  const assessments = assessmentResult.data ?? [];
  const milestoneRows = milestoneResult.data ?? [];
  if (!pathwaysData.length && !practices.length && !assessments.length && !milestoneRows.length) return null;

  const isLegacyPathwayId = (value: unknown): value is LegacyPathwayId => value === 'squat' || value === 'push-up' || value === 'pull-up';
  const legacy: LegacyUserProgress = {
    selectedGoals: pathwaysData.filter((row) => row.selected && isLegacyPathwayId(row.pathway_id)).map((row) => row.pathway_id as LegacyPathwayId),
    currentLevels: { squat: 0, 'push-up': 0, 'pull-up': 0 },
    practices: practices.filter((row) => isLegacyPathwayId(row.pathway_id)).map((row) => ({
      id: row.id as string,
      date: row.date as string,
      pathwayId: row.pathway_id as LegacyPathwayId,
      exerciseId: row.exercise_id as string,
      exerciseTitle: row.exercise_title as string,
      sets: row.sets as number | null,
      amount: row.amount as number | null,
      metric: row.metric as 'reps' | 'seconds',
      difficulty: row.difficulty as number,
      bodyDuring: row.body_during as string,
      bodyAfter: row.body_after as string,
      notes: row.notes as string,
      videoUrl: row.video_url as string,
    })),
    assessments: assessments.filter((row) => isLegacyPathwayId(row.pathway_id)).map((row) => ({
      id: row.id as string,
      date: row.date as string,
      pathwayId: row.pathway_id as LegacyPathwayId,
      levelIndex: row.level_index as number,
      levelTitle: row.level_title as string,
    })),
    milestones: milestoneRows.map((row) => row.title as string),
  };
  pathwaysData.forEach((row) => { if (isLegacyPathwayId(row.pathway_id)) legacy.currentLevels[row.pathway_id] = row.current_level as number; });
  return migrateLegacyProgress(legacy);
}

export async function loadCloudProgress(client: SupabaseClient, userId: string): Promise<HappyBodyData | null> {
  const stateResult = await client.from('happy_body_state').select('data').eq('user_id', userId).maybeSingle();
  if (!stateResult.error && stateResult.data?.data) return normalizeHappyBodyData(stateResult.data.data as Partial<HappyBodyData>);
  if (stateResult.error && !isMissingStateTable(stateResult.error)) throw new Error(stateResult.error.message);
  return loadLegacyCloudProgress(client, userId);
}

async function saveLegacyCloudProgress(client: SupabaseClient, userId: string, data: HappyBodyData) {
  const updatedAt = new Date().toISOString();
  const chosenGoals = new Set([
    data.profile.primaryGoal,
    ...data.profile.secondaryGoals,
    ...data.profile.skillInterests,
  ]);
  const practiceRows = data.practices.filter((entry): entry is PracticeEntry & { pathwayId: PathwayId } => Boolean(entry.pathwayId));
  const assessmentRows = data.assessments.filter((entry): entry is AssessmentRecord & { pathwayId: PathwayId } => Boolean(entry.pathwayId && entry.levelIndex !== null));
  const results = await Promise.all([
    client.from('user_pathways').upsert(pathways.map((pathway) => ({
      user_id: userId,
      pathway_id: pathway.id,
      selected: pathway.goalIds.some((goal) => chosenGoals.has(goal)),
      current_level: data.movementStates[pathway.id]?.currentLevel ?? 0,
      updated_at: updatedAt,
    })), { onConflict: 'user_id,pathway_id' }),
    practiceRows.length ? client.from('practice_sessions').upsert(practiceRows.map((entry) => ({
      user_id: userId,
      id: entry.id,
      date: entry.date,
      pathway_id: entry.pathwayId,
      exercise_id: entry.exerciseId,
      exercise_title: entry.exerciseTitle,
      sets: entry.sets,
      amount: entry.amount,
      metric: entry.metric,
      difficulty: entry.difficulty === 'easy' ? 2 : entry.difficulty === 'challenging' ? 4 : 3,
      body_during: entry.bodyDuring,
      body_after: entry.bodyAfter,
      notes: entry.notes,
      video_url: entry.videoUrl,
      updated_at: updatedAt,
    })), { onConflict: 'user_id,id' }) : Promise.resolve({ error: null }),
    assessmentRows.length ? client.from('assessment_results').upsert(assessmentRows.map((entry) => ({
      user_id: userId,
      id: entry.id,
      date: entry.date,
      pathway_id: entry.pathwayId,
      level_index: entry.levelIndex,
      level_title: entry.checkpointTitle,
      updated_at: updatedAt,
    })), { onConflict: 'user_id,id' }) : Promise.resolve({ error: null }),
    data.milestones.length ? client.from('milestones').upsert(data.milestones.map((title) => ({ user_id: userId, title })), { onConflict: 'user_id,title' }) : Promise.resolve({ error: null }),
  ]);
  results.forEach(throwIfError);
}

export async function saveCloudProgress(client: SupabaseClient, userId: string, data: HappyBodyData) {
  const payload = { ...data, updatedAt: new Date().toISOString() };
  const result = await client.from('happy_body_state').upsert({
    user_id: userId,
    data: payload,
    updated_at: payload.updatedAt,
  }, { onConflict: 'user_id' });
  if (!result.error) return;
  if (!isMissingStateTable(result.error)) throw new Error(result.error.message);
  await saveLegacyCloudProgress(client, userId, data);
}

export function emptyCloudData() {
  return createDefaultData();
}
