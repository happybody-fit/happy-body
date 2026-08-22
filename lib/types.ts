export type PathwayId = 'squat' | 'push-up' | 'pull-up';
export type ScreenId = 'dashboard' | 'goals' | 'assessment' | 'next-step' | 'journey';
export type MetricKind = 'reps' | 'seconds';

export interface Exercise {
  id: string;
  title: string;
  purpose: string;
  prescription: string;
  metric: MetricKind;
  instructions: string[];
  videoId: string;
}

export interface AssessmentCheckpoint {
  id: string;
  title: string;
  instruction: string;
  passCriteria: string;
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
  levels: ProgressionLevel[];
  assessment: AssessmentCheckpoint[];
}

export interface PracticeEntry {
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
}

export interface AssessmentRecord {
  id: string;
  date: string;
  pathwayId: PathwayId;
  levelIndex: number;
  levelTitle: string;
}

export interface UserProgress {
  selectedGoals: PathwayId[];
  currentLevels: Record<PathwayId, number>;
  practices: PracticeEntry[];
  assessments: AssessmentRecord[];
  milestones: string[];
}
