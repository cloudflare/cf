---
"cf": minor
---

Support temporary accounts with `--temporary-account`

Create or reuse a short-lived Cloudflare account without signing in. cf prints
a claim URL; use `--event-code` to redeem an event code during account creation.

Help, authentication checks, and dry runs never create accounts. `cf auth logout`
clears cached temporary accounts.
