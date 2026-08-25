import type { EquipmentId, GoalId } from '@/lib/types';

type GoalOption = { id: GoalId; label: string; description: string; group: 'foundation' | 'skill' | 'legacy' };

export type SkillFamilyId = 'pulling' | 'pushing' | 'leg-strength' | 'core-strength' | 'hand-balance' | 'mobility';

export interface SkillFamily {
  id: SkillFamilyId;
  label: string;
  description: string;
  range: string;
  symbol: string;
  goalIds: GoalId[];
}

export const goalOptions: GoalOption[] = [
  { id: 'move-comfortably', label: 'Move with more ease', description: 'Feel more comfortable and less restricted in everyday movement.', group: 'foundation' },
  { id: 'build-strength', label: 'Build useful strength', description: 'Feel stronger and more capable for daily life.', group: 'foundation' },
  { id: 'improve-mobility', label: 'Improve mobility', description: 'Develop greater flexibility, range and control.', group: 'foundation' },
  { id: 'natural-movement', label: 'Move naturally', description: 'Sit, reach, get up and move close to the ground with confidence.', group: 'legacy' },
  { id: 'pull-up', label: 'Pull-up', description: 'Build from supported hangs towards a strong, controlled pull-up.', group: 'skill' },
  { id: 'bodyweight-row', label: 'Bodyweight row', description: 'Develop horizontal pulling strength through increasingly challenging rows.', group: 'skill' },
  { id: 'front-lever', label: 'Front lever', description: 'Work towards holding your body horizontal beneath a bar.', group: 'skill' },
  { id: 'one-arm-pull-up', label: 'One-arm pull-up', description: 'Build exceptional single-arm pulling strength.', group: 'skill' },
  { id: 'push-up', label: 'Push-up', description: 'Build from the wall towards a strong floor push-up.', group: 'skill' },
  { id: 'handstand-push-up', label: 'Handstand push-up', description: 'Develop vertical pushing strength from pike work to an inverted press.', group: 'skill' },
  { id: 'planche', label: 'Planche', description: 'Build towards supporting your body with straight arms and control.', group: 'skill' },
  { id: 'pistol-squat', label: 'Pistol squat', description: 'Develop controlled single-leg squat strength.', group: 'skill' },
  { id: 'nordic-curl', label: 'Nordic curl', description: 'Develop strong, controlled knee flexion.', group: 'skill' },
  { id: 'hip-extension-hinge', label: 'Hip extension & hinge', description: 'Build strength for bending, lifting and extending through the hips.', group: 'skill' },
  { id: 'core-control', label: 'Core control', description: 'Build a strong, connected centre for whole-body movement.', group: 'skill' },
  { id: 'dragon-flag', label: 'Dragon flag', description: 'Work towards advanced whole-body core control.', group: 'skill' },
  { id: 'wall-handstand', label: 'Wall-supported handstand', description: 'Become comfortable and organised while upside down.', group: 'skill' },
  { id: 'handstand', label: 'Freestanding handstand', description: 'Develop balance and confidence away from the wall.', group: 'skill' },
  { id: 'handstand-walk', label: 'Handstand walk', description: 'Build controlled movement while balanced on your hands.', group: 'skill' },
  { id: 'resting-squat', label: 'Resting squat', description: 'Work towards resting comfortably in a deep squat.', group: 'skill' },
  { id: 'pike', label: 'Pike / forward fold', description: 'Develop a comfortable, controlled fold through the hips.', group: 'skill' },
  { id: 'pancake', label: 'Pancake', description: 'Build wide-leg forward-fold mobility with control.', group: 'skill' },
  { id: 'front-split', label: 'Front split', description: 'Work towards a comfortable front split.', group: 'skill' },
  { id: 'middle-split', label: 'Middle split', description: 'Explore wider hip mobility towards a middle split.', group: 'skill' },
  { id: 'bridge', label: 'Bridge', description: 'Develop a strong, open arch through the whole body.', group: 'skill' },
  { id: 'german-hang', label: 'German hang', description: 'Gradually develop shoulder extension with appropriate preparation.', group: 'skill' },
  { id: 'rotation', label: 'Whole-body rotation', description: 'Develop comfortable, controlled turning through the body.', group: 'skill' },
];

export const goalById = Object.fromEntries(goalOptions.map((goal) => [goal.id, goal])) as Record<GoalId, (typeof goalOptions)[number]>;

export const skillFamilies: SkillFamily[] = [
  {
    id: 'pulling',
    label: 'Pulling',
    description: 'Build strength for pulling yourself and holding strong shapes.',
    range: 'From your first pull-up to front lever and one-arm strength.',
    symbol: '↟',
    goalIds: ['pull-up', 'bodyweight-row', 'front-lever', 'one-arm-pull-up'],
  },
  {
    id: 'pushing',
    label: 'Pushing',
    description: 'Develop confident pushing strength in different directions.',
    range: 'From wall push-ups to handstand push-ups and planche.',
    symbol: '↗',
    goalIds: ['push-up', 'handstand-push-up', 'planche'],
  },
  {
    id: 'leg-strength',
    label: 'Leg strength',
    description: 'Build strong, capable legs through their full range.',
    range: 'From supported strength to pistols, Nordics and strong hinges.',
    symbol: '⌁',
    goalIds: ['pistol-squat', 'nordic-curl', 'hip-extension-hinge'],
  },
  {
    id: 'core-strength',
    label: 'Core strength',
    description: 'Create a strong centre that connects your whole body.',
    range: 'From foundational control to the dragon flag.',
    symbol: '◎',
    goalIds: ['core-control', 'dragon-flag'],
  },
  {
    id: 'hand-balance',
    label: 'Hand balance',
    description: 'Become comfortable, balanced and expressive upside down.',
    range: 'From wall support to freestanding balance and walking.',
    symbol: '◇',
    goalIds: ['wall-handstand', 'handstand', 'handstand-walk'],
  },
  {
    id: 'mobility',
    label: 'Mobility',
    description: 'Develop useful range, ease and control throughout your body.',
    range: 'From a resting squat and pike to splits, bridge and beyond.',
    symbol: '∿',
    goalIds: ['resting-squat', 'pike', 'pancake', 'front-split', 'middle-split', 'bridge', 'german-hang', 'rotation'],
  },
];

export const bodyAreaOptions = ['Shoulders', 'Elbows', 'Wrists or hands', 'Back', 'Hips', 'Knees', 'Ankles or feet'];

export const equipmentOptions: Array<{ id: EquipmentId; label: string }> = [
  { id: 'none', label: 'No equipment' },
  { id: 'chair', label: 'Chair or sturdy support' },
  { id: 'wall', label: 'Clear wall' },
  { id: 'box-bench', label: 'Bench, box or counter' },
  { id: 'resistance-band', label: 'Resistance band' },
  { id: 'pull-up-bar', label: 'Pull-up bar' },
  { id: 'rings', label: 'Gymnastic rings' },
  { id: 'secure-anchor', label: 'Secure foot anchor or training partner' },
];
