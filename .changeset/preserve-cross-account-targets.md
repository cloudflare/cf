---
"cf": patch
---

Preserve cross-account Worker targets during migration and local configuration conversion

Update the Workers SDK prerelease so `cf migrate` retains the target account on service bindings and Miniflare retains it on outbound Worker bindings. This prevents those bindings from resolving to a Worker in the source account.
