---
"cf": minor
---

Update the generated command surface for Forge OpenAPI release
`5162716769ddc087f36d6661a879e2082c88ee44`.

**Breaking:** Update scripts that use these renamed commands; there are no compatibility aliases:

- `cf realtime kit apps update`, `cf realtime kit meetings update`, `cf realtime kit meetings participants update`, `cf realtime kit presets update`, and `cf realtime kit webhooks update` now use `edit` instead of `update`.
- `cf network subnets initial-resolved-ip edit` is now `cf network subnets initial-resolved-ip replace`.
- `cf dns dnssec list zsks` is now `cf dns dnssec zsks list`.

`cf realtime kit meetings active kick` and `mute` no longer accept `--custom-participant-ids`. Use `--participant-ids` with participant IDs instead; it is now required when using individual flags.
