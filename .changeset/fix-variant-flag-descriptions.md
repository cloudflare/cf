---
"cf": patch
---

Preserve every distinct variant description in generated flag help

Show alternative descriptions when object union variants share a flag, including
non-enum fields and nested objects. Group identical descriptions and label enum
alternatives with their values so variant-specific constraints remain clear in
help and command metadata.
