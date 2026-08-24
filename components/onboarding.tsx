'use client';

import { useEffect, useState } from 'react';
import { bodyAreaOptions, equipmentOptions, goalById, goalOptions, skillFamilies } from '@/data/catalog';
import type { SkillFamilyId } from '@/data/catalog';
import type { EquipmentId, GoalId, InjuryContext, UserProfile } from '@/lib/types';
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
  { eyebrow: 'YOUR DIRECTION', title: 'What would you like Happy Body to help you with?', body: 'Choose everything that feels relevant. You can change this later.' },
  { eyebrow: 'SKILLS THAT INSPIRE YOU', title: 'What skills inspire you?', body: 'Choose something you would love to achieve—or a skill you already have and want to develop further.' },
  { eyebrow: 'A LITTLE CONTEXT', title: 'Is there anything we should be mindful of?', body: 'Choose any areas that often feel sensitive, stiff or restricted, or that you would prefer to treat with extra care. We’ll use this to make more suitable suggestions. You can change this anytime.' },
  { eyebrow: 'YOUR TIME', title: 'How much time usually feels realistic?', body: 'This only changes the size of suggestions. You can choose differently on any day.' },
  { eyebrow: 'YOUR RHYTHM', title: 'How do you like to practise?', body: 'One quiet session and short movement breaks can both build capability.' },
  { eyebrow: 'WHAT YOU HAVE', title: 'Which equipment can you normally use?', body: 'We’ll filter out steps that need equipment you do not have.' },
  { eyebrow: 'A STARTING POINT', title: 'Meet your body as it is today.', body: 'We’ll guide you through a few simple movements and help you find a starting point that is right for you.' },
];

export function Onboarding({ initial, onComplete, onBackToWelcome }: { initial: UserProfile; onComplete: (profile: UserProfile, takeAssessment: boolean) => void; onBackToWelcome?: () => void }) {
  const [step, setStep] = useState(0);
  const [openSkillFamily, setOpenSkillFamily] = useState<SkillFamilyId | null>(null);
  const foundations = goalOptions.filter((goal) => goal.group === 'foundation');
  const skills = goalOptions.filter((goal) => goal.group === 'skill');
  const foundationIds = new Set(foundations.map((goal) => goal.id));
  const skillIds = new Set(skills.map((goal) => goal.id));
  const [draft, setDraft] = useState<UserProfile>(() => {
    const previousGoals = [initial.primaryGoal, ...initial.secondaryGoals].filter((goal): goal is GoalId => Boolean(goal));
    const migratedGoals = previousGoals.map((goal) => goal === 'natural-movement' ? 'move-comfortably' : goal);
    const limitationAliases: Record<string, string> = {
      Wrists: 'Wrists or hands',
      Ankles: 'Ankles or feet',
    };
    const retiredContextOptions = new Set(['Balance', 'Low energy', 'My balance feels uncertain', 'I’m returning after a long break', 'I tire more easily than I would like']);
    return {
      ...initial,
      primaryGoal: null,
      secondaryGoals: Array.from(new Set(migratedGoals.filter((goal) => foundationIds.has(goal)))),
      skillInterests: Array.from(new Set([...initial.skillInterests, ...migratedGoals.filter((goal) => skillIds.has(goal))])),
      limitations: Array.from(new Set(initial.limitations.filter((item) => !retiredContextOptions.has(item)).map((item) => limitationAliases[item] ?? item))),
      injuryContext: initial.injuryContext ?? null,
      injuryAreas: initial.injuryAreas ?? [],
      injuryNote: initial.injuryNote ?? '',
      movementAvoidance: initial.movementAvoidance ?? '',
      onboardingCompleted: false,
      onboardingCompletedAt: null,
    };
  });
  const copy = stepCopy[step];
  const selectedGeneralGoals = foundations.filter((goal) => draft.secondaryGoals.includes(goal.id)).map((goal) => goal.id);

  useEffect(() => {
    if (!openSkillFamily || step !== 2) return;
    const frame = window.requestAnimationFrame(() => {
      const panel = document.getElementById(`skill-family-${openSkillFamily}`);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panel?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openSkillFamily, step]);

  const toggleGoal = (field: 'secondaryGoals' | 'skillInterests', id: GoalId) => {
    setDraft((current) => ({
      ...current,
      [field]: current[field].includes(id) ? current[field].filter((item) => item !== id) : [...current[field], id],
    }));
  };
  const toggleLimitation = (value: string) => setDraft((current) => ({ ...current, limitations: current.limitations.includes(value) ? current.limitations.filter((item) => item !== value) : [...current.limitations, value] }));
  const toggleInjuryArea = (value: string) => setDraft((current) => ({ ...current, injuryAreas: current.injuryAreas.includes(value) ? current.injuryAreas.filter((item) => item !== value) : [...current.injuryAreas, value] }));
  const setInjuryContext = (value: InjuryContext) => setDraft((current) => value === 'yes'
    ? { ...current, injuryContext: value }
    : { ...current, injuryContext: value, injuryAreas: [], injuryNote: '', movementAvoidance: '' });
  const toggleEquipment = (id: EquipmentId) => setDraft((current) => {
    if (id === 'none') return { ...current, equipment: ['none'] };
    const withoutNone = current.equipment.filter((item) => item !== 'none');
    return { ...current, equipment: withoutNone.includes(id) ? withoutNone.filter((item) => item !== id) : [...withoutNone, id] };
  });

  const finish = (takeAssessment: boolean) => onComplete({ ...draft, onboardingCompleted: true, onboardingCompletedAt: new Date().toISOString() }, takeAssessment);
  const nextDisabled = step === 1 && selectedGeneralGoals.length === 0;

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

          {step === 1 && <div className="choice-grid general-goal-grid">{foundations.map((goal) => <button type="button" key={goal.id} aria-pressed={draft.secondaryGoals.includes(goal.id)} className={`choice-card goal-choice ${draft.secondaryGoals.includes(goal.id) ? 'selected' : ''}`} onClick={() => toggleGoal('secondaryGoals', goal.id)}><span className="choice-check" aria-hidden="true">✓</span><strong>{goal.label}</strong><span>{goal.description}</span></button>)}</div>}

          {step === 2 && <div className="skill-family-chooser">
            <div className="skill-family-grid">
              {skillFamilies.map((family) => {
                const selectedCount = family.goalIds.filter((id) => draft.skillInterests.includes(id)).length;
                const isOpen = openSkillFamily === family.id;
                return <button
                  type="button"
                  key={family.id}
                  className={`skill-family-card ${isOpen ? 'open' : ''} ${selectedCount ? 'selected' : ''}`}
                  aria-expanded={isOpen}
                  aria-controls={`skill-family-${family.id}`}
                  onClick={() => setOpenSkillFamily(isOpen ? null : family.id)}
                >
                  <span className="skill-family-symbol" aria-hidden="true">{family.symbol}</span>
                  <span className="skill-family-copy"><strong>{family.label}</strong><small>{family.range}</small></span>
                  <span className="skill-family-meta">{selectedCount ? `${selectedCount} chosen` : 'Explore'} <i aria-hidden="true">⌄</i></span>
                </button>;
              })}
            </div>

            {skillFamilies.map((family) => openSkillFamily === family.id && <section className="skill-family-panel" id={`skill-family-${family.id}`} key={family.id} aria-labelledby={`skill-family-heading-${family.id}`}>
              <header><div><p className="eyebrow">{family.label}</p><h2 id={`skill-family-heading-${family.id}`}>{family.description}</h2></div><button type="button" className="text-button" onClick={() => setOpenSkillFamily(null)}>Close ↑</button></header>
              <div className="skill-option-grid">
                {family.goalIds.map((goalId) => {
                  const goal = goalById[goalId];
                  const selected = draft.skillInterests.includes(goalId);
                  return <button type="button" key={goalId} aria-pressed={selected} className={`skill-option ${selected ? 'selected' : ''}`} onClick={() => toggleGoal('skillInterests', goalId)}><span className="skill-option-check" aria-hidden="true">✓</span><span><strong>{goal.label}</strong><small>{goal.description}</small></span></button>;
                })}
              </div>
            </section>)}

            <p className="skill-selection-summary" aria-live="polite">{draft.skillInterests.length ? `${draft.skillInterests.length} skill${draft.skillInterests.length === 1 ? '' : 's'} chosen. You can choose from more than one family.` : 'Open a family to explore its skills, or skip this step for now.'}</p>
          </div>}

          {step === 3 && <div className="context-form">
            <fieldset className="context-fieldset"><legend>Areas that may need extra care <small>Choose any that apply</small></legend><div className="chip-list spacious">{bodyAreaOptions.map((item) => <button type="button" key={item} aria-pressed={draft.limitations.includes(item)} className={draft.limitations.includes(item) ? 'selected' : ''} onClick={() => toggleLimitation(item)}>{item}</button>)}</div></fieldset>

            <label className="large-field">Anything you’d like us to know? <span>Optional</span><textarea rows={3} value={draft.limitationNote} onChange={(event) => setDraft({ ...draft, limitationNote: event.target.value })} placeholder="For example: my right knee feels sensitive in deep squats, but walking feels comfortable" /></label>

            <section className="injury-context-card" aria-labelledby="injury-context-title">
              <div className="injury-context-heading"><p className="eyebrow">PAST INJURIES</p><h2 id="injury-context-title">Does a previous injury, operation or health concern still affect how you move today?</h2><p>This is optional. Tell us only what would help us guide you more carefully.</p></div>
              <div className="injury-answer-grid" role="radiogroup" aria-labelledby="injury-context-title">{([
                ['none', 'No, nothing now'],
                ['yes', 'Yes'],
                ['unsure', 'I’m not sure'],
                ['prefer-not', 'Prefer not to say'],
              ] as Array<[InjuryContext, string]>).map(([value, label]) => <button type="button" role="radio" aria-checked={draft.injuryContext === value} key={value} className={draft.injuryContext === value ? 'selected' : ''} onClick={() => setInjuryContext(value)}>{label}</button>)}</div>

              {draft.injuryContext === 'yes' && <div className="injury-follow-up">
                <fieldset><legend>Which areas are still affected? <small>Optional</small></legend><div className="chip-list">{bodyAreaOptions.map((item) => <button type="button" key={item} aria-pressed={draft.injuryAreas.includes(item)} className={draft.injuryAreas.includes(item) ? 'selected' : ''} onClick={() => toggleInjuryArea(item)}>{item}</button>)}</div></fieldset>
                <div className="injury-text-grid">
                  <label className="large-field">What still affects you today? <span>Optional</span><textarea rows={3} value={draft.injuryNote} onChange={(event) => setDraft({ ...draft, injuryNote: event.target.value })} placeholder="For example: an old ankle sprain still limits deep bending" /></label>
                  <label className="large-field">Any movements or positions you currently avoid? <span>Optional</span><textarea rows={3} value={draft.movementAvoidance} onChange={(event) => setDraft({ ...draft, movementAvoidance: event.target.value })} placeholder="For example: deep lunges or jumping" /></label>
                </div>
                <p className="clinician-guidance">If a healthcare professional has advised you to avoid a movement, follow their guidance.</p>
              </div>}
            </section>

            <PainNote compact />
          </div>}

          {step === 4 && <div className="choice-grid time-grid">{[5, 10, 20, 30, 45, 60].map((minutes) => <button type="button" key={minutes} className={`choice-card centred ${draft.defaultMinutes === minutes ? 'selected' : ''}`} onClick={() => setDraft({ ...draft, defaultMinutes: minutes })}><strong>{minutes}</strong><span>minutes</span></button>)}</div>}

          {step === 5 && <div className="choice-grid">{[
            ['single-session', 'One session', 'I like setting aside one quiet block of time.'],
            ['movement-breaks', 'Movement breaks', 'I prefer small pieces spread across the day.'],
            ['either', 'Either works', 'Let the day decide.'],
          ].map(([id, label, description]) => <button type="button" key={id} className={`choice-card ${draft.practiceStyle === id ? 'selected' : ''}`} onClick={() => setDraft({ ...draft, practiceStyle: id as UserProfile['practiceStyle'] })}><strong>{label}</strong><span>{description}</span></button>)}{draft.practiceStyle === 'movement-breaks' && <label className="inline-field">How many small breaks? <input type="number" min="1" max="6" value={draft.movementBreaks} onChange={(event) => setDraft({ ...draft, movementBreaks: Math.max(1, Math.min(6, Number(event.target.value))) })} /></label>}</div>}

          {step === 6 && <div className="choice-grid">{equipmentOptions.map((item) => <button type="button" key={item.id} className={`choice-card centred ${draft.equipment.includes(item.id) ? 'selected' : ''}`} onClick={() => toggleEquipment(item.id)}><strong>{item.label}</strong></button>)}</div>}

          {step === 7 && <div className="assessment-invitation"><div className="body-map-preview three-part" aria-hidden="true"><span>Lower body</span><span>Core</span><span>Upper body</span></div><div><h2>Three parts of your starting picture</h2><p>We’ll begin with accessible movements for your lower body, core and upper body. They give us useful first steps; the rest of your Body Map will grow as you practise.</p><ul><li>About 5–7 minutes</li><li>Use support and choose a comfortable range</li><li>If anything feels painful, stop that movement</li></ul></div></div>}
        </div>

        <footer className="onboarding-actions">
          <button className="text-button" disabled={step === 0 && !onBackToWelcome} onClick={() => step === 0 ? onBackToWelcome?.() : setStep((value) => value - 1)}>← Back</button>
          {step < stepCopy.length - 1 ? <button className="primary-button" disabled={nextDisabled} onClick={() => setStep((value) => value + 1)}>Continue <span aria-hidden="true">→</span></button> : <div className="finish-actions"><button className="secondary-button" onClick={() => finish(false)}>Skip for now</button><button className="primary-button" onClick={() => finish(true)}>Start my movement check →</button></div>}
        </footer>
      </section>
    </main>
  );
}
