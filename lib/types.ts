export type PathwayId = 'squat' | 'push-up' | 'pull-up';
export type ScreenId = 'today' | 'progress' | 'explore' | 'diary' | 'settings';
export type MetricKind = 'reps' | 'seconds';

export type GoalId =
  | 'move-comfortably'
  | 'build-strength'
  | 'improve-mobility'
  | 'natural-movement'
  | 'push-up'
  | 'pull-up'
  | 'bodyweight-row'
  | 'front-lever'
  | 'one-arm-pull-up'
  | 'handstand-push-up'
  | 'planche'
  | 'pistol-squat'
  | 'nordic-curl'
  | 'hip-extension-hinge'
  | 'core-control'
  | 'dragon-flag'
  | 'handstand'
  | 'wall-handstand'
  | 'handstand-walk'
  | 'resting-squat'
  | 'pike'
  | 'pancake'
  | 'front-split'
  | 'middle-split'
  | 'bridge'
  | 'german-hang'
  | 'rotation';

export type EquipmentId =
  | 'none'
  | 'chair'
  | 'wall'
  | 'resistance-band'
  | 'pull-up-bar'
  | 'rings'
  | 'box-bench';

export type BodyState = 'fresh' | 'steady' | 'stiff' | 'tired' | 'sore';
export type InjuryContext = 'none' | 'yes' | 'unsure' | 'prefer-not';
export type AssessmentOutcome = 'comfortable' | 'limited' | 'not-yet' | 'unsure' | 'no-equipment' | 'pain';
export type MovementStatus =
  | 'unknown'
  | 'assessed'
  | 'in-progress'
  | 'achieved'
  | 'needs-reassessment'
  | 'temporarily-limited'
  | 'pain-flagged';

export interface UserProfile {
  name: string;
  primaryGoal: GoalId | null;
  secondaryGoals: GoalId[];
  skillInterests: GoalId[];
  limitations: string[];
  limitationNote: string;
  injuryContext: InjuryContext | null;
  injuryAreas: string[];
  injuryNote: string;
  movementAvoidance: string;
  defaultMinutes: number;
  practiceStyle: 'single-session' | 'movement-breaks' | 'either';
  movementBreaks: number;
  equipment: EquipmentId[];
  onboardingCompleted: boolean;
  onboardingCompletedAt: string | null;
}

export interface Exercise {
  id: string;
  title: string;
  purpose: string;
  equipment: EquipmentId[];
  alternatives: string[];
  durationMinutes: number;
  sets: number;
  reps?: string;
  hold?: string;
  metric: MetricKind;
  tempo: string;
  rest: string;
  frequency: string;
  cues: string[];
  feel: string;
  commonMistakes: string[];
  regressWhen: string;
  progressWhen: string;
  cautions: string[];
  videoId: string;
  videoStatus: 'placeholder' | 'approved';
  educationId?: string;
}

export interface AssessmentCheckpoint {
  id: string;
  title: string;
  instruction: string;
  comfortPrompt: string;
  equipment: EquipmentId[];
  levelIndex: number;
}

export interface ProgressionLevel {
  id: string;
  title: string;
  description: string;
  milestone: string;
  exercises: Exercise[];
}

export interface Pathway {
  id: PathwayId;
  name: string;
  longName: string;
  category: 'Strength';
  symbol: string;
  tone: 'sage' | 'peach' | 'sand';
  description: string;
  destination: string;
  goalIds: GoalId[];
  levels: ProgressionLevel[];
  assessment: AssessmentCheckpoint[];
}

export interface MovementState {
  movementId: string;
  status: MovementStatus;
  outcome: AssessmentOutcome | null;
  currentLevel: number | null;
  assessedAt: string | null;
  reassessAfter: string | null;
  note: string;
}

export interface PracticeEntry {
  id: string;
  date: string;
  pathwayId: PathwayId | null;
  movementId: string;
  exerciseId: string;
  exerciseTitle: string;
  completion: 'yes' | 'partly' | 'not-today';
  difficulty: 'easy' | 'good' | 'challenging';
  bodyAfter: 'better' | 'good' | 'tired' | 'sore' | 'pain';
  sets: number | null;
  amount: number | null;
  metric: MetricKind;
  bodyDuring: string;
  notes: string;
  videoUrl: string;
  source: 'recommendation' | 'self-chosen';
}

export interface AssessmentRecord {
  id: string;
  date: string;
  movementId: string;
  pathwayId: PathwayId | null;
  checkpointId: string;
  checkpointTitle: string;
  outcome: AssessmentOutcome;
  levelIndex: number | null;
  note: string;
}

export interface DailyCheckIn {
  date: string;
  bodyState: BodyState;
  minutes: number;
}

export interface PainFlag {
  id: string;
  movementId: string;
  bodyArea: string;
  note: string;
  createdAt: string;
  active: boolean;
}

export interface HappyBodyData {
  version: 2;
  profile: UserProfile;
  movementStates: Record<string, MovementState>;
  practices: PracticeEntry[];
  assessments: AssessmentRecord[];
  dailyCheckIns: DailyCheckIn[];
  painFlags: PainFlag[];
  milestones: string[];
  preferences: {
    welcomeSeen: boolean;
    assessmentIntroSeen: boolean;
    lastScreen: ScreenId;
  };
  legacyImportedAt: string | null;
  updatedAt: string;
}

export type RecommendationKind = 'assess' | 'practice' | 'reassess' | 'attention' | 'rest';

export interface Recommendation {
  id: string;
  kind: RecommendationKind;
  movementId: string;
  pathwayId: PathwayId | null;
  title: string;
  reason: string;
  detail: string;
  minutes: number;
  score: number;
  exerciseId: string | null;
  safetyNote?: string;
}

export interface WarmUpStep {
  id: string;
  title: string;
  instruction: string;
  minutes: number;
}

export interface TodaySessionPlan {
  availableMinutes: number;
  totalMinutes: number;
  warmUpMinutes: number;
  practiceMinutes: number;
  finishMinutes: number;
  recommendations: Recommendation[];
  warmUpSteps: WarmUpStep[];
}

// Retained only for safe local and cloud migration from the original prototype.
export interface LegacyUserProgress {
  selectedGoals: PathwayId[];
  currentLevels: Record<PathwayId, number>;
  practices: Array<{
    id: string;
    date: string;
    pathwayId: PathwayId;
    exerciseId: string;
    exerciseTitle: string;
    sets: number | null;
    amount: number | null;
    metric: MetricKind;
    difficulty: number;
    bodyDuring: string;
    bodyAfter: string;
    notes: string;
    videoUrl: string;
  }>;
  assessments: Array<{
    id: string;
    date: string;
    pathwayId: PathwayId;
    levelIndex: number;
    levelTitle: string;
  }>;
  milestones: string[];
}
