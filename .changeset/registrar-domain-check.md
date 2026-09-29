---
"cf": patch
---

Fix `cf registrar registrations check` so positional domains are sent in the request body.

Allow several domains as separate positional arguments, including in the registrar sandbox command, and show the same body in `--dry-run` output.
