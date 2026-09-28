---
slug: bindings-secret-always-required-string
title: bindings.secret() types a secret as required string, with no way to express an optional secret
status: Active
fix-location: config-pkg
last-verified: 2026-09-22
---

# `bindings.secret()` cannot express an optional secret

## Symptom

`bindings.secret()` always produces a required `string` in the inferred Worker environment. There is no way to declare a secret binding whose value may legitimately be absent, so users must either lie to the inferred type or omit the binding from config and maintain a parallel declaration.

This matters for freshly created or rolled-back Workers where a secret may not yet be present even though the code handles `undefined` safely.

## Current status

**Active in cf's pinned `@cloudflare/config@0.17.0`.** The corresponding Workers SDK source confirms:

- `packages/config/src/bindings.ts` defines `SecretBinding` only as `{ type: "secret" }` and `bindings.secret()` takes no options;
- the helper's documentation says it declares a secret required by the Worker; and
- `packages/config/src/inference.ts` maps the `secret` binding kind to `string`, with no optional branch.

cf's installed package and the corresponding Workers SDK source retain the same required-secret model. There is still no dedicated cf or ported Wrangler test for optional secret inference.

## Fix location

`@cloudflare/config`, in both the binding descriptor and `InferEnv` mapping. One compatible shape would be:

```ts
bindings.secret({ optional: true }); // inferred as string | undefined
```

Keeping required-by-default would avoid changing existing inferred types while making the runtime-possible optional state expressible.

## Workaround

Leave the optional secret out of config and declare it as `string | undefined`
in a hand-written environment type. This works at runtime but means config is
no longer the complete binding inventory.
