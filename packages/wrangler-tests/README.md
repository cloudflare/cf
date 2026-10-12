# Wrangler compatibility tests

This package runs canonical Wrangler test situations against `cf`. Test names
come from Wrangler and must not be renamed, even when Wrangler and `cf` expose
the situation through different command paths.

## Revisions and counts

The imported reference is pinned to
`cloudflare/workers-sdk@c2bb4c815f8a6af2ebea17ab6dd4f612c7b1e8eb`,
the Wrangler main revision audited on 2026-09-29 (Wrangler 4.143.0).

Each upstream case has exactly one outcome:

- a normal test when `cf` supports the same situation;
- `it.todo()` when the situation belongs in `cf` but is not working yet;
- `it.skip()` when the situation is tied to Wrangler internals or conflicts
  with `cf`'s design.

[MANIFEST.md](./MANIFEST.md) records every canonical upstream identity, including full `describe()` ancestry where leaf names repeat. It currently contains 5,476 cases: 605 passing, 1,498 todo, and 3,373 skip.

The package has 109 test files: 97 ported/adapted files and 12 generated fallback shards under `src/__tests__/upstream/`. File count and canonical-case count are different units.

## Running the suite

From this directory:

```bash
pnpm test
```

The Vite+ test task depends on `cf` generation and its test-specific Pack
build, and the `cf` import resolves to the resulting `../cli/dist/index.mjs`.
This build keeps mock-sensitive dependencies external; the normal production
build still bundles them. `pnpm test:watch` has the same prerequisites, run once
before starting Vitest. Task caching is disabled. CI runs the suite on pull
requests and pushes to `main` in the Cloudflare-owned repository.

The Vitest configuration runs the compatibility project in fork workers with
isolation disabled, a 15-second per-test timeout, no retries, UTC/`LC_ALL=C`,
and MSW with unhandled remote requests rejected. A separate setup-free project
records the generated skipped/todo inventory. Test-only bridges keep Clack
backed by shared dialog queues and route Undici fetches through MSW. Miniflare
is aliased to the CLI package's exact installation, and a narrow source alias
exposes D1 migration bookkeeping.

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
