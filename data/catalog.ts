import type { EquipmentId, GoalId } from '@/lib/types';

export const goalOptions: Array<{ id: GoalId; label: string; description: string; group: 'foundation' | 'skill' }> = [
  { id: 'move-comfortably', label: 'Move more comfortably', description: 'Make everyday positions and transitions feel easier.', group: 'foundation' },
  { id: 'build-strength', label: 'Build useful strength', description: 'Feel capable in pushing, pulling, squatting and carrying yourself.', group: 'foundation' },
  { id: 'improve-mobility', label: 'Improve mobility', description: 'Explore more range with control and calm.', group: 'foundation' },
  { id: 'natural-movement', label: 'Move naturally', description: 'Sit, reach, get up and move close to the ground with confidence.', group: 'foundation' },
  { id: 'push-up', label: 'Push-up', description: 'Build from the wall towards a strong floor push-up.', group: 'skill' },
  { id: 'pull-up', label: 'Pull-up', description: 'Build grip and pulling strength towards a full pull-up.', group: 'skill' },
  { id: 'pistol-squat', label: 'Pistol squat', description: 'Develop controlled single-leg squat strength.', group: 'skill' },
  { id: 'handstand', label: 'Handstand', description: 'Keep this future skill visible without inventing a pathway yet.', group: 'skill' },
  { id: 'front-split', label: 'Front split', description: 'Keep this mobility intention visible while content is developed.', group: 'skill' },
  { id: 'middle-split', label: 'Middle split', description: 'Keep this mobility intention visible while content is developed.', group: 'skill' },
];

export const goalById = Object.fromEntries(goalOptions.map((goal) => [goal.id, goal])) as Record<GoalId, (typeof goalOptions)[number]>;

export const limitationOptions = ['Shoulders', 'Wrists', 'Back', 'Hips', 'Knees', 'Ankles', 'Balance', 'Low energy'];

export const equipmentOptions: Array<{ id: EquipmentId; label: string }> = [
  { id: 'none', label: 'No equipment' },
  { id: 'chair', label: 'Chair or sturdy support' },
  { id: 'wall', label: 'Clear wall' },
  { id: 'box-bench', label: 'Bench, box or counter' },
  { id: 'resistance-band', label: 'Resistance band' },
  { id: 'pull-up-bar', label: 'Pull-up bar' },
  { id: 'rings', label: 'Gymnastic rings' },
];
