# Wrangler compatibility tests

This package runs canonical Wrangler test situations against `cf`. Test names
come from Wrangler and must not be renamed, even when Wrangler and `cf` expose
the situation through different command paths.

## Revisions and counts

The imported reference is pinned to
`cloudflare/workers-sdk@93d72a5772cce74d9f5657d6989efe89cc10dfbb`.
It is intentionally not Wrangler main. At the 2026-09-04 documentation audit,
current Wrangler was `8bbcb9f08bcfaa291c7d28b6884fc88c1264bb84`
(4.129.0). At the 2026-09-16 audit, current Wrangler is
`40dd545c359acad5c987b3a16ab6d65dfd86a81b` (4.131.2). Current source is
useful for comparison, but does not change the canonical identities until the
corpus is explicitly rebased.

Each upstream case has exactly one outcome:

- a normal test when `cf` supports the same situation;
- `it.todo()` when the situation belongs in `cf` but is not working yet;
- `it.skip()` when the situation is tied to Wrangler internals or conflicts
  with `cf`'s design.

[MANIFEST.md](./MANIFEST.md) records every canonical upstream identity, including full `describe()` ancestry where leaf names repeat. It currently contains 5,100 cases: 546 passing, 1,325 todo, and 3,229 skip.

The package has 118 test files: 106 ported/adapted files and 12 generated fallback shards under `src/__tests__/upstream/`. File count and canonical-case count are different units.

Known local drift must be fixed through source changes plus full regeneration,
not manual manifest-row edits. The current versions-upload port renamed one
canonical title (`should error when no name is provided` → `should error when
Build Output has no name`), and the Email Routing `rules list` block was
skipped after its old path disappeared even though the replacement
`email-routing rules list-account` supports the portable list cases.

## Running the suite

From this directory:

```bash
pnpm test
```

The `cf` import resolves to `../cli/src/index.ts`, so run `pnpm generate` from the repository root first when generated commands have changed. CI does this before running the suite on pull requests and pushes to `main` in the Cloudflare-owned repository.

The Vitest configuration uses fork workers, a 15-second per-test timeout, no retries, UTC/`LC_ALL=C`, MSW with unhandled remote requests rejected, and a Clack bridge backed by shared dialog queues. It aliases Miniflare to the CLI package's exact installation and exposes narrow test-only aliases for D1 migration bookkeeping and OAuth.

## Regenerating fallback classifications

`scripts/generate-upstream-stubs.mjs` compares full Vitest JSON reports from Wrangler and cf. It preserves canonical titles, including expanded parameterized cases. Unique cases match by upstream file and leaf title; repeated leaf titles match by full ancestry. Ported files take precedence over generated fallback classifications.

The generator is a maintainer tool, not a package script:

```text
node scripts/generate-upstream-stubs.mjs \
  <upstream-report.json> <local-report.json> \
  <upstream-tests-dir> <local-tests-dir> \
  <zero-based-shard> <shard-count> \
  [output-shard.ts] [MANIFEST.md]
```

Both inventories must be full Vitest JSON reports with `testResults` and `assertionResults`, not `vitest list` output. Missing cases default to todo unless the audited file/case/prefix rules classify them as Wrangler machinery or a deliberate cf divergence.

A rebase must update the hard-coded revision banner, classification rules, all fallback shards, and the manifest in one reviewable change. Do not silently point only this prose or the manifest at a newer Wrangler commit.
