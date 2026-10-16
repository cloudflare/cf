---
"cf": patch
---

Validate nested tagged unions when assembling request bodies from flags.

Preserve branch-specific required fields, closed-object rules, and available
array limits, including unions selected by enum values without an explicit
discriminator. Apply the checks to requests and dry-run previews.
