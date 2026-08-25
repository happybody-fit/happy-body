'use client';

import type { Recommendation, TodaySessionPlan } from '@/lib/types';
import { PainNote } from './shared';

export function WarmUpDialog({
  plan,
  close,
  continueSession,
}: {
  plan: TodaySessionPlan;
  close: () => void;
  continueSession: (recommendation: Recommendation) => void;
}) {
  const firstStep = plan.recommendations.find((item) => item.minutes > 0) ?? plan.recommendations[0];

  return (
    <div className="dialog-backdrop practice-focus" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}>
      <section className="practice-dialog warm-up-dialog" role="dialog" aria-modal="true" aria-labelledby="warm-up-title">
        <div className="dialog-heading">
          <div><p className="eyebrow">PREPARE</p><h2 id="warm-up-title">Prepare your body</h2></div>
          <button onClick={close} aria-label="Close warm-up">×</button>
        </div>

        <div className="warm-up-intro">
          <span>{plan.warmUpMinutes} min</span>
          <div><strong>Made for today’s practice</strong><p>Begin gently, then prepare the areas you’ll use. You should feel warmer and more ready—not tired.</p></div>
        </div>

        <ol className="warm-up-steps">
          {plan.warmUpSteps.map((step) => (
            <li key={step.id}>
              <span>{step.minutes} min</span>
              <div><h3>{step.title}</h3><p>{step.instruction}</p></div>
            </li>
          ))}
        </ol>

        <PainNote compact />
        <div className="warm-up-actions">
          <button className="secondary-button" onClick={close}>Not now</button>
          {firstStep && <button className="primary-button" onClick={() => continueSession(firstStep)}>Warm-up complete — continue →</button>}
        </div>
      </section>
    </div>
  );
}
