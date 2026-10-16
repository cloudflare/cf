---
"cf": patch
---

Fix generated flags for composed scalar request fields.

Preserve enum fields expressed through `allOf` and expose scalar unions without
turning numeric or boolean values into strings. Report validation operations as
validating rather than creating resources.
