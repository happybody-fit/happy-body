'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { pathwayById, pathways } from '@/data/pathways';
import { browserProgressRepository, defaultProgress, isPathwayId } from '@/lib/storage';
import type { PathwayId, PracticeEntry, ScreenId, UserProgress } from '@/lib/types';

const navItems: { id: ScreenId; label: string; shortLabel: string; icon: string }[] = [
  { id: 'dashboard', label: 'My Happy Body', shortLabel: 'My Body', icon: '⌂' },
  { id: 'goals', label: 'Explore Goals', shortLabel: 'Goals', icon: '○' },
  { id: 'assessment', label: 'Find My Level', shortLabel: 'Assess', icon: '◎' },
  { id: 'next-step', label: 'My Next Step', shortLabel: 'Next', icon: '→' },
  { id: 'journey', label: 'My Journey', shortLabel: 'Journey', icon: '↟' },
];

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

export default function Home() {
  const [screen, setScreen] = useState<ScreenId>('dashboard');
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [ready, setReady] = useState(false);
  const [activePathwayId, setActivePathwayId] = useState<PathwayId>('squat');
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, boolean>>({});
  const [assessmentResult, setAssessmentResult] = useState<number | null>(null);
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setProgress(browserProgressRepository.load());
    setReady(true);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  }, []);

  useEffect(() => {
    if (ready) browserProgressRepository.save(progress);
  }, [progress, ready]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [screen]);

  const activePathway = pathwayById[activePathwayId];
  const currentLevelIndex = progress.currentLevels[activePathwayId] ?? 0;
  const currentLevel = activePathway.levels[currentLevelIndex];
  const nextLevel = activePathway.levels[Math.min(currentLevelIndex + 1, activePathway.levels.length - 1)];

  const navigate = (nextScreen: ScreenId, pathwayId?: PathwayId) => {
    if (pathwayId) setActivePathwayId(pathwayId);
    setScreen(nextScreen);
    setSavedMessage('');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const startAssessment = (pathwayId: PathwayId) => {
    setActivePathwayId(pathwayId);
    setAssessmentStep(0);
    setAssessmentAnswers({});
    setAssessmentResult(null);
    navigate('assessment', pathwayId);
  };

  const answerAssessment = (passed: boolean) => {
    const checkpoint = activePathway.assessment[assessmentStep];
    const answers = { ...assessmentAnswers, [checkpoint.id]: passed };
    setAssessmentAnswers(answers);

    if (assessmentStep < activePathway.assessment.length - 1) {
      setAssessmentStep((step) => step + 1);
      return;
    }

    let result = 0;
    for (const test of activePathway.assessment) {
      if (!answers[test.id]) break;
      result = test.levelIndex;
    }
    setAssessmentResult(result);
    const level = activePathway.levels[result];
    setProgress((previous) => ({
      ...previous,
      currentLevels: { ...previous.currentLevels, [activePathwayId]: result },
      assessments: [
        { id: uid(), date: today(), pathwayId: activePathwayId, levelIndex: result, levelTitle: level.title },
        ...previous.assessments,
      ],
      milestones: previous.currentLevels[activePathwayId] !== result
        ? [`${activePathway.name}: ${level.title}`, ...previous.milestones]
        : previous.milestones,
    }));
  };

  const toggleGoal = (pathwayId: PathwayId) => {
    setProgress((previous) => {
      const selected = previous.selectedGoals.includes(pathwayId);
      if (selected && previous.selectedGoals.length === 1) return previous;
      return {
        ...previous,
        selectedGoals: selected
          ? previous.selectedGoals.filter((id) => id !== pathwayId)
          : [...previous.selectedGoals, pathwayId],
      };
    });
  };

  const savePractice = (entry: PracticeEntry) => {
    setProgress((previous) => ({ ...previous, practices: [entry, ...previous.practices] }));
    setShowPracticeForm(false);
    setSavedMessage('Practice saved to your journey. Nicely done.');
  };

  return (
    <main className="app-shell">
      <Header screen={screen} navigate={navigate} />
      <div className="app-page">
        {screen === 'dashboard' && <Dashboard progress={progress} navigate={navigate} startAssessment={startAssessment} />}
        {screen === 'goals' && <Goals progress={progress} toggleGoal={toggleGoal} startAssessment={startAssessment} navigate={navigate} />}
        {screen === 'assessment' && (
          <Assessment
            pathwayId={activePathwayId}
            setPathwayId={startAssessment}
            step={assessmentStep}
            result={assessmentResult}
            answer={answerAssessment}
            restart={() => startAssessment(activePathwayId)}
            navigate={navigate}
          />
        )}
        {screen === 'next-step' && (
          <NextStep
            pathwayId={activePathwayId}
            setPathwayId={(id) => setActivePathwayId(id)}
            levelIndex={currentLevelIndex}
            openPractice={() => { setShowPracticeForm(true); setSavedMessage(''); }}
            startAssessment={startAssessment}
          />
        )}
        {screen === 'journey' && (
          <Journey progress={progress} openPractice={() => setShowPracticeForm(true)} startAssessment={startAssessment} />
        )}
      </div>

      <MobileNav screen={screen} navigate={navigate} />
      {showPracticeForm && (
        <PracticeDialog
          pathwayId={activePathwayId}
          levelIndex={currentLevelIndex}
          close={() => setShowPracticeForm(false)}
          save={savePractice}
        />
      )}
      {savedMessage && <div className="toast" role="status">✓ {savedMessage}</div>}
    </main>
  );
}

function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>Happy Body</span>
    </span>
  );
}

function Header({ screen, navigate }: { screen: ScreenId; navigate: (screen: ScreenId) => void }) {
  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => navigate('dashboard')} aria-label="Happy Body home"><Brand /></button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button key={item.id} className={screen === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>{item.label}</button>
        ))}
      </nav>
      <button className="avatar" aria-label="Profile placeholder">A</button>
    </header>
  );
}

function MobileNav({ screen, navigate }: { screen: ScreenId; navigate: (screen: ScreenId) => void }) {
  const items = navItems.filter((item) => item.id !== 'next-step');
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => (
        <button key={item.id} className={screen === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
          <span aria-hidden="true">{item.icon}</span>{item.shortLabel}
        </button>
      ))}
    </nav>
  );
}

function Dashboard({
  progress,
  navigate,
  startAssessment,
}: {
  progress: UserProgress;
  navigate: (screen: ScreenId, pathwayId?: PathwayId) => void;
  startAssessment: (pathwayId: PathwayId) => void;
}) {
  const featuredId = progress.selectedGoals[0] ?? 'squat';
  const featured = pathwayById[featuredId];
  const featuredLevel = featured.levels[progress.currentLevels[featuredId] ?? 0];
  const recent = progress.practices.slice(0, 3);

  return (
    <>
      <section className="welcome-card">
        <div className="welcome-copy">
          <p className="eyebrow">MY HAPPY BODY</p>
          <h1>Move well.<br />Feel more like you.</h1>
          <p className="lead">Understand what your body can do today, then take one clear and achievable next step.</p>
          <button className="primary-button" onClick={() => navigate('next-step', featuredId)}>Continue my next step <span aria-hidden="true">→</span></button>
        </div>
        <BodyIllustration />
      </section>

      <section className="section-block" aria-labelledby="pathways-title">
        <div className="section-heading">
          <div><p className="eyebrow">YOUR PATHWAYS</p><h2 id="pathways-title">What you’re growing</h2></div>
          <button className="text-button" onClick={() => navigate('goals')}>Explore all goals</button>
        </div>
        <div className="goal-grid">
          {progress.selectedGoals.map((id) => {
            const pathway = pathwayById[id];
            const levelIndex = progress.currentLevels[id] ?? 0;
            const level = pathway.levels[levelIndex];
            return (
              <article className={`goal-card ${pathway.tone}`} key={id}>
                <div className="goal-topline"><span className="goal-mark">{pathway.symbol}</span><span className="level-chip">Level {levelIndex + 1} of {pathway.levels.length}</span></div>
                <h3>{pathway.name}</h3><p>{level.title}</p>
                <div className="progress-track" aria-label={`Level ${levelIndex + 1} of ${pathway.levels.length}`}><span style={{ width: `${((levelIndex + 1) / pathway.levels.length) * 100}%` }} /></div>
                <button className="card-link" onClick={() => navigate('next-step', id)}>View next step <span aria-hidden="true">↗</span></button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="next-step-card">
        <div className="step-date"><span>YOUR NEXT STEP</span><strong>Today</strong></div>
        <div className="step-copy">
          <div className="movement-glyph" aria-hidden="true"><span /></div>
          <div><p className="eyebrow">{featured.longName.toUpperCase()} · 8 MIN</p><h2>{featuredLevel.exercises[0].title}</h2><p>{featuredLevel.exercises[0].purpose}</p></div>
        </div>
        <button className="round-button" onClick={() => navigate('next-step', featuredId)} aria-label="Open today’s next step">→</button>
      </section>

      <div className="dashboard-lower">
        <section className="activity-card">
          <div className="section-heading compact"><div><p className="eyebrow">RECENT PRACTICE</p><h2>Small steps add up</h2></div><button className="text-button" onClick={() => navigate('journey')}>My journey</button></div>
          {recent.length ? recent.map((entry) => (
            <div className="activity-row" key={entry.id}><span className="activity-dot" /><div><strong>{entry.exerciseTitle}</strong><small>{pathwayById[entry.pathwayId].name} · {formatDate(entry.date)}</small></div><b>{entry.sets ? `${entry.sets} sets` : 'Practised'}</b></div>
          )) : (
            <div className="empty-state"><span>◌</span><div><strong>Your first practice will appear here.</strong><p>Record what you tried, not just what you achieved.</p></div><button className="secondary-button" onClick={() => navigate('next-step', featuredId)}>See today’s step</button></div>
          )}
        </section>
        <aside className="check-in-card"><span className="sunburst">✦</span><p className="eyebrow">A USEFUL CHECK-IN</p><h2>Has this movement changed?</h2><p>Repeat a simple assessment whenever your current exercises begin to feel easier.</p><button className="soft-button" onClick={() => startAssessment(featuredId)}>Find my level</button></aside>
      </div>
      <PainNote />
    </>
  );
}

function BodyIllustration() {
  return (
    <div className="body-orbit" aria-label="Abstract illustration of balanced movement">
      <span className="sun" /><span className="orbit orbit-one" /><span className="orbit orbit-two" />
      <span className="figure-head" /><span className="figure-body" /><span className="leaf leaf-one" /><span className="leaf leaf-two" />
    </div>
  );
}

function Goals({
  progress,
  toggleGoal,
  startAssessment,
  navigate,
}: {
  progress: UserProgress;
  toggleGoal: (id: PathwayId) => void;
  startAssessment: (id: PathwayId) => void;
  navigate: (screen: ScreenId, id?: PathwayId) => void;
}) {
  const futureStrength = ['Horizontal Pull', 'Vertical Push', 'Core', 'Knee Flexion'];
  const futureMobility = ['Shoulders', 'Spine', 'Hips', 'Hamstrings', 'Ankles', 'Wrists', 'Whole-body flow'];
  return (
    <>
      <PageIntro eyebrow="EXPLORE GOALS" title="What would you like your body to do?" body="Choose the pathways that matter to you. Each one turns a distant goal into a series of calm, achievable steps." />
      <section className="pathway-list" aria-label="Available strength pathways">
        {pathways.map((pathway) => {
          const selected = progress.selectedGoals.includes(pathway.id);
          const levelIndex = progress.currentLevels[pathway.id] ?? 0;
          return (
            <article className={`pathway-card ${pathway.tone}`} key={pathway.id}>
              <div className="pathway-symbol">{pathway.symbol}</div>
              <div className="pathway-main"><p className="eyebrow">{pathway.longName}</p><h2>{pathway.name} <span>towards {pathway.destination}</span></h2><p>{pathway.description}</p><div className="level-dots" aria-label={`Current level ${levelIndex + 1}`}>{pathway.levels.map((_, index) => <i key={index} className={index <= levelIndex ? 'filled' : ''} />)}</div></div>
              <div className="pathway-actions"><button className={selected ? 'selected-button' : 'secondary-button'} onClick={() => toggleGoal(pathway.id)}>{selected ? '✓ Chosen goal' : '+ Add goal'}</button><button className="text-button" onClick={() => startAssessment(pathway.id)}>Find my level →</button><button className="quiet-link" onClick={() => navigate('next-step', pathway.id)}>See progression</button></div>
            </article>
          );
        })}
      </section>
      <section className="coming-soon-grid">
        <div className="coming-card"><p className="eyebrow">MORE STRENGTH PATHWAYS</p><h2>Growing next</h2><div>{futureStrength.map((name) => <span key={name}>{name}<small>Coming soon</small></span>)}</div></div>
        <div className="coming-card mobility"><p className="eyebrow">MOBILITY PATHWAYS</p><h2>Room to move</h2><div>{futureMobility.map((name) => <span key={name}>{name}<small>Planned</small></span>)}</div></div>
      </section>
    </>
  );
}

function Assessment({
  pathwayId,
  setPathwayId,
  step,
  result,
  answer,
  restart,
  navigate,
}: {
  pathwayId: PathwayId;
  setPathwayId: (id: PathwayId) => void;
  step: number;
  result: number | null;
  answer: (passed: boolean) => void;
  restart: () => void;
  navigate: (screen: ScreenId, id?: PathwayId) => void;
}) {
  const pathway = pathwayById[pathwayId];
  const checkpoint = pathway.assessment[step];
  return (
    <>
      <PageIntro eyebrow="FIND MY LEVEL" title="Meet your body where it is today." body="This is a simple self-check, not a test to win. Choose the answer that reflects a calm, honest attempt." />
      <PathwayTabs active={pathwayId} select={setPathwayId} />
      {result === null ? (
        <section className="assessment-shell">
          <div className="assessment-progress"><span>CHECK {step + 1} OF {pathway.assessment.length}</span><div>{pathway.assessment.map((_, index) => <i className={index <= step ? 'filled' : ''} key={index} />)}</div></div>
          <div className="assessment-content">
            <div className="assessment-visual"><span className="assessment-number">0{step + 1}</span><div className="pose-lines"><i /><i /><i /></div></div>
            <div className="assessment-copy"><p className="eyebrow">{pathway.longName}</p><h2>{checkpoint.title}</h2><p className="assessment-instruction">{checkpoint.instruction}</p><div className="criteria"><strong>What “comfortable” means here</strong><span>{checkpoint.passCriteria}</span></div><div className="answer-buttons"><button className="answer-yes" onClick={() => answer(true)}>Yes, comfortably <span>→</span></button><button onClick={() => answer(false)}>Not yet / not today</button></div></div>
          </div>
          <PainNote compact />
        </section>
      ) : (
        <section className="result-card">
          <span className="result-flower">✦</span><p className="eyebrow">YOUR CURRENT STARTING POINT</p><h1>{pathway.levels[result].title}</h1><p>{pathway.levels[result].description}</p><div className="result-path"><span>Today</span>{pathway.levels.map((level, index) => <i key={level.id} className={index <= result ? 'filled' : ''} title={level.title} />)}<span>{pathway.destination}</span></div><div className="result-actions"><button className="primary-button" onClick={() => navigate('next-step', pathwayId)}>Discover my next step →</button><button className="secondary-button" onClick={restart}>Repeat assessment</button></div><small>Your result is saved on this device and can be updated at any time.</small>
        </section>
      )}
    </>
  );
}

function NextStep({
  pathwayId,
  setPathwayId,
  levelIndex,
  openPractice,
  startAssessment,
}: {
  pathwayId: PathwayId;
  setPathwayId: (id: PathwayId) => void;
  levelIndex: number;
  openPractice: () => void;
  startAssessment: (id: PathwayId) => void;
}) {
  const pathway = pathwayById[pathwayId];
  const level = pathway.levels[levelIndex];
  const isLast = levelIndex === pathway.levels.length - 1;
  const next = pathway.levels[Math.min(levelIndex + 1, pathway.levels.length - 1)];
  return (
    <>
      <PageIntro eyebrow="MY NEXT STEP" title="A clear place to begin." body="Practise the level that matches you now. Quality, comfort and consistency matter more than rushing ahead." />
      <PathwayTabs active={pathwayId} select={setPathwayId} />
      <section className={`level-hero ${pathway.tone}`}>
        <div><p className="eyebrow">CURRENT LEVEL · {levelIndex + 1} OF {pathway.levels.length}</p><h1>{level.title}</h1><p>{level.description}</p><div className="milestone-box"><span>Ready to progress when</span><strong>{level.milestone}</strong></div></div>
        <div className="level-map">{pathway.levels.map((item, index) => <div key={item.id} className={index === levelIndex ? 'current' : index < levelIndex ? 'done' : ''}><i>{index < levelIndex ? '✓' : index + 1}</i><span>{item.title}</span></div>)}</div>
      </section>
      <section className="exercise-section">
        <div className="section-heading"><div><p className="eyebrow">PRACTISE THIS</p><h2>Your suggested exercises</h2></div><button className="primary-button small" onClick={openPractice}>+ Record practice</button></div>
        <div className="exercise-grid">
          {level.exercises.map((exercise) => (
            <article className="exercise-card" key={exercise.id}>
              <div className="video-wrap"><iframe src={`https://www.youtube-nocookie.com/embed/${exercise.videoId}`} title={`${exercise.title} demonstration`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
              <div className="exercise-body"><div className="exercise-title"><div><p className="eyebrow">{pathway.name}</p><h3>{exercise.title}</h3></div><span>{exercise.prescription}</span></div><p>{exercise.purpose}</p><ol>{exercise.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol><button className="text-button" onClick={openPractice}>I practised this →</button></div>
            </article>
          ))}
        </div>
      </section>
      <section className="next-level-callout"><span className="goal-mark">{isLast ? '✦' : levelIndex + 2}</span><div><p className="eyebrow">{isLast ? 'WHERE THIS LEADS' : 'NEXT ACHIEVABLE LEVEL'}</p><h2>{isLast ? pathway.destination : next.title}</h2><p>{isLast ? 'Keep refining quality, confidence and ease in this advanced movement.' : next.description}</p></div><button className="secondary-button" onClick={() => startAssessment(pathwayId)}>Reassess my level</button></section>
      <PainNote />
    </>
  );
}

function Journey({ progress, openPractice, startAssessment }: { progress: UserProgress; openPractice: () => void; startAssessment: (id: PathwayId) => void }) {
  const events = useMemo(() => [
    ...progress.practices.map((entry) => ({ type: 'practice' as const, id: entry.id, date: entry.date, pathwayId: entry.pathwayId, title: entry.exerciseTitle, detail: `${entry.sets ?? '—'} sets · Felt ${['', 'very easy', 'easy', 'moderate', 'challenging', 'very hard'][entry.difficulty]}` })),
    ...progress.assessments.map((entry) => ({ type: 'assessment' as const, id: entry.id, date: entry.date, pathwayId: entry.pathwayId, title: `Level found: ${entry.levelTitle}`, detail: 'Self-assessment' })),
  ].sort((a, b) => b.date.localeCompare(a.date)), [progress]);
  const totalMinutes = progress.practices.length * 8;
  return (
    <>
      <div className="journey-intro"><PageIntro eyebrow="MY JOURNEY" title="Notice what is changing." body="Your journey is more than numbers. Keep a gentle record of practice, effort, body feedback and meaningful milestones." /><button className="primary-button" onClick={openPractice}>+ Record a practice</button></div>
      <section className="journey-stats"><div><span>{progress.practices.length}</span><small>practices recorded</small></div><div><span>{totalMinutes}</span><small>approx. minutes</small></div><div><span>{progress.assessments.length}</span><small>assessments</small></div><div><span>{progress.milestones.length}</span><small>level changes</small></div></section>
      <div className="journey-layout">
        <section className="timeline-card"><div className="section-heading compact"><div><p className="eyebrow">HISTORY</p><h2>Your recent moments</h2></div></div>{events.length ? <div className="timeline">{events.map((event) => <article key={`${event.type}-${event.id}`}><span className={`timeline-icon ${event.type}`}>{event.type === 'practice' ? '↟' : '◎'}</span><div><time>{formatDate(event.date)}</time><h3>{event.title}</h3><p>{pathwayById[event.pathwayId].name} · {event.detail}</p></div></article>)}</div> : <div className="journey-empty"><span>○</span><h3>Your journey starts with noticing.</h3><p>Record a practice or complete an assessment to create your first entry.</p><button className="secondary-button" onClick={openPractice}>Record practice</button></div>}</section>
        <aside className="milestones-card"><p className="eyebrow">MILESTONES</p><h2>Moments worth keeping</h2>{progress.milestones.length ? progress.milestones.map((milestone, index) => <div className="milestone-row" key={`${milestone}-${index}`}><span>✦</span><p>{milestone}</p></div>) : <p className="muted-copy">Level changes will appear here after you reassess.</p>}<button className="soft-button" onClick={() => startAssessment(progress.selectedGoals[0] ?? 'squat')}>Repeat an assessment</button><div className="privacy-note"><strong>Private by default</strong><p>Your notes and progress stay in this browser on this device.</p></div></aside>
      </div>
    </>
  );
}

function PracticeDialog({ pathwayId, levelIndex, close, save }: { pathwayId: PathwayId; levelIndex: number; close: () => void; save: (entry: PracticeEntry) => void }) {
  const [selectedPathwayId, setSelectedPathwayId] = useState<PathwayId>(pathwayId);
  const pathway = pathwayById[selectedPathwayId];
  const exercises = pathway.levels.flatMap((level) => level.exercises);
  const [exerciseId, setExerciseId] = useState(pathway.levels[levelIndex]?.exercises[0]?.id ?? exercises[0].id);
  const [date, setDate] = useState(today());
  const [sets, setSets] = useState('2');
  const [amount, setAmount] = useState('8');
  const [difficulty, setDifficulty] = useState(3);
  const [bodyDuring, setBodyDuring] = useState('Comfortable');
  const [bodyAfter, setBodyAfter] = useState('Energised');
  const [notes, setNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const updatePathway = (value: string) => {
    if (!isPathwayId(value)) return;
    setSelectedPathwayId(value);
    setExerciseId(pathwayById[value].levels[0].exercises[0].id);
  };

  const exercise = exercises.find((item) => item.id === exerciseId) ?? exercises[0];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    save({ id: uid(), date, pathwayId: selectedPathwayId, exerciseId: exercise.id, exerciseTitle: exercise.title, sets: Number(sets) || null, amount: Number(amount) || null, metric: exercise.metric, difficulty, bodyDuring, bodyAfter, notes: notes.trim(), videoUrl: videoUrl.trim() });
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}>
      <section className="practice-dialog" role="dialog" aria-modal="true" aria-labelledby="practice-title">
        <div className="dialog-heading"><div><p className="eyebrow">MY PRACTICE</p><h2 id="practice-title">Record what you noticed</h2></div><button onClick={close} aria-label="Close practice form">×</button></div>
        <form onSubmit={submit}>
          <div className="form-grid"><label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><label>Movement goal<select value={selectedPathwayId} onChange={(event) => updatePathway(event.target.value)}>{pathways.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div>
          <label>Exercise or progression<select value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>{exercises.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
          <div className="form-grid"><label>Sets<input inputMode="numeric" type="number" min="0" value={sets} onChange={(event) => setSets(event.target.value)} /></label><label>{exercise.metric === 'seconds' ? 'Hold time (seconds)' : 'Repetitions'}<input inputMode="numeric" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} /></label></div>
          <fieldset><legend>How difficult did it feel?</legend><div className="difficulty-options">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} className={difficulty === value ? 'active' : ''} onClick={() => setDifficulty(value)}><span>{value}</span><small>{['', 'Easy', 'Light', 'Steady', 'Hard', 'Very hard'][value]}</small></button>)}</div></fieldset>
          <div className="form-grid"><label>During practice<select value={bodyDuring} onChange={(event) => setBodyDuring(event.target.value)}><option>Comfortable</option><option>Stiff</option><option>Unsteady</option><option>Tired</option><option>Painful — I stopped</option></select></label><label>After practice<select value={bodyAfter} onChange={(event) => setBodyAfter(event.target.value)}><option>Energised</option><option>Calm</option><option>About the same</option><option>Tired</option><option>Sore or painful</option></select></label></div>
          <label>Personal notes<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What felt easier, different or worth remembering?" /></label>
          <label>Optional YouTube progress-video link<input type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://youtube.com/..." /></label>
          <PainNote compact />
          <div className="form-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button className="primary-button" type="submit">Save practice →</button></div>
        </form>
      </section>
    </div>
  );
}

function PageIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <section className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{body}</p></section>;
}

function PathwayTabs({ active, select }: { active: PathwayId; select: (id: PathwayId) => void }) {
  return <div className="pathway-tabs" role="tablist" aria-label="Choose a movement pathway">{pathways.map((pathway) => <button role="tab" aria-selected={active === pathway.id} className={active === pathway.id ? 'active' : ''} key={pathway.id} onClick={() => select(pathway.id)}><span>{pathway.symbol}</span>{pathway.name}</button>)}</div>;
}

function PainNote({ compact = false }: { compact?: boolean }) {
  return <aside className={`pain-note ${compact ? 'compact' : ''}`}><span aria-hidden="true">✦</span><p><strong>Listen to your body.</strong> Happy Body does not diagnose injuries. Stop if you feel sharp, worsening or unexplained pain, and consult a qualified healthcare professional.</p></aside>;
}
