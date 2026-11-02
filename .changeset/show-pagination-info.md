---
"cf": patch
---

Expose pagination metadata on stderr

Print the API's `result_info`, including cursors and page counts, on stderr so
list results can be paged with `--cursor` or the endpoint's page flags. Keep
stdout payloads unchanged for scripts, preserve metadata for object results
and passthrough requests, and suppress the notice with `--quiet`.
