---
slug: generator-fabricates-default-false-on-optional-booleans
title: cf generator fabricated default false on optional boolean body fields
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# cf fabricated `false` defaults for optional boolean body fields

## Historical symptom

Optional boolean body flags with no OpenAPI default were emitted with a yargs `default: false`. That made an omitted flag indistinguishable from an explicit `--flag false`; the body assembler saw a defined value and sent `false` on the wire, potentially resetting fields during partial updates.

## Current status

Fixed in the modular generator.

`packages/cli/generator/arg-derivation.ts` now adds `ArgIR.default` only when a real effective default exists. An overlay may override a spec default or clear it with `null`, but the absence of both sources remains `undefined` and no value is invented for booleans. `generator/emit/builder.ts` emits a yargs default only from that IR value.

The builder additionally suppresses body defaults on PUT/PATCH operations, except for a body discriminator whose value is needed to select a variant. This prevents a legitimate schema default from silently becoming a partial-update instruction.

The resulting semantics are now distinct and correct:

- omitted flag → `undefined` → field omitted by `compactBody`;
- `--flag true` → `true` sent; and
- `--flag false` → `false` sent.

Current generated AI Gateway update flags such as `authentication` and `collect-logs` have no fabricated defaults. Active Wrangler-ported tests for queue subscriptions, R2 custom-domain updates, and D1 export pin the general behavior by asserting that absent optional booleans are omitted.

The old document's monolithic `generator.ts` locations and repository-wide counts are obsolete. Counting every generated `default: false` is not a useful regression metric now: the tree intentionally contains universal flags such as `--dry-run`, `--force`, and `--text`, as well as genuine schema defaults.

## Fix location

cf-only. Forge reports optionality and explicit defaults; cf is responsible for preserving the difference between no default and a real `false` default when it builds the yargs surface.
