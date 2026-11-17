---
"cf": minor
---

Default OAuth login to OS keyring storage when available

`cf auth login` now verifies the OS keyring backend and enables encrypted
credential storage by default when no storage preference or environment override
is set. Existing plaintext credentials migrate through the shared auth layer.
When the backend is unavailable, login keeps plaintext storage with a one-time
warning and retries the keyring on a later login. Saved preferences,
`--use-keyring` / `--no-use-keyring`, and `CLOUDFLARE_AUTH_USE_KEYRING` retain
their existing behavior. This changes the default storage behavior during the
1.0 beta.
