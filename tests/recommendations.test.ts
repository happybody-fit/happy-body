import test from 'node:test';
import assert from 'node:assert/strict';
import { getRecommendations } from '@/lib/recommendations';
import { getTodaySessionPlan } from '@/lib/session-plan';
import { createDefaultData, migrateLegacyProgress, parseImportedData } from '@/lib/storage';
import { pathways } from '@/data/pathways';
import type { LegacyUserProgress, PathwayId } from '@/lib/types';

function readyData() {
  const data = createDefaultData('2026-08-24T08:00:00.000Z');
  data.profile.onboardingCompleted = true;
  data.profile.primaryGoal = 'build-strength';
  data.profile.equipment = ['none', 'wall', 'chair', 'box-bench', 'pull-up-bar', 'resistance-band'];
  return data;
}

test('unknown pathways produce an assessment, never a guessed beginner practice', () => {
  const data = readyData();
  data.profile.primaryGoal = 'push-up';
  const recommendation = getRecommendations(data, '2026-08-24')[0];
  assert.equal(recommendation.pathwayId, 'push-up');
  assert.equal(recommendation.kind, 'assess');
  assert.equal(recommendation.exerciseId, null);
  assert.equal(data.movementStates['push-up'].currentLevel, null);
});

test('missing pull-up equipment keeps the level unknown and filters practice', () => {
  const data = readyData();
  data.profile.primaryGoal = 'pull-up';
  data.profile.equipment = ['none'];
  const recommendations = getRecommendations(data, '2026-08-24');
  assert.equal(recommendations[0].pathwayId, 'pull-up');
  assert.equal(recommendations[0].kind, 'attention');
  assert.match(recommendations[0].reason, /equipment/i);
  assert.ok(!recommendations.some((item) => item.pathwayId === 'pull-up' && item.kind === 'practice'));
});

test('pain flags suppress loading recommendations for that movement', () => {
  const data = readyData();
  data.profile.primaryGoal = 'push-up';
  data.movementStates['push-up'] = { movementId: 'push-up', status: 'pain-flagged', outcome: 'pain', currentLevel: 3, assessedAt: '2026-08-23', reassessAfter: null, note: '' };
  const recommendations = getRecommendations(data, '2026-08-24');
  const push = recommendations.find((item) => item.pathwayId === 'push-up');
  assert.equal(push?.kind, 'attention');
  assert.ok(!recommendations.some((item) => item.pathwayId === 'push-up' && item.kind === 'practice'));
});

test('challenging practice yesterday lowers that pathway below a neglected peer', () => {
  const data = readyData();
  data.profile.defaultMinutes = 30;
  data.movementStates.squat = { movementId: 'squat', status: 'in-progress', outcome: 'comfortable', currentLevel: 3, assessedAt: '2026-08-20', reassessAfter: '2026-09-20', note: '' };
  data.movementStates['push-up'] = { movementId: 'push-up', status: 'in-progress', outcome: 'comfortable', currentLevel: 1, assessedAt: '2026-08-20', reassessAfter: '2026-09-20', note: '' };
  data.practices.push({ id: 'recent', date: '2026-08-23', pathwayId: 'push-up', movementId: 'push-up', exerciseId: 'high-incline-push-up', exerciseTitle: 'High incline push-up', completion: 'yes', difficulty: 'challenging', bodyAfter: 'tired', sets: 3, amount: 8, metric: 'reps', bodyDuring: '', notes: '', videoUrl: '', source: 'recommendation' });
  const recommendations = getRecommendations(data, '2026-08-24');
  const squatIndex = recommendations.findIndex((item) => item.pathwayId === 'squat');
  const pushIndex = recommendations.findIndex((item) => item.pathwayId === 'push-up');
  assert.ok(squatIndex !== -1 && pushIndex !== -1 && squatIndex < pushIndex);
});

test('available time limits the number of suggestions', () => {
  const data = readyData();
  data.profile.defaultMinutes = 5;
  assert.equal(getRecommendations(data, '2026-08-24').length, 1);
  data.profile.defaultMinutes = 30;
  assert.equal(getRecommendations(data, '2026-08-24').length, 3);
});

test('a 30-minute workout includes preparation, practice and a finish within the chosen time', () => {
  const data = readyData();
  data.profile.defaultMinutes = 30;
  (['squat', 'push-up', 'pull-up'] as const).forEach((pathwayId) => {
    data.movementStates[pathwayId] = { movementId: pathwayId, status: 'in-progress', outcome: 'comfortable', currentLevel: 1, assessedAt: '2026-08-24', reassessAfter: '2026-09-24', note: '' };
  });

  const session = getTodaySessionPlan(data, '2026-08-24');
  assert.equal(session.availableMinutes, 30);
  assert.equal(session.totalMinutes, 30);
  assert.equal(session.warmUpMinutes, 5);
  assert.equal(session.practiceMinutes, 22);
  assert.equal(session.finishMinutes, 3);
  assert.equal(session.recommendations.reduce((total, item) => total + item.minutes, 0), 22);
  assert.equal(session.warmUpSteps.reduce((total, item) => total + item.minutes, 0), 5);
});

test('known movement sessions use every selected time option without inflating a practice block excessively', () => {
  const data = readyData();
  (['squat', 'push-up', 'pull-up'] as const).forEach((pathwayId) => {
    data.movementStates[pathwayId] = { movementId: pathwayId, status: 'in-progress', outcome: 'comfortable', currentLevel: 1, assessedAt: '2026-08-24', reassessAfter: '2026-09-24', note: '' };
  });

  [5, 10, 20, 30, 45, 60].forEach((minutes) => {
    data.profile.defaultMinutes = minutes;
    const session = getTodaySessionPlan(data, '2026-08-24');
    assert.equal(session.totalMinutes, minutes);
    assert.equal(session.recommendations.reduce((total, item) => total + item.minutes, 0), session.practiceMinutes);
    assert.ok(session.recommendations.every((item) => item.kind !== 'practice' || item.minutes <= 18));
  });
});

test('a 60-minute session uses six known pathways across strength and mobility', () => {
  const data = readyData();
  data.profile.defaultMinutes = 60;
  (['squat', 'hip-hinge', 'core', 'push-up', 'pike', 'rotation'] as const).forEach((pathwayId) => {
    data.movementStates[pathwayId] = { movementId: pathwayId, status: 'in-progress', outcome: 'comfortable', currentLevel: 1, assessedAt: '2026-08-24', reassessAfter: '2026-09-24', note: '' };
  });

  const session = getTodaySessionPlan(data, '2026-08-24');
  assert.equal(session.warmUpMinutes, 8);
  assert.equal(session.practiceMinutes, 47);
  assert.equal(session.finishMinutes, 5);
  assert.equal(session.totalMinutes, 60);
  assert.equal(session.recommendations.length, 6);
  assert.ok(session.recommendations.every((item) => item.kind === 'practice'));
  const categories = new Set(session.recommendations.map((item) => pathways.find((pathway) => pathway.id === item.pathwayId)?.category));
  assert.deepEqual(categories, new Set(['Strength', 'Mobility']));
  assert.equal(session.recommendations.reduce((total, item) => total + item.minutes, 0), 47);
});

test('warm-up preparation reflects the movements in the session', () => {
  const data = readyData();
  data.profile.primaryGoal = 'push-up';
  data.profile.defaultMinutes = 20;
  data.movementStates.squat = { movementId: 'squat', status: 'in-progress', outcome: 'comfortable', currentLevel: 1, assessedAt: '2026-08-24', reassessAfter: '2026-09-24', note: '' };
  data.movementStates['push-up'] = { movementId: 'push-up', status: 'in-progress', outcome: 'comfortable', currentLevel: 1, assessedAt: '2026-08-24', reassessAfter: '2026-09-24', note: '' };

  const session = getTodaySessionPlan(data, '2026-08-24');
  const activePathways = session.recommendations.filter((item) => item.minutes > 0 && item.pathwayId).map((item) => item.pathwayId);
  activePathways.forEach((pathwayId) => assert.ok(session.warmUpSteps.some((step) => step.id === `prepare-${pathwayId}`)));
  assert.ok(session.totalMinutes <= session.availableMinutes);
});

test('a broad comfort goal still produces a whole-body set of useful steps', () => {
  const data = readyData();
  data.profile.primaryGoal = 'move-comfortably';
  data.profile.defaultMinutes = 30;
  const recommendations = getRecommendations(data, '2026-08-24');
  assert.equal(recommendations.length, 3);
  assert.equal(new Set(recommendations.map((item) => item.pathwayId)).size, 3);
});

test('newly added goals begin with an honest level check, not a guessed exercise', () => {
  const data = readyData();
  data.profile.primaryGoal = 'front-split';
  const recommendation = getRecommendations(data, '2026-08-24')[0];
  assert.equal(recommendation.movementId, 'front-split');
  assert.equal(recommendation.kind, 'assess');
  assert.equal(recommendation.exerciseId, null);
});

test('the whole-body map contains eight strength and eight mobility pathways', () => {
  assert.equal(pathways.length, 16);
  assert.equal(pathways.filter((pathway) => pathway.category === 'Strength').length, 8);
  assert.equal(pathways.filter((pathway) => pathway.category === 'Mobility').length, 8);
  assert.equal(new Set(pathways.map((pathway) => pathway.id)).size, 16);
  pathways.forEach((pathway) => {
    assert.ok(pathway.levels.length >= 5, `${pathway.name} should have a useful first-pass ladder`);
    assert.ok(pathway.assessment.length >= 3, `${pathway.name} should have starting-level checks`);
    assert.ok(pathway.levels.every((level) => level.exercises.length > 0));
    const exerciseIds = pathway.levels.flatMap((level) => level.exercises.map((exercise) => exercise.id));
    assert.equal(new Set(exerciseIds).size, exerciseIds.length, `${pathway.name} exercise ids should be unique`);
    pathway.levels.flatMap((level) => level.exercises).forEach((exercise) => {
      exercise.alternatives.forEach((alternative) => assert.ok(exerciseIds.includes(alternative), `${exercise.title} should reference a real alternative`));
    });
  });
});

test('new data begins without inventing a current level for any pathway', () => {
  const data = createDefaultData('2026-08-24T08:00:00.000Z');
  assert.ok(pathways.every((pathway) => pathway.id in data.movementStates));
  pathways.forEach((pathway) => {
    assert.equal(data.movementStates[pathway.id].currentLevel, null);
    assert.equal(data.movementStates[pathway.id].status, 'unknown');
  });
});

test('every pathway can generate a safe assessment invitation when its level is unknown', () => {
  pathways.forEach((pathway) => {
    const data = readyData();
    data.profile.primaryGoal = pathway.primaryGoal;
    data.profile.defaultMinutes = 5;
    const recommendation = getRecommendations(data, '2026-08-24')[0];
    assert.equal(recommendation.pathwayId, pathway.id);
    assert.ok(['assess', 'attention'].includes(recommendation.kind));
    assert.equal(recommendation.exerciseId, null);
  });
});

test('an unavailable starting setup never skips straight to a harder checkpoint', () => {
  const data = readyData();
  data.profile.primaryGoal = 'resting-squat';
  data.profile.equipment = ['none'];
  data.profile.defaultMinutes = 5;
  const recommendation = getRecommendations(data, '2026-08-24')[0];
  assert.equal(recommendation.pathwayId, 'resting-squat');
  assert.equal(recommendation.kind, 'attention');
  assert.equal(recommendation.exerciseId, null);
});

test('existing foundation results carry into their newly completed pathways', () => {
  const previous = createDefaultData('2026-08-24T08:00:00.000Z');
  previous.movementStates['hip-extension'] = { movementId: 'hip-extension', status: 'assessed', outcome: 'comfortable', currentLevel: 1, assessedAt: '2026-08-24', reassessAfter: '2026-09-24', note: '' };
  previous.movementStates['core-control'] = { movementId: 'core-control', status: 'assessed', outcome: 'comfortable', currentLevel: 2, assessedAt: '2026-08-24', reassessAfter: '2026-09-24', note: '' };
  previous.movementStates['pike-forward-fold'] = { movementId: 'pike-forward-fold', status: 'assessed', outcome: 'comfortable', currentLevel: 1, assessedAt: '2026-08-24', reassessAfter: '2026-09-24', note: '' };

  const normalized = parseImportedData(JSON.stringify(previous));
  assert.equal(normalized.movementStates['hip-hinge'].currentLevel, 1);
  assert.equal(normalized.movementStates.core.currentLevel, 2);
  assert.equal(normalized.movementStates.pike.currentLevel, 2);
});

test('a known state can be represented for all sixteen pathway ids', () => {
  const data = readyData();
  pathways.forEach((pathway) => {
    const pathwayId: PathwayId = pathway.id;
    data.movementStates[pathwayId] = { movementId: pathwayId, status: 'in-progress', outcome: 'comfortable', currentLevel: 0, assessedAt: '2026-08-24', reassessAfter: '2026-09-24', note: '' };
  });
  assert.equal(Object.values(data.movementStates).filter((state) => state.currentLevel === 0).length, 16);
});

test('the untouched legacy prototype defaults migrate to a fresh honest Body Map', () => {
  const legacy: LegacyUserProgress = { selectedGoals: ['squat', 'push-up', 'pull-up'], currentLevels: { squat: 0, 'push-up': 1, 'pull-up': 1 }, practices: [], assessments: [], milestones: [] };
  const migrated = migrateLegacyProgress(legacy, '2026-08-24T08:00:00.000Z');
  assert.equal(migrated.profile.onboardingCompleted, false);
  assert.equal(migrated.profile.primaryGoal, null);
  assert.equal(migrated.movementStates.squat.currentLevel, null);
});

test('meaningful legacy practices and assessments are preserved in version 2', () => {
  const legacy: LegacyUserProgress = {
    selectedGoals: ['push-up'], currentLevels: { squat: 0, 'push-up': 2, 'pull-up': 1 }, milestones: ['Push-up: Floor push-up'],
    practices: [{ id: 'old-practice', date: '2026-08-20', pathwayId: 'push-up', exerciseId: 'floor-push-up', exerciseTitle: 'Floor push-up', sets: 3, amount: 5, metric: 'reps', difficulty: 4, bodyDuring: 'Steady', bodyAfter: 'Good', notes: 'Best so far', videoUrl: '' }],
    assessments: [{ id: 'old-assessment', date: '2026-08-19', pathwayId: 'push-up', levelIndex: 2, levelTitle: 'Floor push-up' }],
  };
  const migrated = migrateLegacyProgress(legacy, '2026-08-24T08:00:00.000Z');
  assert.equal(migrated.version, 2);
  assert.equal(migrated.profile.onboardingCompleted, true);
  assert.equal(migrated.practices[0].id, 'old-practice');
  assert.equal(migrated.assessments[0].id, 'old-assessment');
  assert.equal(migrated.movementStates['push-up'].currentLevel, 5);
  assert.deepEqual(migrated.milestones, ['Push-up: Floor push-up']);
});
