---
slug: openapi-defaults-on-put-patch
title: OpenAPI defaults on PUT/PATCH bodies were sent during partial updates
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# PUT/PATCH body defaults could clobber existing values

## Historical symptom

Several update schemas reuse create-time defaults. When yargs attached those defaults to generated flags, the handler saw the flags as defined even when the user omitted them and sent the values in a partial PUT/PATCH. This could reset unrelated fields.

The original audit found ten especially suspicious operations and many more PUT/PATCH schemas containing defaults. Forge overlays temporarily cleared several known values, while a separate fix stopped synthesizing `false` for optional boolean body fields.

## Current status

Fixed generically in cf. `packages/cli/generator/emit/builder.ts` suppresses a yargs default for every body-derived option on PUT and PATCH, except the body discriminator needed to select a variant. The emitted assembly code includes a field only when the user actually supplied it. This makes a stale or shared OpenAPI default harmless to partial-update command generation.

Query parameters follow a related but distinct policy in `packages/cli/generator/arg-derivation.ts`: spec defaults are not attached client-side at all; only an explicit Forge overlay default is honored. This prevents every request from acquiring values such as `per_page` or `proxied=false` merely because the schema declares a server default.

## Resolution scope

The runtime correctness fix is cf-only and covers the entire generated surface. Correcting misleading defaults in the canonical OpenAPI schemas is still worthwhile for other clients, and existing overlays may remain as schema bookkeeping, but cf no longer depends on every update schema being perfect in order to preserve omitted fields.

Discriminator defaults are deliberately retained. Removing one would make the CLI unable to choose the correct oneOf body variant; those values require operation-specific schema review rather than blanket suppression.
