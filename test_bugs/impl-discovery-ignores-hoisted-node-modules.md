---
slug: impl-discovery-ignores-hoisted-node-modules
title: Impl discovery rejects packages hoisted above the project directory
status: Active
fix-location: cf-only
last-verified: 2026-09-16
---

# Impl discovery rejects hoisted `node_modules` packages

## Symptom

In a workspace with a hoisted install, `cf dev`, `cf build`, and therefore `cf deploy` can report a declared implementation as not installed even though Node can resolve it from an ancestor workspace `node_modules` directory. Hoisting is the normal layout for npm, Yarn, and Bun's default linker.

## Current status

Active and explicitly deliberate in the current source.

`resolveLocalNpmPackage()` in `packages/cli/src/commands/dev/discover.ts` checks only:

```text
<cwd>/node_modules/<package>/package.json
```

The comment rejects `require.resolve` specifically because it can walk to a workspace ancestor. If that one local path is absent, discovery records the declared implementation as not installed. `resolveProjectImpl()` is shared by the dev and build flows, so this is not limited to the `cf dev` command.

There is active coverage in `packages/cli/src/__tests__/commands/dev/discover.test.ts` for a declared implementation absent from the project-local `node_modules`, but it does not create an ancestor `node_modules` copy. The hoisted-package behavior is therefore established by source inspection rather than direct regression coverage. Wrangler does not own this cf implementation-discovery mechanism, so its source has no directly equivalent fix.

## Workarounds

- use a package-manager mode which creates a package-local `node_modules` symlink layout, such as Bun's isolated linker; or
- add an explicit local link for the selected implementation package.

These workarounds change repository layout to satisfy cf's resolver. Installing the dependency again with a hoisting package manager may leave the same layout and the same error.

## Possible resolution

Walk upward using Node's normal resolution rules while preferring the closest installed copy. If ancestor resolution remains intentionally prohibited, the diagnostic should say that a hoisted installation was rejected rather than claiming the dependency is absent, and should suggest a layout-specific remedy.
