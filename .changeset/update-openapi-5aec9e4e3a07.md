---
"cf": minor
---

Update the generated beta CWS commands for Cloudflare API schemas revision
`5aec9e4e3a074fa419d2fe1b7c0894e513c29a3e`.

**Breaking:** `cf zero-trust cws tenant-structures nodes batch <structure-id>`
is now `cf zero-trust cws tenant-structures nodes bulk-apply --structure-id <structure-id>`.
There is no compatibility alias; update scripts to use the new command name and flag.

**Breaking:** `cf zero-trust cws policies delete <policy-id>` no longer removes
policy-set memberships. Detach the policy from every policy set before deleting it.
Likewise, detach a policy set from every deployment before running
`cf zero-trust cws policy-sets delete <policy-set-id>`.
