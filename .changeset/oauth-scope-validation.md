---
"cf": patch
---

Name invalid OAuth scopes and require `--force` when requesting new scopes

Name the specific invalid OAuth scopes when scope validation fails during `cf auth login`.
When requesting scopes on an existing login that lacks them, report the missing scopes and
prompt for `--force` rather than silently ignoring the request and exiting 0.
