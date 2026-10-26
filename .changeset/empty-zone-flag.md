---
"cf": patch
---

Reject `--zone` without a value

An empty `--zone` used to fall back to `CLOUDFLARE_ZONE_ID`, and `--dry-run`
previewed a `/zones//` path. On commands that serve both an account and a
zone, it also switched to zone scope. cf now stops with
`--zone requires a non-empty value.` and, as with `--mode`, rejects a repeated
`--zone`.
