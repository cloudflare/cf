---
"cf": patch
---

Redact header values outside a safe diagnostic allowlist, regardless of log sanitization settings.

Strip `X-Auth-Key` alongside `Authorization` when forwarding requests to local services.
