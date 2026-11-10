---
"cf": minor
---

Summarize authentication for humans and add `cf whoami`

Start interactive output with `Authenticated as <email> via OAuth` or `via API Token`, and show a separate activation line only for named profiles. Include accessible account names and IDs and grouped OAuth scope counts. CI, non-interactive runs, and agents continue to receive full JSON; use `--json` or `--no-json` to choose explicitly. JSON adds profile selection information while retaining the existing fields.

Sanitize control and Unicode formatting characters in human-readable account and identity details while preserving the original values in JSON.

Add `cf whoami` as a hidden alias for `cf auth whoami`. The interactive default output changes in this beta release; scripts can request JSON explicitly.
