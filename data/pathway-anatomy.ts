import type { PathwayId } from '@/lib/types';

export type AnatomyRegion =
  | 'shoulders' | 'rearShoulders' | 'rotatorCuff' | 'chest' | 'upperBack' | 'lats'
  | 'biceps' | 'triceps' | 'forearms' | 'wrists' | 'abs' | 'obliques'
  | 'spinalErectors' | 'hipFlexors' | 'glutes' | 'adductors' | 'quads'
  | 'hamstrings' | 'calves' | 'ankles';

export type PathwayAnatomy = {
  primary: AnatomyRegion[];
  supporting: AnatomyRegion[];
  primaryLabels: string[];
  supportingLabels: string[];
};

export const pathwayAnatomy: Record<PathwayId, PathwayAnatomy> = {
  squat: {
    primary: ['quads', 'glutes', 'adductors'],
    supporting: ['hamstrings', 'calves', 'ankles', 'abs', 'spinalErectors'],
    primaryLabels: ['Front thighs (quadriceps)', 'Buttocks (glutes)', 'Inner thighs (adductors)'],
    supportingLabels: ['Back thighs', 'Calves and ankles', 'Abdominals and back'],
  },
  'knee-flexion': {
    primary: ['hamstrings', 'calves'], supporting: ['glutes', 'abs', 'spinalErectors'],
    primaryLabels: ['Back thighs (hamstrings)', 'Upper calves'], supportingLabels: ['Glutes', 'Abdominals and back'],
  },
  'hip-hinge': {
    primary: ['glutes', 'hamstrings', 'spinalErectors'], supporting: ['adductors', 'abs', 'forearms'],
    primaryLabels: ['Glutes', 'Back thighs (hamstrings)', 'Back of the trunk'], supportingLabels: ['Inner thighs', 'Abdominals', 'Grip and forearms'],
  },
  core: {
    primary: ['abs', 'obliques', 'hipFlexors'], supporting: ['spinalErectors', 'glutes', 'lats', 'shoulders'],
    primaryLabels: ['Abdominals', 'Side body (obliques)', 'Front of the hips'], supportingLabels: ['Back of the trunk', 'Glutes', 'Shoulders and lats'],
  },
  'push-up': {
    primary: ['chest', 'triceps', 'shoulders'], supporting: ['rotatorCuff', 'abs', 'obliques', 'glutes'],
    primaryLabels: ['Chest', 'Back of the arms (triceps)', 'Front of the shoulders'], supportingLabels: ['Shoulder stabilisers', 'Abdominals', 'Glutes'],
  },
  'vertical-push': {
    primary: ['shoulders', 'triceps', 'upperBack'], supporting: ['rotatorCuff', 'forearms', 'wrists', 'abs', 'obliques'],
    primaryLabels: ['Shoulders', 'Back of the arms (triceps)', 'Upper back'], supportingLabels: ['Rotator cuff', 'Wrists and forearms', 'Abdominals'],
  },
  'horizontal-pull': {
    primary: ['lats', 'upperBack', 'rearShoulders', 'biceps'], supporting: ['rotatorCuff', 'forearms', 'abs', 'glutes'],
    primaryLabels: ['Upper and middle back', 'Lats', 'Rear shoulders', 'Front of the arms (biceps)'], supportingLabels: ['Rotator cuff', 'Grip and forearms', 'Abdominals and glutes'],
  },
  'pull-up': {
    primary: ['lats', 'upperBack', 'biceps', 'forearms'], supporting: ['rotatorCuff', 'abs', 'obliques'],
    primaryLabels: ['Lats', 'Upper and middle back', 'Biceps', 'Grip and forearms'], supportingLabels: ['Rotator cuff', 'Abdominals and side body'],
  },
  'resting-squat': {
    primary: ['ankles', 'calves', 'adductors', 'glutes', 'hipFlexors'], supporting: ['quads', 'abs', 'spinalErectors'],
    primaryLabels: ['Ankles and calves', 'Hips and inner thighs', 'Glutes'], supportingLabels: ['Front thighs', 'Abdominals and back'],
  },
  pike: {
    primary: ['hamstrings', 'calves', 'glutes', 'spinalErectors'], supporting: ['quads', 'abs', 'hipFlexors'],
    primaryLabels: ['Back thighs (hamstrings)', 'Calves', 'Glutes and back'], supportingLabels: ['Front thighs', 'Abdominals', 'Front of the hips'],
  },
  pancake: {
    primary: ['adductors', 'hamstrings', 'glutes', 'spinalErectors'], supporting: ['hipFlexors', 'abs', 'quads'],
    primaryLabels: ['Inner thighs (adductors)', 'Back thighs', 'Glutes and back'], supportingLabels: ['Front of the hips', 'Abdominals', 'Front thighs'],
  },
  'front-split': {
    primary: ['hamstrings', 'hipFlexors', 'quads', 'adductors'], supporting: ['glutes', 'abs', 'obliques'],
    primaryLabels: ['Front-leg hamstrings', 'Back-leg hip flexors', 'Front thighs and inner thighs'], supportingLabels: ['Glutes', 'Abdominals and side body'],
  },
  'middle-split': {
    primary: ['adductors', 'hamstrings', 'glutes'], supporting: ['quads', 'abs', 'obliques'],
    primaryLabels: ['Inner thighs (adductors)', 'Back thighs', 'Outer hips and glutes'], supportingLabels: ['Front thighs', 'Abdominals and side body'],
  },
  bridge: {
    primary: ['shoulders', 'lats', 'chest', 'hipFlexors', 'abs', 'spinalErectors', 'wrists'], supporting: ['triceps', 'rotatorCuff', 'glutes', 'quads'],
    primaryLabels: ['Shoulders, chest and lats', 'Front of the hips and trunk', 'Back and wrists'], supportingLabels: ['Triceps and rotator cuff', 'Glutes and front thighs'],
  },
  'german-hang': {
    primary: ['shoulders', 'chest', 'biceps', 'lats'], supporting: ['rotatorCuff', 'upperBack', 'forearms', 'abs', 'obliques'],
    primaryLabels: ['Front of the shoulders', 'Chest and lats', 'Biceps'], supportingLabels: ['Rotator cuff and upper back', 'Grip and forearms', 'Abdominals'],
  },
  rotation: {
    primary: ['obliques', 'spinalErectors', 'glutes', 'adductors', 'upperBack'], supporting: ['abs', 'hipFlexors', 'shoulders', 'ankles'],
    primaryLabels: ['Side body (obliques)', 'Back and rib cage', 'Hips, glutes and inner thighs'], supportingLabels: ['Abdominals', 'Shoulders', 'Feet and ankles'],
  },
};
