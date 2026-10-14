---
"cf": patch
---

Send `--cf-r2-jurisdiction`, `--if-none-match` and `--if-modified-since` with `cf r2 objects get`

The command built these headers but did not pass them to the request, so reading an object
from a bucket in a jurisdiction such as `eu` failed with 10006 "The specified bucket does not exist".
