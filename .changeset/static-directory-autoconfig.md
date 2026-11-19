---
"cf": patch
---

Run autoconfig before uploading a static assets directory

Pass the directory supplied to `cf deploy`, `cf previews deploy`, and
`cf workers versions create` through static project setup. When an unconfigured
project deploys its root, autoconfig creates or updates `.assetsignore` to
exclude environment files, dependencies, and Git metadata from the upload.
Respect `--dry-run` when setup is required.

Keep the generated configuration loadable for static directories without a
`package.json` or local cf installation.
