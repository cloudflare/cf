---
"cf": patch
---

Support experimental workload identity through `bindings.identity({ audience })`.

Use `getToken()` for a fresh assertion with the configured audience. Opt into
`getAuthorizationGrant({ authorizationServer, scope })` and signed `fetch()`
with separate configuration limits. Subjects derive from platform Worker IDs.
`cf dev` forwards the selected auth profile to the shared local development broker.
