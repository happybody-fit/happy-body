'use client';

import { useEffect, useState } from 'react';
import { pathwayById } from '@/data/pathways';
import { AccountDialog } from '@/components/account-dialog';
import { AssessmentFlow } from '@/components/assessment-flow';
import { Onboarding } from '@/components/onboarding';
import { PracticeDialog } from '@/components/practice-dialog';
import { DiaryScreen, ExploreScreen, ProgressScreen, SettingsScreen, TodayScreen } from '@/components/screens';
import { Header, localDate, MobileNav, uid } from '@/components/shared';
import { browserProgressRepository, createDefaultData } from '@/lib/storage';
import { useProgressSync } from '@/lib/use-progress-sync';
import type { BodyState, HappyBodyData, PathwayId, PracticeEntry, Recommendation, ScreenId, UserProfile } from '@/lib/types';

type AssessmentView = { mode: 'initial' | 'pathway'; pathwayId?: PathwayId } | null;

export default function Home() {
  const [data, setData] = useState<HappyBodyData>(() => createDefaultData());
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<ScreenId>('today');
  const [assessment, setAssessment] = useState<AssessmentView>(null);
  const [practice, setPractice] = useState<Recommendation | null | undefined>(undefined);
  const [showAccount, setShowAccount] = useState(false);
  const [toast, setToast] = useState('');
  const sync = useProgressSync(data, setData, ready);

  useEffect(() => {
    const loaded = browserProgressRepository.load();
    // localStorage is read after hydration so server and client markup stay identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loaded);
    setScreen(loaded.preferences.lastScreen ?? 'today');
    setReady(true);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  }, []);

  useEffect(() => {
    if (ready) browserProgressRepository.save(data);
  }, [data, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (next: ScreenId) => {
    setScreen(next);
    setData((current) => ({ ...current, preferences: { ...current.preferences, lastScreen: next }, updatedAt: new Date().toISOString() }));
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const completeOnboarding = (profile: UserProfile, takeAssessment: boolean) => {
    setData((current) => ({ ...current, profile, updatedAt: new Date().toISOString() }));
    if (takeAssessment) setAssessment({ mode: 'initial' });
    else { setScreen('today'); setToast('Your Body Map is ready whenever you want to begin.'); }
  };

  const startAssessment = (pathwayId?: PathwayId) => setAssessment(pathwayId ? { mode: 'pathway', pathwayId } : { mode: 'initial' });

  const saveAssessmentResult: React.ComponentProps<typeof AssessmentFlow>['onResult'] = ({ state, record, painBodyArea }) => {
    setData((current) => {
      const previous = current.movementStates[state.movementId];
      const preserveAdvancedLevel = record.checkpointId.startsWith('goal-')
        && previous?.currentLevel !== null
        && previous?.currentLevel !== undefined
        && state.currentLevel !== null
        && previous.currentLevel > state.currentLevel;
      const nextState = preserveAdvancedLevel ? { ...state, currentLevel: previous.currentLevel, status: previous.status } : state;
      const newLevel = record.pathwayId && nextState.currentLevel !== null ? pathwayById[record.pathwayId].levels[nextState.currentLevel] : null;
      const levelChanged = Boolean(newLevel && previous?.currentLevel !== null && previous?.currentLevel !== undefined && previous.currentLevel !== nextState.currentLevel);
      return {
        ...current,
        movementStates: { ...current.movementStates, [state.movementId]: nextState },
        assessments: [record, ...current.assessments],
        painFlags: painBodyArea
          ? [{ id: uid(), movementId: state.movementId, bodyArea: painBodyArea, note: '', createdAt: record.date, active: true }, ...current.painFlags]
          : current.painFlags.map((flag) => flag.movementId === state.movementId ? { ...flag, active: false } : flag),
        milestones: levelChanged ? [`${pathwayById[record.pathwayId!].name}: ${newLevel!.title}`, ...current.milestones] : current.milestones,
        preferences: { ...current.preferences, assessmentIntroSeen: true },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const savePractice = (entry: PracticeEntry) => {
    setData((current) => {
      const currentState = entry.pathwayId ? current.movementStates[entry.pathwayId] : null;
      const pain = entry.bodyAfter === 'pain';
      return {
        ...current,
        practices: [entry, ...current.practices],
        movementStates: entry.pathwayId ? {
          ...current.movementStates,
          [entry.pathwayId]: {
            ...(currentState ?? { movementId: entry.pathwayId, currentLevel: null, outcome: null, assessedAt: null, reassessAfter: null, note: '' }),
            status: pain ? 'pain-flagged' : currentState?.currentLevel !== null && currentState?.currentLevel !== undefined ? 'in-progress' : 'unknown',
          },
        } : current.movementStates,
        painFlags: pain ? [{ id: uid(), movementId: entry.movementId, bodyArea: entry.exerciseTitle, note: entry.notes, createdAt: entry.date, active: true }, ...current.painFlags] : current.painFlags,
        updatedAt: new Date().toISOString(),
      };
    });
    setPractice(undefined);
    setToast(entry.completion === 'not-today' ? 'Not today is useful information. Saved to your diary.' : 'Practice saved. Notice what changes over time.');
  };

  const saveCheckIn = (bodyState: BodyState, minutes: number) => {
    const date = localDate();
    setData((current) => ({ ...current, dailyCheckIns: [{ date, bodyState, minutes }, ...current.dailyCheckIns.filter((item) => item.date !== date)], updatedAt: new Date().toISOString() }));
    setToast('Today’s context is saved. Suggestions have adjusted.');
  };

  const updateProfile = (profile: UserProfile) => setData((current) => ({ ...current, profile, updatedAt: new Date().toISOString() }));
  const resetData = () => { browserProgressRepository.clear(); setData(createDefaultData()); setScreen('today'); setToast('Local Happy Body data has been reset.'); };

  if (!ready) return <main className="loading-shell"><span className="result-flower">✦</span><p>Preparing your Happy Body…</p></main>;
  if (!data.profile.onboardingCompleted) return <Onboarding initial={data.profile} onComplete={completeOnboarding} />;
  if (assessment) return <AssessmentFlow data={data} mode={assessment.mode} pathwayId={assessment.pathwayId} onResult={saveAssessmentResult} onClose={() => { setAssessment(null); setScreen('today'); }} />;

  return (
    <main className="app-shell">
      <Header screen={screen} data={data} sync={sync} navigate={navigate} openAccount={() => setShowAccount(true)} />
      <div className="app-page">
        {screen === 'today' && <TodayScreen data={data} navigate={navigate} saveCheckIn={saveCheckIn} openPractice={setPractice} startAssessment={startAssessment} />}
        {screen === 'progress' && <ProgressScreen data={data} startAssessment={startAssessment} />}
        {screen === 'explore' && <ExploreScreen data={data} updateProfile={updateProfile} startAssessment={startAssessment} openPractice={setPractice} />}
        {screen === 'diary' && <DiaryScreen data={data} openPractice={setPractice} />}
        {screen === 'settings' && <SettingsScreen data={data} updateProfile={updateProfile} repeatOnboarding={() => updateProfile({ ...data.profile, onboardingCompleted: false })} repeatAssessment={() => startAssessment()} openAccount={() => setShowAccount(true)} importData={(next) => { setData(next); setScreen(next.preferences.lastScreen); }} resetData={resetData} />}
      </div>
      <MobileNav screen={screen} navigate={navigate} />
      {practice !== undefined && <PracticeDialog recommendation={practice} close={() => setPractice(undefined)} save={savePractice} />}
      {showAccount && <AccountDialog sync={sync} close={() => setShowAccount(false)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
