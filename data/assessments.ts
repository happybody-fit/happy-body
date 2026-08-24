import type { EquipmentId, GoalId, PathwayId } from '@/lib/types';

export interface FoundationCheck {
  id: string;
  title: string;
  shortName: string;
  instruction: string;
  why: string;
  equipment: EquipmentId[];
  pathwayId: PathwayId | null;
  shownForGoals?: GoalId[];
}

export const foundationChecks: FoundationCheck[] = [
  {
    id: 'deep-squat',
    title: 'Comfortable deep squat',
    shortName: 'Deep squat',
    instruction: 'With something stable nearby, lower into the deepest squat that feels natural today. You may hold the support. Stay only for one or two calm breaths.',
    why: 'This gives a broad clue about how your ankles, knees and hips work together. It does not diagnose a limitation.',
    equipment: ['chair'],
    pathwayId: null,
  },
  {
    id: 'overhead-reach',
    title: 'Overhead reach',
    shortName: 'Overhead reach',
    instruction: 'Stand or sit tall and slowly reach both arms overhead. Keep breathing and use only the range that feels natural.',
    why: 'This checks your present comfort reaching overhead, which supports many everyday and training movements.',
    equipment: ['none'],
    pathwayId: null,
  },
  {
    id: 'floor-sitting',
    title: 'Floor sitting',
    shortName: 'Floor sitting',
    instruction: 'Sit on the floor in any position you choose. Notice whether you can settle for three calm breaths. Use cushions or hand support if helpful.',
    why: 'Floor comfort combines hip movement, trunk support and confidence close to the ground.',
    equipment: ['none'],
    pathwayId: null,
  },
  {
    id: 'floor-get-up',
    title: 'Getting up from the floor',
    shortName: 'Floor get-up',
    instruction: 'From a comfortable floor-sitting position, stand using any strategy and as much hand support as you need. Keep a chair close if that feels safer.',
    why: 'This is a useful whole-body capability, not a score. Your strategy can change over time.',
    equipment: ['chair'],
    pathwayId: null,
  },
  {
    id: 'goal-push',
    title: 'Gentle pushing check',
    shortName: 'Wall push',
    instruction: 'Try five slow wall push-ups with your body moving as one line.',
    why: 'This gives a starting clue for the Push-up pathway without assuming your level.',
    equipment: ['wall'],
    pathwayId: 'push-up',
    shownForGoals: ['push-up', 'build-strength'],
  },
  {
    id: 'goal-pull',
    title: 'Supported hanging check',
    shortName: 'Supported hang',
    instruction: 'If you have a secure bar, hold it while your feet keep as much weight as needed. Try up to ten calm seconds.',
    why: 'This gives a starting clue for the Pull-up pathway. No bar means the level simply remains unknown.',
    equipment: ['pull-up-bar'],
    pathwayId: 'pull-up',
    shownForGoals: ['pull-up'],
  },
];

export const outcomeOptions = [
  { id: 'comfortable', label: 'Comfortable', hint: 'Steady and natural today' },
  { id: 'limited', label: 'Limited', hint: 'Possible, but range or ease was limited' },
  { id: 'not-yet', label: 'Not yet', hint: 'I could not complete it today' },
  { id: 'unsure', label: 'Unsure', hint: 'I am not confident what happened' },
  { id: 'no-equipment', label: 'No equipment', hint: 'I could not try this safely' },
  { id: 'pain', label: 'Pain', hint: 'Pain appeared during the check' },
] as const;
