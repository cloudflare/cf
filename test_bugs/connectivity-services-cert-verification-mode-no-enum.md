---
slug: connectivity-services-cert-verification-mode-no-enum
title: workers-vpc services --tls-settings-cert-verification-mode lacks an enum constraint
status: Active
fix-location: upstream-spec, forge
last-verified: 2026-09-16
---

# Workers VPC services TLS verification mode lacks an enum constraint

## Symptom

`cf workers-vpc services {create,update}` describes three valid values for `--tls-settings-cert-verification-mode`—`verify_full`, `verify_ca`, and `disabled`—but yargs accepts any string. Invalid input reaches the API instead of failing locally.

## Current status

**Active again.** This record was previously marked Fixed after a Forge overlay supplied explicit choices, but that band-aid is absent from the current Workers VPC surface.

Current generated evidence:

- `packages/cli/src/commands/_generated/workers-vpc/services/create.ts` and `update.ts` are generated from `apis/overlays/workers-vpc.ts`;
- both define the option as `type: "string"` and include the allowed values only in prose;
- neither emits a `choices` array; and
- `packages/wrangler-tests/src/__tests__/vpc.test.ts` again leaves “should reject --cert-verification-mode with invalid value” as `it.todo`, with a comment that the current schema no longer provides an enum.

The old generated path under `_generated/directory/services/` no longer exists.

## Root cause

The API schema currently exposes the field as a plain string whose description contains a hand-written list. The generic generator only emits yargs choices from machine-readable enum/override metadata; parsing enum-like prose would be fragile.

## Resolution options

Preferred: add a real enum to the canonical API schema. That corrects the SDK and every downstream consumer. A Forge `x-forge-params` choices override on both operations is an acceptable temporary repair, but it must live on the current `workers-vpc` overlay so it survives generation.

## Regression note

This is a real Fixed → Active transition, not merely stale line numbers. The previous overlay evidence and active-test claim no longer match HEAD.
