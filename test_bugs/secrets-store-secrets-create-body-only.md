---
slug: secrets-store-secrets-create-body-only
title: Secrets Store bulk create has no single-secret per-field shorthand
status: Active
fix-location: both
last-verified: 2026-09-16
---

# Secrets Store bulk create remains `--body`-only

## Current status

Active as a Wrangler-parity/ergonomics gap. The generated command is:

```text
cf secrets-store secrets bulk create <store-id> --body '<json-array>'
```

`packages/cli/src/commands/_generated/secrets-store/secrets/bulk/create.ts` currently exposes only the store positional, `--dry-run`, and `--body`. It has no `--name`, `--value`, `--scopes`, or `--comment` flags. Unlike an older version of this record, the handler now has a typed `Request["body"]`, passes the parsed body through the generated SDK, and throws the standard `--body is required` error if it is absent.

The four create/per-field cases in `packages/wrangler-tests/src/__tests__/secrets-store.test.ts` remain `it.todo`. The missing-store-id case is active against the real `bulk create` path.

## Why normal flag extraction does not apply

The API operation is genuinely bulk: its request body is an array of secret objects. cf's per-field flags represent top-level object properties, and an array has no unambiguous top-level `name` or `value`. Forge therefore exposes the typed array body but no `BodyParamInfo` leaves for those item properties. Sibling duplicate/edit operations take one object and correctly generate per-field flags.

The previous claim that the SDK could not accept the body is obsolete; the current `SdkRequest<"secrets-store-secret-create">` path does accept it.

## Resolution options

The canonical API schema is not wrong merely because the endpoint is bulk. Parity requires one of:

1. a Forge annotation/generic primitive declaring a single-item shorthand for an array body and instructing cf to wrap the assembled object in an array;
2. a new singular API operation, if the service chooses to expose one; or
3. an explicitly approved hand-written wrapper in cf.

The first option preserves generation but needs a real contract for mixing `--body` and per-field input. A product-specific shortcut in generic `packages/cli/src/` is not acceptable.
