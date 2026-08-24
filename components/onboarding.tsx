'use client';

import { useState } from 'react';
import { equipmentOptions, goalOptions, limitationOptions } from '@/data/catalog';
import type { EquipmentId, GoalId, UserProfile } from '@/lib/types';
import { Brand, PainNote } from './shared';

export function Welcome({ begin, signIn }: { begin: () => void; signIn: () => void }) {
  return (
    <main className="welcome-shell">
      <header className="welcome-brand"><Brand /></header>
      <section className="welcome-stage" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <p className="welcome-kicker">Welcome to Happy Body</p>
          <h1 id="welcome-title">Move freely.<br />Live fully.</h1>
          <p className="welcome-promise">Imagine feeling free in your movement, confident in your strength and fully at home in your body.</p>
          <div className="welcome-actions">
            <button className="primary-button welcome-begin" onClick={begin}>Begin My Journey <span aria-hidden="true">→</span></button>
            <p>Already have a Happy Body account? <button className="text-button" onClick={signIn}>Sign in</button></p>
          </div>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="welcome-sun" />
          <div className="welcome-orbit welcome-orbit-one" />
          <div className="welcome-orbit welcome-orbit-two" />
          <div className="welcome-figure">
            <i className="welcome-head" />
            <i className="welcome-body" />
            <i className="welcome-arm" />
          </div>
          <p>Strong <span>·</span> Free <span>·</span> Alive</p>
        </div>
      </section>
    </main>
  );
}

const stepCopy = [
  { eyebrow: 'WELCOME', title: 'Let’s make Happy Body yours.', body: 'A few simple choices help the app suggest what may be useful for your body today. Your name is optional.' },
  { eyebrow: 'YOUR DIRECTION', title: 'What would you like to grow?', body: 'Choose one main intention. Add other goals or skills without turning them into a competition.' },
  { eyebrow: 'YOUR CONTEXT', title: 'What should Happy Body be considerate of?', body: 'These are context for gentler suggestions, not a diagnosis.' },
  { eyebrow: 'YOUR TIME', title: 'How much time usually feels realistic?', body: 'This only changes the size of suggestions. You can choose differently on any day.' },
  { eyebrow: 'YOUR RHYTHM', title: 'How do you like to practise?', body: 'One quiet session and short movement breaks can both build capability.' },
  { eyebrow: 'WHAT YOU HAVE', title: 'Which equipment can you normally use?', body: 'Happy Body filters out steps that need equipment you do not have.' },
  { eyebrow: 'A STARTING POINT', title: 'Meet your body as it is today.', body: 'A short movement check keeps your Body Map honest. Nothing is graded, and unknown is a valid answer.' },
];

export function Onboarding({ initial, onComplete, onBackToWelcome }: { initial: UserProfile; onComplete: (profile: UserProfile, takeAssessment: boolean) => void; onBackToWelcome?: () => void }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<UserProfile>({ ...initial, onboardingCompleted: false, onboardingCompletedAt: null });
  const copy = stepCopy[step];
  const foundations = goalOptions.filter((goal) => goal.group === 'foundation');
  const skills = goalOptions.filter((goal) => goal.group === 'skill');

  const toggleGoal = (field: 'secondaryGoals' | 'skillInterests', id: GoalId) => {
    setDraft((current) => ({
      ...current,
      [field]: current[field].includes(id) ? current[field].filter((item) => item !== id) : [...current[field], id],
    }));
  };
  const toggleLimitation = (value: string) => setDraft((current) => ({ ...current, limitations: current.limitations.includes(value) ? current.limitations.filter((item) => item !== value) : [...current.limitations, value] }));
  const toggleEquipment = (id: EquipmentId) => setDraft((current) => {
    if (id === 'none') return { ...current, equipment: ['none'] };
    const withoutNone = current.equipment.filter((item) => item !== 'none');
    return { ...current, equipment: withoutNone.includes(id) ? withoutNone.filter((item) => item !== id) : [...withoutNone, id] };
  });

  const finish = (takeAssessment: boolean) => onComplete({ ...draft, onboardingCompleted: true, onboardingCompletedAt: new Date().toISOString() }, takeAssessment);
  const nextDisabled = step === 1 && !draft.primaryGoal;

  return (
    <main className="onboarding-shell">
      <header className="onboarding-brand"><Brand /><span>Personal movement guide</span></header>
      <section className="onboarding-card" aria-labelledby="onboarding-title">
        <div className="onboarding-progress" aria-label={`Step ${step + 1} of ${stepCopy.length}`}>
          {stepCopy.map((_, index) => <i key={index} className={index <= step ? 'filled' : ''} />)}
        </div>
        <div className="onboarding-heading"><p className="eyebrow">{copy.eyebrow} · {step + 1} OF {stepCopy.length}</p><h1 id="onboarding-title">{copy.title}</h1><p>{copy.body}</p></div>

        <div className="onboarding-content">
          {step === 0 && <label className="large-field">What should we call you? <span>Optional</span><input autoFocus autoComplete="given-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Your name" /></label>}

          {step === 1 && <div className="goal-chooser">
            <fieldset><legend>Main intention</legend><div className="choice-grid">{foundations.map((goal) => <button type="button" key={goal.id} className={`choice-card ${draft.primaryGoal === goal.id ? 'selected' : ''}`} onClick={() => setDraft({ ...draft, primaryGoal: goal.id })}><strong>{goal.label}</strong><span>{goal.description}</span></button>)}</div></fieldset>
            <fieldset><legend>Other goals <small>Optional</small></legend><div className="chip-list">{foundations.filter((goal) => goal.id !== draft.primaryGoal).map((goal) => <button type="button" key={goal.id} className={draft.secondaryGoals.includes(goal.id) ? 'selected' : ''} onClick={() => toggleGoal('secondaryGoals', goal.id)}>{goal.label}</button>)}</div></fieldset>
            <fieldset><legend>Skills that interest you <small>Optional</small></legend><div className="chip-list">{skills.map((goal) => <button type="button" key={goal.id} className={draft.skillInterests.includes(goal.id) ? 'selected' : ''} onClick={() => toggleGoal('skillInterests', goal.id)}>{goal.label}</button>)}</div></fieldset>
          </div>}

          {step === 2 && <div className="form-stack"><div className="chip-list spacious">{limitationOptions.map((item) => <button type="button" key={item} className={draft.limitations.includes(item) ? 'selected' : ''} onClick={() => toggleLimitation(item)}>{item}</button>)}</div><label className="large-field">Anything else? <span>Optional</span><textarea rows={3} value={draft.limitationNote} onChange={(event) => setDraft({ ...draft, limitationNote: event.target.value })} placeholder="For example: my right knee sometimes feels uncertain on stairs" /></label><PainNote compact /></div>}

          {step === 3 && <div className="choice-grid time-grid">{[5, 10, 20, 30, 45, 60].map((minutes) => <button type="button" key={minutes} className={`choice-card centred ${draft.defaultMinutes === minutes ? 'selected' : ''}`} onClick={() => setDraft({ ...draft, defaultMinutes: minutes })}><strong>{minutes}</strong><span>minutes</span></button>)}</div>}

          {step === 4 && <div className="choice-grid">{[
            ['single-session', 'One session', 'I like setting aside one quiet block of time.'],
            ['movement-breaks', 'Movement breaks', 'I prefer small pieces spread across the day.'],
            ['either', 'Either works', 'Let the day decide.'],
          ].map(([id, label, description]) => <button type="button" key={id} className={`choice-card ${draft.practiceStyle === id ? 'selected' : ''}`} onClick={() => setDraft({ ...draft, practiceStyle: id as UserProfile['practiceStyle'] })}><strong>{label}</strong><span>{description}</span></button>)}{draft.practiceStyle === 'movement-breaks' && <label className="inline-field">How many small breaks? <input type="number" min="1" max="6" value={draft.movementBreaks} onChange={(event) => setDraft({ ...draft, movementBreaks: Math.max(1, Math.min(6, Number(event.target.value))) })} /></label>}</div>}

          {step === 5 && <div className="choice-grid">{equipmentOptions.map((item) => <button type="button" key={item.id} className={`choice-card centred ${draft.equipment.includes(item.id) ? 'selected' : ''}`} onClick={() => toggleEquipment(item.id)}><strong>{item.label}</strong></button>)}</div>}

          {step === 6 && <div className="assessment-invitation"><div className="body-map-preview" aria-hidden="true"><span>Reach</span><span>Squat</span><span>Sit</span><span>Get up</span></div><div><h2>Four foundation movements</h2><p>Try a comfortable deep squat, an overhead reach, floor sitting and getting up from the floor. If a chosen goal needs one extra check, Happy Body will offer it.</p><ul><li>About 3–5 minutes</li><li>Comfortable, limited and unsure are all useful answers</li><li>Pain stops that movement immediately</li></ul></div></div>}
        </div>

        <footer className="onboarding-actions">
          <button className="text-button" disabled={step === 0 && !onBackToWelcome} onClick={() => step === 0 ? onBackToWelcome?.() : setStep((value) => value - 1)}>← Back</button>
          {step < stepCopy.length - 1 ? <button className="primary-button" disabled={nextDisabled} onClick={() => setStep((value) => value + 1)}>Continue <span aria-hidden="true">→</span></button> : <div className="finish-actions"><button className="secondary-button" onClick={() => finish(false)}>Skip for now</button><button className="primary-button" onClick={() => finish(true)}>Start my movement check →</button></div>}
        </footer>
      </section>
    </main>
  );
}
