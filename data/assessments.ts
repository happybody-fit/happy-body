import type { EquipmentId, PathwayId } from '@/lib/types';

export type FoundationArea = 'lower-body' | 'core' | 'upper-body';
export type AssessmentCalibration = 'gentle' | 'some-basics' | 'regular-training' | 'unsure';

export const foundationAreas: Array<{ id: FoundationArea; label: string }> = [
  { id: 'lower-body', label: 'Lower body' },
  { id: 'core', label: 'Core' },
  { id: 'upper-body', label: 'Upper body' },
];

export const calibrationOptions: Array<{ id: AssessmentCalibration; label: string; description: string }> = [
  { id: 'gentle', label: 'I’m just getting started', description: 'Begin with the most accessible checks and build from there.' },
  { id: 'some-basics', label: 'I’m comfortable with some basics', description: 'Begin around familiar bodyweight movements.' },
  { id: 'regular-training', label: 'I already train regularly', description: 'Begin with stronger variations and adjust from there.' },
  { id: 'unsure', label: 'I’m not sure', description: 'Begin near the middle and help me find the right direction.' },
];

export interface FoundationCheck {
  id: string;
  movementId?: string;
  title: string;
  shortName: string;
  instruction: string;
  why: string;
  area: FoundationArea;
  equipment: EquipmentId[];
  pathwayId: PathwayId | null;
  levelIndex: number;
  showInBodyMap?: boolean;
}

export interface InitialAssessmentLadder {
  id: string;
  label: string;
  area: FoundationArea;
  shownWhenEquipment?: EquipmentId[];
  entryByCalibration: Record<AssessmentCalibration, number>;
  checks: FoundationCheck[];
}

export const initialAssessmentLadders: InitialAssessmentLadder[] = [
  {
    id: 'squat-strength',
    label: 'Squat strength',
    area: 'lower-body',
    entryByCalibration: { gentle: 0, 'some-basics': 1, 'regular-training': 2, unsure: 1 },
    checks: [
      {
        id: 'goal-squat', movementId: 'squat', title: 'Supported sit-to-stand', shortName: 'Sit-to-stand', area: 'lower-body', equipment: ['chair'], pathwayId: 'squat', levelIndex: 0,
        instruction: 'Sit towards the front of a firm chair with both feet comfortably grounded. Stand up and sit down slowly five times. Use your hands or a stable support as much as you need.',
        why: 'This is an accessible first step in the Squat pathway. If it feels easy, we will offer a stronger variation rather than assuming this is your level.',
      },
      {
        id: 'goal-squat-bodyweight', movementId: 'squat', title: 'Bodyweight squat', shortName: 'Bodyweight squat', area: 'lower-body', equipment: ['none'], pathwayId: 'squat', levelIndex: 3,
        instruction: 'Try five unassisted squats through a comfortable range. Keep your whole foot grounded and stand without rushing.',
        why: 'This is a useful middle anchor. Your answer can take the assessment towards supported strength or towards single-leg work.',
      },
      {
        id: 'goal-squat-single-leg', movementId: 'squat', title: 'Controlled single-leg squat', shortName: 'Single-leg squat', area: 'lower-body', equipment: ['none'], pathwayId: 'squat', levelIndex: 5,
        instruction: 'Try three controlled shallow single-leg squats on each side. Keep a stable support nearby and use it whenever helpful. Use only the range you can reverse smoothly.',
        why: 'This checks whether single-leg strength and balance are a more useful starting point than ordinary squats.',
      },
      {
        id: 'goal-squat-assisted-pistol', movementId: 'squat', title: 'Assisted pistol squat', shortName: 'Assisted pistol', area: 'lower-body', equipment: ['none'], pathwayId: 'squat', levelIndex: 7,
        instruction: 'Try one slow pistol squat on each side while using secure hand support whenever helpful. Stop at the depth where you can still return with control.',
        why: 'This places experienced movers near the advanced end of the Squat pathway without requiring an unsupported attempt.',
      },
      {
        id: 'goal-squat-pistol', movementId: 'squat', title: 'Pistol squat', shortName: 'Pistol squat', area: 'lower-body', equipment: ['none'], pathwayId: 'squat', levelIndex: 8,
        instruction: 'If this is already familiar and pain-free, try one controlled pistol squat on each side. Keep a stable support close by and use it whenever needed.',
        why: 'A controlled pistol is the current destination of the Squat pathway. It is only offered after stronger preceding checks.',
      },
    ],
  },
  {
    id: 'hip-extension',
    label: 'Hip extension',
    area: 'lower-body',
    entryByCalibration: { gentle: 0, 'some-basics': 1, 'regular-training': 1, unsure: 1 },
    checks: [
      {
        id: 'hip-extension', movementId: 'hip-hinge', title: 'Heel-dig bridge', shortName: 'Hip extension', area: 'lower-body', equipment: ['none'], pathwayId: 'hip-hinge', levelIndex: 0, showInBodyMap: true,
        instruction: 'Lie on your back with your knees bent and heels on the floor. Press gently through your heels, lift your hips through a comfortable range, and lower slowly. Try up to five repetitions.',
        why: 'This begins our picture of hip-extension and hamstring capacity and places you on the Hip Hinge pathway.',
      },
      {
        id: 'hip-extension-bridge', movementId: 'hip-hinge', title: 'Controlled bridge hold', shortName: 'Bridge hold', area: 'lower-body', equipment: ['none'], pathwayId: 'hip-hinge', levelIndex: 1,
        instruction: 'Lift into a comfortable bridge, keep your pelvis steady, and hold for twenty seconds while breathing normally.',
        why: 'This checks whether sustained hip-extension control is already comfortable for you.',
      },
      {
        id: 'hip-extension-single-leg', movementId: 'hip-hinge', title: 'Single-leg bridge', shortName: 'Single-leg bridge', area: 'lower-body', equipment: ['none'], pathwayId: 'hip-hinge', levelIndex: 2,
        instruction: 'From a bridge position, keep one foot grounded and extend the other leg. Try three controlled lifts on each side without letting the pelvis twist.',
        why: 'This adds single-leg strength and pelvic control for people who already find an ordinary bridge easy.',
      },
    ],
  },
  {
    id: 'pike-mobility',
    label: 'Pike mobility',
    area: 'lower-body',
    entryByCalibration: { gentle: 0, 'some-basics': 1, 'regular-training': 1, unsure: 1 },
    checks: [
      {
        id: 'pike-forward-fold', movementId: 'pike', title: 'Gentle pike / forward fold', shortName: 'Pike / fold', area: 'lower-body', equipment: ['none'], pathwayId: 'pike', levelIndex: 1, showInBodyMap: true,
        instruction: 'Stand with something stable nearby. Soften your knees, fold forward comfortably, and let your hands rest wherever they reach. Rise slowly.',
        why: 'This gives us a first observation for the Pike pathway and the mobility of your posterior chain. We are looking for a comfortable starting range, not maximum depth.',
      },
      {
        id: 'pike-controlled-fold', movementId: 'pike', title: 'Controlled standing pike', shortName: 'Standing pike', area: 'lower-body', equipment: ['none'], pathwayId: 'pike', levelIndex: 2,
        instruction: 'With your legs as straight as comfortably possible, fold from the hips and reach towards the floor. Pause for three calm breaths without bouncing.',
        why: 'This is a clearer middle check for someone who already folds comfortably with softened knees.',
      },
      {
        id: 'pike-long-sit', movementId: 'pike', title: 'Long-sit pike', shortName: 'Long-sit pike', area: 'lower-body', equipment: ['none'], pathwayId: 'pike', levelIndex: 3,
        instruction: 'Sit with both legs extended in front of you. Keeping the knees comfortably straight, tip forward from the hips and reach ahead without forcing your back or hamstrings.',
        why: 'This offers a more demanding pike position when the standing variation already feels easy.',
      },
    ],
  },
  {
    id: 'core-control',
    label: 'Core control',
    area: 'core',
    entryByCalibration: { gentle: 0, 'some-basics': 1, 'regular-training': 2, unsure: 1 },
    checks: [
      {
        id: 'core-control', movementId: 'core', title: 'Alternating core march', shortName: 'Core march', area: 'core', equipment: ['none'], pathwayId: 'core', levelIndex: 0, showInBodyMap: true,
        instruction: 'Lie on your back with your knees bent and feet on the floor. Keep breathing as you slowly lift one foot, place it down, and change sides. Try five on each side without rocking.',
        why: 'This gives us a calm first observation for trunk control before the Core progressions become more demanding.',
      },
      {
        id: 'core-dead-bug', movementId: 'core', title: 'Dead bug extension', shortName: 'Dead bug', area: 'core', equipment: ['none'], pathwayId: 'core', levelIndex: 1,
        instruction: 'Lie on your back with hips and knees bent above you. Slowly extend the opposite arm and leg, return, and change sides. Try three per side while your trunk stays quiet.',
        why: 'This is a useful middle anchor for coordinated core control.',
      },
      {
        id: 'core-tuck-hollow', movementId: 'core', title: 'Tuck hollow-body hold', shortName: 'Tuck hollow hold', area: 'core', equipment: ['none'], pathwayId: 'core', levelIndex: 2,
        instruction: 'Lie on your back, bring your knees towards your chest, lift your head and shoulders comfortably, and hold a rounded tuck shape for fifteen seconds while breathing.',
        why: 'This checks stronger whole-body tension without immediately asking for a straight-leg hollow hold.',
      },
      {
        id: 'core-hollow', movementId: 'core', title: 'Hollow-body hold', shortName: 'Hollow hold', area: 'core', equipment: ['none'], pathwayId: 'core', levelIndex: 3,
        instruction: 'If the tuck hold is easy, gradually extend your legs and arms into the strongest hollow shape you can hold for fifteen controlled seconds. Keep the lower back comfortably connected to the floor.',
        why: 'This places experienced movers further along the Core pathway without jumping directly to a dragon flag attempt.',
      },
    ],
  },
  {
    id: 'push-strength',
    label: 'Pushing strength',
    area: 'upper-body',
    entryByCalibration: { gentle: 0, 'some-basics': 1, 'regular-training': 3, unsure: 2 },
    checks: [
      {
        id: 'goal-push', movementId: 'push-up', title: 'Wall push-up', shortName: 'Wall push-up', area: 'upper-body', equipment: ['wall'], pathwayId: 'push-up', levelIndex: 0,
        instruction: 'Place your hands on a clear wall just below shoulder height. Keeping your body comfortably connected, try five slow wall push-ups.',
        why: 'This is the first available step in the Horizontal Push pathway. If it is easy, we will keep moving rather than save it as your level.',
      },
      {
        id: 'goal-push-incline', movementId: 'push-up', title: 'Incline push-up', shortName: 'Incline push-up', area: 'upper-body', equipment: ['box-bench'], pathwayId: 'push-up', levelIndex: 2,
        instruction: 'Using a sturdy hip-high surface, try five push-ups with your body moving as one connected line.',
        why: 'This is a middle bridge between upright pushing and the floor.',
      },
      {
        id: 'goal-push-knees', movementId: 'push-up', title: 'Knee push-up', shortName: 'Knee push-up', area: 'upper-body', equipment: ['none'], pathwayId: 'push-up', levelIndex: 3,
        instruction: 'From the floor, make a long line from your knees to your head and try five controlled push-ups without letting your hips fold.',
        why: 'This gives beginners a floor-based option when a suitable wall or incline is not available.',
      },
      {
        id: 'goal-push-floor', movementId: 'push-up', title: 'Floor push-up', shortName: 'Floor push-up', area: 'upper-body', equipment: ['none'], pathwayId: 'push-up', levelIndex: 5,
        instruction: 'Try up to five full floor push-ups with a quiet plank, a controlled lowering phase, and no need to strain for another repetition.',
        why: 'This is a useful starting anchor for someone who already has basic pushing strength.',
      },
      {
        id: 'goal-push-close', movementId: 'push-up', title: 'Close-grip push-up', shortName: 'Close-grip push-up', area: 'upper-body', equipment: ['none'], pathwayId: 'push-up', levelIndex: 6,
        instruction: 'Use a comfortably narrow hand position and try five controlled push-ups while your elbows track back.',
        why: 'This checks whether the ordinary floor push-up is already below your useful training level.',
      },
      {
        id: 'goal-push-planche-lean', movementId: 'push-up', title: 'Planche lean', shortName: 'Planche lean', area: 'upper-body', equipment: ['none'], pathwayId: 'push-up', levelIndex: 8,
        instruction: 'Warm your wrists, begin in a high plank, and gently let your shoulders move forward of your hands while keeping your elbows straight. Hold a controlled lean for ten seconds.',
        why: 'This is an advanced checkpoint for straight-arm pushing strength. Keep the lean modest if your wrists are not accustomed to it.',
      },
    ],
  },
  {
    id: 'overhead-mobility',
    label: 'Overhead mobility',
    area: 'upper-body',
    entryByCalibration: { gentle: 0, 'some-basics': 1, 'regular-training': 1, unsure: 1 },
    checks: [
      {
        id: 'overhead-reach', movementId: 'overhead-reach', title: 'Comfortable overhead reach', shortName: 'Overhead reach', area: 'upper-body', equipment: ['none'], pathwayId: null, levelIndex: 0, showInBodyMap: true,
        instruction: 'Stand or sit tall and slowly reach both arms overhead. Keep breathing and use only the range that feels natural today.',
        why: 'This begins our picture of overhead mobility, which supports the Vertical Push and Bridge pathways.',
      },
      {
        id: 'overhead-wall-reach', movementId: 'overhead-reach', title: 'Back-to-wall overhead reach', shortName: 'Wall overhead reach', area: 'upper-body', equipment: ['wall'], pathwayId: null, levelIndex: 1,
        instruction: 'Stand with your back gently against a wall and ribs relaxed. Reach both arms overhead without forcing your back to arch. Notice the range you can control for three calm breaths.',
        why: 'The wall makes this a more precise mobility and trunk-control check for people who already reach overhead easily.',
      },
    ],
  },
  {
    id: 'pull-strength',
    label: 'Pulling strength',
    area: 'upper-body',
    shownWhenEquipment: ['pull-up-bar'],
    entryByCalibration: { gentle: 0, 'some-basics': 1, 'regular-training': 3, unsure: 1 },
    checks: [
      {
        id: 'goal-pull', movementId: 'pull-up', title: 'Feet-supported hang', shortName: 'Supported hang', area: 'upper-body', equipment: ['pull-up-bar'], pathwayId: 'pull-up', levelIndex: 0,
        instruction: 'Using a secure bar, keep your feet on the floor or a stable box and let your hands carry only a comfortable amount of weight. Try ten calm seconds.',
        why: 'This is the first available step in the Vertical Pull pathway and is only included when you have a secure pull-up bar.',
      },
      {
        id: 'goal-pull-active-hang', movementId: 'pull-up', title: 'Active hang', shortName: 'Active hang', area: 'upper-body', equipment: ['pull-up-bar'], pathwayId: 'pull-up', levelIndex: 2,
        instruction: 'From a secure straight-arm hang, gently draw your shoulders away from your ears and hold for ten controlled seconds.',
        why: 'This checks grip and shoulder control before full pulling strength.',
      },
      {
        id: 'goal-pull-assisted', movementId: 'pull-up', title: 'Assisted pull-up', shortName: 'Assisted pull-up', area: 'upper-body', equipment: ['pull-up-bar', 'resistance-band'], pathwayId: 'pull-up', levelIndex: 4,
        instruction: 'Using secure assistance, try three smooth pull-ups without bouncing. Choose enough help that every repetition stays controlled.',
        why: 'This bridges active hanging and an unassisted pull-up.',
      },
      {
        id: 'goal-pull-full', movementId: 'pull-up', title: 'Full pull-up', shortName: 'Full pull-up', area: 'upper-body', equipment: ['pull-up-bar'], pathwayId: 'pull-up', levelIndex: 6,
        instruction: 'Try one controlled pull-up from a quiet hang without swinging. Stop after the first good repetition.',
        why: 'This is an appropriate anchor for someone who already trains pulling strength.',
      },
      {
        id: 'goal-pull-multiple', movementId: 'pull-up', title: 'Five controlled pull-ups', shortName: 'Pull-up set', area: 'upper-body', equipment: ['pull-up-bar'], pathwayId: 'pull-up', levelIndex: 7,
        instruction: 'Try up to five connected pull-ups, leaving one good repetition in reserve and keeping every start quiet.',
        why: 'This distinguishes a first pull-up from repeatable pulling capacity.',
      },
      {
        id: 'goal-pull-archer', movementId: 'pull-up', title: 'Archer pull-up', shortName: 'Archer pull-up', area: 'upper-body', equipment: ['pull-up-bar'], pathwayId: 'pull-up', levelIndex: 8,
        instruction: 'Only if archer pull-ups are already familiar, try one controlled repetition towards each hand with the assisting arm still involved.',
        why: 'This is an advanced checkpoint for people progressing towards one-arm pulling strength.',
      },
    ],
  },
];

export const foundationChecks = initialAssessmentLadders.flatMap((ladder) => ladder.checks);
export const foundationMapChecks = foundationChecks.filter((check) => check.showInBodyMap && !check.pathwayId);
export const foundationStateIds = [...new Set(foundationMapChecks.map((check) => check.movementId ?? check.id))];

export const outcomeOptions = [
  { id: 'comfortable', label: 'That felt easy', hint: 'I could try a harder version with control' },
  { id: 'limited', label: 'Challenging but controlled', hint: 'I completed it well, and this feels like enough' },
  { id: 'not-yet', label: 'Too difficult right now', hint: 'I could not complete it with control today' },
  { id: 'unsure', label: 'I’m not sure', hint: 'I would like clearer guidance' },
  { id: 'no-equipment', label: 'Couldn’t try safely', hint: 'I did not have a safe setup today' },
  { id: 'pain', label: 'I felt pain', hint: 'Pain appeared during the movement' },
] as const;
