---
"cf": minor
---

Add `--force` to `cf deploy` for CI conflict overrides

Use `cf deploy --force` to upload a Worker when its last deployment came from the script API or its remote configuration conflicts with the local Build Output. Deploys remain strict by default. An aborted upload now exits without a success message, and the conflict error points to the supported `--force` option.
