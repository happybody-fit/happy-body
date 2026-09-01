export type ExerciseVideoSource = {
  videoId: string;
  status: 'placeholder' | 'approved';
  sourceLabel: string;
  watchUrl: string;
};

type ExerciseVideoSeed = readonly [videoId: string, sourceLabel: string];

/**
 * Temporary public demonstrations for every movement in the MVP pathways.
 * Keep this catalog separate from pathway content so each source can be
 * replaced by a Happy Body recording without changing any screen code.
 */
const exerciseVideoSeeds: Record<string, ExerciseVideoSeed> = {
  // Squat strength
  'supported-sit-to-stand': ['ITv-_BkcrD0', 'Baptist Health'],
  'chair-squat': ['rvpC9QkTc3Y', 'Margaret Martin, Physical Therapist'],
  'supported-deep-squat': ['IHApHfNA2Ag', 'Hinge Health'],
  'bodyweight-squat': ['P-yaD24bUE8', 'Runna'],
  'tempo-squat': ['mmb618X9Ieg', 'Barbell Logic'],
  'assisted-single-leg-squat': ['0CodCXxgMk4', 'Hinge Health'],
  'box-pistol-squat': ['kc4YfSHjbYE', 'Buff Dudes'],
  'assisted-pistol-squat': ['vq5-vdgJc0I', 'Squat University'],
  'pistol-squat': ['vq5-vdgJc0I', 'Squat University'],

  // Knee-flexion strength
  'heel-dig-hold': ['5zFwQVgaCLk', 'The Doctors of Physical Therapy'],
  'bridge-walkout': ['uI-PO2QNqiE', 'Total Physical Therapy'],
  'sliding-leg-curl': ['AlTI3igOaLw', 'Exercise Tutorial'],
  'assisted-nordic-lower': ['_e9vFU9-tkc', 'E3 Rehab'],
  'elevated-nordic-lower': ['_e9vFU9-tkc', 'E3 Rehab'],
  'nordic-negative': ['_e9vFU9-tkc', 'E3 Rehab'],
  'nordic-curl': ['_e9vFU9-tkc', 'E3 Rehab'],

  // Hip hinge strength
  'hip-heel-dig-bridge': ['5zFwQVgaCLk', 'The Doctors of Physical Therapy'],
  'hip-bridge-hold': ['PhTDzR0TpZs', 'Hinge Health'],
  'hip-single-leg-bridge': ['yFNjwkUNIao', 'Performance Revolution'],
  'wall-hip-hinge': ['2W_gXhut5S8', 'Hinge Health'],
  'bodyweight-good-morning': ['tuG3-YnLbZc', 'Body Enhancing Fitness'],
  'supported-single-leg-hinge': ['guHaRW3Udxk', 'London Back Pain Clinic'],
  'single-leg-hip-hinge': ['uWXXmU1UyHY', 'The Doctors of Physical Therapy'],

  // Core strength
  'core-march': ['9ZRHPCwMmtQ', 'Release Physical Therapy'],
  'dead-bug': ['GbSC02oU3To', 'Hinge Health'],
  'tuck-hollow-hold': ['uZqTUwq96iU', 'FitnessFAQs'],
  'hollow-body-hold': ['uZqTUwq96iU', 'FitnessFAQs'],
  'reverse-curl': ['Jttw-t-S-r4', 'HealthFit Physical Therapy'],
  'candlestick-lower': ['T_X5rb3G5lk', 'Renaissance Periodization'],
  'tuck-dragon-flag': ['Kz6e7J9UHKg', 'Moving Athlete'],
  'dragon-flag': ['pvz7k5gO-DE', 'FitnessFAQs'],

  // Horizontal push strength
  'wall-push-up': ['wIPJvBQs7RA', 'Hinge Health'],
  'high-incline-push-up': ['cfns5VDVVvk', 'Train With Adby'],
  'low-incline-push-up': ['cfns5VDVVvk', 'Train With Adby'],
  'knee-push-up': ['lFR1GWy1Dcs', 'Dr. Carl Baird'],
  'negative-floor-push-up': ['vyOLKo7PizM', 'Calixpert'],
  'floor-push-up': ['IODxDxX7oi4', 'Calisthenicmovement'],
  'close-grip-push-up': ['2eUBTgqK5Ng', 'Train With Adby'],
  'pseudo-planche-push-up': ['TZ63httkob4', 'FitnessFAQs'],
  'planche-lean': ['wKV5zVJTYBo', 'Vitality'],
  'tuck-planche-prep': ['pUVpyfjgg5I', 'Vitality'],

  // Vertical push strength
  'incline-pike-hold': ['fXgou2W10ok', 'The Bodyweight Process'],
  'pike-shoulder-tap': ['kkLV_X8K5G4', 'Lance Goyke'],
  'pike-push-up': ['lIZ_C4VJnmc', 'Chris Calisthenics'],
  'elevated-pike-push-up': ['8URA3YSur2M', 'Tom Peto Training'],
  'wall-handstand-hold': ['mVDE6S-ZvRI', 'Urbacise'],
  'partial-wall-hspu': ['2fY3DHUZLOs', 'FitnessFAQs'],
  'wall-hspu': ['2fY3DHUZLOs', 'FitnessFAQs'],
  'handstand-push-up': ['CeBXMRsTR3w', 'CrossFit Invictus'],

  // Horizontal pull strength
  'standing-band-row': ['WkNuYbWZ8g8', 'Whats Up Dude'],
  'high-ring-row': ['iGzfuXd85R0', 'Antranik Kizirian'],
  'incline-ring-row': ['iGzfuXd85R0', 'Antranik Kizirian'],
  'horizontal-ring-row': ['iGzfuXd85R0', 'Antranik Kizirian'],
  'feet-elevated-row': ['5W8F6MzZ8Rk', 'Andrew Alinda'],
  'tuck-front-lever-hold': ['AGhb8V8M758', 'FitnessFAQs'],
  'advanced-tuck-front-lever': ['AGhb8V8M758', 'FitnessFAQs'],
  'front-lever': ['AGhb8V8M758', 'FitnessFAQs'],

  // Vertical pull strength
  'feet-supported-hang': ['XfqeLAfQuj4', 'Higher Ground Performance'],
  'supported-active-hang': ['ShkBXOGK7A8', 'FitnessFAQs'],
  'active-hang': ['ShkBXOGK7A8', 'FitnessFAQs'],
  'scapular-pull': ['-ZIpSoTRsuE', 'Zack Henderson'],
  'band-assisted-pull-up': ['Dx6DNiOklZI', 'Clench Fitness'],
  'negative-pull-up': ['gbPURTSxQLY', 'Bodybuilding.com'],
  'full-pull-up': ['eGo4IYlbE5g', 'Calisthenicmovement'],
  'multiple-controlled-pull-ups': ['eGo4IYlbE5g', 'Calisthenicmovement'],
  'archer-pull-up': ['_LGLKUiQH5k', 'Pullup & Dip'],
  'assisted-one-arm-pull-up': ['mTJHClMQPM8', 'FitnessFAQs'],
  'one-arm-pull-up': ['mTJHClMQPM8', 'FitnessFAQs'],

  // Resting-squat mobility
  'supported-squat-sit': ['uQbUORRwzqk', 'Get Strong with Emily'],
  'squat-ankle-rock': ['oya7G1djWyQ', 'Upright Health'],
  'counterbalance-squat-hold': ['8xqbsBlQ0DM', 'Functional AF'],
  'free-deep-squat-hold': ['965Fwq2aVIo', 'Strength Side'],
  'resting-squat-breathing': ['965Fwq2aVIo', 'Strength Side'],

  // Pike mobility
  'supine-pike-reach': ['RCtMzDjL_Bo', 'Strength Side'],
  'bent-knee-forward-fold': ['sEBFsU_CnNw', 'Body By Yoga'],
  'standing-pike': ['sEBFsU_CnNw', 'Body By Yoga'],
  'long-sit-pike': ['xYXWEONqBLU', 'STRETCHIT'],
  'active-pike-fold': ['yQXnOuQqKYc', 'Antranik Kizirian'],
  'full-pike-fold': ['HhEqFa9lT80', 'Tom Merrick'],

  // Pancake mobility
  'supported-straddle-sit': ['Zi3hKf_M_Ds', 'The Coach Danny B'],
  'straddle-side-shift': ['xRlMDBUYKL0', 'Dane Larsen Exercise Physiologist'],
  'supported-pancake-fold': ['CHRUb43S6RM', 'Strength Side'],
  'active-straddle-fold': ['CHRUb43S6RM', 'Strength Side'],
  'forearm-pancake': ['brynxf5TIYk', 'Tom Merrick'],
  'full-pancake': ['brynxf5TIYk', 'Tom Merrick'],

  // Front-split mobility
  'half-kneeling-hip-reach': ['gqoPYLUgP48', '[P]rehab'],
  'half-split-hamstring': ['OrvJeFkmDs0', 'Dani Winks Flexibility'],
  'long-lunge-hold': ['gqoPYLUgP48', '[P]rehab'],
  'high-supported-front-split': ['m_XEo-iecCs', 'Tom Merrick'],
  'low-supported-front-split': ['m_XEo-iecCs', 'Tom Merrick'],
  'front-split': ['m_XEo-iecCs', 'Tom Merrick'],

  // Middle-split mobility
  'wide-squat-shift': ['OrqoHGCKz3E', 'Tom Merrick'],
  'frog-rock': ['OrqoHGCKz3E', 'Tom Merrick'],
  'standing-straddle-shift': ['OrqoHGCKz3E', 'Tom Merrick'],
  'half-middle-split': ['OrqoHGCKz3E', 'Tom Merrick'],
  'high-supported-middle-split': ['OrqoHGCKz3E', 'Tom Merrick'],
  'middle-split': ['OrqoHGCKz3E', 'Tom Merrick'],

  // Bridge mobility
  'bridge-overhead-reach': ['ZaCTrGTxyGw', 'Bridge mobility tutorial'],
  'mobility-glute-bridge': ['PhTDzR0TpZs', 'Hinge Health'],
  'reverse-tabletop': ['tSvmWU-0Zo0', 'FitnessFAQs'],
  'elevated-bridge': ['tSvmWU-0Zo0', 'FitnessFAQs'],
  'wall-bridge-reach': ['tSvmWU-0Zo0', 'FitnessFAQs'],
  'floor-bridge': ['tSvmWU-0Zo0', 'FitnessFAQs'],
  'full-bridge-expression': ['tSvmWU-0Zo0', 'FitnessFAQs'],

  // German-hang mobility
  'hands-behind-reach': ['P-tLnJuAbuY', 'Horton Barbell'],
  'seated-shoulder-extension': ['P-tLnJuAbuY', 'Horton Barbell'],
  'band-shoulder-circle': ['P-tLnJuAbuY', 'Horton Barbell'],
  'feet-supported-ring-turn': ['vYtOqDvKRSA', 'German hang progression tutorial'],
  'tuck-inversion-prep': ['vYtOqDvKRSA', 'German hang progression tutorial'],
  'feet-supported-german-hang': ['vYtOqDvKRSA', 'German hang progression tutorial'],
  'german-hang': ['vYtOqDvKRSA', 'German hang progression tutorial'],

  // Rotation mobility
  'supine-knee-roll': ['XwYRaloCdr8', 'Thoracic mobility tutorial'],
  'open-book-rotation': ['XwYRaloCdr8', 'Thoracic mobility tutorial'],
  'seated-rotation': ['XwYRaloCdr8', 'Thoracic mobility tutorial'],
  'half-kneeling-rotation': ['AlYEcT5eLq8', 'Elite Performance Institute'],
  'split-stance-rotation': ['AlYEcT5eLq8', 'Elite Performance Institute'],
  'standing-rotation-flow': ['AlYEcT5eLq8', 'Elite Performance Institute'],
};

export const exerciseVideoLibrary: Record<string, ExerciseVideoSource> =
  Object.fromEntries(Object.entries(exerciseVideoSeeds).map(([exerciseId, [videoId, sourceLabel]]) => [
    exerciseId,
    {
      videoId,
      status: 'placeholder' as const,
      sourceLabel,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    },
  ]));

export function getExerciseVideoSource(exerciseId: string) {
  return exerciseVideoLibrary[exerciseId] ?? null;
}
