---
"cf": minor
---

Update the generated command surface for Forge OpenAPI release
`4a9d37b27a68d4c7bc23d71600b0b29b61f6c0fd`.

**Breaking command and flag changes:** Update scripts to use the new names.

- Vectorize: move `query`, `insert`, and `upsert` under `cf vectorize vectors`. Use `vectors list`, `vectors bulk-get`, and `vectors bulk-delete` in place of `list-vectors`, `get-by-ids`, and `delete-by-ids`, respectively, and pass the index as `--index-name` instead of a positional argument. Rename `metadata-index` to `metadata-indexes`.
- DNS and Waiting Rooms: replace `cf dns settings account views` with `cf dns views`. Replace `cf waiting-rooms rules get <waiting-room-id>` with `cf waiting-rooms rules list --waiting-room-id <waiting-room-id>`.
- Intel and Cache: replace `cf intel indicator-feeds permissions create` / `delete` with `grant` / `revoke`, and `cf cache origin-cloud-regions bulk delete` / `bulk update` with `bulk-delete` / `bulk-replace`.
- Address Maps: rename `update` to `create` under `cf addressing address-maps accounts`, `ips`, and `zones`. Under `ips` and `zones`, replace `update-bulk` and `delete-bulk` with `bulk-create` and `bulk-delete`, and pass the map ID as `--address-map-id` instead of a positional argument.
- Cloudforce One and Resource Sharing: under `cf cloudforce-one requests`, replace `post-request-create`, `get-request-read`, `get-request-list`, and `put-request-update` with `create`, `get`, `list`, and `update`, respectively. Pass `--project-type` to `list` instead of a positional project type. Rename `update` to `replace` under both `cf resource-sharing recipients` and `cf resource-sharing excluded-recipients`.
- Workers: on `cf workers deployments create`, replace the `--code-update-strategy-mode` and `--code-update-strategy-max-delay` flags with `--durable-objects-code-update-mode` and `--durable-objects-code-update-max-delay`.
- Workers Observability: use `cf observability tail` instead of `cf o11y telemetry live-tail`. The tail command keeps the connection alive automatically; `cf o11y telemetry heartbeat` is no longer exposed.
