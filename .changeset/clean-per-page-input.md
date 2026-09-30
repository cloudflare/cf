---
"cf": patch
---

Reject invalid numeric `--per-page` values

Report a CLI usage error when a numeric `--per-page` value parses to `NaN` or infinity. Continue passing finite values to the API for endpoint-specific range validation.
