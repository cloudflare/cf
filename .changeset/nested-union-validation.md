---
"cf": patch
---

Validate nested tagged unions when assembling request bodies from flags.

Preserve branch-specific required fields, closed-object rules, and available
array limits, including unions selected by enum values without an explicit
discriminator. Apply the checks to requests and dry-run previews.
Preserve the alternatives of enclosing unions and retain explicit `--body`
input as an escape hatch from these projected checks.
