import type { GoalId, HappyBodyData, LegacyUserProgress, MovementState, PathwayId } from './types';

export const STORAGE_KEY = 'happy-body-data-v2';
export const LEGACY_STORAGE_KEY = 'happy-body-progress-v1';

const foundationMovementIds = ['deep-squat', 'overhead-reach', 'floor-sitting', 'floor-get-up'];
const pathwayIds: PathwayId[] = ['squat', 'push-up', 'pull-up'];

function unknownState(movementId: string): MovementState {
  return {
    movementId,
    status: 'unknown',
    outcome: null,
    currentLevel: null,
    assessedAt: null,
    reassessAfter: null,
    note: '',
  };
}

export function createDefaultData(now = new Date().toISOString()): HappyBodyData {
  const movementStates = Object.fromEntries(
    [...foundationMovementIds, ...pathwayIds].map((id) => [id, unknownState(id)]),
  );

  return {
    version: 2,
    profile: {
      name: '',
      primaryGoal: null,
      secondaryGoals: [],
      skillInterests: [],
      limitations: [],
      limitationNote: '',
      defaultMinutes: 20,
      practiceStyle: 'either',
      movementBreaks: 2,
      equipment: ['none'],
      onboardingCompleted: false,
      onboardingCompletedAt: null,
    },
    movementStates,
    practices: [],
    assessments: [],
    dailyCheckIns: [],
    painFlags: [],
    milestones: [],
    preferences: { assessmentIntroSeen: false, lastScreen: 'today' },
    legacyImportedAt: null,
    updatedAt: now,
  };
}

const legacyDefault: LegacyUserProgress = {
  selectedGoals: ['squat', 'push-up', 'pull-up'],
  currentLevels: { squat: 0, 'push-up': 1, 'pull-up': 1 },
  practices: [],
  assessments: [],
  milestones: [],
};

const legacyLevelMap: Record<PathwayId, number[]> = {
  squat: [0, 3, 5, 8],
  'push-up': [0, 1, 5, 8],
  'pull-up': [0, 2, 4, 6],
};

const pathwayGoalMap: Record<PathwayId, GoalId> = {
  squat: 'pistol-squat',
  'push-up': 'push-up',
  'pull-up': 'pull-up',
};

export function hasMeaningfulLegacyData(legacy: LegacyUserProgress) {
  return JSON.stringify(legacy) !== JSON.stringify(legacyDefault);
}

export function migrateLegacyProgress(legacy: LegacyUserProgress, now = new Date().toISOString()): HappyBodyData {
  const migrated = createDefaultData(now);
  if (!hasMeaningfulLegacyData(legacy)) return migrated;

  const lastAssessmentByPathway = new Map<PathwayId, LegacyUserProgress['assessments'][number]>();
  [...legacy.assessments]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((record) => lastAssessmentByPathway.set(record.pathwayId, record));

  pathwayIds.forEach((pathwayId) => {
    const assessed = lastAssessmentByPathway.get(pathwayId);
    const hasPractice = legacy.practices.some((entry) => entry.pathwayId === pathwayId);
    if (!assessed && !hasPractice) return;
    const oldIndex = assessed?.levelIndex ?? legacy.currentLevels[pathwayId] ?? 0;
    const map = legacyLevelMap[pathwayId];
    const levelIndex = map[Math.max(0, Math.min(map.length - 1, oldIndex))];
    migrated.movementStates[pathwayId] = {
      movementId: pathwayId,
      status: hasPractice ? 'in-progress' : 'assessed',
      outcome: 'comfortable',
      currentLevel: levelIndex,
      assessedAt: assessed?.date ?? legacy.practices.find((entry) => entry.pathwayId === pathwayId)?.date ?? now.slice(0, 10),
      reassessAfter: null,
      note: 'Imported from the original Happy Body prototype.',
    };
  });

  const selectedGoals = legacy.selectedGoals.map((id) => pathwayGoalMap[id]);
  migrated.profile.primaryGoal = selectedGoals[0] ?? null;
  migrated.profile.secondaryGoals = selectedGoals.slice(1);
  migrated.profile.skillInterests = selectedGoals;
  migrated.profile.onboardingCompleted = true;
  migrated.profile.onboardingCompletedAt = now;
  migrated.legacyImportedAt = now;
  migrated.practices = legacy.practices.map((entry) => ({
    id: entry.id,
    date: entry.date,
    pathwayId: entry.pathwayId,
    movementId: entry.pathwayId,
    exerciseId: entry.exerciseId,
    exerciseTitle: entry.exerciseTitle,
    completion: 'yes',
    difficulty: entry.difficulty <= 2 ? 'easy' : entry.difficulty >= 4 ? 'challenging' : 'good',
    bodyAfter: /pain/i.test(entry.bodyAfter) ? 'pain' : /sore/i.test(entry.bodyAfter) ? 'sore' : 'good',
    sets: entry.sets,
    amount: entry.amount,
    metric: entry.metric,
    bodyDuring: entry.bodyDuring,
    notes: entry.notes,
    videoUrl: entry.videoUrl,
    source: 'self-chosen',
  }));
  migrated.assessments = legacy.assessments.map((entry) => ({
    id: entry.id,
    date: entry.date,
    movementId: entry.pathwayId,
    pathwayId: entry.pathwayId,
    checkpointId: 'legacy-assessment',
    checkpointTitle: entry.levelTitle,
    outcome: 'comfortable',
    levelIndex: legacyLevelMap[entry.pathwayId][Math.max(0, Math.min(3, entry.levelIndex))],
    note: 'Imported from the original Happy Body prototype.',
  }));
  migrated.milestones = [...legacy.milestones];
  return migrated;
}

function normalizeData(value: Partial<HappyBodyData>): HappyBodyData {
  const fallback = createDefaultData();
  const states = { ...fallback.movementStates };
  Object.entries(value.movementStates ?? {}).forEach(([id, state]) => {
    states[id] = { ...unknownState(id), ...state, movementId: id };
  });

  return {
    ...fallback,
    ...value,
    version: 2,
    profile: { ...fallback.profile, ...value.profile },
    movementStates: states,
    practices: Array.isArray(value.practices) ? value.practices : [],
    assessments: Array.isArray(value.assessments) ? value.assessments : [],
    dailyCheckIns: Array.isArray(value.dailyCheckIns) ? value.dailyCheckIns : [],
    painFlags: Array.isArray(value.painFlags) ? value.painFlags : [],
    milestones: Array.isArray(value.milestones) ? value.milestones : [],
    preferences: { ...fallback.preferences, ...value.preferences },
  };
}

export function parseImportedData(raw: string) {
  const parsed = JSON.parse(raw) as Partial<HappyBodyData>;
  if (parsed.version !== 2 || typeof parsed.profile !== 'object' || !parsed.profile) {
    throw new Error('This file is not a Happy Body version 2 export.');
  }
  return normalizeData(parsed);
}

export interface ProgressRepository {
  load(): HappyBodyData;
  save(data: HappyBodyData): void;
  clear(): void;
}

export const browserProgressRepository: ProgressRepository = {
  load() {
    if (typeof window === 'undefined') return createDefaultData();
    try {
      const current = window.localStorage.getItem(STORAGE_KEY);
      if (current) return normalizeData(JSON.parse(current) as Partial<HappyBodyData>);

      const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const migrated = migrateLegacyProgress(JSON.parse(legacy) as LegacyUserProgress);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch {
      // Keep the app usable if browser data is malformed or unavailable.
    }
    return createDefaultData();
  },
  save(data) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: 2, updatedAt: new Date().toISOString() }));
    }
  },
  clear() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  },
};

export function isPathwayId(value: string): value is PathwayId {
  return value === 'squat' || value === 'push-up' || value === 'pull-up';
}
