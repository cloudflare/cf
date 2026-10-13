---
"cf": minor
---

Support temporary accounts with `--temporary-account`

When no Cloudflare credentials are available, commands can now create or reuse
a short-lived account. cf prints the account's claim URL and uses that
account's ID and scoped API token for the command.

When a command fails because no credentials exist, cf suggests rerunning it
with `--temporary-account`.

Pass `--event-code` with `--temporary-account` to redeem an event code when cf
creates the account. cf does not cache, print, or record the code in telemetry.
