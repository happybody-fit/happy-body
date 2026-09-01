'use client';

import { FormEvent, useMemo, useState } from 'react';
import { getExerciseVideoSource } from '@/data/exercise-videos';
import { findExercise, pathwayById, pathways } from '@/data/pathways';
import type { PathwayId, PracticeEntry, Recommendation } from '@/lib/types';
import { localDate, PainNote, uid } from './shared';

type PracticeFeeling = 'easy' | 'right' | 'too-much' | 'pain';

const feelingOptions: { id: PracticeFeeling; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'right', label: 'About right' },
  { id: 'too-much', label: 'Too much' },
  { id: 'pain', label: 'Pain' },
];

export function PracticeDialog({ recommendation, close, save }: { recommendation: Recommendation | null; close: () => void; save: (entry: PracticeEntry) => void }) {
  const suggested = recommendation?.exerciseId ? findExercise(recommendation.exerciseId) : null;
  const [selfChosen, setSelfChosen] = useState(!suggested);
  const [pathwayId, setPathwayId] = useState<PathwayId>(suggested?.pathway.id ?? 'squat');
  const availableExercises = useMemo(() => pathwayById[pathwayId].levels.flatMap((item) => item.exercises), [pathwayId]);
  const [exerciseId, setExerciseId] = useState(suggested?.exercise.id ?? availableExercises[0].id);
  const [completion, setCompletion] = useState<PracticeEntry['completion'] | null>(null);
  const [feeling, setFeeling] = useState<PracticeFeeling | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [date, setDate] = useState(localDate());
  const [sets, setSets] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const item = selfChosen ? availableExercises.find((candidate) => candidate.id === exerciseId) ?? availableExercises[0] : suggested!.exercise;
  const pathway = selfChosen ? pathwayById[pathwayId] : suggested!.pathway;
  const videoSource = getExerciseVideoSource(item.id);

  const selectPathway = (id: PathwayId) => {
    setPathwayId(id);
    setExerciseId(pathwayById[id].levels[0].exercises[0].id);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!completion || (completion !== 'not-today' && !feeling)) return;
    const difficulty: PracticeEntry['difficulty'] = feeling === 'easy' ? 'easy' : feeling === 'too-much' || feeling === 'pain' ? 'challenging' : 'good';
    const bodyAfter: PracticeEntry['bodyAfter'] = feeling === 'pain' ? 'pain' : feeling === 'too-much' ? 'tired' : 'good';
    save({
      id: uid(), date, pathwayId: pathway.id, movementId: pathway.id, exerciseId: item.id, exerciseTitle: item.title,
      completion, difficulty, bodyAfter, sets: Number(sets) || null, amount: Number(amount) || null, metric: item.metric,
      bodyDuring: '', notes: notes.trim(), videoUrl: videoUrl.trim(), source: selfChosen ? 'self-chosen' : 'recommendation',
    });
  };

  return (
    <div className="dialog-backdrop practice-focus" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}>
      <section className="practice-dialog practice-guide" role="dialog" aria-modal="true" aria-labelledby="practice-title">
        <div className="dialog-heading"><div><p className="eyebrow">{selfChosen ? 'YOUR CHOICE' : 'A USEFUL NEXT STEP'}</p><h2 id="practice-title">{selfChosen ? 'Record something else' : item.title}</h2></div><button onClick={close} aria-label="Close practice">×</button></div>

        {item.videoId && <div className="practice-video"><div className="video-wrap"><iframe src={`https://www.youtube-nocookie.com/embed/${item.videoId}?playsinline=1&rel=0`} title={`${item.title} demonstration`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>{item.videoStatus === 'placeholder' && <div className="practice-video-note"><span>Temporary YouTube demonstration</span>{videoSource && <a href={videoSource.watchUrl} target="_blank" rel="noreferrer">{videoSource.sourceLabel} ↗</a>}</div>}</div>}

        {selfChosen ? <div className="self-choice-fields"><label>Movement<select value={pathwayId} onChange={(event) => selectPathway(event.target.value as PathwayId)}>{(['Strength', 'Mobility'] as const).map((category) => <optgroup label={category} key={category}>{pathways.filter((candidate) => candidate.category === category).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</optgroup>)}</select></label><label>What did you practise?<select value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>{availableExercises.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.title}</option>)}</select></label></div> : <><div className="practice-why"><span>{recommendation?.minutes || item.durationMinutes} min</span><p>{recommendation?.reason}</p></div>{recommendation && recommendation.minutes > item.durationMinutes && <p className="extended-practice-note"><strong>You have time to move unhurriedly.</strong> Keep the prescribed sets and use the remaining time for comfortable setup and full rest. You do not need to add repetitions to fill the clock.</p>}</>}

        <div className="practice-prescription"><div><small>SUGGESTION</small><strong>{item.sets} sets · {item.reps ?? item.hold}</strong></div><div><small>REST</small><strong>{item.rest}</strong></div></div>
        <ol className="cue-list">{item.cues.map((cue) => <li key={cue}>{cue}</li>)}</ol>
        <details className="guidance-details"><summary>More guidance</summary><div className="guidance-grid"><div><strong>What it may feel like</strong><p>{item.feel}</p></div><div><strong>Step back when</strong><p>{item.regressWhen}</p></div><div><strong>Explore the next step when</strong><p>{item.progressWhen}</p></div><div><strong>Watch for</strong><p>{item.commonMistakes.join(' · ')}</p></div></div></details>
        <form className="quick-log" onSubmit={submit}>
          <div className="quick-log-heading"><div><p className="eyebrow">QUICK LOG</p><h3>How did it go?</h3></div>{!selfChosen && <button type="button" className="text-button" onClick={() => setSelfChosen(true)}>I worked on something else</button>}</div>
          <fieldset><legend>Did you practise it?</legend><div className="three-choices">{[['yes', 'Completed'], ['partly', 'Partly'], ['not-today', 'Not today']].map(([id, label]) => <button type="button" key={id} className={completion === id ? 'selected' : ''} onClick={() => { const next = id as PracticeEntry['completion']; setCompletion(next); if (next === 'not-today') setFeeling(null); }}>{label}</button>)}</div></fieldset>
          {completion && completion !== 'not-today' && <fieldset><legend>How did it feel?</legend><div className="four-choices">{feelingOptions.map(({ id, label }) => <button type="button" key={id} className={`${feeling === id ? 'selected' : ''} ${id === 'pain' ? 'pain-choice' : ''}`} onClick={() => setFeeling(id)}>{label}</button>)}</div></fieldset>}
          <button type="button" className="details-toggle" onClick={() => setShowNote((value) => !value)} aria-expanded={showNote}>{showNote ? 'Hide note' : '+ Add a note (optional)'}</button>
          {showNote && <label className="quick-note">Anything you want to remember?<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What felt useful or different?" /></label>}
          {completion !== 'not-today' && <details className="advanced-log-details"><summary>Add numbers or a progress video</summary><div className="optional-log-details"><div className="form-grid"><label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Sets<input type="number" inputMode="numeric" min="0" value={sets} onChange={(event) => setSets(event.target.value)} /></label></div><label>{item.metric === 'seconds' ? 'Hold time in seconds' : 'Repetitions'}<input type="number" inputMode="numeric" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label>Optional YouTube progress-video link<input type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://youtube.com/…" /></label></div></details>}
          {feeling === 'pain' && <PainNote compact />}
          <button className="primary-button save-quick-log" disabled={!completion || (completion !== 'not-today' && !feeling)}>Save practice →</button>
        </form>
      </section>
    </div>
  );
}
