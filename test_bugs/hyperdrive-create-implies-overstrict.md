---
slug: hyperdrive-create-implies-overstrict
title: hyperdrive create over-required Access credentials when a host was used
status: Fixed
fix-location: forge-only
last-verified: 2026-09-22
---

# `hyperdrive create` over-required Access credentials for a host

## Historical symptom

The generated builder implied both Access credential flags whenever `--origin-host` was supplied. Ordinary host-and-port database configurations were therefore rejected unless the user also supplied Cloudflare Access credentials, even though Access is only an optional connection variant.

## Current status

Fixed by the current Hyperdrive request schema in Forge. Caller-supplied origins
now go through the generated raw `--body` path, while individual create flags
cover the managed-integration variant. Since `--origin-host` is no longer a
create flag, the incorrect implication cannot be emitted.

Active compatibility tests still cover ordinary host/port creation, paired
Access credentials, a VPC service ID, and mTLS combinations through `--body`.
The old yargs conflict and implication cases are skipped because those
individual origin flags are no longer part of `cf hyperdrive create`.

## Fix location

Forge-only. The available flags and raw-body fallback are derived from the
Hyperdrive request schema; cf does not carry product-specific behavior for it.
