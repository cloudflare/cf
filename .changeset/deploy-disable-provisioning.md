---
"cf": minor
---

Add `cf deploy --no-provision`

Disable automatic resource provisioning for a deployment so bindings without
required resource identifiers fail instead of creating new resources.
Provisioning remains enabled by default.
