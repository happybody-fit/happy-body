import { pathwayById, pathways } from '@/data/pathways';
import type { DailyCheckIn, GoalId, HappyBodyData, Pathway, PathwayId, Recommendation } from './types';

export const recommendationRules = {
  primaryGoal: 35,
  secondaryGoal: 18,
  skillInterest: 10,
  unknownMovement: 22,
  reassessmentDue: 16,
  eachNeglectedDay: 3,
  neglectedDayCap: 24,
  practicedToday: -32,
  practicedYesterday: -20,
  challengingYesterday: -14,
  temporarilyLimited: -8,
  stiffBody: -4,
  tiredBody: -12,
  soreBody: -22,
} as const;

const pathwayGoal: Record<PathwayId, GoalId> = {
  squat: 'pistol-squat',
  'push-up': 'push-up',
  'pull-up': 'pull-up',
};

const placeholderGoals: GoalId[] = ['front-split', 'middle-split', 'handstand', 'improve-mobility'];

function dayNumber(date: string) {
  return Math.floor(new Date(`${date.slice(0, 10)}T12:00:00Z`).getTime() / 86_400_000);
}

function daysBetween(earlier: string, later: string) {
  return Math.max(0, dayNumber(later) - dayNumber(earlier));
}

function goalWeight(data: HappyBodyData, pathway: Pathway) {
  const relevantGoals = new Set(pathway.goalIds);
  let score = 0;
  if (data.profile.primaryGoal && relevantGoals.has(data.profile.primaryGoal)) score += recommendationRules.primaryGoal;
  data.profile.secondaryGoals.forEach((goal) => {
    if (relevantGoals.has(goal)) score += recommendationRules.secondaryGoal;
  });
  data.profile.skillInterests.forEach((goal) => {
    if (goal === pathwayGoal[pathway.id]) score += recommendationRules.skillInterest;
  });
  return score;
}

function hasEquipment(data: HappyBodyData, requirements: string[]) {
  const available = new Set(data.profile.equipment);
  return requirements.every((item) => item === 'none' || available.has(item as never));
}

function latestCheckIn(data: HappyBodyData, today: string): DailyCheckIn | undefined {
  return data.dailyCheckIns.find((checkIn) => checkIn.date === today);
}

function bodyAdjustment(data: HappyBodyData, today: string) {
  const state = latestCheckIn(data, today)?.bodyState;
  if (state === 'stiff') return recommendationRules.stiffBody;
  if (state === 'tired') return recommendationRules.tiredBody;
  if (state === 'sore') return recommendationRules.soreBody;
  return 0;
}

function practiceAdjustment(data: HappyBodyData, pathwayId: PathwayId, today: string) {
  const last = data.practices
    .filter((entry) => entry.pathwayId === pathwayId && entry.completion !== 'not-today')
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!last) return recommendationRules.neglectedDayCap;
  const days = daysBetween(last.date, today);
  if (days === 0) return recommendationRules.practicedToday;
  if (days === 1) {
    return recommendationRules.practicedYesterday + (last.difficulty === 'challenging' ? recommendationRules.challengingYesterday : 0);
  }
  return Math.min(recommendationRules.neglectedDayCap, days * recommendationRules.eachNeglectedDay);
}

function pathwayCandidate(data: HappyBodyData, pathway: Pathway, today: string): Recommendation | null {
  const state = data.movementStates[pathway.id];
  const scoreBase = 20 + goalWeight(data, pathway) + practiceAdjustment(data, pathway.id, today) + bodyAdjustment(data, today);
  const painFlagged = state?.status === 'pain-flagged' || data.painFlags.some((flag) => flag.active && flag.movementId === pathway.id);

  if (painFlagged) {
    return {
      id: `attention-${pathway.id}`,
      kind: 'attention',
      movementId: pathway.id,
      pathwayId: pathway.id,
      title: `Give ${pathway.name.toLowerCase()} practice space today`,
      reason: 'A pain response is flagged for this movement, so Happy Body will not suggest loading it.',
      detail: 'Choose another comfortable area. Clear the flag only when you are ready to reassess calmly.',
      minutes: 0,
      score: scoreBase + 40,
      exerciseId: null,
      safetyNote: 'Sharp, worsening or unexplained pain deserves assessment from a qualified healthcare professional.',
    };
  }

  if (!state || state.status === 'unknown' || state.currentLevel === null) {
    const firstCheckpoint = pathway.assessment.find((item) => hasEquipment(data, item.equipment));
    if (!firstCheckpoint) {
      return {
        id: `equipment-${pathway.id}`,
        kind: 'attention',
        movementId: pathway.id,
        pathwayId: pathway.id,
        title: `${pathway.name} level is still unknown`,
        reason: `You chose this goal, but the short check needs equipment you have not listed.`,
        detail: pathway.id === 'pull-up' ? 'Add a secure pull-up bar when available, or choose another area today.' : 'Update your equipment in Settings when it becomes available.',
        minutes: 0,
        score: scoreBase + recommendationRules.unknownMovement,
        exerciseId: null,
      };
    }
    return {
      id: `assess-${pathway.id}`,
      kind: 'assess',
      movementId: pathway.id,
      pathwayId: pathway.id,
      title: `Find your ${pathway.name.toLowerCase()} starting point`,
      reason: 'Your level is unknown, so a short check is more useful than a guessed exercise.',
      detail: `Begin with ${firstCheckpoint.title.toLowerCase()}. You can stop or choose “unsure” at any time.`,
      minutes: 4,
      score: scoreBase + recommendationRules.unknownMovement,
      exerciseId: null,
    };
  }

  const currentLevel = pathway.levels[Math.min(state.currentLevel, pathway.levels.length - 1)];
  const item = currentLevel.exercises.find((candidate) => hasEquipment(data, candidate.equipment));
  if (!item) {
    return {
      id: `equipment-${pathway.id}-${state.currentLevel}`,
      kind: 'attention',
      movementId: pathway.id,
      pathwayId: pathway.id,
      title: `${currentLevel.title} needs different equipment`,
      reason: 'The current step is known, but its equipment is not in your list.',
      detail: 'Update Equipment in Settings or open Explore to choose another movement.',
      minutes: 0,
      score: scoreBase + 8,
      exerciseId: null,
    };
  }

  const reassessmentDue = state.status === 'needs-reassessment'
    || Boolean(state.reassessAfter && state.reassessAfter <= today)
    || Boolean(state.assessedAt && daysBetween(state.assessedAt, today) >= 28);
  if (reassessmentDue) {
    return {
      id: `reassess-${pathway.id}`,
      kind: 'reassess',
      movementId: pathway.id,
      pathwayId: pathway.id,
      title: `Revisit your ${pathway.name.toLowerCase()} level`,
      reason: 'Your last check is old enough that a calm reassessment may be more useful than assuming nothing changed.',
      detail: `Your saved step remains ${currentLevel.title} until you choose a new outcome.`,
      minutes: 5,
      score: scoreBase + recommendationRules.reassessmentDue,
      exerciseId: null,
    };
  }

  return {
    id: `practice-${pathway.id}-${item.id}`,
    kind: 'practice',
    movementId: pathway.id,
    pathwayId: pathway.id,
    title: item.title,
    reason: state.status === 'temporarily-limited'
      ? 'This is your known step, but keep today smaller and easier than usual.'
      : `This matches your current ${pathway.name.toLowerCase()} step and your recent practice.`,
    detail: `${item.sets} sets · ${item.reps ?? item.hold} · ${item.durationMinutes} minutes`,
    minutes: item.durationMinutes,
    score: scoreBase + (state.status === 'temporarily-limited' ? recommendationRules.temporarilyLimited : 0),
    exerciseId: item.id,
  };
}

function placeholderCandidate(data: HappyBodyData, goal: GoalId): Recommendation | null {
  const isPrimary = data.profile.primaryGoal === goal;
  const isSecondary = data.profile.secondaryGoals.includes(goal) || data.profile.skillInterests.includes(goal);
  if (!isPrimary && !isSecondary) return null;
  const names: Partial<Record<GoalId, string>> = {
    'front-split': 'Front split',
    'middle-split': 'Middle split',
    handstand: 'Handstand',
    'improve-mobility': 'Mobility',
  };
  return {
    id: `placeholder-${goal}`,
    kind: 'attention',
    movementId: goal,
    pathwayId: null,
    title: `${names[goal] ?? 'This goal'} is on your Body Map`,
    reason: 'Happy Body remembers this goal, but the verified pathway is not ready yet.',
    detail: 'It will stay visible without made-up levels or exercises. You can choose a developed strength pathway today.',
    minutes: 0,
    score: isPrimary ? 90 : 50,
    exerciseId: null,
  };
}

function relevantPathways(data: HappyBodyData) {
  const chosen = new Set<GoalId>([
    ...(data.profile.primaryGoal ? [data.profile.primaryGoal] : []),
    ...data.profile.secondaryGoals,
    ...data.profile.skillInterests,
  ]);
  const matches = pathways.filter((pathway) => pathway.goalIds.some((goal) => chosen.has(goal)));
  return matches.length ? matches : pathways;
}

export function getRecommendations(data: HappyBodyData, today = new Date().toISOString().slice(0, 10)): Recommendation[] {
  const checkIn = latestCheckIn(data, today);
  const minutes = checkIn?.minutes ?? data.profile.defaultMinutes;
  const candidates = [
    ...relevantPathways(data).map((pathway) => pathwayCandidate(data, pathway, today)),
    ...placeholderGoals.map((goal) => placeholderCandidate(data, goal)),
  ].filter((item): item is Recommendation => Boolean(item));

  if (checkIn?.bodyState === 'sore') {
    candidates.push({
      id: 'rest-sore',
      kind: 'rest',
      movementId: 'whole-body',
      pathwayId: null,
      title: 'A gentle day may be useful',
      reason: 'You said your body feels sore today.',
      detail: 'Rest, walk, or choose a very easy familiar movement. You do not need to complete a recommendation.',
      minutes: 0,
      score: 60,
      exerciseId: null,
    });
  }

  const count = minutes < 15 ? 1 : minutes < 30 ? 2 : 3;
  const selected = candidates.sort((a, b) => b.score - a.score).slice(0, count);
  const activeCount = Math.max(1, selected.filter((item) => item.minutes > 0).length);
  const allowance = Math.max(4, Math.floor(minutes / activeCount));
  return selected.map((item) => ({
    ...item,
    minutes: item.minutes ? Math.min(item.minutes, allowance) : 0,
    detail: data.profile.practiceStyle === 'movement-breaks' && item.minutes
      ? `${item.detail}. This can be one of ${data.profile.movementBreaks} short movement breaks.`
      : item.detail,
  }));
}

export function getRecommendationForPathway(data: HappyBodyData, pathwayId: PathwayId, today?: string) {
  return pathwayCandidate(data, pathwayById[pathwayId], today ?? new Date().toISOString().slice(0, 10));
}
