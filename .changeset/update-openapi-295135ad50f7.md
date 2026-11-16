---
"cf": minor
---

Update the generated command surface for Forge OpenAPI release
`295135ad50f7498c831e9229d5a63170cccd92f7`.

Breaking change: the following commands have been renamed without compatibility
aliases. Update scripts to use the replacements:

- `cf email-routing addresses update` → `cf email-routing addresses edit`
- `cf email-routing settings update` → `cf email-routing settings edit`
- `cf email-routing settings apply` → `cf email-routing settings replace`
- `cf cloudforce-one rules email update-pending-approval` → `cf cloudforce-one rules email approvals replace`
