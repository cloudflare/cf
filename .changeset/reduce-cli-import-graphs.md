---
"cf": patch
---

Reduce startup imports for authentication and raw API requests.

Load token and OAuth helpers independently of the SDK client, and use the SDK error entrypoint for error handling and telemetry.
