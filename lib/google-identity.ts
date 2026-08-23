'use client';

export type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdentity = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    nonce?: string;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: 'signin' | 'signup' | 'use';
    itp_support?: boolean;
    ux_mode?: 'popup' | 'redirect';
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: {
    type: 'standard';
    theme: 'outline';
    size: 'large';
    shape: 'pill';
    text: 'continue_with';
    logo_alignment: 'left';
    width: string;
  }) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

let googleIdentityPromise: Promise<GoogleIdentity> | null = null;

export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (window.google?.accounts.id) return Promise.resolve(window.google.accounts.id);
  if (googleIdentityPromise) return googleIdentityPromise;

  googleIdentityPromise = new Promise<GoogleIdentity>((resolve, reject) => {
    const finish = () => {
      if (window.google?.accounts.id) resolve(window.google.accounts.id);
      else reject(new Error('Google sign-in could not be loaded. Please check your connection and try again.'));
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    existing?.remove();

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = finish;
    script.onerror = () => {
      script.remove();
      reject(new Error('Google sign-in could not be loaded. Please try again.'));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    googleIdentityPromise = null;
    throw error;
  });

  return googleIdentityPromise;
}

export async function createGoogleNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = btoa(String.fromCharCode(...bytes));
  const encodedNonce = new TextEncoder().encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
  const hashedNonce = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return { nonce, hashedNonce };
}
