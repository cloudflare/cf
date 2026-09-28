---
slug: connectivity-services-missing-host-flags
title: workers-vpc services create/update lacked per-field --host-* flags
status: Fixed
fix-location: forge-only
last-verified: 2026-09-16
---

# Workers VPC services lacked per-field `--host-*` flags

## Historical symptom

The nested `host` oneOf beneath the Workers VPC service request body was once dropped by Forge's recursive schema resolver. Only `--body` could express an IPv4, IPv6, dual-stack, or hostname target.

## Current status

**Fixed.** The current commands are `packages/cli/src/commands/_generated/workers-vpc/services/{create,update}.ts`. Both expose:

- `--host-ipv4`
- `--host-ipv6`
- `--host-hostname`
- `--host-network-tunnel-id`
- `--host-resolver-network-tunnel-id`
- `--host-resolver-network-resolver-ips` as a repeated string flag

They also emit conflicts between IP and hostname/resolver variants, and their body assembly reconstructs the corresponding nested `host.network` and `host.resolver_network` objects.

## Verification

`packages/wrangler-tests/src/__tests__/vpc.test.ts` now has an active per-field IPv4 create test and an active conflict test. The first posts the generated nested host object; the second verifies that an IP/hostname combination is rejected before a request.

The old record said the IPv4 test remained todo and cited generated files under `directory`; both claims are stale.

## Remaining validation defect

The generated optional-parent check currently requires **both** `host.network.tunnel_id` and `host.resolver_network.tunnel_id` whenever any host flag is supplied, even though they belong to different host variants. The active IPv4 test passes both to get through that check. That is tracked by `connectivity-services-overrequired-create-update.md`; it does not mean the host flags are missing again.

## Resolution

The Forge resolver now descends into a property-level oneOf nested beneath the body's oneOf and emits its leaves/conflicts. cf's generic nested-body assembly needed no product-specific change.
