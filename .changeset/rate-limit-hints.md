---
"cf": patch
---

Provide actionable hints when API rate limits are reached

Report clear rate limit hints on HTTP 429 responses, surfacing the retry
duration when `Retry-After` or rate-limit reset headers are provided.
