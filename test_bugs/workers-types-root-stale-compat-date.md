---
slug: workers-types-root-stale-compat-date
title: Older workers-types roots could lag the latest runtime surface
status: Fixed
fix-location: external
last-verified: 2026-09-16
---

# The current workers-types root is documented as latest

## Historical symptom

An older `@cloudflare/workers-types` release exposed a compatibility-pinned root that lacked `URL.canParse`, while its `/latest` entrypoint included the API. Projects using the unqualified package in `tsconfig` saw a type error for runtime-supported code and worked around it by selecting `/latest`.

## Current status

The old present-tense claim is no longer supported by current source. At workerd commit `8e6eb20f7067c0a37900220cf18ee1e8338a2a30`, `npm/workers-types/README.md` states that the package provides a typing environment corresponding to the latest Workers runtime and recommends the unqualified `@cloudflare/workers-types` entrypoint. It no longer documents `/latest` as the way to escape a pinned root.

workers-sdk commit `40dd545c359acad5c987b3a16ab6d65dfd86a81b` pins the current v5 package line (`^5.20260911.1`) and Wrangler's templates still use the unqualified root. The package's preferred long-term workflow is now `wrangler types`, which generates runtime types for the project's exact compatibility date and flags.

## Migration guidance

Treat the `/latest` workaround as historical and version-specific. On current v5 releases, use the package root if opting into the package-wide latest surface, or generate compatibility-specific types. Projects pinned to an older major may still need their existing subpath until they upgrade.

This repository does not build the workers-types artifact; its source and packaging live in workerd. The current source contract, rather than the old package layout, is the ground truth recorded here.
