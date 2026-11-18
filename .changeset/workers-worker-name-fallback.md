---
"cf": minor
---

Use `worker.name` from `cloudflare.config.ts` when `--worker` is omitted

The API-backed `cf workers` commands (`secrets`, `versions`, `deployments`, `get` and `delete`) now fall back to the project's `worker.name`, evaluated with the current `--mode`, when `--worker` is not passed. The name's source is printed on stderr unless `--quiet` is set; destructive confirmations still name the resolved Worker. Config load and validation errors are reported when the fallback is needed. Passing `--worker` works as before.
