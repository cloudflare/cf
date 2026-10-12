---
"cf": patch
---

Reject unsupported persistence-directory overrides in `cf dev`

`cf dev --persist-to <dir>` now reports that the option is unsupported instead of
silently ignoring it. The validation runs before project setup or dev-server
startup, while `cf dev --help` remains available with the option present.
