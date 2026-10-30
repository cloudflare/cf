---
"cf": minor
---

Give API fields that collide with cf's own flags distinct names

Generated commands no longer drop, merge, or shadow API fields whose names match a cf flag. `cf precursor update --detection-mode` sets the previously unreachable `mode`, and Magic Transit advanced protection commands gain `--filter-mode` and `--protection-mode`. `cf o11y telemetry query` and `cf o11y shared-queries create` gain `--preview`.

Two behavior changes: on `cf cloudforce-one priority-intelligence profile update`, the organization profile is now `--organization-profile` and `--profile` selects the auth profile again; on `cf magic-cloud-networking on-ramps delete`, the API's force is now `--force-delete` and `--force` only skips confirmation. `cf ai run` and `cf registrar registrations create` accept schema fields named after cf flags as `--input-<name>` (for example `--input-quiet`), and `cf schema` lists the flag behind a path or query parameter when it has one.
