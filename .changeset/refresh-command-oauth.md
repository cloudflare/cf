---
"cf": patch
---

Refresh expired OAuth credentials during commands

Keep long-running commands such as `cf observability tail` authenticated when their OAuth access token expires.
