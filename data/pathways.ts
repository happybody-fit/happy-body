import type { Pathway } from '@/lib/types';

export const pathways: Pathway[] = [
  {
    id: 'squat',
    name: 'Squat',
    longName: 'Squat pathway',
    category: 'Strength',
    symbol: 'S',
    tone: 'sage',
    description: 'Build leg strength, balance and comfortable depth for everyday movement.',
    destination: 'Pistol squat',
    levels: [
      {
        id: 'squat-supported',
        title: 'Supported squat',
        description: 'Use a stable support to explore a comfortable range with control.',
        milestone: 'Sit back and stand smoothly with light hand support.',
        exercises: [
          {
            id: 'chair-squat',
            title: 'Chair squat',
            purpose: 'Build confidence and leg strength through a familiar range.',
            prescription: '2 sets · 6–10 slow reps',
            metric: 'reps',
            instructions: ['Place a sturdy chair behind you.', 'Send your hips back and lightly touch the seat.', 'Press through your whole foot to stand tall.'],
            videoId: 'qgugh6l0zeU',
          },
          {
            id: 'supported-squat-hold',
            title: 'Supported squat hold',
            purpose: 'Explore calm breathing and ease near your comfortable depth.',
            prescription: '3 holds · 15–30 seconds',
            metric: 'seconds',
            instructions: ['Hold a door frame or sturdy post.', 'Lower only as far as feels steady.', 'Breathe slowly and keep both heels grounded.'],
            videoId: 'qgugh6l0zeU',
          },
        ],
      },
      {
        id: 'squat-bodyweight',
        title: 'Bodyweight squat',
        description: 'Squat without hand support while keeping balance and an even tempo.',
        milestone: 'Complete 10 controlled squats to a comfortable depth.',
        exercises: [
          {
            id: 'tempo-squat',
            title: 'Tempo squat',
            purpose: 'Develop control and awareness through the full movement.',
            prescription: '3 sets · 5 reps at 3-second lowering',
            metric: 'reps',
            instructions: ['Stand in your natural squat stance.', 'Lower for three quiet counts.', 'Pause briefly, then stand without rushing.'],
            videoId: 'qgugh6l0zeU',
          },
        ],
      },
      {
        id: 'squat-single-leg',
        title: 'Single-leg preparation',
        description: 'Build the balance and strength needed to control one leg at a time.',
        milestone: 'Complete 6 controlled assisted single-leg squats per side.',
        exercises: [
          {
            id: 'assisted-pistol',
            title: 'Assisted pistol squat',
            purpose: 'Practise single-leg control with just enough support.',
            prescription: '3 sets · 3–6 reps each side',
            metric: 'reps',
            instructions: ['Hold a stable support lightly.', 'Reach the free leg forward as you lower.', 'Use the working leg as much as you comfortably can.'],
            videoId: 'qgugh6l0zeU',
          },
        ],
      },
      {
        id: 'squat-pistol',
        title: 'Pistol squat',
        description: 'A full-depth single-leg squat with balance, strength and control.',
        milestone: 'Complete a smooth pistol squat on each side.',
        exercises: [
          {
            id: 'pistol-squat',
            title: 'Pistol squat practice',
            purpose: 'Refine range, balance and single-leg strength.',
            prescription: '4 sets · 1–3 quality reps each side',
            metric: 'reps',
            instructions: ['Begin tall on one foot.', 'Reach the other leg forward as you descend.', 'Stand with control and stop before form changes.'],
            videoId: 'qgugh6l0zeU',
          },
        ],
      },
    ],
    assessment: [
      { id: 'squat-test-1', title: 'Chair sit-to-stand', instruction: 'From a firm chair, stand up and sit down five times without using your hands if possible.', passCriteria: 'Five smooth repetitions without pain or loss of balance.', levelIndex: 1 },
      { id: 'squat-test-2', title: 'Comfortable bodyweight squat', instruction: 'Perform five unassisted squats to the depth that feels natural today.', passCriteria: 'Heels stay grounded and every repetition feels controlled.', levelIndex: 2 },
      { id: 'squat-test-3', title: 'Assisted single-leg squat', instruction: 'Lightly hold a stable support and try three shallow single-leg squats per side.', passCriteria: 'Both sides feel steady with no sharp pain.', levelIndex: 3 },
    ],
  },
  {
    id: 'push-up',
    name: 'Push-up',
    longName: 'Horizontal push pathway',
    category: 'Strength',
    symbol: 'P',
    tone: 'peach',
    description: 'Build whole-body pushing strength from the wall towards the floor and beyond.',
    destination: 'Planche',
    levels: [
      {
        id: 'push-wall',
        title: 'Wall push-up',
        description: 'Learn the pushing shape with a gentle, upright starting point.',
        milestone: 'Complete 12 smooth wall push-ups.',
        exercises: [
          { id: 'wall-push-up', title: 'Wall push-up', purpose: 'Build a confident pushing pattern with low load.', prescription: '2 sets · 8–12 reps', metric: 'reps', instructions: ['Place your hands just below shoulder height.', 'Move your body as one line towards the wall.', 'Press the wall away without shrugging.'], videoId: 'J2vaGZ7wSco' },
        ],
      },
      {
        id: 'push-incline',
        title: 'Incline push-up',
        description: 'Use a sturdy raised surface to increase the challenge gradually.',
        milestone: 'Complete 10 controlled reps at waist height.',
        exercises: [
          { id: 'incline-push-up', title: 'Incline push-up', purpose: 'Strengthen your chest, arms and connected body line.', prescription: '3 sets · 5–10 reps', metric: 'reps', instructions: ['Choose a stable surface that feels manageable.', 'Keep ribs and hips connected as you lower.', 'Touch the surface softly, then press away.'], videoId: 'J2vaGZ7wSco' },
          { id: 'incline-plank', title: 'Incline plank', purpose: 'Build the whole-body tension that supports a push-up.', prescription: '3 holds · 20–40 seconds', metric: 'seconds', instructions: ['Place hands on a stable surface.', 'Step back until your body forms one long line.', 'Breathe while gently pressing the surface away.'], videoId: 'J2vaGZ7wSco' },
        ],
      },
      {
        id: 'push-floor',
        title: 'Floor push-up',
        description: 'A full push-up with a connected trunk and comfortable shoulder control.',
        milestone: 'Complete 8 calm floor push-ups.',
        exercises: [
          { id: 'floor-push-up', title: 'Floor push-up', purpose: 'Build full horizontal pushing strength.', prescription: '4 sets · 3–8 quality reps', metric: 'reps', instructions: ['Begin in a strong plank.', 'Lower with elbows angled gently back.', 'Press the floor away while keeping your body connected.'], videoId: 'J2vaGZ7wSco' },
        ],
      },
      {
        id: 'push-planche',
        title: 'Planche preparation',
        description: 'Shift more bodyweight into the hands while building straight-arm strength.',
        milestone: 'Hold a controlled tuck planche progression.',
        exercises: [
          { id: 'planche-lean', title: 'Planche lean', purpose: 'Prepare wrists, shoulders and trunk for advanced pushing.', prescription: '4 holds · 8–15 seconds', metric: 'seconds', instructions: ['Start in a high plank with fingers spread.', 'Keep elbows straight and lean forward slightly.', 'Stop while the position still feels strong and pain-free.'], videoId: 'J2vaGZ7wSco' },
        ],
      },
    ],
    assessment: [
      { id: 'push-test-1', title: 'Wall push-up', instruction: 'Try ten wall push-ups with your body moving as one line.', passCriteria: 'Ten comfortable reps without shoulder or wrist pain.', levelIndex: 1 },
      { id: 'push-test-2', title: 'Incline push-up', instruction: 'Using a stable waist-high surface, try five controlled push-ups.', passCriteria: 'Five reps with a connected body line and no straining.', levelIndex: 2 },
      { id: 'push-test-3', title: 'Floor push-up', instruction: 'From the floor, try up to five full push-ups.', passCriteria: 'At least three smooth reps through your comfortable range.', levelIndex: 3 },
    ],
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
    longName: 'Vertical pull pathway',
    category: 'Strength',
    symbol: 'U',
    tone: 'sand',
    description: 'Develop grip, shoulder control and pulling strength towards a confident pull-up.',
    destination: 'One-arm pull-up',
    levels: [
      {
        id: 'pull-supported',
        title: 'Supported hang',
        description: 'Let your feet share the load while your hands and shoulders learn the position.',
        milestone: 'Hold a comfortable supported hang for 30 seconds.',
        exercises: [
          { id: 'supported-hang', title: 'Feet-supported hang', purpose: 'Introduce grip and overhead comfort with adjustable load.', prescription: '3 holds · 15–30 seconds', metric: 'seconds', instructions: ['Use a low bar or keep feet on a box.', 'Let your hands carry only a comfortable amount.', 'Keep breathing and step down before grip fails.'], videoId: 'B_VkNQS5YLs' },
        ],
      },
      {
        id: 'pull-active',
        title: 'Active hang',
        description: 'Build grip and learn to move the shoulder blades with straight arms.',
        milestone: 'Hold for 20 seconds and complete 5 scapular pulls.',
        exercises: [
          { id: 'active-hang', title: 'Active hang', purpose: 'Build overhead confidence and shoulder-blade control.', prescription: '3 holds · 10–20 seconds', metric: 'seconds', instructions: ['Hang with a secure grip and optional foot support.', 'Gently draw shoulders away from your ears.', 'Keep elbows straight and avoid forcing range.'], videoId: 'B_VkNQS5YLs' },
          { id: 'scapular-pull', title: 'Scapular pull', purpose: 'Practise the first part of a strong pull-up.', prescription: '3 sets · 3–6 reps', metric: 'reps', instructions: ['Begin in a comfortable hang.', 'With straight arms, draw your chest slightly upward.', 'Lower slowly back to a relaxed shoulder position.'], videoId: 'B_VkNQS5YLs' },
        ],
      },
      {
        id: 'pull-assisted',
        title: 'Band-assisted pull-up',
        description: 'Use assistance to practise a smooth, full pulling path.',
        milestone: 'Complete 5 controlled assisted pull-ups.',
        exercises: [
          { id: 'band-pull-up', title: 'Band-assisted pull-up', purpose: 'Build pulling strength through a full range.', prescription: '4 sets · 3–6 reps', metric: 'reps', instructions: ['Secure a band over the bar and step in carefully.', 'Begin from an active shoulder position.', 'Pull smoothly, pause, then lower with control.'], videoId: 'B_VkNQS5YLs' },
        ],
      },
      {
        id: 'pull-full',
        title: 'Pull-up',
        description: 'A controlled pull from a dead hang to chin over the bar.',
        milestone: 'Complete a smooth unassisted pull-up.',
        exercises: [
          { id: 'full-pull-up', title: 'Pull-up practice', purpose: 'Develop complete vertical pulling strength.', prescription: '5 sets · 1–4 quality reps', metric: 'reps', instructions: ['Begin from a quiet hang.', 'Drive elbows down as your chest rises.', 'Lower under control to finish each repetition.'], videoId: 'B_VkNQS5YLs' },
        ],
      },
    ],
    assessment: [
      { id: 'pull-test-1', title: 'Supported hang', instruction: 'Hold a secure bar with your feet taking as much weight as needed.', passCriteria: 'Twenty seconds feels comfortable for hands and shoulders.', levelIndex: 1 },
      { id: 'pull-test-2', title: 'Active hang', instruction: 'With straight arms, gently draw your shoulders down and hold.', passCriteria: 'A steady 10-second active hang without pain.', levelIndex: 2 },
      { id: 'pull-test-3', title: 'Assisted pull-up', instruction: 'Using a suitable band or foot support, try three slow pull-ups.', passCriteria: 'Three controlled reps without swinging or straining.', levelIndex: 3 },
    ],
  },
];

export const pathwayById = Object.fromEntries(pathways.map((pathway) => [pathway.id, pathway])) as Record<Pathway['id'], Pathway>;
