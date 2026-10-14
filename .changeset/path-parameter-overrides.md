---
"cf": patch
---

Honor defaults and argument overrides for path parameters

Generated commands now honor `x-forge-params` defaults, requiredness, and
positional placement for path parameters. A defaulted path parameter becomes
an optional flag, and the default is used in API requests and dry-run previews.

Defaulted path parameters no longer consume positional arguments, so commands
can use their resource identifier as the positional while accepting a scope
override as a flag. Path parameters without an annotated default retain their
existing behavior unless their requiredness or placement is explicitly overridden.
