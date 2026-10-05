---
"cf": patch
---

Avoid project setup changes during deploy dry runs

Pass `--dry-run` to framework setup and Wrangler config conversion for `cf deploy`, `cf workers versions create`, and `cf workers triggers deploy`. If setup is needed, show the planned changes and skip the build and upload.
