---
"cf": patch
---

Name invalid OAuth scopes and re-authenticate when changing scopes

Name the specific invalid OAuth scopes when scope validation fails during `cf auth login`.
When an explicit scope list differs from the existing login's scopes, start a new login flow
with the requested scopes without requiring `--force`, including when requesting fewer scopes.
