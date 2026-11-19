---
"cf": patch
---

Run autoconfig before uploading a static assets directory

Pass the directory supplied to `cf deploy`, `cf previews deploy`, and
`cf workers versions create` through static project setup. When an unconfigured
project deploys its root, autoconfig creates or updates `.assetsignore` to
exclude environment files, dependencies, and Git metadata from the upload.
Preserve existing Build Output during `--dry-run` in unconfigured projects,
even when autoconfig cannot detect the project.

Keep the generated configuration loadable for static directories without a
`package.json` or local cf installation.
