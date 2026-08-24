import test from 'node:test';
import assert from 'node:assert/strict';
import { getRecommendations } from '@/lib/recommendations';
import { createDefaultData, migrateLegacyProgress } from '@/lib/storage';
import type { LegacyUserProgress } from '@/lib/types';

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

test('undeveloped goals remain visible without invented exercises', () => {
  const data = readyData();
  data.profile.primaryGoal = 'front-split';
  const recommendation = getRecommendations(data, '2026-08-24')[0];
  assert.equal(recommendation.movementId, 'front-split');
  assert.equal(recommendation.kind, 'attention');
  assert.equal(recommendation.exerciseId, null);
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
