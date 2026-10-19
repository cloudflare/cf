---
"cf": minor
---

Write hand-written command messages to stderr

Breaking change during the beta: `cf auth login`, `cf auth logout`, the auth
profile commands, `cf cli telemetry enable` / `disable` and `cf migrate` now
print their notices, warnings and success messages on stderr, so redirected or
piped stdout holds only command output, as with generated commands. The
messages use clack's log lines and the `✓` success line, and a command to run
next is printed on its own line so it copies cleanly. `cf auth login` with
`CLOUDFLARE_API_TOKEN` set now prints a single warning.
