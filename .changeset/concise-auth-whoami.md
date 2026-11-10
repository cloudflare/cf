---
"cf": minor
---

Summarize authentication for humans and add `cf whoami`

Show authentication status and method, the selected profile, email, accessible account names and IDs, and grouped OAuth scope counts in interactive terminals. CI, non-interactive runs, and agents continue to receive full JSON; use `--json` or `--no-json` to choose explicitly. JSON adds profile selection information while retaining the existing fields.

Add `cf whoami` as a hidden alias for `cf auth whoami`. The interactive default output changes in this beta release; scripts can request JSON explicitly.
