---
"cf": patch
---

Fix generated flags for composed scalar request fields.

Preserve enum fields expressed through `allOf` and expose scalar unions without
turning numeric or boolean values into strings, including when a field is supplied
as a positional argument. Report validation operations as
validating rather than creating resources.
