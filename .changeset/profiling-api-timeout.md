---
"cf": patch
---

Allow long-running API operations to finish

Increase the default API request timeout from 30 to 90 seconds so Workers
profiling captures can run for the full supported 50 seconds and return their
results. Apply the same default to SDK and raw-response requests while retaining
explicit timeout overrides and the exemption for binary and multipart uploads.
