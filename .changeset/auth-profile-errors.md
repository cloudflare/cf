---
"cf": patch
---

Accurately report missing auth profiles

When commands resolve or are given a non-existent auth profile, report that the specified profile
was not found and list available profiles instead of emitting a misleading "No authentication token found" error.
