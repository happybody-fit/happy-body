'use client';

import { useMemo, useState } from 'react';
import { foundationChecks, outcomeOptions } from '@/data/assessments';
import { pathwayById } from '@/data/pathways';
import type { AssessmentOutcome, AssessmentRecord, HappyBodyData, MovementState, PathwayId } from '@/lib/types';
import { PainNote, uid } from './shared';

type ResultPayload = { state: MovementState; record: AssessmentRecord; painBodyArea?: string };

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function AssessmentFlow({
  data,
  mode,
  pathwayId,
  onResult,
  onClose,
}: {
  data: HappyBodyData;
  mode: 'initial' | 'pathway';
  pathwayId?: PathwayId;
  onResult: (payload: ResultPayload) => void;
  onClose: () => void;
}) {
  const pathway = pathwayId ? pathwayById[pathwayId] : null;
  const checks = useMemo(() => {
    if (mode === 'pathway' && pathway) return pathway.assessment.map((item) => ({ ...item, pathwayId: pathway.id, why: item.comfortPrompt, shortName: item.title }));
    const goals = new Set([
      ...(data.profile.primaryGoal ? [data.profile.primaryGoal] : []),
      ...data.profile.secondaryGoals,
      ...data.profile.skillInterests,
    ]);
    return foundationChecks.filter((check) => !check.shownForGoals || check.shownForGoals.some((goal) => goals.has(goal)));
  }, [data.profile, mode, pathway]);
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [savedOutcomes, setSavedOutcomes] = useState<AssessmentOutcome[]>([]);
  const [highestComfortable, setHighestComfortable] = useState<number | null>(null);
  const check = checks[step];

  const answer = (outcome: AssessmentOutcome) => {
    const date = new Date().toISOString().slice(0, 10);
    const isPathwayCheck = Boolean(mode === 'pathway' && pathway);
    const checkpointLevel = 'levelIndex' in check ? check.levelIndex : null;
    const movementId = isPathwayCheck ? pathway!.id : check.id;
    let currentLevel: number | null = null;
    let status: MovementState['status'];

    if (outcome === 'pain') status = 'pain-flagged';
    else if (outcome === 'unsure' || outcome === 'no-equipment') status = isPathwayCheck && highestComfortable !== null ? 'assessed' : 'unknown';
    else if (outcome === 'limited') status = 'temporarily-limited';
    else if (outcome === 'not-yet') status = 'in-progress';
    else status = isPathwayCheck ? 'assessed' : 'achieved';

    if (isPathwayCheck) {
      if (outcome === 'comfortable') currentLevel = checkpointLevel;
      else if (outcome !== 'pain') currentLevel = highestComfortable;
    } else if (check.pathwayId && outcome === 'comfortable') {
      currentLevel = 0;
    }

    const effectiveMovementId = !isPathwayCheck && check.pathwayId ? check.pathwayId : movementId;
    const state: MovementState = {
      movementId: effectiveMovementId,
      status,
      outcome,
      currentLevel,
      assessedAt: outcome === 'unsure' || outcome === 'no-equipment' ? null : date,
      reassessAfter: outcome === 'pain' ? null : addDays(date, 28),
      note: outcome === 'no-equipment' ? 'Equipment was not available for this check.' : '',
    };
    const record: AssessmentRecord = {
      id: uid(),
      date,
      movementId: effectiveMovementId,
      pathwayId: isPathwayCheck ? pathway!.id : check.pathwayId,
      checkpointId: check.id,
      checkpointTitle: check.title,
      outcome,
      levelIndex: currentLevel,
      note: '',
    };
    onResult({ state, record, painBodyArea: outcome === 'pain' ? check.title : undefined });
    setSavedOutcomes((current) => [...current, outcome]);
    if (isPathwayCheck && outcome === 'comfortable' && checkpointLevel !== null) setHighestComfortable(checkpointLevel);

    const endsPathway = isPathwayCheck && outcome !== 'comfortable';
    if (step === checks.length - 1 || endsPathway) setComplete(true);
    else setStep((value) => value + 1);
  };

  if (complete) {
    const comfortable = savedOutcomes.filter((item) => item === 'comfortable').length;
    const unknown = savedOutcomes.filter((item) => item === 'unsure' || item === 'no-equipment').length;
    const pain = savedOutcomes.includes('pain');
    const level = pathway && highestComfortable !== null ? pathway.levels[highestComfortable] : null;
    return (
      <div className="focus-shell">
        <section className="assessment-result-card">
          <span className="result-flower" aria-hidden="true">✦</span>
          <p className="eyebrow">YOUR BODY MAP IS UPDATED</p>
          <h1>{level ? level.title : pain ? 'This movement is paused' : 'A useful starting picture'}</h1>
          {level ? <p>Your current saved step is <strong>{level.title}</strong>. The next level remains visible, but you do not need to rush towards it.</p> : <p>{comfortable} movement{comfortable === 1 ? '' : 's'} felt comfortable today{unknown ? `, and ${unknown} stayed unknown` : ''}. Every answer is useful information.</p>}
          <div className="result-actions"><button className="primary-button" onClick={onClose}>See what may be useful today →</button></div>
          <p className="quiet-result-note">You can repeat any check from Progress. A result is never a medical diagnosis.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="focus-shell">
      <section className="assessment-card" aria-labelledby="assessment-title">
        <header className="focus-header"><button className="quiet-close" onClick={onClose}>← Leave check</button><span>{step + 1} of {checks.length}</span></header>
        <div className="assessment-track">{checks.map((_, index) => <i className={index <= step ? 'filled' : ''} key={index} />)}</div>
        <div className="assessment-layout">
          <div className="assessment-visual-new"><span>{String(step + 1).padStart(2, '0')}</span><div className="movement-rings"><i /><i /><i /></div></div>
          <div className="assessment-question">
            <p className="eyebrow">{mode === 'pathway' && pathway ? pathway.longName : 'FOUNDATION MOVEMENT'}</p>
            <h1 id="assessment-title">{check.title}</h1>
            <p className="assessment-instruction">{check.instruction}</p>
            <details className="why-check"><summary>Why this is useful</summary><p>{check.why}</p></details>
            <fieldset className="outcome-grid"><legend>How did that feel?</legend>{outcomeOptions.map((option) => <button type="button" key={option.id} className={option.id === 'pain' ? 'pain-choice' : ''} onClick={() => answer(option.id)}><strong>{option.label}</strong><span>{option.hint}</span></button>)}</fieldset>
          </div>
        </div>
        <PainNote compact />
      </section>
    </div>
  );
}
