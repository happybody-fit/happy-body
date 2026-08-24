'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { createGoogleNonce, loadGoogleIdentity } from '@/lib/google-identity';
import type { ProgressSync } from '@/lib/use-progress-sync';

export function AccountDialog({ sync, close }: { sync: ProgressSync; close: () => void }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const sendLink = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setFormError(''); setMessage('');
    try {
      await sync.sendMagicLink(email.trim());
      setMessage('Check your email and open the Happy Body sign-in link on this device.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'We could not send the sign-in link.');
    } finally { setBusy(false); }
  };

  const signInWithGoogle = async (credential: string, nonce: string) => {
    setBusy(true); setFormError(''); setMessage('');
    try { await sync.signInWithGoogle(credential, nonce); }
    catch (error) { setFormError(error instanceof Error ? error.message : 'We could not complete Google sign-in.'); }
    finally { setBusy(false); }
  };

  const signOut = async () => {
    setBusy(true); setFormError('');
    try { await sync.signOut(); setMessage('Signed out. Your progress is still available on this device.'); }
    catch (error) { setFormError(error instanceof Error ? error.message : 'We could not sign you out.'); }
    finally { setBusy(false); }
  };

  const statusText = {
    local: 'Saved on this device', connecting: 'Connecting to your journey…', syncing: 'Saving your latest changes…',
    synced: 'Your journey is synced', offline: 'Offline — changes will sync later', error: 'Sync needs attention',
  }[sync.status];

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}>
      <section className="practice-dialog account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <div className="dialog-heading"><div><p className="eyebrow">ACCOUNT & SYNC</p><h2 id="account-title">Take your journey with you</h2></div><button onClick={close} aria-label="Close account settings">×</button></div>
        {!sync.configured ? (
          <div className="account-empty"><span aria-hidden="true">○</span><h3>Cloud sync is almost ready.</h3><p>Your Body Map continues to save on this device while the connection is completed.</p></div>
        ) : sync.user ? (
          <div className="account-signed-in">
            <div className="account-identity"><span>{sync.user.email?.slice(0, 1).toUpperCase()}</span><div><small>Signed in as</small><strong>{sync.user.email}</strong></div></div>
            <div className={`sync-status-card ${sync.status}`}><span className="sync-status-icon" aria-hidden="true">✓</span><div><strong>{statusText}</strong><small>{sync.lastSyncedAt ? `Last synced ${new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(sync.lastSyncedAt))}` : 'Your device keeps a local copy too.'}</small></div></div>
            {(formError || sync.errorMessage) && <p className="form-message error" role="alert">{formError || sync.errorMessage}</p>}
            {message && <p className="form-message success" role="status">{message}</p>}
            <p className="account-help">Your Body Map, practices and assessments are private to your account. Keep using Happy Body offline—changes will upload later.</p>
            <div className="account-actions"><button className="secondary-button" onClick={signOut} disabled={busy}>Sign out</button><button className="primary-button" onClick={() => sync.syncNow()} disabled={busy || sync.status === 'syncing'}>Sync now</button></div>
          </div>
        ) : (
          <form className="account-form" onSubmit={sendLink}>
            <div className="account-intro"><span aria-hidden="true">↟</span><div><h3>One journey, on every device.</h3><p>Sign in to privately sync your Body Map and practice history. Your existing local progress comes with you.</p></div></div>
            <GoogleSignInButton onCredential={signInWithGoogle} disabled={busy} onError={setFormError} />
            <div className="account-divider"><span>or use email</span></div>
            <label>Email address<input type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
            <button className="primary-button account-submit" disabled={busy}>{busy ? 'Sending…' : 'Email me a sign-in link →'}</button>
            {formError && <p className="form-message error" role="alert">{formError}</p>}
            {message && <p className="form-message success" role="status">{message}</p>}
            <p className="account-fine-print">No password needed. Google shares only the basic profile and email used to identify your private account.</p>
          </form>
        )}
      </section>
    </div>
  );
}

function GoogleSignInButton({ onCredential, disabled, onError }: { onCredential: (credential: string, nonce: string) => Promise<void>; disabled: boolean; onError: (message: string) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [loading, setLoading] = useState(true);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => { onCredentialRef.current = onCredential; onErrorRef.current = onError; }, [onCredential, onError]);
  useEffect(() => {
    let active = true;
    let resizeObserver: ResizeObserver | null = null;
    const prepare = async () => {
      if (!googleClientId) { if (active) { setLoading(false); onErrorRef.current('Google sign-in has not been configured yet.'); } return; }
      try {
        const [googleIdentity, { nonce, hashedNonce }] = await Promise.all([loadGoogleIdentity(), createGoogleNonce()]);
        if (!active || !buttonRef.current) return;
        googleIdentity.initialize({
          client_id: googleClientId,
          callback: (response) => response.credential ? void onCredentialRef.current(response.credential, nonce) : onErrorRef.current('Google did not return a sign-in credential. Please try again.'),
          nonce: hashedNonce, auto_select: false, cancel_on_tap_outside: true, context: 'signin', itp_support: true, ux_mode: 'popup', use_fedcm_for_prompt: true,
        });
        const render = () => {
          const target = buttonRef.current; if (!target) return; target.replaceChildren();
          googleIdentity.renderButton(target, { type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'left', width: String(Math.min(400, Math.max(240, Math.floor(target.clientWidth)))) });
        };
        render(); resizeObserver = new ResizeObserver(render); resizeObserver.observe(buttonRef.current); setLoading(false);
      } catch (error) { if (active) { setLoading(false); onErrorRef.current(error instanceof Error ? error.message : 'Google sign-in could not be loaded.'); } }
    };
    void prepare();
    return () => { active = false; resizeObserver?.disconnect(); };
  }, [googleClientId]);
  return <div className={`google-sign-in-shell${disabled ? ' disabled' : ''}`} aria-busy={loading || disabled}><div ref={buttonRef} className="google-sign-in-frame" />{loading && <span className="google-sign-in-loading">Preparing secure Google sign-in…</span>}</div>;
}
