import { pathwayById, pathways } from '@/data/pathways';
import type { DailyCheckIn, GoalId, HappyBodyData, Pathway, PathwayId, Recommendation } from './types';

export const recommendationRules = {
  primaryGoal: 35,
  exactPrimaryPathway: 16,
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

const placeholderGoals: GoalId[] = ['handstand-walk'];

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
  if (data.profile.primaryGoal === pathway.primaryGoal) score += recommendationRules.exactPrimaryPathway;
  data.profile.secondaryGoals.forEach((goal) => {
    if (relevantGoals.has(goal)) score += recommendationRules.secondaryGoal;
  });
  data.profile.skillInterests.forEach((goal) => {
    if (relevantGoals.has(goal)) score += recommendationRules.skillInterest;
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

function practiceReason(data: HappyBodyData, pathway: Pathway, today: string, temporarilyLimited: boolean) {
  if (temporarilyLimited) return 'We know this step, but we’re keeping it smaller and easier than usual today.';
  const last = data.practices
    .filter((entry) => entry.pathwayId === pathway.id && entry.completion !== 'not-today')
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const chosenGoals = [
    ...(data.profile.primaryGoal ? [data.profile.primaryGoal] : []),
    ...data.profile.secondaryGoals,
    ...data.profile.skillInterests,
  ];
  const supportsChosenGoal = chosenGoals.some((goal) => pathway.goalIds.includes(goal));
  if (!last) {
    return supportsChosenGoal
      ? `This supports a goal you chose through the ${pathway.name.toLowerCase()} step we already know.`
      : `This keeps ${pathway.focusLabel} in your whole-body practice at a level we already know.`;
  }
  const days = daysBetween(last.date, today);
  if (days >= 2) return `It has been ${days} days since you practised this area, so we’ve brought it back today.`;
  if (days === 1 && last.difficulty === 'challenging') return 'Your last practice here felt challenging, so we’re staying with your familiar current step.';
  if (days === 1) return 'You practised this yesterday, so today’s suggestion stays familiar and controlled.';
  return 'You have already practised this today, so treat this as optional rather than something to complete again.';
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
      reason: 'A pain response is flagged for this movement, so we will not suggest loading it.',
      detail: 'Choose another comfortable area. Clear the flag only when you are ready to reassess calmly.',
      minutes: 0,
      score: scoreBase + 40,
      exerciseId: null,
      safetyNote: 'Sharp, worsening or unexplained pain deserves assessment from a qualified healthcare professional.',
    };
  }

  if (!state || state.status === 'unknown' || state.currentLevel === null) {
    const firstCheckpoint = pathway.assessment[0];
    if (!firstCheckpoint || !hasEquipment(data, firstCheckpoint.equipment)) {
      return {
        id: `equipment-${pathway.id}`,
        kind: 'attention',
        movementId: pathway.id,
        pathwayId: pathway.id,
        title: `${pathway.name} level is still unknown`,
        reason: 'We cannot check this area yet because the short check needs equipment you have not listed.',
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
      reason: `We do not know your current ${pathway.name.toLowerCase()} level yet, so a short check will help us suggest something that fits instead of guessing.`,
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
      reason: 'We know your current step, but the equipment it needs is not in your list.',
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
      reason: state.assessedAt
        ? `Your last check was ${daysBetween(state.assessedAt, today)} days ago, so it may be useful to see what has changed.`
        : 'Your saved level could use a calm reassessment before we change your next step.',
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
    reason: practiceReason(data, pathway, today, state.status === 'temporarily-limited'),
    detail: `${item.sets} sets · ${item.reps ?? item.hold}`,
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
    handstand: 'Handstand',
    'handstand-walk': 'Handstand walking',
  };
  return {
    id: `placeholder-${goal}`,
    kind: 'attention',
    movementId: goal,
    pathwayId: null,
    title: `${names[goal] ?? 'This goal'} is on your Body Map`,
    reason: 'We remember this goal, but its verified pathway is not ready yet.',
    detail: 'It will stay visible without made-up levels or exercises while its dedicated pathway is developed.',
    minutes: 0,
    score: isPrimary ? 90 : 50,
    exerciseId: null,
  };
}

function recommendationCount(minutes: number) {
  if (minutes < 15) return 1;
  if (minutes < 30) return 2;
  if (minutes < 45) return 3;
  if (minutes < 60) return 4;
  return 6;
}

function selectBalancedPractice(candidates: Recommendation[], count: number) {
  const remaining = [...candidates];
  const selected: Recommendation[] = [];
  const categories = new Set<Pathway['category']>();
  const focuses = new Set<Pathway['focus']>();

  while (selected.length < count && remaining.length) {
    remaining.sort((a, b) => {
      const pathA = a.pathwayId ? pathwayById[a.pathwayId] : null;
      const pathB = b.pathwayId ? pathwayById[b.pathwayId] : null;
      const adjustedA = a.score + (pathA && !categories.has(pathA.category) ? 12 : 0) + (pathA && !focuses.has(pathA.focus) ? 7 : 0);
      const adjustedB = b.score + (pathB && !categories.has(pathB.category) ? 12 : 0) + (pathB && !focuses.has(pathB.focus) ? 7 : 0);
      return adjustedB - adjustedA;
    });
    const next = remaining.shift()!;
    selected.push(next);
    if (next.pathwayId) {
      categories.add(pathwayById[next.pathwayId].category);
      focuses.add(pathwayById[next.pathwayId].focus);
    }
  }

  return selected;
}

export function getRecommendations(data: HappyBodyData, today = new Date().toISOString().slice(0, 10)): Recommendation[] {
  const checkIn = latestCheckIn(data, today);
  const minutes = checkIn?.minutes ?? data.profile.defaultMinutes;
  const candidates = [
    ...pathways.map((pathway) => pathwayCandidate(data, pathway, today)),
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

  const count = recommendationCount(minutes);
  const rest = candidates.find((item) => item.kind === 'rest');
  const practiceCandidates = candidates.filter((item) => item.kind === 'practice');
  const selected = rest
    ? [rest, ...selectBalancedPractice(practiceCandidates, count - 1)]
    : selectBalancedPractice(practiceCandidates, count);
  if (selected.length < count) {
    const chosen = new Set(selected.map((item) => item.id));
    candidates
      .filter((item) => !chosen.has(item.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, count - selected.length)
      .forEach((item) => selected.push(item));
  }
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
