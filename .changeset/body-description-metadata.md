---
"cf": patch
---

Describe `--body` consistently in `--help` and command metadata

Command metadata used by `cf tools` now gives `--body` the same description
as `--help`, including the API's own description where it has one. Endpoints
that take a raw, non-JSON body are no longer described as taking raw JSON.
