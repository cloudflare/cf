---
slug: body-params-required-within-optional-parent
title: Required-within-optional-parent body params prompt unconditionally
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# Required leaves under optional body parents prompted unconditionally

## Historical symptom

Forge preserves OpenAPI's “required when this object exists” marker on a nested leaf. Flattening that shape into flags used to make cf treat the leaf as unconditionally required even when its optional parent was absent.

For example, a Workflow status change with no `--from-*` flags still prompted for `--from-name`, although the correct contract is: omit `from` entirely, or require `name` when any member of `from` is supplied.

## Current status

**Fixed.** The implementation has moved out of the former monolithic `generator.ts`:

- `packages/cli/generator/arg-derivation.ts` discovers top-level optional parent groups from `apiFieldPath` and `requestBodyRequired`, then downgrades their required leaves in the yargs/metadata view.
- `packages/cli/generator/emit/builder.ts` emits a group check which restores the conditional rule. It also uses oneOf conflict metadata so a required leaf from an incompatible variant is not demanded.
- body prompts run later in the handler, after the `--body` short circuit.

The current representative command is `packages/cli/src/commands/_generated/workflows/instances/pause.ts`, not the removed `workflows/instances/status/edit.ts`. Its builder leaves `--from-name` optional by itself, but throws “`--from-name is required when any --from-* flag is set`” if another `--from-*` member is used without it.

## Verification

The pause, resume, terminate, and restart cases in `packages/wrangler-tests/src/__tests__/workflows.test.ts` are active. Each changes status without a `from` object and verifies no `--from-name` prompt occurs.

The generic machinery is also present throughout the current generated tree. Individual APIs can still have incorrect oneOf/required metadata; those are separate schema or overlay bugs rather than a return of the unconditional optional-parent prompt.

## Resolution

cf keeps Forge's schema truth while adapting it to flat flags:

- no member supplied: omit the optional parent;
- any member supplied: require that parent's required leaves, subject to incompatible oneOf variants; and
- raw `--body`: trust the caller's complete object.
