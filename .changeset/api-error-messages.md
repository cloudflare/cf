---
"cf": patch
---

Show additional API error messages on stderr

Include the response envelope's `messages` entries after `errors` when a request fails, so validation details such as missing parameter names are visible. Preserve the full envelope for `success: false` responses returned with a successful HTTP status, and keep successful-response output unchanged.
