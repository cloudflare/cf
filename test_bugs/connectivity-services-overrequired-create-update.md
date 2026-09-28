---
slug: connectivity-services-overrequired-create-update
title: workers-vpc services create/update over-require request fields
status: Active
fix-location: both
last-verified: 2026-09-16
---

# Workers VPC services over-require request fields

## Historical symptom

The Workers VPC service create and update surfaces inherited incorrect required markers. Earlier generated commands demanded TLS verification mode, update demanded create-only fields, and nested host variants were flattened into an unconditional set of required leaves.

This was marked Fixed when a connectivity overlay and cf's optional-parent logic covered those shapes.

## Current status

**Active again on the current `workers-vpc` surface.** The present generated commands show a split result:

- Create correctly requires `name` and `type` at handler time, and no longer prompts for TLS verification mode.
- Update still prompts for `name` and `type` when per-field flags are used, so a partial update cannot use only the changed field.
- Both create and update run a `--host-*` group check which demands both `--host-network-tunnel-id` and `--host-resolver-network-tunnel-id` for every host variant. An IPv4 host should need the former; a hostname/resolver host should need the latter.

Evidence is in `packages/cli/src/commands/_generated/workers-vpc/services/{create,update}.ts`. The older `_generated/directory/services` paths no longer exist.

## Test evidence

`packages/wrangler-tests/src/__tests__/vpc.test.ts` has promoted the per-field IPv4 create case, but it explicitly supplies both tunnel IDs and the expected body therefore contains both `network` and `resolver_network`. Update cases still use `--body`, whose early return avoids the per-field prompt loop.

The TLS enum is a separate active regression; see `connectivity-services-cert-verification-mode-no-enum.md`.

## Required resolution

Two metadata/adaptation issues must be fixed:

1. mark update's `name` and `type` optional in the current Forge `workers-vpc` overlay or, preferably, correct the source update schema; and
2. preserve enough oneOf-variant information for cf's optional-parent check to require only leaves belonging to the selected host variant.

The second problem spans Forge's derived conflict/variant metadata and cf's generic group-check emitter, hence `fix-location: both`.

## Regression note

The previous “Fixed” evidence described an overlay/resource name that is no longer generated. Current artifacts and tests demonstrate that the complete fix did not survive that transition.
