---
"cf": patch
---

Validate `--body` before authenticating or confirming

Commands now parse `--body`, and enforce its item limit, before
authenticating or showing a confirmation prompt. A malformed body or an
unreadable `@file` therefore fails straight away, without a login or account
lookup first and without asking you to confirm a destructive action. On JSON
endpoints, an empty `--body ""` is now rejected as invalid JSON instead of
being ignored, and `--dry-run` shows the `--file` path for raw-body uploads.
Multipart flags still keep `--body` literal, and `--file` still takes
precedence over `--body`; early validation only parses a body the command
will send.
