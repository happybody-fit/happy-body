'use client';

import { useMemo, useState } from 'react';
import { getExerciseVideoSource } from '@/data/exercise-videos';
import { findExercise } from '@/data/pathways';
import type { PracticeEntry, Recommendation, TodaySessionPlan } from '@/lib/types';
import { localDate, PainNote, uid } from './shared';

type SessionStep =
  | { id: 'prepare'; kind: 'prepare' }
  | { id: string; kind: 'movement'; recommendation: Recommendation }
  | { id: 'finish'; kind: 'finish' };

type BodyAfter = PracticeEntry['bodyAfter'];

const bodyAfterOptions: Array<{ id: BodyAfter; label: string }> = [
  { id: 'better', label: 'Better' },
  { id: 'good', label: 'Good' },
  { id: 'tired', label: 'Tired' },
  { id: 'sore', label: 'Sore' },
  { id: 'pain', label: 'Pain' },
];

export function GuidedPracticeDialog({
  plan,
  close,
  openRecommendation,
  complete,
}: {
  plan: TodaySessionPlan;
  close: () => void;
  openRecommendation: (recommendation: Recommendation) => void;
  complete: (entries: PracticeEntry[]) => void;
}) {
  const steps = useMemo<SessionStep[]>(() => [
    ...(plan.warmUpMinutes ? [{ id: 'prepare' as const, kind: 'prepare' as const }] : []),
    ...plan.recommendations.filter((item) => item.minutes > 0).map((recommendation) => ({ id: recommendation.id, kind: 'movement' as const, recommendation })),
    ...(plan.finishMinutes ? [{ id: 'finish' as const, kind: 'finish' as const }] : []),
  ], [plan]);
  const [stepIndex, setStepIndex] = useState(0);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [bodyAfter, setBodyAfter] = useState<BodyAfter | null>(null);
  const [notes, setNotes] = useState('');
  const reflection = stepIndex >= steps.length;
  const currentStep = steps[stepIndex];
  const completedMovementCount = plan.recommendations.filter((item) => item.kind === 'practice' && item.exerciseId && !skippedIds.includes(item.id)).length;
  const progress = reflection ? 100 : Math.round(((stepIndex + 1) / Math.max(steps.length, 1)) * 100);

  const advance = () => setStepIndex((current) => Math.min(current + 1, steps.length));
  const goBack = () => setStepIndex((current) => Math.max(0, current - 1));
  const skipMovement = (recommendation: Recommendation) => {
    setSkippedIds((current) => current.includes(recommendation.id) ? current : [...current, recommendation.id]);
    advance();
  };

  const saveSession = () => {
    if (!bodyAfter) return;
    const date = localDate();
    const sessionId = uid();
    const entries: PracticeEntry[] = [];
    plan.recommendations
      .filter((item) => item.kind === 'practice' && item.exerciseId && !skippedIds.includes(item.id))
      .forEach((item, index) => {
        const found = findExercise(item.exerciseId!);
        if (!found) return;
        const difficulty: PracticeEntry['difficulty'] = bodyAfter === 'tired' || bodyAfter === 'sore' || bodyAfter === 'pain' ? 'challenging' : 'good';
        entries.push({
          id: `${sessionId}-${index + 1}`,
          date,
          pathwayId: found.pathway.id,
          movementId: found.pathway.id,
          exerciseId: found.exercise.id,
          exerciseTitle: found.exercise.title,
          completion: 'yes' as const,
          difficulty,
          bodyAfter,
          sets: found.exercise.sets,
          amount: null,
          metric: found.exercise.metric,
          bodyDuring: '',
          notes: index === 0 ? notes.trim() : '',
          videoUrl: '',
          source: 'recommendation',
        });
      });
    complete(entries);
  };

  return (
    <div className="dialog-backdrop guided-practice-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}>
      <section className="guided-practice-dialog" role="dialog" aria-modal="true" aria-labelledby="guided-practice-title">
        <header className="guided-practice-bar">
          <div>
            <p className="eyebrow">TODAY’S PRACTICE</p>
            <strong>{reflection ? 'Practice complete' : `${stepIndex + 1} of ${steps.length}`}</strong>
          </div>
          <button type="button" onClick={close} aria-label="Close guided practice">×</button>
        </header>
        <div className="guided-progress" aria-label={`${progress}% of practice viewed`}><i style={{ width: `${progress}%` }} /></div>

        {reflection ? (
          <div className="guided-reflection">
            <span className="guided-complete-mark" aria-hidden="true">✓</span>
            <p className="eyebrow">YOU’RE DONE</p>
            <h2 id="guided-practice-title">How does your body feel now?</h2>
            <p>{completedMovementCount ? `We’ll record the ${completedMovementCount} ${completedMovementCount === 1 ? 'movement' : 'movements'} you completed.` : 'You can finish without recording a movement today.'}</p>
            {completedMovementCount > 0 && <>
              <div className="guided-feeling-options">{bodyAfterOptions.map((option) => <button type="button" key={option.id} className={bodyAfter === option.id ? 'selected' : ''} onClick={() => setBodyAfter(option.id)}>{option.label}</button>)}</div>
              <label className="guided-session-note">Anything you would like to remember?<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional note" /></label>
              {bodyAfter === 'pain' && <PainNote compact />}
            </>}
            <div className="guided-reflection-actions">
              <button type="button" className="secondary-button" onClick={goBack}>Back</button>
              {completedMovementCount > 0 ? <button type="button" className="primary-button" disabled={!bodyAfter} onClick={saveSession}>Save today’s practice →</button> : <button type="button" className="primary-button" onClick={() => complete([])}>Finish for today</button>}
            </div>
          </div>
        ) : currentStep?.kind === 'prepare' ? (
          <div className="guided-step-body">
            <div className="guided-step-heading"><span className="guided-phase-symbol">↗</span><div><p className="eyebrow">PREPARE · {plan.warmUpMinutes} MIN</p><h2 id="guided-practice-title">Warm up for today’s movements</h2><p>Begin gently. You should feel warmer and more ready—not tired.</p></div></div>
            <ol className="guided-warm-up-list">{plan.warmUpSteps.map((step) => <li key={step.id}><span>{step.minutes} min</span><div><h3>{step.title}</h3><p>{step.instruction}</p></div></li>)}</ol>
            <PainNote compact />
            <GuidedActions canGoBack={false} back={goBack} skip={null} next={advance} nextLabel="Warm-up complete — continue" />
          </div>
        ) : currentStep?.kind === 'finish' ? (
          <div className="guided-step-body guided-finish-step">
            <div className="guided-step-heading"><span className="guided-phase-symbol finish">○</span><div><p className="eyebrow">FINISH · {plan.finishMinutes} MIN</p><h2 id="guided-practice-title">Let your breathing settle</h2><p>Give your body a few quiet minutes before you finish.</p></div></div>
            <div className="guided-finish-grid"><article><span>01</span><strong>Move easily</strong><p>Walk around or repeat a comfortable movement with less effort.</p></article><article><span>02</span><strong>Slow your breathing</strong><p>Let your breath return to its natural rhythm without forcing it.</p></article><article><span>03</span><strong>Notice the change</strong><p>Take a moment to feel how your body is different from when you began.</p></article></div>
            <GuidedActions canGoBack back={goBack} skip={null} next={advance} nextLabel="Finish practice" />
          </div>
        ) : currentStep?.kind === 'movement' ? (
          <GuidedMovement
            recommendation={currentStep.recommendation}
            canGoBack={stepIndex > 0}
            back={goBack}
            skip={() => skipMovement(currentStep.recommendation)}
            next={advance}
            openRecommendation={() => openRecommendation(currentStep.recommendation)}
          />
        ) : null}
      </section>
    </div>
  );
}

function GuidedMovement({ recommendation, canGoBack, back, skip, next, openRecommendation }: { recommendation: Recommendation; canGoBack: boolean; back: () => void; skip: () => void; next: () => void; openRecommendation: () => void }) {
  const found = recommendation.exerciseId ? findExercise(recommendation.exerciseId) : null;
  const videoSource = found ? getExerciseVideoSource(found.exercise.id) : null;

  if (!found) {
    return (
      <div className="guided-step-body guided-action-step">
        <div className="guided-step-heading"><span className="guided-phase-symbol">◎</span><div><p className="eyebrow">{recommendation.kind === 'reassess' ? 'REASSESSMENT' : 'FIND YOUR LEVEL'} · {recommendation.minutes} MIN</p><h2 id="guided-practice-title">{recommendation.title}</h2><p>{recommendation.reason}</p></div></div>
        <div className="guided-action-card"><strong>{recommendation.detail}</strong><p>This short check helps us choose a movement that matches your current level.</p><button type="button" className="primary-button" onClick={openRecommendation}>Open the movement check →</button></div>
        <GuidedActions canGoBack={canGoBack} back={back} skip={skip} next={null} nextLabel="" />
      </div>
    );
  }

  const { exercise, pathway } = found;
  return (
    <div className="guided-movement-step">
      <div className="guided-video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${exercise.videoId}?playsinline=1&rel=0`} title={`${exercise.title} demonstration`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
      <div className="guided-movement-content">
        {exercise.videoStatus === 'placeholder' && videoSource && <div className="guided-video-source"><span>Temporary demonstration</span><a href={videoSource.watchUrl} target="_blank" rel="noreferrer">{videoSource.sourceLabel} ↗</a></div>}
        <div className="guided-movement-heading"><div><p className="eyebrow">{pathway.name.toUpperCase()} · {recommendation.minutes} MIN</p><h2 id="guided-practice-title">{exercise.title}</h2></div><span>{pathway.category}</span></div>
        <p className="guided-movement-purpose">{exercise.purpose}</p>
        <div className="guided-dose"><div><small>DO</small><strong>{exercise.sets} sets · {exercise.reps ?? exercise.hold}</strong></div><div><small>REST</small><strong>{exercise.rest}</strong></div></div>
        <section className="guided-instructions"><p className="eyebrow">HOW TO MOVE</p><ol>{exercise.cues.map((cue) => <li key={cue}>{cue}</li>)}</ol></section>
        <details className="guided-more"><summary>More guidance</summary><div><p><strong>What it may feel like</strong>{exercise.feel}</p><p><strong>Make it easier when</strong>{exercise.regressWhen}</p><p><strong>Ready for more when</strong>{exercise.progressWhen}</p></div></details>
        <GuidedActions canGoBack={canGoBack} back={back} skip={skip} next={next} nextLabel="Done — next movement" />
      </div>
    </div>
  );
}

function GuidedActions({ canGoBack, back, skip, next, nextLabel }: { canGoBack: boolean; back: () => void; skip: (() => void) | null; next: (() => void) | null; nextLabel: string }) {
  return (
    <div className="guided-actions">
      {canGoBack ? <button type="button" className="secondary-button" onClick={back}>Back</button> : <span />}
      <div>{skip && <button type="button" className="text-button" onClick={skip}>Skip for today</button>}{next && <button type="button" className="primary-button" onClick={next}>{nextLabel} →</button>}</div>
    </div>
  );
}
