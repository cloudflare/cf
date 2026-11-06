---
"cf": patch
---

Keep required HTTP header parameters out of generated JSON request bodies.

Flags such as `--if-match` are now sent only as headers rather than also being copied into the body under a generated field name.
