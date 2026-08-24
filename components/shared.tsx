'use client';

import type { HappyBodyData, MovementStatus, ScreenId } from '@/lib/types';
import type { ProgressSync } from '@/lib/use-progress-sync';

export const navItems: Array<{ id: ScreenId; label: string; icon: string }> = [
  { id: 'today', label: 'Today', icon: '⌂' },
  { id: 'progress', label: 'Progress', icon: '◎' },
  { id: 'explore', label: 'Explore', icon: '◇' },
  { id: 'diary', label: 'Diary', icon: '≋' },
  { id: 'settings', label: 'Settings', icon: '○' },
];

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

export function Brand() {
  return (
    <span className="brand">
      {/* eslint-disable-next-line @next/next/no-img-element -- optimized local PWA mark */}
      <img className="brand-mark" src="./logo-mark.png" alt="" aria-hidden="true" />
      <span>Happy Body</span>
    </span>
  );
}

export function Header({
  screen,
  data,
  sync,
  navigate,
  openAccount,
}: {
  screen: ScreenId;
  data: HappyBodyData;
  sync: ProgressSync;
  navigate: (screen: ScreenId) => void;
  openAccount: () => void;
}) {
  const identity = data.profile.name.trim() || sync.user?.email || '';
  const initial = identity ? identity.slice(0, 1).toUpperCase() : '○';
  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => navigate('today')} aria-label="Happy Body home"><Brand /></button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => <button key={item.id} className={screen === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>{item.label}</button>)}
      </nav>
      <button className={`avatar sync-${sync.status}`} onClick={openAccount} aria-label={`Account and progress sync: ${sync.status}`}>
        {initial}<span className="sync-dot" aria-hidden="true" />
      </button>
    </header>
  );
}

export function MobileNav({ screen, navigate }: { screen: ScreenId; navigate: (screen: ScreenId) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {navItems.map((item) => (
        <button key={item.id} className={screen === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
          <span aria-hidden="true">{item.icon}</span>{item.label}
        </button>
      ))}
    </nav>
  );
}

export function PageIntro({ eyebrow, title, body, action }: { eyebrow: string; title: string; body: string; action?: React.ReactNode }) {
  return (
    <section className="page-intro page-intro-with-action">
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{body}</p></div>
      {action}
    </section>
  );
}

export function PainNote({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`pain-note ${compact ? 'compact' : ''}`}>
      <span aria-hidden="true">✦</span>
      <p><strong>Listen to your body.</strong> We do not diagnose injuries. Stop if you feel sharp, worsening or unexplained pain, and consult a qualified healthcare professional.</p>
    </aside>
  );
}

export const statusCopy: Record<MovementStatus, { label: string; description: string }> = {
  unknown: { label: 'Unknown', description: 'Not assessed yet' },
  assessed: { label: 'Assessed', description: 'A starting point is saved' },
  'in-progress': { label: 'In progress', description: 'Currently being practised' },
  achieved: { label: 'Achieved', description: 'The current capability feels comfortable' },
  'needs-reassessment': { label: 'Reassess', description: 'Ready for a fresh check' },
  'temporarily-limited': { label: 'Limited today', description: 'Keep the next step gentle' },
  'pain-flagged': { label: 'Pain flagged', description: 'Loading suggestions are paused' },
};

export function MovementStatusPill({ status }: { status: MovementStatus }) {
  return <span className={`status-pill status-${status}`}>{statusCopy[status].label}</span>;
}

export function SteadinessCard() {
  return (
    <details className="steadiness-card">
      <summary><span>Steadiness and ease</span><small>Sthira Sukham Asanam</small></summary>
      <div><p>A useful practice is steady enough to feel organised and easy enough that you can keep breathing. The goal is not to make every movement effortless—it is to choose a challenge you can meet without force.</p></div>
    </details>
  );
}
