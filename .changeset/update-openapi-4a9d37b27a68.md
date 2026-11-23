---
"cf": minor
---

Update the generated command surface for Forge OpenAPI release
`4a9d37b27a68d4c7bc23d71600b0b29b61f6c0fd`.

**Breaking:** Several commands are renamed, and some take their identifiers
as flags instead of positional arguments. There are no compatibility aliases;
update scripts to use the new names and inputs:

- `cf vectorize insert`, `upsert`, and `query` are now
  `cf vectorize vectors insert`, `upsert`, and `query`.
- `cf vectorize get-by-ids`, `delete-by-ids`, and `list-vectors` are now
  `cf vectorize vectors bulk-get`, `bulk-delete`, and `list`. These take the
  index as `--index-name` instead of a positional argument.
- `cf vectorize metadata-index` is now `cf vectorize metadata-indexes`.
- `cf dns settings account views` is now `cf dns views`.
- `cf cloudforce-one requests get-request-list`, `get-request-read`,
  `post-request-create`, and `put-request-update` are now `list`, `get`,
  `create`, and `update`. The renamed `list` command takes the project type
  as `--project-type` instead of a positional argument.
- `cf addressing address-maps accounts update` is now `create`. The `ips`
  and `zones` subgroups rename `update` to `create`, `update-bulk` to
  `bulk-create`, and `delete-bulk` to `bulk-delete`. The renamed bulk
  commands take the Address Map ID as `--address-map-id` instead of a
  positional argument.
- `cf cache origin-cloud-regions bulk update` and `bulk delete` are now
  `cf cache origin-cloud-regions bulk-replace` and `bulk-delete`.
- `cf intel indicator-feeds permissions create` and `delete` are now
  `grant` and `revoke`.
- `cf resource-sharing recipients update` and
  `cf resource-sharing excluded-recipients update` are now `replace`.
- `cf waiting-rooms rules get` is now `cf waiting-rooms rules list`, which
  takes the waiting room ID as `--waiting-room-id` instead of a positional
  argument.

**Breaking:** Some existing commands change their flags:

- `cf workers deployments create` renames `--code-update-strategy-mode` and
  `--code-update-strategy-max-delay` to `--durable-objects-code-update-mode`
  and `--durable-objects-code-update-max-delay`.
- `cf turnstile widgets update` no longer accepts `--region`.
- `cf turnstile widgets create` no longer accepts the list flags `--page`,
  `--per-page`, `--order`, `--direction`, and `--filter`.

`cf o11y telemetry live-tail` and `cf o11y telemetry heartbeat` are removed;
use `cf observability tail` to stream live events.

New commands include `cf ai-gateway model-aliases`, `cf feedback`,
`cf pay-per-use agreements`, and `cf pay-per-use enabled-publishers list`.
`cf queues subscriptions list` accepts an optional `--queue-id` filter.
