# Happy Body authentication emails

These templates mirror the live Supabase configuration under
**Authentication → Emails → Templates**.

- `confirm-sign-up.html`
  - Subject: `Welcome to Happy Body — confirm your email`
- `magic-link-or-otp.html`
  - Subject: `Your Happy Body sign-in link`

Both templates intentionally use Supabase's `{{ .ConfirmationURL }}` variable.
Keep that variable intact when editing or restoring a template.

