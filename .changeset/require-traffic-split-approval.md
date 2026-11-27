---
"cf": minor
---

Require approval before `cf deploy` replaces an active Worker traffic split with a 100% rollout. Confirm the replacement in a terminal or pass `--force` to deploy without prompting. Declining keeps the existing split and exits with a nonzero status. Dry runs remain offline and explain what a real deploy would change.
