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

`cf auth logout` now uses the same shared messages as Wrangler and also clears a
cached temporary account. When `CLOUDFLARE_API_TOKEN` is set, it asks you to
unset the variable and leaves any stored OAuth login in place, as Wrangler does.
