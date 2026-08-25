import { getRecommendations } from './recommendations';
import type { BodyState, HappyBodyData, PathwayId, Recommendation, TodaySessionPlan, WarmUpStep } from './types';

const pathwayPreparation: Record<PathwayId, { title: string; instruction: string }> = {
  squat: {
    title: 'Prepare your ankles, knees and hips',
    instruction: 'Try comfortable ankle rocks, gentle hip shifts and a few easy supported or bodyweight squats.',
  },
  'push-up': {
    title: 'Prepare your wrists and shoulders',
    instruction: 'Open and close your hands, make gentle wrist shifts and shoulder circles, then try a few easy wall or incline pushes.',
  },
  'pull-up': {
    title: 'Prepare your shoulders and grip',
    instruction: 'Use shoulder circles and easy shoulder-blade movement, then try a feet-supported hold or a very light hang if you have a secure bar.',
  },
};

const arrivalInstruction: Record<BodyState, string> = {
  fresh: 'Walk or march easily, breathe naturally and let your joints begin moving through a comfortable range.',
  steady: 'Walk or march easily, breathe naturally and let your whole body begin moving.',
  stiff: 'Begin gently with easy walking or marching and small, comfortable movements. Let your range open gradually.',
  tired: 'Start slowly with relaxed walking or marching. Keep the pace easy enough that your breathing stays calm.',
  sore: 'Move very gently and stay with a comfortable range. Stop if soreness feels sharp, worsening or unusual.',
};

function warmUpMinutesFor(availableMinutes: number) {
  if (availableMinutes <= 5) return 1;
  if (availableMinutes <= 10) return 2;
  if (availableMinutes <= 20) return 4;
  if (availableMinutes <= 30) return 5;
  if (availableMinutes <= 45) return 7;
  return 8;
}

function finishMinutesFor(availableMinutes: number) {
  if (availableMinutes <= 10) return 1;
  if (availableMinutes <= 20) return 2;
  if (availableMinutes <= 30) return 3;
  if (availableMinutes <= 45) return 4;
  return 5;
}

const maximumPracticeBlockMinutes = 18;

function allocateSessionMinutes(recommendations: Recommendation[], budget: number) {
  const active = recommendations.filter((item) => item.minutes > 0);
  let remaining = budget;
  let activeIndex = 0;

  const adjusted = recommendations.map((item) => {
    if (!item.minutes) return item;
    const itemsLeft = active.length - activeIndex;
    const fairShare = Math.ceil(remaining / itemsLeft);
    const minutes = Math.max(1, Math.min(item.minutes, fairShare, remaining));
    remaining -= minutes;
    activeIndex += 1;
    return { ...item, minutes };
  });

  remaining = budget - adjusted.reduce((total, item) => total + item.minutes, 0);
  const expandable = adjusted.filter((item) => item.kind === 'practice' && item.minutes > 0);

  while (remaining > 0 && expandable.some((item) => item.minutes < maximumPracticeBlockMinutes)) {
    for (const item of expandable) {
      if (!remaining) break;
      if (item.minutes >= maximumPracticeBlockMinutes) continue;
      item.minutes += 1;
      remaining -= 1;
    }
  }

  return adjusted.map((item) => {
    const original = recommendations.find((candidate) => candidate.id === item.id);
    if (!original || item.kind !== 'practice' || item.minutes <= original.minutes) return item;
    return { ...item, detail: `${item.detail} · unhurried setup and full rest included` };
  });
}

function splitMinutes(total: number, count: number) {
  const base = Math.floor(total / count);
  const remainder = total % count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

function buildWarmUpSteps(bodyState: BodyState, pathways: PathwayId[], minutes: number): WarmUpStep[] {
  if (!minutes) return [];
  if (minutes === 1) {
    return [{
      id: 'prepare-briefly',
      title: 'Begin gently',
      instruction: `${arrivalInstruction[bodyState]} Rehearse the first movement with less range or support before you begin.`,
      minutes: 1,
    }];
  }

  const movementStepCount = Math.min(pathways.length, minutes - 1);
  const durations = splitMinutes(minutes, movementStepCount + 1);
  const steps: WarmUpStep[] = [{
    id: 'prepare-whole-body',
    title: 'Start moving gently',
    instruction: arrivalInstruction[bodyState],
    minutes: durations[0],
  }];

  pathways.slice(0, movementStepCount).forEach((pathwayId, index) => {
    steps.push({
      id: `prepare-${pathwayId}`,
      ...pathwayPreparation[pathwayId],
      minutes: durations[index + 1],
    });
  });

  return steps;
}

export function getTodaySessionPlan(data: HappyBodyData, today = new Date().toISOString().slice(0, 10)): TodaySessionPlan {
  const recommendations = getRecommendations(data, today);
  const availableMinutes = data.dailyCheckIns.find((item) => item.date === today)?.minutes ?? data.profile.defaultMinutes;
  const activeRecommendations = recommendations.filter((item) => item.minutes > 0);

  if (!activeRecommendations.length) {
    return {
      availableMinutes,
      totalMinutes: 0,
      warmUpMinutes: 0,
      practiceMinutes: 0,
      finishMinutes: 0,
      recommendations,
      warmUpSteps: [],
    };
  }

  const warmUpMinutes = warmUpMinutesFor(availableMinutes);
  const finishMinutes = finishMinutesFor(availableMinutes);
  const availableForPractice = Math.max(1, availableMinutes - warmUpMinutes - finishMinutes);
  const adjustedRecommendations = allocateSessionMinutes(recommendations, availableForPractice);
  const practiceMinutes = adjustedRecommendations.reduce((total, item) => total + item.minutes, 0);
  const activePathways = [...new Set(activeRecommendations.map((item) => item.pathwayId).filter((item): item is PathwayId => Boolean(item)))];

  return {
    availableMinutes,
    totalMinutes: warmUpMinutes + practiceMinutes + finishMinutes,
    warmUpMinutes,
    practiceMinutes,
    finishMinutes,
    recommendations: adjustedRecommendations,
    warmUpSteps: buildWarmUpSteps(data.dailyCheckIns.find((item) => item.date === today)?.bodyState ?? 'steady', activePathways, warmUpMinutes),
  };
}
