---
"cf": patch
---

Retain Container images for repeated Build Output uploads

Keep local image tags referenced by saved Build Output after successful deploys
and Worker version uploads. Reusing that output with `--prebuilt` now succeeds
for both standard Containers and Durable Object-managed Containers.
