'use client';

import { useMemo, useState } from 'react';
import { calibrationOptions, foundationAreas, initialAssessmentLadders, outcomeOptions } from '@/data/assessments';
import type { AssessmentCalibration, FoundationCheck, InitialAssessmentLadder } from '@/data/assessments';
import { pathwayById } from '@/data/pathways';
import type { AssessmentOutcome, AssessmentRecord, HappyBodyData, MovementState, PathwayId } from '@/lib/types';
import { PainNote, uid } from './shared';

type ResultPayload = { state: MovementState; record: AssessmentRecord; painBodyArea?: string };
type SavedResult = {
  outcome: AssessmentOutcome;
  movementId: string;
  pathwayId: PathwayId | null;
  levelIndex: number | null;
};

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function requirementsAvailable(requirements: string[], available: Set<string>) {
  return requirements.every((item) => item === 'none' || available.has(item));
}

function closestAvailableIndex(ladder: InitialAssessmentLadder, target: number, available: Set<string>) {
  const indices = ladder.checks
    .map((check, index) => requirementsAvailable(check.equipment, available) ? index : -1)
    .filter((index) => index >= 0);
  return indices.sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)[0] ?? 0;
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
  const availableEquipment = useMemo(() => new Set<string>(data.profile.equipment), [data.profile.equipment]);
  const initialLadders = useMemo(() => initialAssessmentLadders.filter((ladder) => {
    const ladderIsRelevant = !ladder.shownWhenEquipment || ladder.shownWhenEquipment.some((item) => availableEquipment.has(item));
    return ladderIsRelevant && ladder.checks.some((check) => requirementsAvailable(check.equipment, availableEquipment));
  }), [availableEquipment]);
  const pathwayChecks = useMemo(() => pathway ? pathway.assessment.map((item) => ({
    ...item,
    movementId: pathway.id,
    pathwayId: pathway.id,
    why: item.comfortPrompt,
    shortName: item.title,
    area: null,
  })) : [], [pathway]);

  const initialPathStep = useMemo(() => {
    if (!pathway || !pathwayChecks.length) return 0;
    const savedLevel = data.movementStates[pathway.id]?.currentLevel;
    if (savedLevel === null || savedLevel === undefined) return 0;
    return pathwayChecks.reduce((best, item, index) => item.levelIndex <= savedLevel ? index : best, 0);
  }, [data.movementStates, pathway, pathwayChecks]);

  const [calibration, setCalibration] = useState<AssessmentCalibration | null>(null);
  const [ladderIndex, setLadderIndex] = useState(0);
  const [initialCheckIndex, setInitialCheckIndex] = useState(0);
  const [pathStep, setPathStep] = useState(initialPathStep);
  const [complete, setComplete] = useState(false);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [highestComfortable, setHighestComfortable] = useState<number | null>(null);
  const [attemptedByLadder, setAttemptedByLadder] = useState<Record<string, Record<number, AssessmentOutcome>>>({});

  const currentLadder = mode === 'initial' ? initialLadders[ladderIndex] : null;
  const initialCheck = currentLadder?.checks[initialCheckIndex];
  const pathwayCheck = pathwayChecks[pathStep];
  const check = mode === 'initial' ? initialCheck : pathwayCheck;

  const beginInitialAssessment = (value: AssessmentCalibration) => {
    setCalibration(value);
    setLadderIndex(0);
    setInitialCheckIndex(closestAvailableIndex(initialLadders[0], initialLadders[0].entryByCalibration[value], availableEquipment));
  };

  const advanceInitialLadder = () => {
    if (!calibration || ladderIndex >= initialLadders.length - 1) {
      setComplete(true);
      return;
    }
    const nextLadderIndex = ladderIndex + 1;
    const nextLadder = initialLadders[nextLadderIndex];
    setLadderIndex(nextLadderIndex);
    setInitialCheckIndex(closestAvailableIndex(nextLadder, nextLadder.entryByCalibration[calibration], availableEquipment));
  };

  const answerInitial = (outcome: AssessmentOutcome, current: FoundationCheck) => {
    if (!currentLadder) return;
    const date = new Date().toISOString().slice(0, 10);
    const existingAttempts = attemptedByLadder[currentLadder.id] ?? {};
    const nextAttempts = { ...existingAttempts, [initialCheckIndex]: outcome };
    const demonstratedIndices = Object.entries(nextAttempts)
      .filter(([, result]) => result === 'comfortable' || result === 'limited')
      .map(([index]) => Number(index))
      .sort((a, b) => currentLadder.checks[b].levelIndex - currentLadder.checks[a].levelIndex);
    const bestCheck = demonstratedIndices.length ? currentLadder.checks[demonstratedIndices[0]] : null;
    const currentLevel = bestCheck?.levelIndex ?? null;
    const movementId = current.pathwayId ?? current.movementId ?? current.id;
    let status: MovementState['status'];
    if (outcome === 'pain') status = 'pain-flagged';
    else if (outcome === 'unsure' || outcome === 'no-equipment') status = currentLevel !== null ? 'assessed' : 'unknown';
    else if (outcome === 'not-yet') status = currentLevel !== null ? 'assessed' : 'in-progress';
    else status = 'assessed';

    const state: MovementState = {
      movementId,
      status,
      outcome,
      currentLevel,
      assessedAt: outcome === 'unsure' || outcome === 'no-equipment' ? null : date,
      reassessAfter: outcome === 'pain' || outcome === 'unsure' || outcome === 'no-equipment' ? null : addDays(date, 28),
      note: outcome === 'no-equipment' ? 'A safe setup was not available for this check.' : '',
    };
    const record: AssessmentRecord = {
      id: uid(),
      date,
      movementId,
      pathwayId: current.pathwayId,
      checkpointId: current.id,
      checkpointTitle: current.title,
      outcome,
      levelIndex: currentLevel,
      note: '',
    };
    onResult({ state, record, painBodyArea: outcome === 'pain' ? current.title : undefined });
    setSavedResults((results) => [...results, { outcome, movementId, pathwayId: current.pathwayId, levelIndex: currentLevel }]);
    setAttemptedByLadder((attempts) => ({ ...attempts, [currentLadder.id]: nextAttempts }));

    const availableIndices = currentLadder.checks
      .map((item, index) => requirementsAvailable(item.equipment, availableEquipment) ? index : -1)
      .filter((index) => index >= 0);
    let nextCheckIndex: number | null = null;
    if (outcome === 'comfortable') {
      const nearestHigher = availableIndices.find((index) => index > initialCheckIndex);
      nextCheckIndex = nearestHigher !== undefined && nextAttempts[nearestHigher] === undefined ? nearestHigher : null;
    } else if (outcome === 'not-yet') {
      const nearestLower = [...availableIndices].reverse().find((index) => index < initialCheckIndex);
      nextCheckIndex = nearestLower !== undefined && nextAttempts[nearestLower] === undefined ? nearestLower : null;
    }

    if (nextCheckIndex !== null) setInitialCheckIndex(nextCheckIndex);
    else advanceInitialLadder();
  };

  const answerPathway = (outcome: AssessmentOutcome) => {
    if (!pathway || !pathwayCheck) return;
    const date = new Date().toISOString().slice(0, 10);
    const checkpointLevel = pathwayCheck.levelIndex;
    const previousLevel = data.movementStates[pathway.id]?.currentLevel ?? null;
    const fallbackLevel = highestComfortable ?? previousLevel;
    let currentLevel: number | null = null;
    let status: MovementState['status'];

    if (outcome === 'pain') status = 'pain-flagged';
    else if (outcome === 'unsure' || outcome === 'no-equipment') status = fallbackLevel !== null ? 'needs-reassessment' : 'unknown';
    else if (outcome === 'not-yet') status = fallbackLevel !== null ? 'needs-reassessment' : 'in-progress';
    else status = 'assessed';

    if (outcome === 'comfortable' || outcome === 'limited') currentLevel = checkpointLevel;
    else if (outcome !== 'pain') currentLevel = fallbackLevel;

    const state: MovementState = {
      movementId: pathway.id,
      status,
      outcome,
      currentLevel,
      assessedAt: outcome === 'unsure' || outcome === 'no-equipment' ? null : date,
      reassessAfter: outcome === 'pain' || outcome === 'unsure' || outcome === 'no-equipment' ? null : addDays(date, 28),
      note: outcome === 'no-equipment' ? 'A safe setup was not available for this check.' : '',
    };
    const record: AssessmentRecord = {
      id: uid(),
      date,
      movementId: pathway.id,
      pathwayId: pathway.id,
      checkpointId: pathwayCheck.id,
      checkpointTitle: pathwayCheck.title,
      outcome,
      levelIndex: currentLevel,
      note: '',
    };
    onResult({ state, record, painBodyArea: outcome === 'pain' ? pathwayCheck.title : undefined });
    setSavedResults((results) => [...results, { outcome, movementId: pathway.id, pathwayId: pathway.id, levelIndex: currentLevel }]);
    if (outcome === 'comfortable') setHighestComfortable(checkpointLevel);

    if (outcome === 'comfortable' && pathStep < pathwayChecks.length - 1) setPathStep((value) => value + 1);
    else setComplete(true);
  };

  const answer = (outcome: AssessmentOutcome) => {
    if (mode === 'initial' && initialCheck) answerInitial(outcome, initialCheck);
    else answerPathway(outcome);
  };

  if (mode === 'initial' && !calibration) {
    return (
      <div className="focus-shell">
        <section className="assessment-card calibration-card" aria-labelledby="calibration-title">
          <header className="focus-header"><button className="quiet-close" onClick={onClose}>← Leave check</button><span>Before we begin</span></header>
          <div className="calibration-heading"><p className="eyebrow">FINDING YOUR STARTING POINT</p><h1 id="calibration-title">Where would you like us to begin?</h1><p>This only chooses your first movement. After every answer, we’ll move up, move down, or save the level that feels right for you.</p></div>
          <div className="calibration-grid">{calibrationOptions.map((option) => <button type="button" key={option.id} onClick={() => beginInitialAssessment(option.id)}><span aria-hidden="true">{option.id === 'gentle' ? '○' : option.id === 'some-basics' ? '◐' : option.id === 'regular-training' ? '●' : '◇'}</span><strong>{option.label}</strong><small>{option.description}</small><i aria-hidden="true">→</i></button>)}</div>
          <p className="adaptive-explainer"><strong>You are not choosing a label.</strong> This is simply a quicker route to a useful starting point, and you can stop any movement at any time.</p>
          <PainNote compact />
        </section>
      </div>
    );
  }

  if (complete) {
    const finalByMovement = new Map<string, SavedResult>();
    savedResults.forEach((result) => finalByMovement.set(result.movementId, result));
    const finalResults = [...finalByMovement.values()];
    const unknown = finalResults.filter((item) => item.outcome === 'unsure' || item.outcome === 'no-equipment').length;
    const pain = finalResults.some((item) => item.outcome === 'pain');
    const observed = finalResults.length - unknown;
    const pathwayStarts = new Set(finalResults.filter((item) => item.pathwayId && item.levelIndex !== null).map((item) => item.pathwayId)).size;
    const resolvedLevelIndex = [...savedResults].reverse().find((item) => item.levelIndex !== null)?.levelIndex ?? null;
    const level = pathway && resolvedLevelIndex !== null ? pathway.levels[resolvedLevelIndex] : null;
    return (
      <div className="focus-shell">
        <section className="assessment-result-card">
          <span className="result-flower" aria-hidden="true">✦</span>
          <p className="eyebrow">YOUR BODY MAP IS UPDATED</p>
          <h1>{level ? level.title : mode === 'initial' ? 'Your starting picture is taking shape' : pain ? 'This movement is paused' : 'A useful starting picture'}</h1>
          {level ? <p>Your current saved step is <strong>{level.title}</strong>. The next level remains visible, but you do not need to rush towards it.</p> : mode === 'initial' ? <p>We placed {observed} movement area{observed === 1 ? '' : 's'} and found {pathwayStarts} pathway starting point{pathwayStarts === 1 ? '' : 's'}{unknown ? `. ${unknown} area${unknown === 1 ? '' : 's'} stayed open for later` : ''}. The rest of your Body Map can grow gradually.</p> : <p>{pain ? 'We stopped when pain appeared and will keep this movement out of loading suggestions.' : 'We saved what you noticed today without guessing a level.'}</p>}
          <div className="result-actions"><button className="primary-button" onClick={onClose}>See what may be useful today →</button></div>
          <p className="quiet-result-note">You can repeat any check from Progress. A result is never a medical diagnosis.</p>
        </section>
      </div>
    );
  }

  if (!check) return null;
  const visibleOutcomeOptions = outcomeOptions.filter((option) => option.id !== 'no-equipment' || check.equipment.some((item) => item !== 'none'));
  const currentAreaIndex = check.area ? foundationAreas.findIndex((area) => area.id === check.area) : -1;
  const progressLength = mode === 'initial' ? initialLadders.length : pathwayChecks.length;
  const progressIndex = mode === 'initial' ? ladderIndex : pathStep;

  return (
    <div className="focus-shell">
      <section className="assessment-card" aria-labelledby="assessment-title">
        <header className="focus-header"><button className="quiet-close" onClick={onClose}>← Leave check</button><span>{mode === 'initial' ? `Part ${ladderIndex + 1} of ${initialLadders.length}` : `${pathStep + 1} of ${pathwayChecks.length}`}</span></header>
        <div className="assessment-track">{Array.from({ length: progressLength }, (_, index) => <i className={index <= progressIndex ? 'filled' : ''} key={index} />)}</div>
        {mode === 'initial' && <div className="assessment-area-track" aria-label="Movement check areas">{foundationAreas.map((area, index) => <span className={index < currentAreaIndex ? 'complete' : index === currentAreaIndex ? 'active' : ''} key={area.id}><i aria-hidden="true">{index < currentAreaIndex ? '✓' : index + 1}</i>{area.label}</span>)}</div>}
        <div className="assessment-layout">
          <div className="assessment-visual-new"><span>{String(progressIndex + 1).padStart(2, '0')}</span><div className="movement-rings"><i /><i /><i /></div></div>
          <div className="assessment-question">
            <p className="eyebrow">{mode === 'pathway' && pathway ? pathway.longName : `FOUNDATION · ${foundationAreas.find((area) => area.id === check.area)?.label ?? ''} · ${currentLadder?.label ?? ''}`}</p>
            <h1 id="assessment-title">{check.title}</h1>
            <p className="assessment-instruction">{check.instruction}</p>
            <details className="why-check"><summary>Why this is useful</summary><p>{check.why}</p></details>
            <p className="adaptive-answer-note">Your answer decides whether we move up, move down, or save this as your starting point.</p>
            <fieldset className="outcome-grid"><legend>How did that feel today?</legend>{visibleOutcomeOptions.map((option) => <button type="button" key={option.id} className={option.id === 'pain' ? 'pain-choice' : ''} onClick={() => answer(option.id)}><strong>{option.label}</strong><span>{option.hint}</span></button>)}</fieldset>
          </div>
        </div>
        <PainNote compact />
      </section>
    </div>
  );
}
