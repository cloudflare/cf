---
"cf": patch
---

Include multipart form-field flags in command metadata

Shell completions and `cf tools` schemas now list the flags for multipart form fields, such as `--metadata` on `cf kv keys put` and `--branch` on `cf pages deployments create`. The commands already accepted these flags.
