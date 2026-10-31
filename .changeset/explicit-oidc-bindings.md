---
"cf": minor
---

Support experimental workload identity through `bindings.identity({ audience })`.

Use `getToken()` for a fresh assertion with the configured audience. Opt into
`getAuthorizationGrant({ authorizationServer, scope })` and signed `fetch()`
with separate configuration limits. Subjects derive from platform Worker IDs.
Local calls report unsupported issuance. Use a deployed Preview for real tokens,
grants and signed requests, or mock the binding in tests.
