---
"cf": minor
---

Update the generated command surface for Cloudflare API schemas revision
`3359e90fa19e8e250ab5a402b0f9dbe65bbe82a3`.

Breaking: Replace `cf organizations members batch create <organization-id>`
with `cf organizations members bulk-create --organization-id <organization-id>`.
Update scripts to pass the ID as a required flag instead of a positional
argument. The old command has no compatibility alias.

Use `cf o11y destinations get <slug>` to fetch a Workers Observability
Telemetry Destination by its slug.
