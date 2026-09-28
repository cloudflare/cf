---
slug: known-impls-wrangler-minimum-too-low
title: Wrangler implementation minimum predated the Build Output contract
status: Fixed
fix-location: cf-only
last-verified: 2026-09-22
---

# Wrangler implementation minimum predated cf's required contract

## Historical symptom

cf once accepted Wrangler 4.102.0 as a compatible implementation, although that version predated the `cf-wrangler` delegate and Build Output layout which cf actually consumes. Discovery could therefore pass its version gate and fail later because the implementation did not provide the required executable or compatible Build Output.

## Current status

Fixed. `packages/cli/src/commands/dev/known-impls.ts` currently accepts:

- `@cloudflare/vite-plugin` v2, including beta prereleases; and
- `wrangler` 4.136.0 or newer.

`packages/cli/src/commands/dev/impl.ts` validates an installed package version against the implementation's semver range and produces an implementation-specific error. Active dev tests cover both constraints, including rejection of Vite plugin v1, and the build test pins the Wrangler error.

The current Vite plugin beta is 2.0.0-beta.sha-805ec1ff3 and the latest
Wrangler release is 4.142.0. They emit the configuration and Build Output
Specification artifacts consumed by cf.

## Fixture coverage

The Vite and Wrangler smoke fixtures now pin the latest compatible published releases, so a clean install exercises the same format contract as production delegation.
