---
slug: looks-like-secret-text-flag
title: Secret values with neutral flag names used plain-text prompts
status: Fixed
fix-location: both
last-verified: 2026-09-16
---

# Secret values with neutral flag names used plain-text prompts

## Historical symptom

The former generated `cf workers secrets update <name>` command exposed the secret value as `--text`. The original prompt logic guessed sensitivity from names such as `secret`, `password`, or `token`, so a missing `--text` value was entered through a plain text prompt and could be echoed to the terminal.

## Current status

Fixed. Sensitivity is schema-driven:

- the OpenAPI/Forge pipeline surfaces `x-sensitive: true` as `BodyParamInfo.sensitive`;
- `packages/cli/generator/arg-derivation.ts` records that as a secret body flag;
- the regular and discriminated-variant emitters pass `{ kind: "secret" }` to `promptForRequiredField`; and
- `packages/cli/src/lib/prompt.ts` deliberately contains no name heuristic.

The target schema now classifies the Worker secret update operation as SDK-only,
so that generated CLI command and its active compatibility coverage are gone.
The generator-level fix remains: any CLI-audience field carrying `x-sensitive`
still receives the secret prompt options and non-TTY stdin handling described
above. The preserved Wrangler-port update suite is skipped by design until the
operation's audience changes.

## Resolution and invariant

This required both the schema/Forge signal and cf generator plumbing. A field that lacks `x-sensitive` will intentionally use a normal text prompt even if its name looks secret-like. Missing annotations should therefore be fixed in the API schema or a Forge overlay, not by adding another regex to cf.
