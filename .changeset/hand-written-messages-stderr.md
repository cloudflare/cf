---
"cf": minor
---

Write hand-written command messages to stderr

Breaking change during the beta: `cf auth login`, `cf auth logout`, the auth
profile commands, `cf cli telemetry enable` / `disable` and `cf migrate` now
print their notices, warnings and success messages on stderr, so redirected or
piped stdout holds only command output, as with generated commands. The auth
and telemetry commands use clack's log lines and the `✓` success line, which,
as with generated commands, appears only when stderr is a terminal. A command
to run next is printed on its own line so it copies cleanly. `cf auth login`
with `CLOUDFLARE_API_TOKEN` set now warns once that the token takes
precedence, and `cf auth logout` no longer reports removing OAuth tokens that
it keeps while `CLOUDFLARE_API_TOKEN` is set.
