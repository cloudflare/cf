# cf repo — AGENTS.md

This repository contains the public `cf` npm CLI and its command generator.
`cf` is an agent-first CLI for the whole Cloudflare API. Shared Forge code is
installed from a commit-pinned pkg.pr.new build until it is available on npm.

## Read as needed

- [CLI instructions](packages/cli/AGENTS.md): command, generator, dotenv,
  child-process, and runtime conventions when working in `packages/cli/`.
- [Wrangler test instructions](packages/wrangler-tests/AGENTS.md): parity
  classification and generated test inventory rules.
- [Architecture reference](docs/architecture.md): detailed layout, library map,
  generator behavior, UX, flags, dependency updates, and publishing. Read the
  relevant sections when changing those areas.
- [Design history](docs/design-history.md): product rationale, superseded
  proposals, distribution estimates, and recorded follow-ups. Consult when
  revisiting a design; implementation and tests determine current status.

Keep this file focused on working rules. Put detailed reference and historical
context in the linked documents.

## Repository map

| Area                                             | Location                                                   |
| ------------------------------------------------ | ---------------------------------------------------------- |
| CLI entry, request runtime, generic helpers      | `packages/cli/src/{index.ts,api/,lib/}`                    |
| Hand-written commands and central registry       | `packages/cli/src/commands/`, especially `hand-written.ts` |
| Generator plugin and OpenAPI preparation         | `packages/cli/generator/`, `packages/cli/generate.ts`      |
| Tracked generated commands, operations, metadata | `packages/cli/src/commands/_generated/`                    |
| CLI unit and command tests (Vitest + MSW)        | `packages/cli/src/__tests__/`                              |
| Imported Wrangler compatibility tests            | `packages/wrangler-tests/`                                 |
| Project fixtures and usage scenarios             | `fixtures/`, `usecases/`                                   |
| Dependency patches and automation                | `patches/`, `scripts/`, `.github/workflows/`               |

## Cross-platform support

Support Windows, Linux, and macOS in every feature. Account for differences in
process spawning, signals and exit codes, shells and argument quoting,
filesystem paths and permissions, environment variables, and terminal behavior.
Use platform-specific implementations and tests where semantics differ.

## Design boundaries

In the rules below, `src/` means `packages/cli/src/`.

- **Keep API knowledge upstream.** Generic `src/index.ts` and `src/lib/` code
  must remain product-agnostic. API coverage and product-specific behavior
  belong in Forge overlays or OpenAPI; generic command-emission rules belong in
  `packages/cli/generator/plugin/`. Do not modify the installed Forge package;
  change the Forge source repository and consume its next build.
- **Choose the shared boundary first.** Capabilities useful to API callers
  belong at the platform/API layer; reusable CLI affordances belong in Forge
  annotations. Truly CLI-only local or multi-endpoint workflows may use a
  bounded hand-written command. Share code only when a real second consumer
  has matching semantics; keep cf UX and thin adapters local.
- **Contain exceptions.** Register hand-written commands once in
  `src/commands/hand-written.ts`, keep product wiring in its command directory,
  and retain drift guards for overridden leaves. Keep universal zone-name
  resolution in `context.ts` / `resolve.ts` and Worker-name derivation in its
  existing generator helper. The registry and architecture reference describe
  the permitted exceptions. Revisit a Forge annotation when runtime-schema
  lookup reaches four examples; unrelated workflows do not count.
- **Never hand-edit generated output.** `pnpm generate` clears and rewrites
  `_generated/`. Change Forge/OpenAPI or the plugin, regenerate, and commit
  the resulting artifacts. Review every changed generated file even when
  GitHub collapses it.
- **Preserve lazy startup.** Register every root through `lazyCommand` and
  preserve dynamic root imports. Do not eagerly import `_generated/index.ts`
  outside the lazy shell in `src/index.ts`. Vite+ Pack emits chunked ESM;
  do not reintroduce `tsup`.
- **Use one API request path.** Use `#api` with operations imported from
  `#operations/<path>.js`; `lib/api-operations.ts` holds operations without a
  generated caller. Use `requestApi` when a typed call cannot express the
  request, and `lib/raw-fetch.ts` for raw responses. Do not add ad-hoc platform
  API fetches. Derive HTTP verbs from finalized `opInfo.method`, never from
  command names. Keep per-API-code error hints upstream; `errors.ts` only
  supplies status-level hints.
- **Keep source config access scoped.** Normal startup and API commands read
  only account/compliance settings from `cloudflare.config.ts`. Worker
  validation belongs to `cf workers types` and the type generation reused by
  `cf init`. Other project workflows consume Build Output through
  `readBuildOutput()` from `@cloudflare/build-output-utils`; do not compose
  output paths by hand. Invalid Worker bindings must not break unrelated API
  commands. cf supports ES module Workers only, not service-worker format.
- **Respect runtime ownership.** Keep OAuth flows in
  `@cloudflare/workers-auth`, with cf supplying adapters. Dev/build delegate
  to project tooling. Local mode owns a Miniflare instance over persisted
  state. Never use Miniflare's `getWorkerRegistry` for read-only discovery: it
  deletes entries older than five minutes; use a read-only walk.
- **Preserve delegation compatibility.** Global cf can re-exec a locally
  pinned cf. Do not assume there is only one cf process; keep auth, cache,
  and CLI state cross-version compatible, with migrations for schema changes.
  Be deliberate about heavy dependencies and preserve lazy loading.

## Implementation conventions

- Use pnpm 12, Vite+ for tasks/lint/format/test/Pack, and `tsrs` for type
  checking. Do not reintroduce `tsc` for this repository's type checks.
- Never use relative imports across package boundaries. For cross-directory
  Git operations, set the command's working directory rather than using
  `git -C`.
- Keep comments sparse and explain why. Never add JSDoc `@param` or `@returns`
  tags beside typed signatures.
- Keep generated metadata deterministic: use fixed strings such as
  `"build-time"`, never `new Date()`. Format generated TS after generation
  with Vite+; do not restore `formatTypeScript()` / Biome WASM inside Forge.
- Keep the hand-written registry import-free plain data; root lazy loaders
  and telemetry belong in `root-commands.ts`. Keep each command's `meta.ts`
  sidecar and the typed `hand-written-meta.ts` list in sync.
- Let strict yargs own unknown-option validation. Keep emitter options and
  metadata synchronized; check existing global/reserved flag names before
  introducing a flag.
- stdout carries command output (JSON for structured results, raw payloads
  for raw endpoints). Prompts, progress, notices, warnings, and success lines
  go to stderr. Reuse `lib/ui/theme.ts`, `lib/ui/log.ts`, and `printSuccess`.
- Only `--force` bypasses destructive confirmation; `--quiet` never confirms
  an action or hides warnings, fixes, or prompts. Derive secret handling from
  explicit sensitivity metadata, never flag-name heuristics.

## Commands and verification

Run from the repository root unless specified:

```bash
pnpm install           # install pinned dependencies
pnpm generate          # pinned OpenAPI + Forge plugin → tracked commands
pnpm build             # generation + Vite+ Pack → dist/
pnpm dev               # source entry; no generation or bundling
pnpm check             # generation + builds + workspace type checks + lint/format
pnpm check:lint        # type-aware lint
pnpm check:type        # workspace type checks with prerequisites
pnpm check:format      # formatting check
pnpm fix               # lint fixes + format
pnpm --filter cf test
pnpm --filter @cloudflare/wrangler-tests test
```

Build, type-check, and test tasks declare prerequisites in package
`vite.config.ts` files; package-scoped commands prepare what they need. Use
shared `task:build` / `task:check:type` names for new workspace tasks, direct
task references in `dependsOn`, and dependency selectors for dependency builds.

For a focused CLI test, run `pnpm test src/__tests__/lib/local-e2e.test.ts`
from `packages/cli/`. Pass the path directly: inserting `--` runs the full
suite. Real-account smoke tests under `packages/cli/e2e/` are out-of-band;
see the architecture reference for invocation.

Before pushing any code change, run the exact root command `pnpm check` and
require it to pass. Narrower checks and builds do not replace it. If it cannot
start or finish because of the environment or dependencies, report the blocker
and which checks did run before pushing. After fixing a check failure, rerun
the complete root command.

## Commits and changesets

Commit each logical change as it is made using conventional commits
(`feat`, `fix`, `refactor`, `chore`, `docs`, `test`). Do not push unless asked.

Add a changeset for every user-facing `cf` change. Use `pnpm changeset` or
write `.changeset/<name>.md` with `"cf": <patch|minor>` frontmatter, an
imperative title, and a short body. Fixes use `patch`; features, new
commands/flags, and pre-1.0 behavior changes use `minor`. Purely internal
refactors, tests, docs, and CI changes need none. See
[the changeset rules](.changeset/README.md).

Prereleases use pkg.pr.new; versioned beta/stable releases use Changesets.
Keep bug fixes independently releasable rather than batching for a release
window. See [publishing details](docs/architecture.md#publishing).
