---
"cf": patch
---

Reduce SDK client imports when running API commands.

Generate narrow runtime imports for SDK error constructors and load the client entry directly, avoiding the API type and resource barrels while preserving error classes and request behavior.
