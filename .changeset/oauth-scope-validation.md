---
"cf": patch
---

Name invalid OAuth scopes and re-authenticate when requesting new scopes

Name the specific invalid OAuth scopes when scope validation fails during `cf auth login`.
When requesting scopes on an existing login that lacks them, automatically trigger a new login flow
with the requested scopes rather than silently ignoring the request and exiting 0.
