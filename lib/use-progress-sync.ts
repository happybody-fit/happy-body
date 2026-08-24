'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { User } from '@supabase/supabase-js';
import { hasMeaningfulLocalProgress, loadCloudProgress, mergeProgress, saveCloudProgress } from '@/lib/cloud-progress';
import { createDefaultData } from '@/lib/storage';
import { isCloudSyncConfigured, supabase } from '@/lib/supabase';
import type { HappyBodyData } from '@/lib/types';

const SYNC_META_KEY = 'happy-body-sync-meta-v1';

type SyncStatus = 'local' | 'connecting' | 'syncing' | 'synced' | 'offline' | 'error';

type SyncMeta = {
  linkedUserId: string | null;
  dirty: boolean;
  lastSyncedAt: string | null;
};

const emptyMeta: SyncMeta = { linkedUserId: null, dirty: false, lastSyncedAt: null };

function readMeta(): SyncMeta {
  try {
    const value = window.localStorage.getItem(SYNC_META_KEY);
    return value ? { ...emptyMeta, ...JSON.parse(value) } : emptyMeta;
  } catch {
    return emptyMeta;
  }
}

function writeMeta(meta: SyncMeta) {
  window.localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
}

export function useProgressSync(
  progress: HappyBodyData,
  setProgress: Dispatch<SetStateAction<HappyBodyData>>,
  ready: boolean,
) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SyncStatus>(isCloudSyncConfigured ? 'connecting' : 'local');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const progressRef = useRef(progress);
  const userRef = useRef<User | null>(null);
  const syncingRef = useRef(false);
  const hydratedRef = useRef(false);
  const lastUploadedRef = useRef('');

  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { userRef.current = user; }, [user]);

  const synchronize = useCallback(async (forcePreferLocal?: boolean) => {
    const currentUser = userRef.current;
    if (!supabase || !currentUser || syncingRef.current) return;
    if (!navigator.onLine) { setStatus('offline'); return; }

    syncingRef.current = true;
    setStatus('syncing');
    setErrorMessage('');
    try {
      const meta = readMeta();
      const local = progressRef.current;
      const cloud = await loadCloudProgress(supabase, currentUser.id);
      const isDifferentAccount = Boolean(meta.linkedUserId && meta.linkedUserId !== currentUser.id);
      const firstLink = !meta.linkedUserId;
      const preferLocal = forcePreferLocal ?? (meta.dirty || (firstLink && hasMeaningfulLocalProgress(local)));
      const merged = isDifferentAccount
        ? (cloud ?? createDefaultData())
        : cloud
          ? mergeProgress(local, cloud, preferLocal)
          : local;

      await saveCloudProgress(supabase, currentUser.id, merged);
      const serialized = JSON.stringify(merged);
      lastUploadedRef.current = serialized;
      progressRef.current = merged;
      if (serialized !== JSON.stringify(local)) setProgress(merged);
      const syncedAt = new Date().toISOString();
      writeMeta({ linkedUserId: currentUser.id, dirty: false, lastSyncedAt: syncedAt });
      setLastSyncedAt(syncedAt);
      setStatus('synced');
    } catch (error) {
      setStatus(navigator.onLine ? 'error' : 'offline');
      setErrorMessage(error instanceof Error ? error.message : 'Sync is temporarily unavailable.');
    } finally {
      syncingRef.current = false;
    }
  }, [setProgress]);

  useEffect(() => {
    if (!supabase || !ready) return;

    let active = true;
    const applyUser = async (nextUser: User | null) => {
      if (!active) return;
      userRef.current = nextUser;
      setUser(nextUser);
      hydratedRef.current = false;
      if (!nextUser) {
        setStatus('local');
        setLastSyncedAt(null);
        return;
      }
      setStatus('connecting');
      await synchronize();
      hydratedRef.current = true;
    };

    supabase.auth.getSession().then(({ data }) => applyUser(data.session?.user ?? null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [ready, synchronize]);

  useEffect(() => {
    if (!ready) return;
    const serialized = JSON.stringify(progress);
    if (serialized === lastUploadedRef.current) return;
    const meta = readMeta();
    if (!user) {
      if (meta.linkedUserId) writeMeta({ ...meta, dirty: true });
      return;
    }
    if (!hydratedRef.current) return;
    writeMeta({ ...meta, linkedUserId: user.id, dirty: true });
    setStatus(navigator.onLine ? 'syncing' : 'offline');
    const timeout = window.setTimeout(() => synchronize(true), 700);
    return () => window.clearTimeout(timeout);
  }, [progress, ready, synchronize, user]);

  useEffect(() => {
    if (!user) return;
    const syncWhenAvailable = () => synchronize();
    window.addEventListener('online', syncWhenAvailable);
    window.addEventListener('focus', syncWhenAvailable);
    return () => {
      window.removeEventListener('online', syncWhenAvailable);
      window.removeEventListener('focus', syncWhenAvailable);
    };
  }, [synchronize, user]);

  const sendMagicLink = async (email: string) => {
    if (!supabase) throw new Error('Cloud sync has not been connected yet.');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async (credential: string, nonce: string) => {
    if (!supabase) throw new Error('Cloud sync has not been connected yet.');
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
      nonce,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    configured: isCloudSyncConfigured,
    user,
    status,
    lastSyncedAt,
    errorMessage,
    sendMagicLink,
    signInWithGoogle,
    signOut,
    syncNow: () => synchronize(),
  };
}

export type ProgressSync = ReturnType<typeof useProgressSync>;
