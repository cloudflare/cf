---
"cf": minor
---

Give API fields that collide with cf's own flags distinct names

Generated commands no longer drop, merge, or shadow API fields whose names match a cf flag. `cf precursor update --detection-mode` sets the previously unreachable `mode`, and `cf o11y telemetry query` and `cf o11y shared-queries create` gain `--preview`.

One behavior change: on `cf cloudforce-one priority-intelligence profile update`, the organization profile is now `--organization-profile`, and `--profile` selects the auth profile again. An API parameter named `force` can no longer take cf's confirmation `--force`. `cf ai run` and `cf registrar registrations create` accept schema fields named after cf flags as `--input-<name>` (for example `--input-quiet`), and `cf schema` lists the flag behind a path or query parameter when it has one.
