'use client';

import { useMemo, useRef, useState } from 'react';
import { foundationMapChecks } from '@/data/assessments';
import { goalById, goalOptions } from '@/data/catalog';
import { pathwayById, pathways } from '@/data/pathways';
import { getRecommendations } from '@/lib/recommendations';
import { parseImportedData } from '@/lib/storage';
import type { BodyState, GoalId, HappyBodyData, PathwayId, Recommendation, ScreenId, UserProfile } from '@/lib/types';
import { formatDate, localDate, MovementStatusPill, PageIntro, PainNote, statusCopy, SteadinessCard } from './shared';

export function TodayScreen({
  data,
  navigate,
  saveCheckIn,
  openPractice,
  startAssessment,
}: {
  data: HappyBodyData;
  navigate: (screen: ScreenId) => void;
  saveCheckIn: (bodyState: BodyState, minutes: number) => void;
  openPractice: (recommendation: Recommendation | null) => void;
  startAssessment: (pathwayId?: PathwayId) => void;
}) {
  const today = localDate();
  const checkIn = data.dailyCheckIns.find((item) => item.date === today);
  const [bodyState, setBodyState] = useState<BodyState>(checkIn?.bodyState ?? 'steady');
  const [minutes, setMinutes] = useState(checkIn?.minutes ?? data.profile.defaultMinutes);
  const recommendations = useMemo(() => getRecommendations(data, today), [data, today]);
  const greeting = data.profile.name.trim() ? `${data.profile.name.trim()}, what` : 'What';
  const currentMapIds = [...foundationMapChecks.map((check) => check.id), ...pathways.map((pathway) => pathway.id)];
  const assessedCount = currentMapIds.filter((id) => {
    const state = data.movementStates[id];
    return Boolean(state && state.status !== 'unknown');
  }).length;
  const movementWord = assessedCount === 1 ? 'movement' : 'movements';

  return (
    <>
      <section className="today-hero">
        <div className="today-copy"><p className="eyebrow">TODAY</p><h1>{greeting} would be useful for your body today?</h1><p>Choose a suggestion, check something you do not know yet, or simply rest. Your Body Map guides the options—it does not command your day.</p><div className="hero-actions"><button className="primary-button" onClick={() => openPractice(recommendations.find((item) => item.kind === 'practice') ?? null)}>Begin a useful step →</button><button className="secondary-button" onClick={() => openPractice(null)}>I worked on something else</button></div></div>
        <div className="body-map-orbit" aria-label={`${assessedCount} ${movementWord} have information in your Body Map`}><span className="orbit-core">{assessedCount}</span><span className="orbit-label">{movementWord}<br />known</span><i className="orbit-a" /><i className="orbit-b" /><i className="orbit-c" /></div>
      </section>

      <section className="daily-checkin-card">
        <div><p className="eyebrow">OPTIONAL DAILY CHECK-IN</p><h2>{checkIn ? 'Today’s context is saved.' : 'How are you arriving?'}</h2><p>This changes suggestion size and intensity for today only.</p></div>
        <div className="checkin-controls"><div><span>Body feels</span><div className="segmented-control">{(['fresh', 'steady', 'stiff', 'tired', 'sore'] as BodyState[]).map((item) => <button key={item} className={bodyState === item ? 'active' : ''} onClick={() => setBodyState(item)}>{item}</button>)}</div></div><div><span>Time today</span><div className="segmented-control time-options">{[5, 10, 20, 30, 45].map((item) => <button key={item} className={minutes === item ? 'active' : ''} onClick={() => setMinutes(item)}>{item}m</button>)}</div></div><button className="soft-button" onClick={() => saveCheckIn(bodyState, minutes)}>{checkIn ? 'Update today' : 'Use this today'}</button></div>
      </section>

      <section className="section-block recommendations-section">
        <div className="section-heading"><div><p className="eyebrow">YOUR USEFUL OPTIONS</p><h2>Based on what you have told us</h2></div><button className="text-button" onClick={() => navigate('explore')}>Choose freely in Explore</button></div>
        <div className="recommendation-grid">{recommendations.map((item, index) => <RecommendationCard key={item.id} item={item} featured={index === 0} openPractice={openPractice} startAssessment={startAssessment} navigate={navigate} />)}</div>
      </section>

      <section className="today-lower-grid">
        <div className="quiet-card"><p className="eyebrow">YOUR BODY MAP</p><h2>{assessedCount ? `${assessedCount} ${movementWord} ${assessedCount === 1 ? 'carries' : 'carry'} useful information.` : 'No levels have been assumed.'}</h2><p>{assessedCount ? 'Unknown areas stay unknown until you choose to check them.' : 'Begin with the short foundation check when you are ready.'}</p><button className="secondary-button" onClick={() => navigate('progress')}>Open my Body Map</button></div>
        <div className="quiet-card recent-card"><p className="eyebrow">RECENT PRACTICE</p><h2>Notice, don’t judge.</h2>{data.practices.length ? data.practices.slice(0, 2).map((entry) => <div className="mini-event" key={entry.id}><span>{entry.completion === 'yes' ? '✓' : '◌'}</span><div><strong>{entry.exerciseTitle}</strong><small>{formatDate(entry.date)} · felt {entry.difficulty}</small></div></div>) : <p>Your first honest practice note will appear here.</p>}<button className="text-button" onClick={() => navigate('diary')}>See my diary →</button></div>
      </section>
      <PainNote />
    </>
  );
}

function RecommendationCard({ item, featured, openPractice, startAssessment, navigate }: { item: Recommendation; featured: boolean; openPractice: (item: Recommendation | null) => void; startAssessment: (id?: PathwayId) => void; navigate: (screen: ScreenId) => void }) {
  const action = () => {
    if (item.kind === 'practice') openPractice(item);
    else if ((item.kind === 'assess' || item.kind === 'reassess') && item.pathwayId) startAssessment(item.pathwayId);
    else navigate(item.pathwayId ? 'progress' : 'explore');
  };
  const actionLabel = item.kind === 'practice' ? 'Open practice' : item.kind === 'assess' ? 'Find my level' : item.kind === 'reassess' ? 'Reassess' : item.kind === 'rest' ? 'See other choices' : 'View on my map';
  return (
    <article className={`recommendation-card ${featured ? 'featured' : ''} kind-${item.kind}`}>
      <div className="recommendation-top"><span>{item.kind.replace('-', ' ')}</span>{item.minutes > 0 && <strong>{item.minutes} min</strong>}</div>
      <h3>{item.title}</h3><p>{item.reason}</p><small>{item.detail}</small>{item.safetyNote && <em>{item.safetyNote}</em>}
      <button className={featured ? 'primary-button light' : 'secondary-button'} onClick={action}>{actionLabel} →</button>
    </article>
  );
}

export function ProgressScreen({ data, startAssessment }: { data: HappyBodyData; startAssessment: (pathwayId?: PathwayId) => void }) {
  const movementCards = foundationMapChecks.map((check) => ({ id: check.id, title: check.shortName, detail: check.why, pathwayId: null as PathwayId | null }));
  return (
    <>
      <PageIntro eyebrow="MY BODY MAP" title="A picture of what your body can do now." body="Assessed, unknown, changing and temporarily limited can all exist together. This map values capability without pretending every movement is known." action={<button className="primary-button" onClick={() => startAssessment()}>Repeat foundation check</button>} />
      {data.painFlags.some((flag) => flag.active) && <section className="pain-flags-card"><p className="eyebrow">PAIN FLAGS</p><h2>Loading suggestions are paused here.</h2>{data.painFlags.filter((flag) => flag.active).map((flag) => <div key={flag.id}><strong>{flag.bodyArea || flag.movementId}</strong><span>{formatDate(flag.createdAt)}</span></div>)}<PainNote compact /></section>}
      <section className="body-map-section"><div className="section-heading"><div><p className="eyebrow">FOUNDATIONS</p><h2>Everyday movement capabilities</h2></div></div><div className="body-map-grid">{movementCards.map((movement) => { const state = data.movementStates[movement.id]; const safeState = state ?? { status: 'unknown' as const }; return <article className={`body-map-card status-border-${safeState.status}`} key={movement.id}><div><span className="map-symbol">{movement.title.slice(0, 1)}</span><MovementStatusPill status={safeState.status} /></div><h3>{movement.title}</h3><p>{statusCopy[safeState.status].description}</p>{state?.assessedAt && <small>Checked {formatDate(state.assessedAt)}</small>}</article>; })}</div></section>
      <section className="body-map-section"><div className="section-heading"><div><p className="eyebrow">STRENGTH PATHWAYS</p><h2>Known steps and open questions</h2></div></div><div className="pathway-progress-grid">{pathways.map((pathway) => { const state = data.movementStates[pathway.id]; const current = state?.currentLevel !== null && state?.currentLevel !== undefined ? pathway.levels[state.currentLevel] : null; const next = current && state!.currentLevel! < pathway.levels.length - 1 ? pathway.levels[state!.currentLevel! + 1] : null; return <article className={`path-progress-card ${pathway.tone}`} key={pathway.id}><header><span className="pathway-symbol small">{pathway.symbol}</span><MovementStatusPill status={state?.status ?? 'unknown'} /></header><h2>{pathway.name}</h2>{current ? <><p className="current-capability"><small>CURRENT STEP</small><strong>{current.title}</strong></p><div className="level-line"><span style={{ width: `${((state!.currentLevel! + 1) / pathway.levels.length) * 100}%` }} /></div><p>{next ? <>Next visible step: <strong>{next.title}</strong></> : <>Pathway destination reached: <strong>{pathway.destination}</strong></>}</p></> : <p>Your level remains unknown. No beginner level has been assigned.</p>}<button className="secondary-button" onClick={() => startAssessment(pathway.id)}>{current ? 'Reassess this pathway' : 'Find my level'}</button></article>; })}</div></section>
      <section className="capability-summary"><div><strong>{data.practices.filter((item) => item.completion !== 'not-today').length}</strong><span>practices completed or partly completed</span></div><div><strong>{data.assessments.length}</strong><span>honest movement observations</span></div><div><strong>{data.milestones.length}</strong><span>capability changes noticed</span></div></section>
    </>
  );
}

export function ExploreScreen({ data, updateProfile, startAssessment, openPractice }: { data: HappyBodyData; updateProfile: (profile: UserProfile) => void; startAssessment: (id: PathwayId) => void; openPractice: (item: Recommendation | null) => void }) {
  const [activeId, setActiveId] = useState<PathwayId>('squat');
  const pathway = pathwayById[activeId];
  const state = data.movementStates[activeId];
  const specificGoal: Record<PathwayId, GoalId> = { squat: 'pistol-squat', 'push-up': 'push-up', 'pull-up': 'pull-up' };
  const selected = data.profile.skillInterests.includes(specificGoal[activeId]) || data.profile.primaryGoal === specificGoal[activeId] || data.profile.secondaryGoals.includes(specificGoal[activeId]);
  const toggle = () => updateProfile({ ...data.profile, skillInterests: selected ? data.profile.skillInterests.filter((item) => item !== specificGoal[activeId]) : [...data.profile.skillInterests, specificGoal[activeId]] });
  return (
    <>
      <PageIntro eyebrow="EXPLORE" title="See the whole path without rushing it." body="Explore every developed level, understand what comes next, and choose your own practice. A visible destination is not a demand to reach it." />
      <div className="explore-tabs" role="tablist">{pathways.map((item) => <button role="tab" aria-selected={activeId === item.id} className={activeId === item.id ? 'active' : ''} key={item.id} onClick={() => setActiveId(item.id)}><span>{item.symbol}</span><strong>{item.name}</strong><small>{item.levels.length} steps</small></button>)}</div>
      <section className={`explore-hero ${pathway.tone}`}><div><p className="eyebrow">{pathway.longName}</p><h1>{pathway.name}</h1><p>{pathway.description}</p><div className="hero-actions"><button className="primary-button" onClick={() => startAssessment(pathway.id)}>{state?.currentLevel !== null && state?.currentLevel !== undefined ? 'Reassess my level' : 'Find my level'} →</button><button className={selected ? 'selected-button' : 'secondary-button'} onClick={toggle}>{selected ? '✓ In my goals' : '+ Add to my goals'}</button></div></div><div className="destination-medallion"><small>PATHWAY DESTINATION</small><strong>{pathway.destination}</strong></div></section>
      <section className="pathway-ladder"><div className="section-heading"><div><p className="eyebrow">THE PATHWAY</p><h2>From first contact to advanced capability</h2></div></div>{pathway.levels.map((level, index) => { const current = state?.currentLevel === index; const knownIndex = state?.currentLevel ?? -1; const done = knownIndex >= 0 && index < knownIndex; const item = level.exercises[0]; return <article className={`ladder-step ${current ? 'current' : ''} ${done ? 'done' : ''}`} key={level.id}><span className="step-index">{done ? '✓' : index + 1}</span><div className="ladder-main"><div><small>{current ? 'YOUR CURRENT STEP' : index === knownIndex + 1 ? 'NEXT VISIBLE STEP' : `LEVEL ${index + 1}`}</small><h3>{level.title}</h3><p>{level.description}</p></div><details><summary>Exercise guidance</summary><div><p><strong>{item.title}</strong> · {item.sets} sets · {item.reps ?? item.hold}</p><ul>{item.cues.map((cue) => <li key={cue}>{cue}</li>)}</ul><button className="text-button" onClick={() => openPractice({ id: `explore-${item.id}`, kind: 'practice', movementId: pathway.id, pathwayId: pathway.id, title: item.title, reason: 'You chose this from the full pathway.', detail: item.purpose, minutes: item.durationMinutes, score: 0, exerciseId: item.id })}>Practise or record this →</button></div></details></div><span className="milestone-copy">{level.milestone}</span></article>; })}</section>
      <SteadinessCard />
      <section className="future-goals"><div><p className="eyebrow">VISIBLE, NOT INVENTED</p><h2>Goals waiting for verified pathways</h2><p>These can remain part of your direction. We will not assign made-up levels or random exercises while their content is being developed.</p></div><div className="future-goal-grid">{goalOptions.filter((goal) => ['handstand', 'front-split', 'middle-split'].includes(goal.id)).map((goal) => <span key={goal.id}><strong>{goal.label}</strong><small>Pathway planned</small></span>)}</div></section>
      <PainNote />
    </>
  );
}

export function DiaryScreen({ data, openPractice }: { data: HappyBodyData; openPractice: (item: Recommendation | null) => void }) {
  const [filter, setFilter] = useState<'all' | 'practice' | 'assessment'>('all');
  const events = useMemo(() => [
    ...data.practices.map((item) => ({ id: item.id, type: 'practice' as const, date: item.date, title: item.exerciseTitle, detail: `${item.completion} · ${item.difficulty} · body ${item.bodyAfter}`, note: item.notes, pathwayId: item.pathwayId })),
    ...data.assessments.map((item) => ({ id: item.id, type: 'assessment' as const, date: item.date, title: item.checkpointTitle, detail: item.outcome.replace('-', ' '), note: item.note, pathwayId: item.pathwayId })),
  ].filter((item) => filter === 'all' || item.type === filter).sort((a, b) => b.date.localeCompare(a.date)), [data, filter]);
  return (
    <>
      <PageIntro eyebrow="MY DIARY" title="Keep what you noticed." body="Practice, effort, body feedback and assessment results live together here. Honest entries are more useful than perfect ones." action={<button className="primary-button" onClick={() => openPractice(null)}>+ Record a practice</button>} />
      <div className="diary-toolbar"><div className="segmented-control">{(['all', 'practice', 'assessment'] as const).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><span>{events.length} entr{events.length === 1 ? 'y' : 'ies'}</span></div>
      <section className="diary-timeline">{events.length ? events.map((event) => <article key={`${event.type}-${event.id}`}><time>{formatDate(event.date)}</time><span className={`event-icon ${event.type}`}>{event.type === 'practice' ? '↟' : '◎'}</span><div><small>{event.type}{event.pathwayId ? ` · ${pathwayById[event.pathwayId].name}` : ''}</small><h3>{event.title}</h3><p>{event.detail}</p>{event.note && <blockquote>{event.note}</blockquote>}</div></article>) : <div className="diary-empty"><span>○</span><h2>Your diary begins with noticing.</h2><p>Record something you tried, even if you only did part of it.</p><button className="secondary-button" onClick={() => openPractice(null)}>Record my first practice</button></div>}</section>
    </>
  );
}

export function SettingsScreen({
  data,
  updateProfile,
  repeatOnboarding,
  repeatAssessment,
  openAccount,
  importData,
  resetData,
}: {
  data: HappyBodyData;
  updateProfile: (profile: UserProfile) => void;
  repeatOnboarding: () => void;
  repeatAssessment: () => void;
  openAccount: () => void;
  importData: (data: HappyBodyData) => void;
  resetData: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetWord, setResetWord] = useState('');
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `happy-body-${localDate()}.json`; link.click(); URL.revokeObjectURL(url);
    setMessage('Your Happy Body export has been downloaded.');
  };
  const readImport = async (file?: File) => {
    if (!file) return;
    try { importData(parseImportedData(await file.text())); setMessage('Your Happy Body data has been imported.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'That file could not be imported.'); }
  };
  const selectedGoals = [data.profile.primaryGoal, ...data.profile.secondaryGoals, ...data.profile.skillInterests].filter((goal): goal is GoalId => Boolean(goal));
  return (
    <>
      <PageIntro eyebrow="SETTINGS" title="Keep Happy Body personal and portable." body="Adjust your context, repeat the gentle setup, or make a private copy of everything stored in the app." />
      {message && <p className="settings-message" role="status">{message}</p>}
      <div className="settings-grid">
        <section className="settings-card"><p className="eyebrow">YOUR CONTEXT</p><h2>{data.profile.name || 'Your Happy Body'}</h2><label>Display name<input value={data.profile.name} onChange={(event) => updateProfile({ ...data.profile, name: event.target.value })} placeholder="Optional" /></label><label>Usual practice time<select value={data.profile.defaultMinutes} onChange={(event) => updateProfile({ ...data.profile, defaultMinutes: Number(event.target.value) })}>{[5, 10, 20, 30, 45, 60].map((item) => <option value={item} key={item}>{item} minutes</option>)}</select></label><div className="settings-goals"><small>GOALS ON YOUR MAP</small>{selectedGoals.length ? selectedGoals.map((goal) => <span key={goal}>{goalById[goal].label}</span>) : <p>No goals chosen yet.</p>}</div><button className="secondary-button" onClick={repeatOnboarding}>Review onboarding choices</button></section>
        <section className="settings-card"><p className="eyebrow">ACCOUNT & SYNC</p><h2>Local first, with optional sync.</h2><p>Happy Body saves a complete working copy in this browser. If you sign in, an encrypted web connection also sends your private data to your account so another device can load it.</p><button className="primary-button" onClick={openAccount}>Open account & sync</button><small>Signing out does not remove the local copy on this device.</small></section>
        <section className="settings-card"><p className="eyebrow">ASSESSMENTS</p><h2>Your body can change.</h2><p>Repeat the short foundation check or open any pathway from Progress. Old results remain in your diary.</p><button className="secondary-button" onClick={repeatAssessment}>Repeat foundation check</button></section>
        <section className="settings-card"><p className="eyebrow">YOUR DATA</p><h2>Export or bring back your journey.</h2><p>The JSON export contains your profile choices, Body Map, diary and assessments. Keep it somewhere private.</p><div className="settings-actions"><button className="secondary-button" onClick={exportData}>Export my data</button><button className="secondary-button" onClick={() => fileInput.current?.click()}>Import data</button><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(event) => void readImport(event.target.files?.[0])} /></div></section>
        <section className="settings-card danger-card"><p className="eyebrow">START OVER</p><h2>Reset this device.</h2><p>This removes the local version 2 Body Map and returns to onboarding. If you are signed in, reset while online so the change can sync.</p>{showReset ? <div className="reset-confirm"><label>Type RESET to confirm<input value={resetWord} onChange={(event) => setResetWord(event.target.value)} /></label><div><button className="text-button" onClick={() => setShowReset(false)}>Cancel</button><button className="danger-button" disabled={resetWord !== 'RESET'} onClick={resetData}>Reset Happy Body</button></div></div> : <button className="danger-link" onClick={() => setShowReset(true)}>Reset local data…</button>}</section>
      </div>
    </>
  );
}
