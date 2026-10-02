---
"cf": patch
---

Reject invalid numeric argument values

Report a CLI usage error when yargs parses a numeric argument as `NaN` or infinity. Continue passing finite values to the API for endpoint-specific range validation.
