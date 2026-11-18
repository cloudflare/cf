---
"cf": minor
---

Update the generated command surface for Forge OpenAPI release
`47f30fe3d687230ce60145cea2f8a3e2284a766f`.

**Breaking:** `cf dns records batch` is now `cf dns records bulk-apply`.
There is no compatibility alias; update scripts to use the new command name.

`cf dns records export` now supports filters such as `--name`, `--type`,
and `--proxied`.
