import type { EquipmentId, GoalId, Pathway, PathwayId } from '@/lib/types';

type StepSeed = {
  id: string;
  title: string;
  purpose: string;
  equipment?: EquipmentId[];
  sets?: number;
  reps?: string;
  hold?: string;
  duration?: number;
  cues: string[];
  caution?: string;
};

type PathwaySeed = {
  id: PathwayId;
  name: string;
  longName: string;
  category: Pathway['category'];
  focus: Pathway['focus'];
  focusLabel: string;
  primaryGoal: GoalId;
  symbol: string;
  tone: Pathway['tone'];
  description: string;
  destination: string;
  goalIds: GoalId[];
  steps: StepSeed[];
  assessmentLevels: number[];
};

function buildPathway(seed: PathwaySeed): Pathway {
  const levels = seed.steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    description: step.purpose,
    milestone: `Practise ${step.title.toLowerCase()} with steady breathing and control.`,
    exercises: [{
      id: step.id,
      title: step.title,
      purpose: step.purpose,
      equipment: step.equipment ?? ['none'],
      alternatives: index ? [seed.steps[index - 1].id] : [],
      durationMinutes: step.duration ?? (seed.category === 'Mobility' ? 6 : 8),
      sets: step.sets ?? (seed.category === 'Mobility' ? 2 : 3),
      reps: step.reps,
      hold: step.hold,
      metric: step.hold ? 'seconds' as const : 'reps' as const,
      tempo: seed.category === 'Mobility' ? 'Move into and out of the range slowly. Do not bounce.' : 'Move slowly enough to stay in control.',
      rest: seed.category === 'Mobility' ? 'Come out of the position, move comfortably, and begin again when ready.' : 'Rest until your breathing feels calm, usually 45–90 seconds.',
      frequency: seed.category === 'Mobility' ? 'Explore 2–4 times each week without forcing range.' : 'Practise 2–3 times each week when your body feels recovered.',
      cues: step.cues,
      feel: seed.category === 'Mobility' ? 'A clear but manageable stretch with normal breathing and no sharp sensation.' : 'Steady effort with room for one or two more good repetitions.',
      commonMistakes: seed.category === 'Mobility' ? ['Forcing the deepest range', 'Holding the breath'] : ['Rushing the hardest part', 'Continuing after the movement loses ease'],
      regressWhen: index ? `Return to ${seed.steps[index - 1].title.toLowerCase()} when this range or load cannot stay calm and controlled.` : 'Use more support, less range, or a shorter effort.',
      progressWhen: index < seed.steps.length - 1 ? `Explore ${seed.steps[index + 1].title.toLowerCase()} after several comfortable practices at this step.` : 'Keep this capability through regular, comfortable practice.',
      cautions: [step.caution ?? 'Stop if you feel sharp, worsening or unexplained pain.'],
      videoId: '',
      videoStatus: 'placeholder' as const,
      educationId: 'steadiness-and-ease',
    }],
  }));

  return {
    id: seed.id,
    name: seed.name,
    longName: seed.longName,
    category: seed.category,
    focus: seed.focus,
    focusLabel: seed.focusLabel,
    primaryGoal: seed.primaryGoal,
    symbol: seed.symbol,
    tone: seed.tone,
    description: seed.description,
    destination: seed.destination,
    goalIds: seed.goalIds,
    levels,
    assessment: seed.assessmentLevels.map((levelIndex, index) => {
      const step = seed.steps[levelIndex];
      const attempt = step.hold ? 'one comfortable 10–15 second hold' : 'up to three controlled repetitions';
      return {
        id: `${seed.id}-check-${index + 1}`,
        title: step.title,
        instruction: `After moving gently, try ${attempt} of ${step.title.toLowerCase()}. Use support, reduce the range, or stop whenever needed.${step.caution ? ` ${step.caution}` : ''}`,
        comfortPrompt: 'Choose the answer that best describes what happened today.',
        equipment: step.equipment ?? ['none'],
        levelIndex,
      };
    }),
  };
}

const strengthPathways: PathwaySeed[] = [
  {
    id: 'knee-flexion', name: 'Knee flexion', longName: 'Knee-flexion strength pathway', category: 'Strength', focus: 'Lower body', focusLabel: 'hamstring and knee-flexion strength', primaryGoal: 'nordic-curl', symbol: 'N', tone: 'sand',
    description: 'Build hamstring strength from supported floor work towards a controlled Nordic curl.', destination: 'Nordic curl', goalIds: ['build-strength', 'nordic-curl'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'heel-dig-hold', title: 'Heel-dig bridge hold', purpose: 'Introduce hamstring effort with the hips supported by the floor.', sets: 3, hold: '10–20 sec', cues: ['Lie down with knees bent and heels grounded.', 'Dig the heels down gently before lifting the hips.', 'Keep the effort even behind both thighs.'] },
      { id: 'bridge-walkout', title: 'Bridge walkout', purpose: 'Increase the hamstring lever gradually while keeping the pelvis controlled.', sets: 3, reps: '3–5 steps out and back', cues: ['Begin in a comfortable bridge.', 'Take small heel steps away from you.', 'Stop before the hips begin to drop.'] },
      { id: 'sliding-leg-curl', title: 'Sliding leg curl', purpose: 'Practise knee flexion while the hips remain organised.', sets: 3, reps: '4–8', cues: ['Use socks or towels only on a safe smooth surface.', 'Slide the heels away slowly.', 'Use a smaller range if the hips cannot stay lifted.'] },
      { id: 'assisted-nordic-lower', title: 'Heavily assisted Nordic lower', purpose: 'Introduce the Nordic shape with generous hand assistance.', equipment: ['secure-anchor'], sets: 3, reps: '3–5', cues: ['Use a truly secure foot anchor or a capable partner.', 'Keep hips gently extended.', 'Use your hands early and generously.'], caution: 'Do not improvise an unstable foot anchor.' },
      { id: 'elevated-nordic-lower', title: 'Elevated Nordic lower', purpose: 'Control a short Nordic range towards a raised surface.', equipment: ['secure-anchor', 'box-bench'], sets: 3, reps: '3–5', cues: ['Place a stable raised target in front of you.', 'Lower as one long line.', 'Catch the surface before control fades.'], caution: 'Use secure padding and an anchor that cannot move.' },
      { id: 'nordic-negative', title: 'Nordic curl negative', purpose: 'Build control through a longer lowering phase.', equipment: ['secure-anchor'], sets: 4, reps: '2–4', cues: ['Lower for three to five calm seconds.', 'Use the hands to return to the start.', 'End the set before the descent accelerates.'], caution: 'Nordic work creates high hamstring demand; progress gradually.' },
      { id: 'nordic-curl', title: 'Nordic curl', purpose: 'Express strong knee flexion through a controlled Nordic curl.', equipment: ['secure-anchor'], sets: 4, reps: '1–4', cues: ['Keep the hips extended.', 'Pull back using the hamstrings without jerking.', 'Use hand assistance whenever the return loses control.'], caution: 'Use a secure setup and qualified coaching if this advanced movement is unfamiliar.' },
    ],
  },
  {
    id: 'hip-hinge', name: 'Hip hinge', longName: 'Hip extension and hinge pathway', category: 'Strength', focus: 'Lower body', focusLabel: 'hip-extension and hinge strength', primaryGoal: 'hip-extension-hinge', symbol: 'H', tone: 'sage',
    description: 'Build the strength and coordination to bend, extend and balance through the hips.', destination: 'Strong single-leg hinge', goalIds: ['move-comfortably', 'build-strength', 'natural-movement', 'hip-extension-hinge'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'hip-heel-dig-bridge', title: 'Heel-dig bridge', purpose: 'Begin hip extension with both feet grounded and the floor supporting you.', sets: 2, reps: '6–10', cues: ['Place the heels comfortably near you.', 'Lift only through a range you can control.', 'Lower without dropping.'] },
      { id: 'hip-bridge-hold', title: 'Bridge hold', purpose: 'Build steady hip extension while breathing normally.', sets: 3, hold: '15–30 sec', cues: ['Press evenly through both feet.', 'Keep the ribs relaxed.', 'Finish before the hamstrings cramp.'] },
      { id: 'hip-single-leg-bridge', title: 'Single-leg bridge', purpose: 'Add side-to-side hip strength and pelvic control.', sets: 3, reps: '4–8 / side', cues: ['Keep one foot grounded.', 'Hold the pelvis level.', 'Use a smaller lift if you begin to twist.'] },
      { id: 'wall-hip-hinge', title: 'Wall hip hinge', purpose: 'Learn to fold at the hips while the wall gives a clear target.', equipment: ['wall'], sets: 3, reps: '6–10', cues: ['Stand a short step from the wall.', 'Send the hips back without squatting deeply.', 'Stand by pressing the floor away.'] },
      { id: 'bodyweight-good-morning', title: 'Bodyweight good morning', purpose: 'Build a free-standing hinge with a long, controlled trunk.', sets: 3, reps: '6–10', cues: ['Soften the knees.', 'Fold only as far as the back stays comfortable.', 'Squeeze the ground with your feet as you stand.'] },
      { id: 'supported-single-leg-hinge', title: 'Supported single-leg hinge', purpose: 'Combine hip strength, balance and side-to-side control.', equipment: ['chair'], sets: 3, reps: '4–8 / side', cues: ['Use one hand on stable support.', 'Reach the free leg behind you.', 'Keep the pelvis facing the floor.'] },
      { id: 'single-leg-hip-hinge', title: 'Single-leg hip hinge', purpose: 'Express controlled single-leg hip strength without hand support.', sets: 3, reps: '5–8 / side', cues: ['Begin tall on one foot.', 'Move the trunk and free leg as one shape.', 'Return before balance replaces control.'] },
    ],
  },
  {
    id: 'core', name: 'Core', longName: 'Whole-body core pathway', category: 'Strength', focus: 'Core', focusLabel: 'core control', primaryGoal: 'core-control', symbol: 'C', tone: 'peach',
    description: 'Build a connected centre from calm floor control towards the dragon flag.', destination: 'Dragon flag', goalIds: ['move-comfortably', 'build-strength', 'core-control', 'dragon-flag'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'core-march', title: 'Alternating core march', purpose: 'Coordinate the trunk and legs while the floor provides feedback.', sets: 2, reps: '5–8 / side', cues: ['Keep both feet close to you.', 'Lift one foot without rocking.', 'Breathe out gently as the foot rises.'] },
      { id: 'dead-bug', title: 'Dead bug extension', purpose: 'Control opposite arm and leg movement through a comfortable range.', sets: 3, reps: '4–8 / side', cues: ['Begin with knees above the hips.', 'Reach only as far as the trunk stays quiet.', 'Return slowly before changing sides.'] },
      { id: 'tuck-hollow-hold', title: 'Tuck hollow-body hold', purpose: 'Build a rounded, connected trunk position with short levers.', sets: 3, hold: '10–20 sec', cues: ['Bring the knees towards the chest.', 'Lift the shoulders only as high as comfortable.', 'Keep breathing behind the brace.'] },
      { id: 'hollow-body-hold', title: 'Hollow-body hold', purpose: 'Lengthen the levers while keeping the trunk connected.', sets: 3, hold: '10–25 sec', cues: ['Extend only as far as the lower back stays comfortable.', 'Reach long through fingers and toes.', 'Shorten the shape before it becomes a strain.'] },
      { id: 'reverse-curl', title: 'Controlled reverse curl', purpose: 'Move the pelvis with abdominal control rather than momentum.', sets: 3, reps: '5–10', cues: ['Begin with knees comfortably bent.', 'Curl the pelvis a small distance from the floor.', 'Lower without swinging the legs.'] },
      { id: 'candlestick-lower', title: 'Candlestick lower', purpose: 'Practise lowering a connected body shape with progressively longer levers.', sets: 3, reps: '3–6', cues: ['Begin with hips lifted and hands supporting if needed.', 'Lower one section at a time.', 'Tuck the knees whenever control fades.'] },
      { id: 'tuck-dragon-flag', title: 'Tuck dragon-flag lower', purpose: 'Introduce dragon-flag loading with the knees tucked.', equipment: ['box-bench'], sets: 4, reps: '2–5', cues: ['Hold a truly stable bench behind your head.', 'Keep the knees tucked.', 'Lower only through the range you can reverse.'], caution: 'Do not pull on an unstable object or load the neck.' },
      { id: 'dragon-flag', title: 'Dragon flag', purpose: 'Express advanced whole-body trunk strength with a long lever.', equipment: ['box-bench'], sets: 4, reps: '1–4', cues: ['Anchor the hands to a stable bench.', 'Keep the body connected from shoulders to feet.', 'Use a partial range before control is complete.'], caution: 'This is an advanced movement; avoid loading the neck and use coaching if unsure.' },
    ],
  },
  {
    id: 'vertical-push', name: 'Vertical push', longName: 'Vertical push pathway', category: 'Strength', focus: 'Upper body', focusLabel: 'overhead pushing strength', primaryGoal: 'handstand-push-up', symbol: 'V', tone: 'sage',
    description: 'Build overhead strength from supported pike work towards a controlled handstand push-up.', destination: 'Handstand push-up', goalIds: ['build-strength', 'handstand-push-up', 'wall-handstand', 'handstand'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'incline-pike-hold', title: 'Incline pike hold', purpose: 'Introduce overhead hand support with the feet grounded.', equipment: ['box-bench'], sets: 3, hold: '10–20 sec', cues: ['Use a sturdy raised surface for the hands.', 'Send the hips back and up.', 'Press the surface away without shrugging.'] },
      { id: 'pike-shoulder-tap', title: 'Incline pike weight shift', purpose: 'Move bodyweight towards the hands without bending the elbows deeply.', equipment: ['box-bench'], sets: 3, reps: '5–8 shifts', cues: ['Keep the surface stable.', 'Shift forward only through a comfortable shoulder angle.', 'Move back before the wrists feel overloaded.'] },
      { id: 'pike-push-up', title: 'Pike push-up', purpose: 'Build vertical pressing strength while both feet remain on the floor.', sets: 3, reps: '4–8', cues: ['Lift the hips into a pike.', 'Lower the head slightly ahead of the hands.', 'Press back towards the feet.'] },
      { id: 'elevated-pike-push-up', title: 'Feet-elevated pike push-up', purpose: 'Increase the share of bodyweight carried by the arms.', equipment: ['box-bench'], sets: 4, reps: '3–6', cues: ['Place the feet on a stable surface.', 'Keep the hips stacked as much as comfortable.', 'Use a small range before adding depth.'] },
      { id: 'wall-handstand-hold', title: 'Wall-supported handstand', purpose: 'Build confidence and straight-arm support while the wall provides balance.', equipment: ['wall'], sets: 3, hold: '15–30 sec', cues: ['Use a clear wall and uncluttered floor.', 'Press tall through the shoulders.', 'Step down well before fatigue affects control.'], caution: 'Only invert when you can enter and exit safely; use qualified help if unfamiliar.' },
      { id: 'partial-wall-hspu', title: 'Partial wall handstand push-up', purpose: 'Add a small controlled elbow bend in an organised wall handstand.', equipment: ['wall'], sets: 4, reps: '2–5', cues: ['Begin in a stable wall-supported position.', 'Lower only a few centimetres at first.', 'Keep enough energy to exit safely.'], caution: 'Do not practise alone if you cannot reliably exit the handstand.' },
      { id: 'wall-hspu', title: 'Wall handstand push-up', purpose: 'Build a full controlled vertical press with wall balance.', equipment: ['wall'], sets: 4, reps: '1–5', cues: ['Use a consistent hand position.', 'Lower under control without collapsing onto the head.', 'Stop before the exit becomes uncertain.'], caution: 'This advanced inverted press is best learned with qualified coaching.' },
      { id: 'handstand-push-up', title: 'Freestanding handstand push-up', purpose: 'Combine vertical pressing strength with freestanding balance.', sets: 4, reps: '1–3', cues: ['Attempt only with a reliable freestanding handstand.', 'Keep the lowering path controlled.', 'Use a safe, open practice area.'], caution: 'This is an advanced skill; use qualified coaching and a safe exit strategy.' },
    ],
  },
  {
    id: 'horizontal-pull', name: 'Horizontal pull', longName: 'Horizontal pull pathway', category: 'Strength', focus: 'Upper body', focusLabel: 'horizontal pulling strength', primaryGoal: 'bodyweight-row', symbol: 'R', tone: 'peach',
    description: 'Build rowing and straight-arm pulling strength towards a front lever.', destination: 'Front lever', goalIds: ['build-strength', 'bodyweight-row', 'front-lever'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'standing-band-row', title: 'Standing band row', purpose: 'Begin horizontal pulling with easily adjusted resistance.', equipment: ['resistance-band'], sets: 2, reps: '8–12', cues: ['Secure the band to a reliable anchor.', 'Draw the elbows back without leaning.', 'Return slowly until the arms are long.'], caution: 'Check the band and anchor before every set.' },
      { id: 'high-ring-row', title: 'High ring row', purpose: 'Use a nearly upright body angle to learn a connected row.', equipment: ['rings'], sets: 3, reps: '6–10', cues: ['Set the rings securely.', 'Keep the body in one line.', 'Pull the rings towards the ribs.'] },
      { id: 'incline-ring-row', title: 'Incline ring row', purpose: 'Increase bodyweight through a lower ring-row angle.', equipment: ['rings'], sets: 3, reps: '6–10', cues: ['Walk the feet forward gradually.', 'Keep hips and ribs connected.', 'Pause briefly with the rings near you.'] },
      { id: 'horizontal-ring-row', title: 'Horizontal ring row', purpose: 'Row a larger share of bodyweight with a long body line.', equipment: ['rings'], sets: 4, reps: '4–8', cues: ['Begin beneath secure rings.', 'Press the heels down.', 'Avoid leading with the chin.'] },
      { id: 'feet-elevated-row', title: 'Feet-elevated ring row', purpose: 'Increase horizontal pulling demand while keeping a familiar pattern.', equipment: ['rings', 'box-bench'], sets: 4, reps: '4–8', cues: ['Use a stable foot support.', 'Keep the pelvis level.', 'Finish each repetition before the shoulders roll forward.'] },
      { id: 'tuck-front-lever-hold', title: 'Tuck front-lever hold', purpose: 'Introduce straight-arm horizontal pulling with a short lever.', equipment: ['pull-up-bar'], sets: 4, hold: '5–12 sec', cues: ['Begin from active shoulders.', 'Tuck the knees closely.', 'Keep the hold brief enough to avoid swinging.'], caution: 'Build straight-arm shoulder strength gradually.' },
      { id: 'advanced-tuck-front-lever', title: 'Advanced tuck front lever', purpose: 'Lengthen the tuck while maintaining straight-arm control.', equipment: ['pull-up-bar'], sets: 4, hold: '4–10 sec', cues: ['Open the hips gradually.', 'Keep the shoulders active.', 'Return to a tighter tuck before the shape drops.'], caution: 'Avoid forcing the elbows or front of the shoulder.' },
      { id: 'front-lever', title: 'Front lever', purpose: 'Express advanced straight-arm pulling strength in a long horizontal shape.', equipment: ['pull-up-bar'], sets: 5, hold: '3–8 sec', cues: ['Attempt from active shoulders.', 'Lengthen the body without losing the horizontal line.', 'Use shorter lever shapes between attempts.'], caution: 'This is an advanced skill; qualified coaching is useful if you are unsure.' },
    ],
  },
];

const mobilityPathways: PathwaySeed[] = [
  {
    id: 'resting-squat', name: 'Resting squat', longName: 'Resting squat mobility pathway', category: 'Mobility', focus: 'Lower body', focusLabel: 'deep-squat mobility', primaryGoal: 'resting-squat', symbol: 'Q', tone: 'sage',
    description: 'Develop the ankle, hip and whole-body ease to rest comfortably in a deep squat.', destination: 'Comfortable resting squat', goalIds: ['move-comfortably', 'improve-mobility', 'natural-movement', 'resting-squat'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'supported-squat-sit', title: 'Supported squat sit', purpose: 'Explore a comfortable squat depth while the hands carry some weight.', equipment: ['chair'], sets: 3, hold: '15–30 sec', cues: ['Hold a stable support.', 'Let the knees and hips bend together.', 'Choose a depth where the heels feel supported.'] },
      { id: 'squat-ankle-rock', title: 'Supported squat ankle rock', purpose: 'Explore ankle movement inside a well-supported squat.', equipment: ['chair'], sets: 2, reps: '5–8 / side', cues: ['Keep both feet grounded.', 'Shift gently towards one ankle.', 'Use the hands to keep the movement easy.'] },
      { id: 'counterbalance-squat-hold', title: 'Counterbalance squat hold', purpose: 'Use the arms and a small counterbalance to settle lower with control.', equipment: ['chair'], sets: 3, hold: '20–40 sec', cues: ['Hold the support lightly in front of you.', 'Let the hips settle between the feet.', 'Keep breathing without chasing depth.'] },
      { id: 'free-deep-squat-hold', title: 'Free deep-squat hold', purpose: 'Stay in a deep squat without hand support for short calm holds.', sets: 3, hold: '15–30 sec', cues: ['Use the stance that suits your hips.', 'Keep pressure across the whole foot.', 'Stand before the position becomes a strain.'] },
      { id: 'resting-squat-breathing', title: 'Resting squat breathing', purpose: 'Build time and ease in a natural deep-squat rest.', sets: 2, hold: '45–90 sec', cues: ['Settle only as low as you can stay relaxed.', 'Let the spine and hips organise naturally.', 'Breathe slowly and change position whenever needed.'] },
    ],
  },
  {
    id: 'pike', name: 'Pike', longName: 'Pike and forward-fold pathway', category: 'Mobility', focus: 'Lower body', focusLabel: 'posterior-chain mobility', primaryGoal: 'pike', symbol: 'K', tone: 'sand',
    description: 'Develop a comfortable forward fold through gradual hamstring, hip and trunk control.', destination: 'Full pike / forward fold', goalIds: ['move-comfortably', 'improve-mobility', 'pike'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'supine-pike-reach', title: 'Supine leg reach', purpose: 'Explore hamstring range while the floor supports your back.', sets: 2, reps: '5–8 / side', cues: ['Lie comfortably with one leg lifted.', 'Hold behind the thigh rather than pulling the foot.', 'Straighten the knee only as far as breathing stays easy.'] },
      { id: 'bent-knee-forward-fold', title: 'Bent-knee forward fold', purpose: 'Fold comfortably while the knees soften the hamstring demand.', sets: 3, hold: '15–30 sec', cues: ['Bend the knees generously.', 'Fold from the hips without pulling down.', 'Rise slowly with support nearby.'] },
      { id: 'standing-pike', title: 'Standing pike', purpose: 'Explore a straighter-leg fold while remaining able to breathe.', sets: 3, hold: '15–30 sec', cues: ['Keep a small knee bend if needed.', 'Let the hands rest wherever they reach.', 'Avoid bouncing for the floor.'] },
      { id: 'long-sit-pike', title: 'Long-sit pike', purpose: 'Build a seated forward fold with both legs extended.', sets: 3, hold: '20–40 sec', cues: ['Sit on a folded support if the pelvis rolls back.', 'Reach forward from the hips.', 'Keep the knees as soft as needed.'] },
      { id: 'active-pike-fold', title: 'Active pike fold', purpose: 'Combine forward-fold range with active compression and control.', sets: 3, reps: '5–8 pulses', cues: ['Begin in a comfortable seated pike.', 'Lift the chest before reaching forward.', 'Use small active movements rather than pulling.'] },
      { id: 'full-pike-fold', title: 'Full pike / forward fold', purpose: 'Express a deep, controlled forward fold without force.', sets: 2, hold: '30–60 sec', cues: ['Lengthen through the legs.', 'Fold from the hips before relaxing deeper.', 'Keep breathing and leave the position slowly.'] },
    ],
  },
  {
    id: 'pancake', name: 'Pancake', longName: 'Pancake mobility pathway', category: 'Mobility', focus: 'Lower body', focusLabel: 'wide-leg hip mobility', primaryGoal: 'pancake', symbol: 'A', tone: 'peach',
    description: 'Build wide-leg sitting, hip control and forward-fold range towards a pancake.', destination: 'Full pancake', goalIds: ['improve-mobility', 'pancake', 'middle-split'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'supported-straddle-sit', title: 'Supported straddle sit', purpose: 'Find an upright wide-leg seat with as much elevation as needed.', equipment: ['chair'], sets: 2, hold: '20–40 sec', cues: ['Sit on a firm support if helpful.', 'Choose a width that lets you sit tall.', 'Keep the knees pointing comfortably upward.'] },
      { id: 'straddle-side-shift', title: 'Straddle side shift', purpose: 'Move gently from side to side while staying organised in the hips.', sets: 2, reps: '5–8 / side', cues: ['Keep both legs comfortably active.', 'Shift towards one side without collapsing.', 'Use the hands on the floor for support.'] },
      { id: 'supported-pancake-fold', title: 'Supported pancake fold', purpose: 'Introduce a forward fold with the hands or a chair carrying some weight.', equipment: ['chair'], sets: 3, hold: '20–40 sec', cues: ['Set the legs at a manageable width.', 'Reach forward to stable support.', 'Keep the fold calm enough to breathe.'] },
      { id: 'active-straddle-fold', title: 'Active straddle fold', purpose: 'Build strength while moving into the pancake range.', sets: 3, reps: '5–8', cues: ['Sit tall before each repetition.', 'Tip forward a small distance without using momentum.', 'Return using the hips and trunk.'] },
      { id: 'forearm-pancake', title: 'Forearm pancake', purpose: 'Sustain a deeper wide-leg fold with controlled breathing.', sets: 3, hold: '20–45 sec', cues: ['Let the forearms approach support without forcing them down.', 'Keep the legs gently active.', 'Come out if the inner thighs feel sharp.'] },
      { id: 'full-pancake', title: 'Full pancake', purpose: 'Express a deep wide-leg forward fold with control and ease.', sets: 2, hold: '30–60 sec', cues: ['Reach long through the trunk.', 'Keep the kneecaps comfortably upward.', 'Use active control before relaxing into range.'] },
    ],
  },
  {
    id: 'front-split', name: 'Front split', longName: 'Front split mobility pathway', category: 'Mobility', focus: 'Lower body', focusLabel: 'front-back split mobility', primaryGoal: 'front-split', symbol: 'F', tone: 'sage',
    description: 'Develop hip-flexor and hamstring range on both sides towards a supported, controlled front split.', destination: 'Front split', goalIds: ['improve-mobility', 'front-split'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'half-kneeling-hip-reach', title: 'Half-kneeling hip reach', purpose: 'Explore the back-leg hip position with generous support.', equipment: ['chair'], sets: 2, hold: '20–30 sec / side', cues: ['Use padding under the knee.', 'Hold a chair for balance.', 'Shift forward without forcing the lower back.'] },
      { id: 'half-split-hamstring', title: 'Half-split hamstring fold', purpose: 'Explore front-leg length from a supported kneeling position.', equipment: ['chair'], sets: 2, hold: '20–30 sec / side', cues: ['Send the hips back over the rear knee.', 'Straighten the front leg only as comfortable.', 'Keep the spine long rather than pulling down.'] },
      { id: 'long-lunge-hold', title: 'Long lunge hold', purpose: 'Combine front and back leg positions in a stable split stance.', equipment: ['chair'], sets: 3, hold: '20–40 sec / side', cues: ['Use hand support.', 'Keep both sides of the pelvis facing forward.', 'Choose a stance you can leave easily.'] },
      { id: 'high-supported-front-split', title: 'High supported front split', purpose: 'Introduce the split shape while support limits the depth.', equipment: ['chair'], sets: 3, hold: '15–30 sec / side', cues: ['Keep both hands supported.', 'Slide the feet apart gradually.', 'Stop well before the position becomes difficult to exit.'] },
      { id: 'low-supported-front-split', title: 'Low supported front split', purpose: 'Move closer to the floor while maintaining square, controlled hips.', equipment: ['chair'], sets: 3, hold: '20–40 sec / side', cues: ['Use blocks or a chair for generous support.', 'Keep the front knee comfortably straight.', 'Reduce depth if the pelvis turns.'] },
      { id: 'front-split', title: 'Front split', purpose: 'Express a full front split with control on both sides.', sets: 2, hold: '20–45 sec / side', cues: ['Enter gradually with support within reach.', 'Keep the hips as square as your anatomy allows comfortably.', 'Exit using the hands rather than pulling suddenly.'], caution: 'Never force or bounce into a split; sharp hamstring or groin pain is a stop signal.' },
    ],
  },
  {
    id: 'middle-split', name: 'Middle split', longName: 'Middle split mobility pathway', category: 'Mobility', focus: 'Lower body', focusLabel: 'side-to-side hip mobility', primaryGoal: 'middle-split', symbol: 'M', tone: 'sand',
    description: 'Develop side-to-side hip range and control towards a supported middle split.', destination: 'Middle split', goalIds: ['improve-mobility', 'middle-split', 'pancake'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'wide-squat-shift', title: 'Wide squat shift', purpose: 'Explore side-to-side hip movement with both feet grounded.', equipment: ['chair'], sets: 2, reps: '5–8 / side', cues: ['Use a chair for balance.', 'Shift towards one knee while the other leg lengthens.', 'Keep both feet comfortably grounded.'] },
      { id: 'frog-rock', title: 'Supported frog rock', purpose: 'Explore inner-thigh range from a stable hands-and-knees position.', sets: 2, reps: '6–10', cues: ['Use comfortable padding.', 'Set the knees only as wide as feels manageable.', 'Rock back a small distance without forcing.'] },
      { id: 'standing-straddle-shift', title: 'Standing straddle shift', purpose: 'Build control in a wider standing position.', equipment: ['chair'], sets: 3, reps: '5–8 / side', cues: ['Hold stable support.', 'Keep the toes in a comfortable direction.', 'Move slowly from one side to the other.'] },
      { id: 'half-middle-split', title: 'Half middle split', purpose: 'Lengthen one inner thigh at a time from a supported kneeling position.', equipment: ['chair'], sets: 3, hold: '20–35 sec / side', cues: ['Use padding for the kneeling leg.', 'Extend the other leg to the side.', 'Keep the hands supported and breathing easy.'] },
      { id: 'high-supported-middle-split', title: 'High supported middle split', purpose: 'Explore the complete shape while hands and a higher hip position reduce load.', equipment: ['chair'], sets: 3, hold: '15–30 sec', cues: ['Use stable support in front of you.', 'Widen the feet gradually.', 'Keep enough muscular effort to leave the position.'] },
      { id: 'middle-split', title: 'Middle split', purpose: 'Express a deep side split with active control and support nearby.', sets: 2, hold: '20–45 sec', cues: ['Enter slowly on a surface with predictable friction.', 'Keep support within reach.', 'Exit before the inner thighs become fatigued.'], caution: 'Do not force or slide suddenly into the position.' },
    ],
  },
  {
    id: 'bridge', name: 'Bridge', longName: 'Bridge mobility pathway', category: 'Mobility', focus: 'Whole body', focusLabel: 'whole-body extension mobility', primaryGoal: 'bridge', symbol: 'B', tone: 'peach',
    description: 'Develop hip, spine and shoulder extension gradually towards a strong, comfortable bridge.', destination: 'Full bridge expression', goalIds: ['improve-mobility', 'bridge', 'handstand-push-up'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'bridge-overhead-reach', title: 'Supine overhead reach', purpose: 'Explore shoulder flexion while the ribs and back are supported.', sets: 2, reps: '5–8', cues: ['Lie with knees bent.', 'Reach the arms overhead only as far as comfortable.', 'Keep breathing instead of pressing the hands down.'] },
      { id: 'mobility-glute-bridge', title: 'Glute bridge', purpose: 'Build comfortable hip extension before adding spinal or shoulder demand.', sets: 3, reps: '6–10', cues: ['Press evenly through both feet.', 'Lift the hips without forcing the back.', 'Lower slowly.'] },
      { id: 'reverse-tabletop', title: 'Reverse tabletop', purpose: 'Combine hip extension with supported shoulder extension.', sets: 3, hold: '10–20 sec', cues: ['Place the hands at a comfortable angle.', 'Lift the chest and hips together.', 'Stop if the front of the shoulder feels pinched.'] },
      { id: 'elevated-bridge', title: 'Elevated bridge', purpose: 'Practise the bridge shape with the hands on a raised stable surface.', equipment: ['box-bench'], sets: 3, hold: '10–20 sec', cues: ['Use a surface that cannot slide.', 'Place the hands comfortably.', 'Press through feet and hands without forcing height.'], caution: 'Use a stable setup and avoid compressing the neck.' },
      { id: 'wall-bridge-reach', title: 'Wall bridge reach', purpose: 'Explore a deeper arch while the wall provides a clear, limited target.', equipment: ['wall'], sets: 3, reps: '3–5 reaches', cues: ['Stand close enough that the wall is easy to reach.', 'Reach back one hand at a time.', 'Return before balance or breathing changes.'], caution: 'Do not walk far down the wall unless the exit is completely familiar.' },
      { id: 'floor-bridge', title: 'Floor bridge', purpose: 'Press into a full bridge from the floor with controlled entry and exit.', sets: 3, hold: '8–20 sec', cues: ['Set the hands and feet before lifting.', 'Press evenly rather than forcing the lower back.', 'Lower with control and keep the neck free.'], caution: 'Use qualified help if you are unsure about entering or leaving the position.' },
      { id: 'full-bridge-expression', title: 'Full bridge expression', purpose: 'Develop a strong bridge with more even extension through hips, spine and shoulders.', sets: 3, hold: '15–30 sec', cues: ['Press the chest through the arms gradually.', 'Share the curve across the whole body.', 'Keep the effort steady rather than chasing a visual shape.'], caution: 'A bridge should not create sharp wrist, shoulder, neck or back pain.' },
    ],
  },
  {
    id: 'german-hang', name: 'German hang', longName: 'Shoulder-extension and German-hang pathway', category: 'Mobility', focus: 'Upper body', focusLabel: 'shoulder-extension mobility', primaryGoal: 'german-hang', symbol: 'G', tone: 'sage',
    description: 'Develop shoulder extension gradually from floor-supported positions towards a controlled German hang.', destination: 'Controlled German hang', goalIds: ['improve-mobility', 'german-hang', 'front-lever'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'hands-behind-reach', title: 'Hands-behind reach', purpose: 'Explore gentle shoulder extension while standing upright.', sets: 2, reps: '5–8', cues: ['Clasp the hands or hold a strap behind you.', 'Move the hands away only slightly.', 'Keep the chest relaxed and neck free.'] },
      { id: 'seated-shoulder-extension', title: 'Seated shoulder-extension support', purpose: 'Use the floor to control how much weight enters the arms behind you.', sets: 3, hold: '10–20 sec', cues: ['Sit with hands behind you.', 'Walk the hands back only as comfortable.', 'Keep most of the weight through the legs.'] },
      { id: 'band-shoulder-circle', title: 'Wide band shoulder circle', purpose: 'Move through a broad overhead arc with adjustable hand width.', equipment: ['resistance-band'], sets: 2, reps: '5–8', cues: ['Use a very wide grip.', 'Keep the band slack enough to move smoothly.', 'Do not force past a sticking point.'] },
      { id: 'feet-supported-ring-turn', title: 'Feet-supported ring turn', purpose: 'Introduce the turning path while the feet keep almost all bodyweight supported.', equipment: ['rings'], sets: 3, reps: '3–5', cues: ['Set the rings low and secure.', 'Keep the feet firmly grounded.', 'Turn only through a range you can reverse easily.'], caution: 'Do not let the shoulders carry full bodyweight.' },
      { id: 'tuck-inversion-prep', title: 'Tuck inversion preparation', purpose: 'Build confidence moving into a tucked inverted position on secure rings.', equipment: ['rings'], sets: 3, reps: '2–4', cues: ['Use low rings and a spotter if needed.', 'Keep the knees tucked.', 'Return before grip or orientation feels uncertain.'], caution: 'Only invert with a secure setup and a reliable exit.' },
      { id: 'feet-supported-german-hang', title: 'Feet-supported German hang', purpose: 'Explore the German-hang shoulder position while the feet remain supported.', equipment: ['rings'], sets: 3, hold: '5–15 sec', cues: ['Keep the rings low enough for foot support.', 'Let the feet control almost all depth.', 'Use a very small shoulder range at first.'], caution: 'Do not drop into shoulder extension or continue through pain.' },
      { id: 'german-hang', title: 'Controlled German hang', purpose: 'Express advanced shoulder extension with a calm entry and exit.', equipment: ['rings'], sets: 3, hold: '5–15 sec', cues: ['Enter through a controlled tuck inversion.', 'Keep the shoulders active rather than hanging passively.', 'Reverse the movement before grip or shoulder control fades.'], caution: 'This advanced position can heavily load the shoulders and biceps; use qualified coaching if unfamiliar.' },
    ],
  },
  {
    id: 'rotation', name: 'Rotation', longName: 'Whole-body rotation pathway', category: 'Mobility', focus: 'Whole body', focusLabel: 'whole-body rotational mobility', primaryGoal: 'rotation', symbol: 'T', tone: 'sand',
    description: 'Develop comfortable turning through the hips, trunk and shoulders without forcing one area.', destination: 'Integrated whole-body rotation', goalIds: ['move-comfortably', 'improve-mobility', 'natural-movement', 'rotation'], assessmentLevels: [0, 2, 4],
    steps: [
      { id: 'supine-knee-roll', title: 'Supine knee roll', purpose: 'Begin rotation with the floor supporting the trunk.', sets: 2, reps: '5–8 / side', cues: ['Lie with knees bent and feet grounded.', 'Let both knees move a comfortable distance.', 'Keep the shoulders relaxed.'] },
      { id: 'open-book-rotation', title: 'Open-book rotation', purpose: 'Explore upper-body turning from a stable side-lying position.', sets: 2, reps: '5–8 / side', cues: ['Lie on one side with knees supported.', 'Open the top arm and chest slowly.', 'Follow the hand without forcing the neck.'] },
      { id: 'seated-rotation', title: 'Seated rotation', purpose: 'Build upright trunk rotation with the pelvis supported.', equipment: ['chair'], sets: 3, reps: '5–8 / side', cues: ['Sit tall with both feet grounded.', 'Turn from the ribs and chest.', 'Keep the movement smooth rather than pulling with the arms.'] },
      { id: 'half-kneeling-rotation', title: 'Half-kneeling rotation', purpose: 'Connect hip stability with controlled trunk turning.', sets: 3, reps: '5–8 / side', cues: ['Use padding under the knee.', 'Keep the pelvis facing forward.', 'Turn through the range where balance stays easy.'] },
      { id: 'split-stance-rotation', title: 'Split-stance rotation', purpose: 'Integrate the feet, hips and trunk in a standing turn.', sets: 3, reps: '5–8 / side', cues: ['Use a comfortable staggered stance.', 'Let the back heel turn naturally if needed.', 'Return to centre without rushing.'] },
      { id: 'standing-rotation-flow', title: 'Standing rotation flow', purpose: 'Move continuously through comfortable whole-body rotation.', sets: 3, reps: '6–10 / side', cues: ['Let the feet and hips participate.', 'Keep the arms relaxed.', 'Turn only as far as the movement remains smooth.'] },
    ],
  },
];

export const expandedPathways: Pathway[] = [...strengthPathways, ...mobilityPathways].map(buildPathway);
