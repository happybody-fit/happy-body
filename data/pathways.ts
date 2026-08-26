import type { AssessmentCheckpoint, EquipmentId, Exercise, MetricKind, Pathway, PathwayId, ProgressionLevel } from '@/lib/types';
import { expandedPathways } from './expanded-pathways';

type ExerciseSeed = {
  id: string;
  title: string;
  purpose: string;
  equipment?: EquipmentId[];
  duration?: number;
  sets?: number;
  reps?: string;
  hold?: string;
  metric?: MetricKind;
  cues: string[];
  feel?: string;
  caution?: string;
  videoId: string;
  videoStatus?: Exercise['videoStatus'];
};

function exercise(seed: ExerciseSeed): Exercise {
  return {
    id: seed.id,
    title: seed.title,
    purpose: seed.purpose,
    equipment: seed.equipment ?? ['none'],
    alternatives: [],
    durationMinutes: seed.duration ?? 8,
    sets: seed.sets ?? 3,
    reps: seed.reps,
    hold: seed.hold,
    metric: seed.metric ?? (seed.hold ? 'seconds' : 'reps'),
    tempo: 'Move slowly enough to stay in control.',
    rest: 'Rest until your breathing feels calm, usually 45–90 seconds.',
    frequency: 'Practise 2–3 times each week when your body feels recovered.',
    cues: seed.cues,
    feel: seed.feel ?? 'Steady effort with room for one or two more good repetitions.',
    commonMistakes: ['Rushing the hardest part', 'Continuing after the movement loses ease'],
    regressWhen: 'Use the previous step if you cannot stay controlled or the effort becomes a strain.',
    progressWhen: 'Explore the next step after two or three comfortable practices at the top of the range.',
    cautions: [seed.caution ?? 'Stop if you feel sharp, worsening or unexplained pain.'],
    videoId: seed.videoId,
    videoStatus: seed.videoStatus ?? 'placeholder',
    educationId: 'steadiness-and-ease',
  };
}

function level(id: string, title: string, description: string, milestone: string, item: Exercise): ProgressionLevel {
  return { id, title, description, milestone, exercises: [item] };
}

function checkpoint(id: string, title: string, instruction: string, levelIndex: number, equipment: EquipmentId[] = ['none']): AssessmentCheckpoint {
  return {
    id,
    title,
    instruction,
    comfortPrompt: 'Choose the answer that best describes what happened today.',
    equipment,
    levelIndex,
  };
}

const squatVideo = 'qgugh6l0zeU';
const supportedSitToStandVideo = '9JVaSIUPqxU';
const pushVideo = 'J2vaGZ7wSco';
const pullVideo = 'B_VkNQS5YLs';

const originalPathways: Pathway[] = [
  {
    id: 'squat',
    name: 'Squat',
    longName: 'Squat pathway',
    category: 'Strength',
    focus: 'Lower body',
    focusLabel: 'lower-body strength',
    primaryGoal: 'pistol-squat',
    symbol: 'S',
    tone: 'sage',
    description: 'Build comfortable leg strength, balance and depth for sitting, standing and moving close to the ground.',
    destination: 'Pistol squat',
    goalIds: ['move-comfortably', 'build-strength', 'natural-movement', 'pistol-squat'],
    levels: [
      level('supported-sit-to-stand', 'Supported sit-to-stand', 'Use your hands or a stable support to make standing feel secure.', 'Stand from a firm seat five times with steady feet.', exercise({ id: 'supported-sit-to-stand', title: 'Supported sit-to-stand', purpose: 'Build everyday leg strength with as much support as you need.', equipment: ['chair'], sets: 2, reps: '5–8', cues: ['Place both feet comfortably under you.', 'Use the chair or your hands only as much as needed.', 'Stand tall, then sit down quietly.'], videoId: supportedSitToStandVideo, videoStatus: 'approved' })),
      level('chair-squat', 'Chair squat', 'Use a chair as a clear, reassuring depth target.', 'Complete ten quiet chair squats without dropping onto the seat.', exercise({ id: 'chair-squat', title: 'Chair squat', purpose: 'Practise a smooth squat with a reliable target.', equipment: ['chair'], sets: 2, reps: '6–10', cues: ['Send your hips back towards the chair.', 'Touch down lightly instead of collapsing.', 'Press through your whole foot to stand.'], videoId: squatVideo })),
      level('supported-deep-squat', 'Supported deep squat', 'Use hand support to explore a deeper, comfortable position.', 'Breathe calmly for 30 seconds at your comfortable depth.', exercise({ id: 'supported-deep-squat', title: 'Supported deep squat', purpose: 'Explore depth, ankle movement and ease with adjustable support.', equipment: ['chair'], sets: 3, hold: '15–30 sec', cues: ['Hold something stable.', 'Keep your heels supported.', 'Choose a depth where breathing remains easy.'], videoId: squatVideo })),
      level('bodyweight-squat', 'Bodyweight squat', 'Squat freely through the range you can control today.', 'Complete ten balanced bodyweight squats.', exercise({ id: 'bodyweight-squat', title: 'Bodyweight squat', purpose: 'Build coordinated leg and trunk strength.', sets: 3, reps: '6–10', cues: ['Use the stance that lets your hips move freely.', 'Keep pressure across your whole foot.', 'Stand without rushing.'], videoId: squatVideo })),
      level('tempo-squat', 'Tempo squat', 'Add a slow lowering phase to build control and capacity.', 'Complete eight repetitions with a three-second lowering phase.', exercise({ id: 'tempo-squat', title: 'Tempo squat', purpose: 'Increase strength without needing external weight.', sets: 3, reps: '5–8', cues: ['Lower for three calm counts.', 'Pause briefly at your comfortable depth.', 'Stand smoothly.'], videoId: squatVideo })),
      level('assisted-single-leg-squat', 'Assisted single-leg squat', 'Let one leg work harder while your hands help with balance.', 'Complete six controlled repetitions on each side.', exercise({ id: 'assisted-single-leg-squat', title: 'Assisted single-leg squat', purpose: 'Prepare balance and single-leg strength.', equipment: ['chair'], sets: 3, reps: '3–6 / side', cues: ['Hold a stable support lightly.', 'Keep the working foot grounded.', 'Use a range you can reverse with control.'], videoId: squatVideo })),
      level('box-pistol-squat', 'Box pistol squat', 'Use a box or chair to define the depth of a single-leg squat.', 'Touch the box softly for five repetitions per side.', exercise({ id: 'box-pistol-squat', title: 'Box pistol squat', purpose: 'Build single-leg strength with a predictable target.', equipment: ['box-bench'], sets: 3, reps: '3–5 / side', cues: ['Reach the free leg forward.', 'Sit back to the box slowly.', 'Stand using the working leg without bouncing.'], videoId: squatVideo })),
      level('assisted-pistol-squat', 'Assisted pistol squat', 'Use light hand support through a deeper single-leg squat.', 'Complete three smooth assisted pistols per side.', exercise({ id: 'assisted-pistol-squat', title: 'Assisted pistol squat', purpose: 'Develop full-range single-leg control.', equipment: ['chair'], sets: 4, reps: '2–4 / side', cues: ['Use only enough support to stay composed.', 'Keep the working heel grounded.', 'Match the depth to your control today.'], videoId: squatVideo })),
      level('pistol-squat', 'Pistol squat', 'A controlled full-depth single-leg squat.', 'Complete a calm pistol squat on each side.', exercise({ id: 'pistol-squat', title: 'Pistol squat', purpose: 'Express balance, mobility and single-leg strength together.', sets: 4, reps: '1–3 / side', cues: ['Begin tall and balanced.', 'Reach the free leg forward as you descend.', 'Stop the set before control fades.'], videoId: squatVideo })),
    ],
    assessment: [
      checkpoint('squat-check-1', 'Supported sit-to-stand', 'From a firm chair, stand and sit five times. Use your hands if you need them.', 0, ['chair']),
      checkpoint('squat-check-2', 'Chair squat', 'Try five slow chair squats, touching the seat lightly.', 1, ['chair']),
      checkpoint('squat-check-3', 'Bodyweight squat', 'Try five unassisted squats through a comfortable range.', 3),
      checkpoint('squat-check-4', 'Assisted single-leg squat', 'With stable hand support, try three shallow single-leg squats per side.', 5, ['chair']),
      checkpoint('squat-check-5', 'Assisted pistol squat', 'With stable support, try one controlled assisted pistol on each side.', 7, ['chair']),
    ],
  },
  {
    id: 'push-up',
    name: 'Push-up',
    longName: 'Horizontal push pathway',
    category: 'Strength',
    focus: 'Upper body',
    focusLabel: 'horizontal pushing strength',
    primaryGoal: 'push-up',
    symbol: 'P',
    tone: 'peach',
    description: 'Build confident whole-body pushing strength from the wall towards advanced hand-supported shapes.',
    destination: 'Tuck-planche preparation',
    goalIds: ['build-strength', 'push-up', 'planche', 'natural-movement'],
    levels: [
      level('wall-push-up', 'Wall push-up', 'Learn the pushing shape in a gentle upright position.', 'Complete twelve smooth wall push-ups.', exercise({ id: 'wall-push-up', title: 'Wall push-up', purpose: 'Build a connected pushing pattern with low load.', equipment: ['wall'], sets: 2, reps: '8–12', cues: ['Place hands just below shoulder height.', 'Move your body towards the wall as one line.', 'Press away without shrugging.'], videoId: pushVideo })),
      level('high-incline-push-up', 'High incline push-up', 'Use a sturdy chest-high surface to add a little more load.', 'Complete ten calm repetitions.', exercise({ id: 'high-incline-push-up', title: 'High incline push-up', purpose: 'Develop pushing strength while keeping the angle manageable.', equipment: ['box-bench'], sets: 3, reps: '6–10', cues: ['Choose a truly stable surface.', 'Keep ribs and hips connected.', 'Touch softly and press away.'], videoId: pushVideo })),
      level('low-incline-push-up', 'Low incline push-up', 'Lower the hand support to gradually increase the challenge.', 'Complete eight connected repetitions.', exercise({ id: 'low-incline-push-up', title: 'Low incline push-up', purpose: 'Bridge the gap between upright and floor pushing.', equipment: ['box-bench'], sets: 3, reps: '5–8', cues: ['Keep a long line from head to heels.', 'Let elbows angle gently back.', 'Use an incline where every rep looks similar.'], videoId: pushVideo })),
      level('knee-push-up', 'Knee push-up', 'Practise the floor position with your knees sharing the load.', 'Complete eight controlled repetitions.', exercise({ id: 'knee-push-up', title: 'Knee push-up', purpose: 'Build floor pushing strength with a shorter lever.', sets: 3, reps: '5–8', cues: ['Make a long line from knees to head.', 'Lower your chest between your hands.', 'Press the floor away evenly.'], videoId: pushVideo })),
      level('negative-floor-push-up', 'Negative floor push-up', 'Lower slowly from the top and reset between repetitions.', 'Complete five five-second lowerings.', exercise({ id: 'negative-floor-push-up', title: 'Negative floor push-up', purpose: 'Build the strength for the hardest part of a floor push-up.', sets: 3, reps: '3–5', cues: ['Begin in a strong high plank.', 'Lower for three to five seconds.', 'Put knees down to reset without straining.'], videoId: pushVideo })),
      level('floor-push-up', 'Floor push-up', 'A full push-up with connected trunk and shoulder control.', 'Complete eight smooth floor push-ups.', exercise({ id: 'floor-push-up', title: 'Floor push-up', purpose: 'Build complete horizontal pushing strength.', sets: 4, reps: '3–8', cues: ['Begin in a quiet plank.', 'Lower through the range you control.', 'Press the floor away as one piece.'], videoId: pushVideo })),
      level('close-grip-push-up', 'Close-grip push-up', 'Use a narrower hand position to increase arm demand.', 'Complete eight controlled close-grip repetitions.', exercise({ id: 'close-grip-push-up', title: 'Close-grip push-up', purpose: 'Build stronger elbow extension and connected pressing.', sets: 3, reps: '4–8', cues: ['Keep hands a comfortable distance apart.', 'Let elbows track back.', 'Avoid forcing the wrist angle.'], videoId: pushVideo })),
      level('pseudo-planche-push-up', 'Pseudo-planche push-up', 'Turn the hands slightly and let the shoulders travel forward.', 'Complete five steady forward-leaning repetitions.', exercise({ id: 'pseudo-planche-push-up', title: 'Pseudo-planche push-up', purpose: 'Prepare forward shoulder strength for planche work.', sets: 4, reps: '3–5', cues: ['Warm your wrists first.', 'Keep elbows straight at the top.', 'Use only a lean you can control.'], caution: 'Regress if your wrists or front of the shoulder feel irritated.', videoId: pushVideo })),
      level('planche-lean', 'Planche lean', 'Shift bodyweight into straight arms while keeping the feet down.', 'Hold a strong lean for fifteen seconds.', exercise({ id: 'planche-lean', title: 'Planche lean', purpose: 'Develop wrist tolerance and straight-arm shoulder strength.', sets: 4, hold: '8–15 sec', cues: ['Spread your fingers and press through the floor.', 'Lock the elbows without jamming them.', 'Lean only while the shoulder position stays strong.'], caution: 'Keep the lean modest if your wrists are not accustomed to this load.', videoId: pushVideo })),
      level('tuck-planche-prep', 'Tuck-planche preparation', 'Explore lifting the feet only with strong, pain-free support.', 'Hold a controlled tuck-planche preparation for five seconds.', exercise({ id: 'tuck-planche-prep', title: 'Tuck-planche preparation', purpose: 'Bring strength, balance and straight-arm support together.', equipment: ['box-bench'], sets: 5, hold: '3–8 sec', cues: ['Use blocks or a stable raised surface if helpful.', 'Press down and round the upper back gently.', 'Treat even a light foot float as enough.'], caution: 'This is advanced preparation, not a full planche prescription.', videoId: pushVideo })),
    ],
    assessment: [
      checkpoint('push-check-1', 'Wall push-up', 'Try eight wall push-ups with your body moving as one line.', 0, ['wall']),
      checkpoint('push-check-2', 'High incline push-up', 'Using a sturdy chest-high surface, try five slow push-ups.', 1, ['box-bench']),
      checkpoint('push-check-3', 'Low incline push-up', 'Using a sturdy hip-high surface, try five connected push-ups.', 2, ['box-bench']),
      checkpoint('push-check-4', 'Floor push-up', 'From the floor, try up to five full push-ups.', 5),
      checkpoint('push-check-5', 'Planche lean', 'Warm your wrists, then try a gentle straight-arm forward lean.', 8),
    ],
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
    longName: 'Vertical pull pathway',
    category: 'Strength',
    focus: 'Upper body',
    focusLabel: 'vertical pulling strength',
    primaryGoal: 'pull-up',
    symbol: 'U',
    tone: 'sand',
    description: 'Develop grip, overhead confidence and pulling strength towards a one-arm pull-up.',
    destination: 'One-arm pull-up',
    goalIds: ['build-strength', 'pull-up', 'one-arm-pull-up', 'natural-movement'],
    levels: [
      level('feet-supported-hang', 'Feet-supported hang', 'Let your feet adjust how much weight your hands carry.', 'Hold comfortably for thirty seconds.', exercise({ id: 'feet-supported-hang', title: 'Feet-supported hang', purpose: 'Introduce grip and the overhead position with adjustable load.', equipment: ['pull-up-bar'], sets: 3, hold: '15–30 sec', cues: ['Keep your feet on the floor or a box.', 'Let your hands carry a comfortable amount.', 'Step down before your grip fails.'], videoId: pullVideo })),
      level('supported-active-hang', 'Supported active hang', 'Use the feet while learning to draw the shoulders away from the ears.', 'Hold an active position for twenty seconds.', exercise({ id: 'supported-active-hang', title: 'Supported active hang', purpose: 'Learn shoulder-blade control without carrying full bodyweight.', equipment: ['pull-up-bar'], sets: 3, hold: '10–20 sec', cues: ['Keep elbows straight.', 'Gently make your neck feel long.', 'Use your feet to keep the effort calm.'], videoId: pullVideo })),
      level('active-hang', 'Active hang', 'Carry your bodyweight with the shoulders gently active.', 'Hold a steady active hang for twenty seconds.', exercise({ id: 'active-hang', title: 'Active hang', purpose: 'Build grip and overhead shoulder control.', equipment: ['pull-up-bar'], sets: 3, hold: '10–20 sec', cues: ['Begin from a secure grip.', 'Draw the shoulders down without bending the elbows.', 'Step down before the shape changes.'], videoId: pullVideo })),
      level('scapular-pull', 'Scapular pull', 'Move the body slightly using the shoulder blades and straight arms.', 'Complete six quiet repetitions.', exercise({ id: 'scapular-pull', title: 'Scapular pull', purpose: 'Practise the first part of a strong pull-up.', equipment: ['pull-up-bar'], sets: 3, reps: '3–6', cues: ['Start in a comfortable hang.', 'Keep elbows straight.', 'Lift and lower only as far as the shoulders stay composed.'], videoId: pullVideo })),
      level('band-assisted-pull-up', 'Band-assisted pull-up', 'Use a band to practise a complete pulling path.', 'Complete five controlled assisted repetitions.', exercise({ id: 'band-assisted-pull-up', title: 'Band-assisted pull-up', purpose: 'Build full-range pulling strength with assistance.', equipment: ['pull-up-bar', 'resistance-band'], sets: 4, reps: '3–6', cues: ['Secure the band carefully.', 'Begin from active shoulders.', 'Pull and lower without bouncing.'], videoId: pullVideo })),
      level('negative-pull-up', 'Negative pull-up', 'Begin at the top and lower slowly under control.', 'Complete three five-second lowerings.', exercise({ id: 'negative-pull-up', title: 'Negative pull-up', purpose: 'Build strength through the lowering phase.', equipment: ['pull-up-bar', 'box-bench'], sets: 4, reps: '2–4', cues: ['Use a box to begin safely at the top.', 'Lower for three to five seconds.', 'Step down once the arms are straight.'], videoId: pullVideo })),
      level('full-pull-up', 'Full pull-up', 'Pull from a quiet hang until the chin clears the bar.', 'Complete one unassisted pull-up with control.', exercise({ id: 'full-pull-up', title: 'Full pull-up', purpose: 'Express complete vertical pulling strength.', equipment: ['pull-up-bar'], sets: 5, reps: '1–3', cues: ['Start without swinging.', 'Drive the elbows down.', 'Lower to a controlled finish.'], videoId: pullVideo })),
      level('multiple-controlled-pull-ups', 'Multiple controlled pull-ups', 'Build repeatable strength without losing the shape.', 'Complete five connected controlled pull-ups.', exercise({ id: 'multiple-controlled-pull-ups', title: 'Controlled pull-up sets', purpose: 'Turn a single pull-up into repeatable capacity.', equipment: ['pull-up-bar'], sets: 4, reps: '2–5', cues: ['Leave one good repetition in reserve.', 'Keep every start quiet.', 'Rest enough to preserve quality.'], videoId: pullVideo })),
      level('archer-pull-up', 'Archer pull-up', 'Shift more work towards one arm while the other assists.', 'Complete three controlled archer repetitions per side.', exercise({ id: 'archer-pull-up', title: 'Archer pull-up', purpose: 'Develop side-to-side pulling strength.', equipment: ['pull-up-bar'], sets: 4, reps: '2–4 / side', cues: ['Use a wider secure grip.', 'Pull towards one hand.', 'Keep the assisting arm involved enough to stay smooth.'], videoId: pullVideo })),
      level('assisted-one-arm-pull-up', 'Assisted one-arm pull-up', 'Use the free hand or a band to scale one-arm pulling.', 'Complete one smooth assisted repetition per side.', exercise({ id: 'assisted-one-arm-pull-up', title: 'Assisted one-arm pull-up', purpose: 'Prepare one-arm strength with precise assistance.', equipment: ['pull-up-bar', 'resistance-band'], sets: 5, reps: '1–3 / side', cues: ['Use generous assistance at first.', 'Keep the working shoulder active.', 'Avoid twisting to chase height.'], videoId: pullVideo })),
      level('one-arm-pull-up', 'One-arm pull-up', 'A highly advanced single-arm pull from a controlled hang.', 'Complete a controlled one-arm pull-up on each trained side.', exercise({ id: 'one-arm-pull-up', title: 'One-arm pull-up', purpose: 'Express exceptional unilateral pulling strength.', equipment: ['pull-up-bar'], sets: 5, reps: '1 quality rep', cues: ['Attempt only when thoroughly prepared.', 'Keep the shoulder active from the start.', 'Stop before technique becomes a struggle.'], caution: 'This advanced skill carries high elbow and shoulder load; use qualified coaching if unsure.', videoId: pullVideo })),
    ],
    assessment: [
      checkpoint('pull-check-1', 'Feet-supported hang', 'Hold a secure bar while your feet take as much weight as needed.', 0, ['pull-up-bar']),
      checkpoint('pull-check-2', 'Active hang', 'Try a short straight-arm active hang with shoulders gently away from the ears.', 2, ['pull-up-bar']),
      checkpoint('pull-check-3', 'Scapular pull', 'Try three quiet scapular pulls with straight elbows.', 3, ['pull-up-bar']),
      checkpoint('pull-check-4', 'Assisted pull-up', 'Using suitable assistance, try three smooth pull-ups.', 4, ['pull-up-bar', 'resistance-band']),
      checkpoint('pull-check-5', 'Full pull-up', 'Try one unassisted pull-up without swinging.', 6, ['pull-up-bar']),
    ],
  },
];

const pathwayOrder: PathwayId[] = [
  'squat', 'knee-flexion', 'hip-hinge', 'core', 'push-up', 'vertical-push', 'horizontal-pull', 'pull-up',
  'resting-squat', 'pike', 'pancake', 'front-split', 'middle-split', 'bridge', 'german-hang', 'rotation',
];
const allPathways = [...originalPathways, ...expandedPathways];

export const pathways: Pathway[] = pathwayOrder.map((id) => allPathways.find((pathway) => pathway.id === id)!);

export const pathwayById = Object.fromEntries(pathways.map((pathway) => [pathway.id, pathway])) as Record<Pathway['id'], Pathway>;

export function findExercise(exerciseId: string) {
  for (const pathway of pathways) {
    for (const pathwayLevel of pathway.levels) {
      const item = pathwayLevel.exercises.find((candidate) => candidate.id === exerciseId);
      if (item) return { pathway, level: pathwayLevel, exercise: item };
    }
  }
  return null;
}
