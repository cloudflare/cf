# cf repo — AGENTS.md

Contains the unscoped `cf` public npm CLI and its code generator. Shared code lives in
`@cloudflare/forge`, vendored as a tarball in `vendor/` until it is on npm.

## Cross-platform support

`cf` supports Windows, Linux, and macOS. When designing or implementing every
feature, account for differences between all three operating systems rather
than assuming POSIX behaviour. Pay particular attention to process spawning,
signals and exit codes, shells and argument quoting, filesystem paths and
permissions, environment variables, and terminal behaviour. Use
platform-specific implementations and tests where their semantics differ.

## Layout

```
cf/
├── packages/cli/       # cf — CLI + generator
│   ├── src/
│   │   ├── index.ts            # yargs entry; registers lazy-loaded generated
│   │   │                       # commands + hand-written commands
│   │   ├── dev.ts              # tsx entry wrapper (maps CliExit → process.exit);
│   │   │                       # NOT the `cf dev` command
│   │   ├── version.ts          # VERSION resolver from bundled package JSON
│   │   ├── config.ts           # public config types / defineConfig entry
│   │   ├── sdk/                # tracked generated SDK; rewritten by generation
│   │   ├── commands/
│   │   │   ├── _generated/     # tracked generated source; rewritten by pnpm generate
│   │   │   ├── hand-written.ts # central root/leaf/override/subgroup registry
│   │   │   ├── auth/           # hand-written: login, logout, whoami, profiles
│   │   │   ├── login/          # hidden `cf login` alias for `cf auth login`
│   │   │   ├── cli/            # hand-written: search and telemetry settings
│   │   │   ├── telemetry/      # implementation of `cf cli telemetry`
│   │   │   ├── completions/    # hand-written: `cf complete` (@bomb.sh/tab)
│   │   │   ├── dev/            # hand-written: `cf dev` (impl discovery + spawn)
│   │   │   ├── build/          # hand-written: direct framework/delegate build
│   │   │   ├── deploy/         # hand-written: `cf deploy` (Build Output → upload)
│   │   │   ├── migrate/        # hand-written: Wrangler-to-cf config migration
│   │   │   ├── previews/       # hand-written: `cf previews deploy`
│   │   │   ├── init/           # hand-written: `cf init` / `cf init workers`
│   │   │   │                   # (hello-world scaffold or autoconfig setup)
│   │   │   ├── containers/     # hand-written: local image build/push leaves
│   │   │   ├── tunnels/        # hand-written cloudflared-backed leaves
│   │   │   ├── workers/check/          # hand-written local startup profiling leaf
│   │   │   ├── workers/triggers/       # hand-written `cf workers triggers` subgroup
│   │   │   ├── workers/versions/create/# hand-written Build Output leaf override
│   │   │   ├── d1/migrations/  # hand-written: `cf d1 migrations` (spliced into
│   │   │   │                   # the generated d1 tree — see hand-written-overrides.ts)
│   │   │   ├── schema.ts       # hand-written: dump JSON-schema for an op
│   │   │   └── tools.ts        # hand-written: list/print MCP tool definitions
│   │   ├── lib/                # see "Library Map" below
│   │   └── __tests__/          # vitest + MSW harness (unit + command tests)
│   ├── generator/
│   │   ├── index.ts            # entry transformer; emits files via forge.emit()
│   │   ├── generator.ts        # per-command emitter (handler body, args)
│   │   ├── metadata.ts         # _meta/ JSON sidecars + schema dump
│   │   ├── arg-classification.ts # path/query/body/header bucketing
│   │   ├── arg-derivation.ts   # derived/computed arg handling
│   │   ├── codegen/            # TS code-emission helpers
│   │   └── emit/               # per-file emit helpers
│   ├── e2e/                    # 114 JSON product fixtures +
│   │                           # generated bash runner (run-e2e.sh) hitting a
│   │                           # real Cloudflare account
│   ├── bin/cf                  # binary entry — loads lightweight delegation,
│   │                           # then imports dist/index.mjs when staying local
│   ├── dist/                   # gitignored, written by tsdown (chunked ESM)
│   ├── generate.ts             # OpenAPI/SDK sync → initFromOpenApi → transform/finalize
│   ├── vitest.config.mts       # in-package test harness config
│   └── tsdown.config.ts        # ESM bundle config; package JSON supplies
│                               # the version; `define` can inject the prerelease label
├── packages/wrangler-tests/    # imported wrangler test corpus, aliased onto
│                               # ../cli/src/index.ts (MSW-mocked)
├── fixtures/                   # cf dev discovery fixtures (vite-plugin +
│                               # wrangler-bundler projects)
├── usecases/                   # per-command usage-scenario YAML catalogue
├── vendor/                     # Vendored tarballs: forge + SDK transformer
├── patches/                    # pnpm patches: release publishing + Container image
│                               # cleanup ownership
├── scripts/sync-forge.ts       # re-vendor pipeline (FORGE_REPO=...)
├── .github/workflows/          # CI, changesets publish, prerelease, benchmark, review
├── pnpm-workspace.yaml         # blockExoticSubdeps + allowBuilds + patches
├── package.json                # scripts/deps + pnpm version
├── turbo.json                  # task orchestration; remoteCache + signature
├── .oxlintrc.jsonc             # type-aware lint via oxlint-tsgolint
└── .oxfmtrc.jsonc              # tabs, double quotes, printWidth 80
```

## Tooling

Aligned with `workers-sdk`:

- **turbo** — task orchestration (`turbo run generate|build|dev|check:*`),
  remote-cache enabled with signing.
- **oxfmt** — formatting (tabs, double quotes, printWidth 80).
- **oxlint** — linting, type-aware via `oxlint-tsgolint`.
- **tsgo** (`@typescript/native-preview`) — type checking, no `tsc`.
- **pnpm 12** with `blockExoticSubdeps` +
  `allowBuilds: { esbuild: true, workerd: true }`.
- **tsdown** — ESM bundler (Rolldown-based; replaced `tsup` for faster
  builds). Outputs chunked `dist/*.mjs` so command modules can be
  dynamically imported.

Test infrastructure is split across two packages:

- **`packages/cli/`** — first-class vitest harness at
  `packages/cli/vitest.config.mts` (`pool: "forks"`) driving in-package
  unit + command-level tests under `src/__tests__/` (67 test files
  covering auth, config, context, build-output, deploy, Workers check,
  `cf dev` discovery/spawn, `--local`, plus MSW-mocked end-to-end command tests
  for zones/kv/r2/d1). Helpers under `__tests__/helpers/` (`run-cf.ts`,
  `msw.ts`, `mock-deploy-context.ts`, `serialize-form-data-entry.ts`).
  `pnpm test` from the cli package. Filter to one file by passing its path
  directly, for example `pnpm test src/__tests__/lib/local-e2e.test.ts`
  (do not insert `--`, which causes Vitest to run the full suite).
- **`packages/wrangler-tests/`** — the imported wrangler test corpus
  (118 test files), re-targeted at cf by aliasing `cf` →
  `../cli/src/index.ts` (runs from source) and `@clack/prompts` → a
  dialog mock. Uses MSW for HTTP mocking. `pnpm test` from that package.

`.github/workflows/ci.yml` runs generation, repository checks, the CLI suite, and the Wrangler compatibility suite on every PR and push to `main` (for the Cloudflare-owned repository). Additional confidence:

- The forge-side type system + the OpenAPI spec (every emitted command
  is type-checked end-to-end against the SDK).
- `pnpm check:type` (tsgo) on the full generated tree.
- `packages/cli/e2e/` — JSON fixtures driving a generated bash runner
  (`packages/cli/e2e/_generated/run-e2e.sh`) that hits a real
  Cloudflare account. Out-of-band; not run on every commit.
- `cli-startup-bench.yml` — hyperfine benchmark of `cf --help` cold
  start, posted as a sticky comment on PRs.

## Pipeline

```
pnpm build
  └─ turbo run generate
       └─ tsx packages/cli/generate.ts
            ├─ fetch pinned Forge OpenAPI release (or preview bundle)
            ├─ regenerate src/sdk/ when missing, on revision change, or for preview
            ├─ initFromOpenApi(source)
            ├─ forge.transform(transformer)    # per-command emitter
            ├─ forge.finalize(_generated, files, { clean: true })
            └─ oxfmt _generated/                # post-format emitted TS
```

Single transformer (`packages/cli/generator/index.ts`) walks
`forge.commands` and emits:

- `src/commands/_generated/<resource>/<sub>/<op>.ts` — yargs command modules
- `src/commands/_generated/<resource>/index.ts` — resource indexes that statically import/register that selected root's sub-groups and leaves
- `src/commands/_generated/index.ts` — top-level lazy registry
  (`generatedCommands: GeneratedCommand[]`)
- `src/commands/_generated/_meta/commands.json` — full command catalogue
- `src/commands/_generated/_meta/hand-written-commands.json` — hand-written subset with root/leaf/subgroup/override provenance
- `src/commands/_generated/_meta/schemas.json` — per-op JSON schemas

`forge.finalize` cleans + writes; oxfmt formats afterward (kept out of
the generator so forge stays format-agnostic).

Shell completions are no longer generated — `cf complete` is backed by
`@bomb.sh/tab`, which parses the command/option tree at runtime from
the complete generated and hand-written `_meta/commands.json` catalogue (see
`src/commands/completions/index.ts`).

`pnpm build` runs `tsdown`, which:

- Bundles `src/index.ts` to `dist/` as chunked ESM. Dynamic top-level-root imports provide the primary code-splitting boundaries; shared modules may be factored into additional chunks.
- resolves the CLI version from the statically bundled package JSON import.
- Its config can define `PACKAGE_PRERELEASE_LABEL`, but no current source module reads that identifier.
- Copies `_meta/` next to `dist/` so `cf --help` works after `npm i -g`.
- emits separate `index`, lightweight `delegate`, and public `config` entries; the config entry also receives declarations.

## Where to Edit

| Task                            | Location                                                                                                                                                                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add/fix a generated command     | Overlay files in `@cloudflare/forge` — NOT in this repo. Edit forge, republish, re-vendor (`pnpm sync:forge`).                                                                                                                                                    |
| Add a generated-command rule    | `packages/cli/generator/generator.ts` — emits handler body, arg shapes, batching, confirm prompts, etc.                                                                                                                                                           |
| New cross-product flag          | yargs middleware in `packages/cli/src/index.ts` (`--zone`, `--profile`, `--quiet`, `--local`, `--persist-to`)                                                                                                                                                     |
| Hand-written command            | roots under `packages/cli/src/commands/{auth,build,cli,completions,dev,deploy,init,previews}/` plus `schema.ts` and `tools.ts`; generated-tree exceptions under `{access,ai,registrar,d1,tunnels,workers}/`; register every one in `src/commands/hand-written.ts` |
| Hand-written metadata/emit      | per-command `meta.json`, `packages/cli/src/commands/hand-written.ts`, `generator/{hand-written-overrides,index,metadata}.ts`                                                                                                                                      |
| `cf init` scaffold / setup      | `packages/cli/src/commands/init/{index,workers,template}.ts`                                                                                                                                                                                                      |
| `cf dev` discovery / spawn      | `packages/cli/src/commands/dev/{discover,known-impls,spawn}.ts`                                                                                                                                                                                                   |
| `cf deploy` pipeline            | `packages/cli/src/commands/deploy/index.ts` + `lib/{build-output,deploy-context,deploy-input}.ts`                                                                                                                                                                 |
| Container image build / push    | `packages/cli/src/commands/containers/{build,push}/`                                                                                                                                                                                                              |
| Auth / OAuth                    | `packages/cli/src/lib/auth.ts`, `packages/cli/src/lib/oauth/`                                                                                                                                                                                                     |
| `cloudflare.config.ts` settings | `packages/cli/src/lib/project-settings.ts`                                                                                                                                                                                                                        |
| Global CLI state                | `packages/cli/src/lib/state.ts` (shell-completion and telemetry state under workers-auth's canonical cf config directory)                                                                                                                                         |
| Help formatting                 | yargs built-in (cf no longer overrides help)                                                                                                                                                                                                                      |
| `--local` request routing       | `packages/cli/src/lib/{local,local-runtime}.ts`                                                                                                                                                                                                                   |
| Local-install delegation        | `packages/cli/src/lib/delegate.ts`                                                                                                                                                                                                                                |
| Output / spinner / errors       | `packages/cli/src/lib/{output,progress,errors,prompt}.ts`, `lib/ui/`                                                                                                                                                                                              |
| Body parsing / dry-run          | `packages/cli/src/lib/{body-parser,dry-run,resolve}.ts`                                                                                                                                                                                                           |
| Raw / non-JSON responses        | `packages/cli/src/lib/raw-fetch.ts`                                                                                                                                                                                                                               |
| Generator logic                 | `packages/cli/generator/{generator,metadata,arg-classification}.ts`                                                                                                                                                                                               |
| Emitted-file shape              | `packages/cli/generator/index.ts`                                                                                                                                                                                                                                 |
| Lint / format rules             | `.oxlintrc.jsonc`, `.oxfmtrc.jsonc`                                                                                                                                                                                                                               |
| Vendored forge bump             | `pnpm sync:forge` (then commit `vendor/` and `package.json` diff)                                                                                                                                                                                                 |
| Patch a published dep           | `patches/*.patch` (created via `pnpm patch <pkg>`)                                                                                                                                                                                                                |

## Library Map (`packages/cli/src/lib/`)

| File                  | Purpose                                                                                                                                                                                                                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.ts`             | Token loader: `CLOUDFLARE_API_TOKEN` env (via `@cloudflare/workers-auth` `getAuthFromEnv`, global-key disabled) → cf OAuth token (refreshed). No stored API token, no Wrangler fallback. Also `createCommandClient`.                                                                                                                                      |
| `autoconfig.ts`       | Adapter around `@cloudflare/autoconfig` used by the hand-written init/build/dev setup flows                                                                                                                                                                                                                                                               |
| `oauth/`              | Thin façade over `@cloudflare/workers-auth/cf`: supplies cf's logger and prompt adapters while the shared package owns identity, scopes, callback handling, credential storage, refresh, and keyring support.                                                                                                                                             |
| `context.ts`          | `getAccountId` / `getZoneId` / `getComplianceRegion` runtime resolution                                                                                                                                                                                                                                                                                   |
| `state.ts`            | Persists shell-completion and telemetry preferences in `~/.config/cloudflare/state.json`, using workers-auth's canonical cf path and JSON storage                                                                                                                                                                                                         |
| `body-parser.ts`      | JSON `--body` ingestion (including `@path`) and compacting; generated file handlers use `input-validation.ts` for `--file`                                                                                                                                                                                                                                |
| `request-headers.ts`  | User-Agent plus `X-CF-CLI-Mode` / detected-agent headers; authentication is owned by the SDK/raw-fetch/auth layers                                                                                                                                                                                                                                        |
| `dry-run.ts`          | `--dry-run` body-preview formatting (`bodyKind: 'json' \| 'multipart' \| 'octet-stream' \| 'none'`)                                                                                                                                                                                                                                                       |
| `errors.ts`           | `handleError`; APIError box; status-level hints (no per-code knowledge in `src/`)                                                                                                                                                                                                                                                                         |
| `output.ts`           | `formatOutput` (silent on null; `✓ <successLabel>` on TTY stderr); `--quiet` knob                                                                                                                                                                                                                                                                         |
| `progress.ts`         | `withProgress(label, task)` clack braille/timer spinner; active only with color + stdout TTY and no `CF_QUIET=1`                                                                                                                                                                                                                                          |
| `prompt.ts`           | required text/enum/acknowledgement prompts; sensitivity is explicit OpenAPI/forge metadata, not a name regex; secret-only stdin ingestion; destructive confirmation                                                                                                                                                                                       |
| `session.ts`          | `openSession(version)` — idempotent once-per-process banner emission at interactive invocation startup; prompt helpers call it defensively                                                                                                                                                                                                                |
| `interactive.ts`      | `isNonInteractiveOrCI()` / `isCI` (via `@cloudflare/cli-shared-helpers` + `ci-info`)                                                                                                                                                                                                                                                                      |
| `telemetry/`          | Opt-out preference and device state, product-agnostic argument/error sanitization, environment probes, lifecycle wrapping, and bounded Sparrow dispatch                                                                                                                                                                                                   |
| `raw-fetch.ts`        | `fetchRawBytes` / `writeRawOutput` — bypasses SDK envelope decoding for generated `binary \| text` response kinds (e.g. `cf kv keys get`)                                                                                                                                                                                                                 |
| `lazy-command.ts`     | `lazyCommand(command, describe, importer, telemetry)` — wraps a deferred `CommandModule`; telemetry is required or marked as handled by the imported command. **Critical for startup perf** — without it, every invocation pulls in all 178 generated root indexes.                                                                                       |
| `metadata.ts`         | `loadMeta()` loader + types for `_meta/*.json` (complete commands, hand-written provenance, and schemas); `isCommandsMetadata` guard                                                                                                                                                                                                                      |
| `local.ts`            | Dependency-free `--local` lazy runtime loading                                                                                                                                                                                                                                                                                                            |
| `local-runtime.ts`    | Local request rewriting, runtime lifecycle, and explorer dispatch; dynamically imported                                                                                                                                                                                                                                                                   |
| `registry.ts`         | Shared dev-registry path resolution                                                                                                                                                                                                                                                                                                                       |
| `delegate.ts`         | local-install delegation (Wrangler-2 style): global cf re-execs a project-pinned local cf. `CF_DELEGATION` sentinel + realpath self-check + ephemeral-npx/dlx guard                                                                                                                                                                                       |
| `build-output.ts`     | combines `readBuildOutput()`'s root config and `workers.default` from `.cloudflare/output/v0/workers/default/worker.config.json` and converts them into the deploy-helpers/Wrangler config shape (`convertToWranglerConfig` + `normalizeAndValidateConfig`) before deployment; owns `BuildOutputConfigError`, re-exports the package's `BuildOutputError` |
| `deploy-context.ts`   | builds the `DeployHelpersContext` (fetch/logger/confirm/prompt closures) bridging cf auth/UX to deploy-helpers' module globals                                                                                                                                                                                                                            |
| `deploy-input.ts`     | assembles `DeployProps` / `WorkerBuildResult` from build output (module-type mapping, routes, assets)                                                                                                                                                                                                                                                     |
| `dialog.ts`           | cf prompt/dialog adapter shared by hand-written orchestration                                                                                                                                                                                                                                                                                             |
| `cli-types.ts`        | shared yargs argv-shape helpers (`CommonYargsOptions`, `InferArgs`, `RemoveIndex`); modelled on wrangler's `yargs-types.ts`                                                                                                                                                                                                                               |
| `ui/blocks.ts`        | `errorBlock(...)` left-gutter / clack-style block rendering (replaced the old boxen-based `ui/box.ts`); `wrapPlain` per-line wrap                                                                                                                                                                                                                         |
| `ui/banner.ts`        | slim `renderPromptIntro(version)` headline and `formatCommand`; the old gradient/ASCII splash is removed                                                                                                                                                                                                                                                  |
| `ui/theme.ts`         | background-neutral semantic colour palette and Chalk wrapper                                                                                                                                                                                                                                                                                              |
| `ui/format.ts`        | one-line `success`, `warning`, `info`, and `hint` helpers                                                                                                                                                                                                                                                                                                 |
| `input-validation.ts` | yargs-time arg coercion + `resolveFileToken(value, fieldName, format)` for `@<path>` ingestion; runtime body/path validation                                                                                                                                                                                                                              |
| `resolve.ts`          | URL templating (path-param substitution), `isId`, `isValidDomainName`                                                                                                                                                                                                                                                                                     |

## Critical Invariants

### `src/` is product-agnostic

Outside the documented hand-written command exceptions and universal global resolver below, `packages/cli/src/` MUST NOT contain hard-coded API product names (d1, dns, zones, etc.) or product-specific behavior. `src/index.ts` loops over `generatedCommands` (each entry a lazy shell that imports its product's index on demand). Adding a new API product requires zero changes here — it's defined in forge's overlays and re-generates automatically.

Practical extensions of this rule:

- **No per-code error mapping.** `errors.ts` does status-level hints
  (`401 → cf auth login`, `403 → check permissions`) only. Per-code
  hints stay forge-side via overlays because the API itself is the source
  of truth for error text.
- **Limits, batching, confirmations** live in forge or in the OpenAPI
  spec itself. Batching comes from the body schema's `maxItems`
  (surfaced as `opInfo.maxItems`); destructive non-DELETE ops opt in
  via `x-forge-require-confirmation: 'This operation …'`. The
  generator's emitter is generic; forge supplies the per-method values.
- **Universal zone resolution** is an intentional cross-cutting exception.
  Global `--zone` accepts an ID or domain name; `context.ts` delegates names to
  `resolve.ts`, which validates the domain and calls `client.zones.list()` for
  the selected account. Keep this exception contained in those global
  context/resolution helpers.
- **Worker-name flag** (`--worker`, with `--script-name` as an alias) is a
  generator-side product-scoped affordance, selected by
  `resourceName === "workers"` in `isWorkerNameArg`. Add similar scoped checks
  rather than spreading product names.
- **Product-specific hand-written commands are documented exceptions.** Three
  shadow generated leaves. Two exist because the request body's real schema sits behind a sibling
  endpoint rather than in the spec:
  `cf ai run` (per model, from `/ai/models/schema`) and
  `cf registrar registrations create` (per TLD, from
  `/registrar/extensions/{name}`, where the extension has to be derived
  from the domain). A generated command can only offer the union of a few
  shapes, accurate for none. Containment rules, the price of the
  exceptions:
  - Each lives in one directory under `src/commands/` plus one `leafOverride`
    entry in the central `src/commands/hand-written.ts` registry.
  - The generic half is product-agnostic: `lib/schema-flags.ts` (JSON
    Schema → flags, help, validation) and `lib/schema-cache.ts` (per-key
    TTL cache) know about JSON Schema and caching, not about models or
    domains. Only the wiring — which endpoint, how to derive its key — is
    per-command.
  - Each carries a drift guard in `src/__tests__/`, because a hand-written
    command no longer tracks the spec.
  - `cf workers versions create` is the third leaf override. It substitutes the
    Build Output upload workflow for the generated request-body handler; it is
    not a runtime-schema example.
  - `cf workers check` is a hand-written leaf added to the generated Workers
    tree.
    It runs the standard build unless `--prebuilt` is passed, then profiles the
    default (or `--worker`-selected) Build Output Worker locally; there is no API
    operation to derive it from.
  - `cf workers types` is a hand-written leaf added to the generated Workers
    tree. It is the bounded source-config exception: it validates the Worker in
    the nearest `cloudflare.config.ts` and generates
    `.cloudflare/types/index.d.ts`. `cf init` reuses its generator
    (`generate.ts`) for a project it has just created and installed.
  - `cf containers build` and `cf containers push` are hand-written leaves
    added to the generated Containers tree. They wrap the shared Container
    Docker and registry helpers; there are no OpenAPI operations for local
    image build or push orchestration.
  - `cf tunnels quick-start` and `cf tunnels run` are hand-written leaves
    added to the generated Tunnels tree. They run the cf-managed cloudflared
    binary; quick tunnels have no API operation, and running a named tunnel is
    process orchestration rather than an API call. Keep their implementations
    in `src/commands/tunnels/`.
  - Process-backed `cf access` workflows are hand-written leaves added to the
    generated Access tree. They delegate local browser, token, and proxy work
    to the cf-managed cloudflared binary.
  - The separate `d1/migrations` and `workers/triggers` subgroups are added
    product-specific exceptions rather than shadowed leaves. They implement
    filesystem bookkeeping and Build Output trigger orchestration absent from
    one-shot OpenAPI operations.
  - Generalising runtime-schema lookup into a forge annotation waits for **four
    or more** examples; too few and the annotation gets fitted to one case. A
    third runtime-schema entry is fine, a fourth means stopping to design it.

### Lazy command registration

Each generated top-level root and each hand-written root is registered via `lazyCommand` (`src/lib/lazy-command.ts`). The outer shell exposes only the `command` + `describe` strings yargs needs; selecting a root dynamically imports its root module/chunk. Within that selected generated root, index files statically import and register the full subtree. Without the outer lazy boundary, `cf --help` / `cf --version` / any command would eagerly load every generated root, the complete command catalogue, the SDK, and every helper.

`tsdown` preserves those dynamic root imports as code-split chunks (and may factor shared dependencies into additional chunks), so do not assume a strict one-chunk-per-root correspondence. Don't reintroduce eager top-level imports of `_generated/index.ts` from anywhere besides the lazy shell registration in `src/index.ts`.

### Generator output (DO NOT EDIT)

- `packages/cli/src/commands/_generated/` — yargs modules + `_meta/` JSON
- `packages/cli/src/sdk/` — generated SDK and pinned OpenAPI artifacts

Tracked in git and never safe to patch by hand. Every `pnpm generate` cleans, rewrites, and oxfmt-formats `_generated/`. SDK regeneration occurs when its entrypoint is missing, its OpenAPI revision is outdated, or a preview bundle is supplied and is handled by its own generator; ordinary cf emitter changes do not rewrite it. Make changes in Forge, the SDK transformer, or the cf generator as appropriate, then regenerate and commit the resulting artifacts.

GitHub collapses `_generated/` by default because it is marked `linguist-generated`, but AI reviewers must still review every changed file there.

Shell-completion scripts are no longer generated — `cf complete`
(`@bomb.sh/tab`) reads `_meta/commands.json` at runtime.

### Source config access is command-scoped

Normal cf startup and generated API commands read only `accountId` and
`complianceRegion` from the default export in `cloudflare.config.ts`; they do
not inspect or validate the `worker` or `containers` fields. Project resource
config is otherwise the dev-server impl's domain. The bounded exception is
`cf workers types`, which loads and validates the Worker definition to generate
declarations. `cf init` reuses the same generator for a project it has just
created and installed.

This keeps Worker-definition validation lazy: `cf dns records list` cannot fail
merely because a binding field in the configured Worker is invalid. Loading
account settings still evaluates the TypeScript module and default config
wrapper, so syntax, import, and
top-level runtime errors can surface.

What cf DOES read:

- **Account settings from `cloudflare.config.ts`'s default export** for project
  account and compliance-region defaults.
- **The Worker definition from `cloudflare.config.ts`** only when running
  `cf workers types`, including its compatibility date and flags for runtime
  type generation, or when `cf init` generates types for the project it just
  created.
- **`~/.config/cloudflare/state.json`** records the shell-completion tip and
  telemetry preferences. Owned by `lib/state.ts`.
- **`~/.config/cloudflare/state/v3/`** stores cf's global Miniflare resources
  for `--local` unless `--persist-to` overrides it.
- **Build Output under `.cloudflare/output/v0/`** for `cf build`, `cf deploy`, `cf previews deploy`, `cf workers versions create`, `cf workers check`, and `cf workers triggers deploy`. A required top-level `config.json` carries account settings and `buildContext`; Worker directories contain `worker.config.json` and at least one of `bundle/` or `assets/`; Container directories contain `container.config.json`. The output Worker config has output-only manifest fields and no source entrypoint. `@cloudflare/build-output-utils` accepts additional Worker directories; `cf deploy`, `cf previews deploy`, `cf workers versions create`, `cf workers triggers deploy`, and `cf workers check` select one by configured name with `--worker <name>`, otherwise cf consumes the required `workers.default`. Always use `readBuildOutput()` rather than composing paths by hand.

What cf does NOT read:

- The `worker` field outside `cf workers types` type generation, or the
  `containers` field from `cloudflare.config.ts`.
- Other source resource config in any form, for any API command.
- `package.json` worker config (none exists today; reserved for
  the future).
- Source binding manifests, durable-object class lists, and trigger lists. Project workflows may consume their built equivalents from Build Output.

Outside the explicit type-generation workflow, if a feature seems to require cf to parse the source config,
that's a signal to push it elsewhere — usually to the local-explorer
API or to a forge annotation. Local mode is the worked example: `--local`
derives resource identity from the request URL and sends the request to a
cf-spawned Miniflare local-explorer instance over shared persisted state. It
does not read the project's binding declarations.

## Generator Conventions

How the generator turns forge methods into yargs commands. Important
to know before editing `generator.ts`.

### Path-param routing

- The **last** non-account/zone path param of the URL is the **subject**
  → emitted as a positional `<name>`.
- All earlier path params (containers) are demoted to required `--flag`s
  with `demandOption: true`.
- `list` and `bulk-*` operations have **no subject** — every path param
  becomes a `--flag`.
- `account_id` / `zone_id` are never positional — `account_id` is
  resolved via `getAccountId` (local mode substitutes `LOCAL_ACCOUNT_ID`), `zone_id`
  reuses the global `--zone` flag.
- `paramOverride.positional: true` (forge schema) only promotes
  top-level body fields to positionals — does NOT affect path params.

### Subject = positional + arg shape

- Each generated handler receives `args: <Op>Args` (a generated type
  with all flags + positional). Positional name is the param's
  `apiFieldPath[0]` lowercased.
- `--body` is emitted for almost every request-body operation, including as an escape hatch alongside derived per-field flags. Explicit `--file` is much narrower: it appears on eligible binary, multipart, and other non-JSON upload paths (48 current leaves), not every operation with a body. Non-JSON binary content sends raw bytes with `Content-Type: application/octet-stream`.
- Multipart endpoints get **per-field flags** if the schema is
  introspectable: `--metadata`, `--creator`, etc. (`extractMultipartFields`
  returns `{fields, payloadField}`). The payload field detection
  precedence is `$ref`-matches-octet-stream → `format: binary` →
  literally named `file`. Endpoints with dynamic keys
  (worker-assets-upload) fall back to `--body`.
- Body-required commands without `--body` and without per-field flags
  fail with a clear "--body is required" error instead of an opaque
  EOF API error.
- Per-field-flag `demandOption: true` is suppressed when `--body` is
  also supported (so `--body @file` isn't rejected by yargs for
  missing required fields — handler-time enforcement instead).
- Array-typed body params (e.g. KV bulk-get's `--keys`) emit
  `array: true, string: true` so users can do `--keys k1 k2` instead
  of fighting JSON-string-as-array.

### `@file` token (universal file ingestion)

Every string-typed body flag (and multipart string field) accepts
`--<flag> @path/to/file`. The leading `@` triggers
`resolveFileToken(value, fieldName, format)` from `lib/input-validation.ts`,
which reads the file with the requested format (`text`, `binary`,
`base64`, `json`). Bare values without `@` pass through unchanged.

Format defaults to `text`; overlays opt into a different format via
`paramOverride.fromFile = { format: 'json' | 'binary' | 'base64' }`,
or opt out entirely via `fromFile: false`. Multipart string fields
get the same treatment.

`cf complete` currently completes commands, flags, and enum choices. It does not attach filesystem-completion metadata to `@file` values; users type the path themselves (and `@<TAB>` is not a documented completion contract).

### Hand-written command directories

`src/commands/hand-written.ts` is the single registry for root commands,
generated-parent presentation overrides, leaf overrides, added leaf commands,
and subgroups. `src/index.ts` derives its lazy root shells from that registry;
`generator/hand-written-overrides.ts` derives the maps and metadata used to
splice the non-root kinds into generated product trees.

**Root command** (`kind: "root"`) — registered directly at `cf <name>` rather
than inside a generated product. A root may itself be a leaf (`build`, `dev`) or
own a command tree (`auth`, `cli`); `root` describes its placement, not its
shape.

**Leaf override** (`kind: "leafOverride"`) — the spec _does_ describe the
operation, but not well enough for a generated command to be useful. The
generator keeps deriving the operation's identity (path, verb,
operationId) and a `meta.json` sidecar overrides only usage/flags/prose;
the generated index imports the implementation from `#commands/<dir>`
instead of its generated sibling. Current entries: `ai/run`,
`registrar/registrations/create`, and `workers/versions/create`. The first two
have bodies whose real schema sits behind a sibling endpoint; the third replaces
a request-body-driven upload with the Build Output workflow shared by deploy.
Each overridden leaf needs a spec drift guard in `src/__tests__/`.

**Leaf command** (`kind: "leaf"`) — there is **no** spec operation, but a
single executable leaf is added directly to a generated product. Its
`meta.json` carries one complete `CommandMeta`. Current entries are
`workers/check`, which profiles a local Build Output Worker;
`workers/types`, which generates types from source config; and
`tunnels/quick-start` plus `tunnels/run`, which run cloudflared; and the
process-backed Access leaves. None has an API endpoint.

**Generated-parent override** (`kind: "parentOverride"`) — changes only the
description and visibility of an existing generated product root. It does not
replace generated commands or their implementations. The Access entry exposes
the previously hidden generated root because process-backed leaves now give it
a supported public command surface; its API leaves remain spec-derived.

**Sub-group** (`kind: "subgroup"`) — there is **no** matching one-shot spec
operation at all, so a whole tree is _added_ to a product's index rather than
replacing anything. Nothing can be derived, so `meta.json` carries a
complete `CommandMeta[]`, one per leaf. Current entries: `d1/migrations` and
`workers/triggers`.

Reach for a sub-group only when the work genuinely is not an API
operation. `d1 migrations` is a filesystem walk plus N calls to one endpoint,
ordered and bookkept by rules OpenAPI cannot express; Workers trigger deploy
builds a project and applies routes/crons from Build Output. Neither exists
merely because a spec happens to be thin.

Generalising the runtime-schema pattern into a forge annotation is deliberately deferred until there are four or more such examples. That threshold does not combine unrelated Build Output or migration workflows.

`cf init [directory]` is the single explicit setup entry point; there is no separate `cf setup` or `cf workers setup`. It currently behaves exactly like `cf init workers [directory]`, the first product initializer, which `cf init --help` lists as `[default]`; other products can later add `cf init <product>` subcommands, and bare `cf init` is expected to become a selection menu of what to create. When the directory is omitted, cf asks for it (defaulting to the current directory); non-interactive runs must pass one, such as `.`. cf shows the absolute target directory before the package-manager choice or autoconfig, and every successful run ends with a `Next steps` list led by `cf dev` (`npx cf dev` when cf itself ran through `npx` or `pnpm dlx`). A missing directory, an empty directory, or one containing only `.git` receives the hello-world Worker scaffold (`cloudflare.config.ts` with a `WORLD` text binding, `vite.config.ts`, `src/index.ts`, `tsconfig.json`, `package.json`, `.gitignore`) built on the `@cloudflare/vite-plugin` v2 beta without Wrangler; dependencies are installed by default with a prompted or `--package-manager` choice. After a successful install, cf generates `.cloudflare/types/index.d.ts` through `commands/workers/types/generate.ts`, the generator behind `cf workers types`; a failure there is a warning, not an error. The template's `typecheck` script runs `cf workers types && tsc`, and its `tsconfig.json` includes `.cloudflare/types`. Any other non-empty directory is handed to autoconfig after cf changes into it, because autoconfig's package installs use the process working directory. `cf dev` and `cf build` still run autoconfig implicitly. Tunnel log streaming is the process-backed `cf tunnels tail` command; the generated tail-create API command only creates a tail descriptor.

Hand-written commands with no generated parent (`auth/`, `build/`, `cli/`,
`completions/`, `dev/`, `deploy/`, `init/`, `previews/`, plus top-level
`schema.ts` and `tools.ts`) are `kind: "root"` entries and must not collide
with a generated product name.

Generation merges every hand-written leaf into the complete `_meta/commands.json` consumed by completions and tools. Generation additionally emits `_meta/hand-written-commands.json`, repeating only executable entries with their `root` / `leafOverride` / `leaf` / `subgroup` provenance and source directory. Presentation-only `parentOverride` entries do not represent commands and are not emitted there.

### Deprecated methods

`status: 'deprecated'` methods are **skipped entirely** at both leaf
and group level (groups that become empty are pruned —
`hasNonDeprecatedContent` in `generator/index.ts`). Rationale: they'll
break at sunset; surfacing them encourages users to adopt doomed paths.

### Confirmation, force, batching

- DELETE operations get a `confirmDelete` prompt unless `--force` is passed. `--quiet` never confirms a destructive action. Non-interactive/CI contexts print the prompt and `pass --force` hint, then abort the handler.
- `--force` / `-f` is auto-emitted for DELETE ops that don't already
  have a forge `force` flag (cascade-delete semantics override).
- Forge `x-forge-require-confirmation: 'This operation …'`
  (`method.requireConfirmation`) extends the delete-confirm
  treatment to destructive POST/PUT operations whose API verb
  doesn't match the semantic (e.g. `cache zone-purge`,
  `queues purge`, `cf workers-builds triggers purge-cache`, slurper-abort, vectorize
  metadata-index drop, zero-trust device revokes, etc.). Generator's
  `isDelete` predicate honours the annotation; spinner and success
  labels switch to "Deleting" / "Deleted" automatically. The
  annotation value is a "This operation …." sentence surfaced
  verbatim in the prompt instead of the generic "This permanently
  deletes the resource. Continue?" fallback.
- An OpenAPI body-schema `maxItems: N` on an array-typed request
  body (surfaced as `opInfo.maxItems`) splits the parsed body into
  N-sized batches with a per-batch spinner ("Updating: batch
  2/3"). No result aggregation — bulk ops are write-mostly; success
  is silent with one final `✓ <successLabel>`. Replaces the
  previous `x-forge-batch-size` annotation now that the OpenAPI
  spec carries this directly on the body schema.

### Strict yargs

`yargs.strict()` handles unknown flags. There are no pre-yargs
allowlists — yargs is authoritative. Keep it that way.

### Output

`formatOutput` is silent on null/undefined responses (SDK unwraps
`result`; null = `{success: true, result: null}`). Prints
`✓ <successLabel>` on stderr when TTY. For structured output it unwraps SDK
pages/envelopes, pretty-prints JSON to stdout, and syntax-highlights when color
is supported.

For binary or non-JSON-shaped responses (KV values, R2 object bytes,
signed-URL downloads), the generator derives
`outputKind: 'binary' | 'text'` from response MIME types. It emits a code
path that bypasses the SDK's response decoding and uses
`fetchRawBytes` / `writeRawOutput` from `lib/raw-fetch.ts` to write
the body verbatim to stdout. `--text` flips `binary` endpoints to UTF-8 decoded
mode at runtime; `text` endpoints decode by default.

### List pagination (intentional divergence)

`cf <product> list` returns a single API page. cf does NOT
auto-paginate today — callers receive truncated results when a
resource has more than the API's default per-page limit. This is a
**deliberate divergence** from Wrangler's many auto-paginating or explicit
all-pages commands, though Wrangler itself is not uniform and some commands
also return one page.

Closing the gap is future work, gated on a forge annotation
(`x-forge-list-pagination`) so the generator can emit a paginated
loop only for ops that opt in. Until then, callers paginate manually via the per-API
cursor / page flags the underlying op exposes.

### Required-field interactive prompting

When stdin is a TTY and a required body field isn't supplied:

- **Plain string fields** → `clack.text` via `promptForRequiredField`.
- **Fields marked `x-sensitive: true` by OpenAPI** →
  `clack.password` (masked input). Forge exposes sensitivity to the generator;
  flag-name heuristics are not used.
- **Enum-typed fields** → `clack.select` via
  `promptForRequiredEnumField`, with the allowed choices as options.
- **Piped stdin for a sensitive field** → consumed verbatim as the value
  (so `echo "hunter2" | cf workers secrets update X` works). Non-sensitive
  required fields do not consume stdin implicitly.
- **Non-TTY without a usable sensitive-field stdin value** → throws the standard
  `--<flag> is required` error (with enum errors listing the
  choices).

This is the primary closure of wrangler's "interactive wizard" gap
for the common case (single missing required field). Multi-step
branching wizards (`pipelines setup`, `ai-search create`) require a bounded
hand-written design or remain deliberately unsupported.

## UX Conventions

These have stabilised this repo's voice; preserve them.

- **Banner:** `renderPromptIntro(version)` supplies the compact branded headline. `openSession` prints it once for an interactive command; bare cf and `--version` use the compact presentation directly.
- **Terminal styling:** Use the semantic helpers in `lib/ui/theme.ts`
  (`theme.brand`, `theme.info`, `theme.muted`, etc.) rather than importing
  Chalk directly, calling explicit color methods, or hard-coding RGB/ANSI
  values at call sites. If a new semantic purpose does not fit an existing
  helper, add a role to the shared palette with light- and dark-background
  contrast coverage.
- **Account announcement:** `Using account: X (source)` only when `DEBUG` is any non-empty value. Avoids cluttering successful runs.
- **Spinner:** Claude Code-style braille frames + elapsed timer; generated API
  requests (GET + mutating) are wrapped in `withProgress`. Labels are
  verb-only ("Creating", "Deleting", "Loading") — the command already
  names the resource. It animates only with color support and a stdout TTY,
  and `CF_QUIET=1` disables it. The `--quiet` flag is not consulted.
- **Error block:** APIError → `APIError` title; bold `[code]` in error color; bold message; dim `HTTP <status> <reason>` tail. `errorBlock` renders a clack-style left gutter and wraps plain text before applying color.
- **Delete confirmation:** clack.confirm; only `--force` bypasses;
  CI-friendly stderr message when non-interactive ("non-interactive;
  pass --force to confirm").
- **Secret prompt:** clack.password (masks input).
- **Success line:** `✓ <successLabel>` on stderr; null/undefined SDK
  results suppress stdout output entirely.
- **Splash screen:** bare `cf` prints the headline, a short getting-started list, and the docs link. Yargs owns root, group, and command help rendering.

## Global Flags

Live globals (`packages/cli/src/index.ts:buildCli`):

| Flag           | Alias | Purpose                                                         |
| -------------- | ----- | --------------------------------------------------------------- |
| `--help`       | `-h`  | Show help                                                       |
| `--version`    | `-v`  | Show version (branded banner)                                   |
| `--quiet`      | `-q`  | Suppress non-essential output                                   |
| `--zone`       | `-z`  | Zone ID or domain (overrides `CLOUDFLARE_ZONE_ID`)              |
| `--profile`    | —     | Use a specific auth profile                                     |
| `--mode`       | `-m`  | Mode used to evaluate `cloudflare.config.ts`                    |
| `--local`      | —     | Run against cf's global local Miniflare state                   |
| `--persist-to` | —     | Override state directory (default `~/.config/cloudflare/state`) |

There is no single global resolution order. Zone uses positional value → `--zone` → `CLOUDFLARE_ZONE_ID`; account uses `CLOUDFLARE_ACCOUNT_ID` → project settings → cached/prompted workers-auth selection; compliance region uses its environment variable → project settings; and the token uses `CLOUDFLARE_API_TOKEN` → stored OAuth credentials. There are no `--account-id`, `--api-token`, or `--compliance-region` flags.

`--mode` is supplied through the CLI and is available as `ctx.mode` when function-form configuration exports are evaluated.

Generated commands additionally get (per-command, not global): `--dry-run` on every command (mutating and read — reads omit the body preview), `--body` on almost every body-accepting operation, explicit `--file` on eligible upload shapes, and `--force` / `-f` on destructive operations. String-shaped body flags accept the general `@path` ingestion convention unless Forge opts out.

API fields that would emit an exact `--mode` flag are temporarily omitted until their upstream schemas stop using the reserved name. Body fields can still be supplied through `--body`; query, path, and header fields are temporarily unavailable.

Structured API output is JSON; generated `binary`/`text` endpoints write their payload verbatim. There is no global output-format `--format`, `--json`, `--ndjson`, or `--fields` switch. Some generated leaves do expose `format` or `fields` as endpoint-specific API parameters. Callers needing ndjson pipe structured output through `jq -c '.[]'`.

### Reserved and current collisions

`src/index.ts` documents several names the project wants to reserve for cross-cutting features. This is a design constraint, not an enforced global deny-list: yargs scopes leaf options, and generated commands may otherwise expose reserved names sourced from OpenAPI. Do not introduce new collisions casually, but check the generated surface before describing a name as unavailable.

| Flag               | Alias | Reserved for                                                         |
| ------------------ | ----- | -------------------------------------------------------------------- |
| `--remote`         | —     | Force production routing if local ever becomes the default           |
| `--cwd`            | —     | Run as if from a different working directory                         |
| `--config`         | `-c`  | Explicit Cloudflare config-file path                                 |
| `--mode`           | `-m`  | Live global configuration and project-implementation mode            |
| `--experimental-*` | —     | Namespace for opt-in feature gates                                   |
| `--json`           | —     | Output-format toggle (claimed against future default-output changes) |
| `--ndjson`         | —     | Output-format toggle                                                 |
| `--pretty`         | —     | Output-format toggle                                                 |

`--mode` is registered globally and exact colliding API fields are temporarily omitted. `--remote` exists on a generated Pay Per Crawl command. The other exact names in this table are not registered as root/global options today and are normally rejected outside a leaf that defines them. The in-source design list is the `Reserved (future)` comment in `src/index.ts`; it does not itself register or reject options.

## Vendored packages

Tarballs in `vendor/`:

- `cloudflare-forge-0.1.0.tgz`
- `cloudflare-forge-transformer-sdk-ts-0.1.0.tgz`

The Forge packages are not published to npm yet, so
`packages/cli/package.json` references them via `file:` specifiers.
`build-output-utils`, `config`, `containers-shared`, `workers-auth`,
`workers-utils`, and `deploy-helpers` are installed from npm at exact versions.
Dependency patches are registered in `pnpm-workspace.yaml` under
`patchedDependencies`; workers-auth is not patched.

To re-vendor **forge**: `pnpm sync:forge` (defaults to
`FORGE_REPO=../forge`, override to point at any forge checkout). The
script:

1. Runs the `@cloudflare/forge-transformer-sdk-ts` package's `build` task in the source repo (skip with `FORGE_SKIP_PREBUILD=1`). It does not invoke a separate Forge generation task.
2. Repacks the two forge-managed tarballs (`forge` and
   `forge-transformer-sdk-ts`) into `vendor/`.
3. Rewrites the forge `file:` specifiers in `packages/cli/package.json` to
   match the newly-packed filenames.
4. Runs `pnpm install --force`.

Then commit `vendor/` + the `package.json` diff.

When the Forge packages publish to npm: drop their tarballs, switch to npm
versions, and delete `scripts/sync-forge.ts`.

The containers-shared and deploy-helpers patches stay until those packages defer
local image cleanup to cf's successful workflow boundary — see "Patched deps".

## Patched deps

Three dependency patches are registered in `pnpm-workspace.yaml#patchedDependencies`:

- `patches/@changesets__cli@2.31.0.patch`
- `patches/@cloudflare__containers-shared@0.21.1.patch`
- `patches/@cloudflare__deploy-helpers@0.19.0.patch`

The Changesets patch permits publishing prerelease state under `latest` and
suppresses the non-latest-tag warning for that tag. The containers-shared and
deploy-helpers patches defer local image cleanup until the complete upload
succeeds so later failures remain retryable.

## Common Forge-side Annotations cf Reads

These live on forge methods (`methodBase` in
`packages/forge/schema/schema.ts`) and are interpreted by cf's generator.
Knowing the set helps when adding new behavior — prefer extending forge
over adding switches in cf src/.

| Annotation                                                                         | Status | Effect                                                                                                       |
| ---------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| `status: 'deprecated'`                                                             | live   | Method (and possibly its group) skipped entirely                                                             |
| body schema `maxItems: N`                                                          | live   | Generator emits batched-array codepath for bulk ops (sourced from OpenAPI; see `opInfo.maxItems`)            |
| `x-forge-require-confirmation: 'This …'`                                           | live   | Treat a non-DELETE op as destructive (confirm prompt with the supplied message + `--force` + delete spinner) |
| response MIME `application/octet-stream`                                           | live   | Bypass SDK envelope; write response body verbatim to stdout (derived from response content type)             |
| known text response MIME types (`text/plain`, `text/csv`, `text/html`, `text/vtt`) | live   | Same, but UTF-8 decode the body                                                                              |
| `paramOverride.fromFile`                                                           | live   | Body string field accepts `--<flag> @path` with `format: text \| binary \| base64 \| json`                   |
| `paramOverride.hidden`                                                             | live   | Param accepted but not surfaced in `--help`                                                                  |
| `paramOverride.required`                                                           | live   | Promote optional OpenAPI param to required CLI flag                                                          |
| `paramOverride.positional: true`                                                   | live   | Promote top-level body field to positional (NOT for path params)                                             |
| `paramOverride.default`                                                            | live   | CLI default                                                                                                  |
| `paramOverride.description`                                                        | live   | Override OpenAPI prose                                                                                       |
| `x-fern-sdk-method-name`                                                           | live   | Resolved leaf command name                                                                                   |
| `x-fern-sdk-group-name`                                                            | live   | Dot-separated command/group placement                                                                        |
| `x-fern-parameter-name` (path/query/header parameter)                              | live   | Rename the parameter's flag or positional; the wire name and zone/worker handling are unchanged              |
| `x-fern-property-name` (request-body property, any depth)                          | live   | Rename that segment of the body flag (e.g. `--mtls-certificate-id`); the JSON path is unchanged              |
| `x-forge-aliases`                                                                  | live   | Re-emit a method under multiple `(group, name)` pairs                                                        |
| `x-fern-ignore`                                                                    | live   | Drop the operation entirely                                                                                  |
| `x-forge-hidden`                                                                   | live   | Hide the top-level root when every included operation is marked; selected descendant help remains visible    |
| `x-forge-internal`                                                                 | live   | Explicitly retain a selected internal operation                                                              |
| `x-forge-globals`                                                                  | live   | Per-product global flags                                                                                     |
| `x-forge-epilogue`                                                                 | live   | Help-screen epilogue                                                                                         |
| `x-forge-args` / `x-forge-params`                                                  | live   | Full argument/parameter overrides                                                                            |
| `x-sensitive: true`                                                                | live   | Mark a request field for masked prompting and secret-only stdin ingestion                                    |

Names discussed in planning documents such as `paramOverride.derive`, `x-forge-job-poll`, `x-forge-pre-delete-checks`, `x-forge-confirm-typed-name`, `x-forge-success-message`, and `x-forge-list-pagination` are proposals only. They are not part of the current vendored Forge schema and the generator does not read them.

## Known Anti-Patterns to Avoid

- **IMPORTANT: Never add JSDoc `@param` / `@returns` tags — they're
  redundant noise next to typed signatures.** Keep comments sparse and
  high-signal: explain _why_, not _what_. Don't narrate the code.
- Never use `git -C <dir>` for cross-directory git operations. Always
  cd into the right directory (use the bash tool's `workdir` parameter).
- Never modify `@cloudflare/forge` from this repo. Changes go in the
  forge source repo, republished, re-vendored.
- Never use relative imports across package boundaries.
- Never infer HTTP verbs from command names. Use the finalized OpenAPI operation resolved by Forge (`opInfo.method`).
- Never hard-code API product names in generic/cross-cutting `packages/cli/src/` code. Keep the documented AI, Registrar, D1, and Workers workflow exceptions contained in their command directories, and keep the universal zone-name resolver confined to `context.ts` and `resolve.ts`.
- Never edit `_generated/` files — overwritten on `pnpm generate`.
- Never reintroduce `tsc`. Type checking uses `tsgo`.
- Never reintroduce `tsup` — `tsdown` is the bundler. Unlike `tsup`,
  it produces chunked output that cooperates with lazy-command
  dynamic imports.
- Never eagerly import `_generated/index.ts` from anywhere besides
  the lazy shell in `src/index.ts`. Doing so reverses the startup-perf
  win from `lazy-command.ts`.
- Never call `getWorkerRegistry` from miniflare for read-only purposes
  — it `unlinkSync`s files older than 5 min as a side effect. Use a
  read-only walk instead for `--local` work.
- Never add per-API-code error switches in `errors.ts` — surface
  product knowledge via forge annotations or push fixes upstream into
  the canonical API error message.
- Never reintroduce `formatTypeScript()` (biome wasm) into the
  generator. Format post-finalize via `oxfmt` so forge stays
  dependency-free.
- Never use `new Date()` in generated metadata — use `"build-time"` /
  fixed strings for deterministic output (turbo/CI cache stability).

## Commit cadence

Commit each logical change as it's made (per-feature, per-fix).
Conventional-commits style. Don't push unless asked. Common types in
this repo: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`.

Before pushing any code change, run the exact root command `pnpm check` and
require it to pass. This is the repository-level gate for lint, type checking,
and formatting; narrower commands, focused tests, direct tool invocations, and
successful builds do not replace it. If `pnpm check` cannot start or complete
because of the environment or unavailable dependencies, do not present those
substitutes as equivalent: report the blocker and the checks that did run
before pushing. After fixing a check failure, rerun the complete root command.

Add a changeset alongside any user-facing change to `cf`. Run
`pnpm changeset` (or hand-write `.changeset/<name>.md` with a
`"cf": <patch|minor>` frontmatter, an imperative title, and a short
body). Bump type tracks the commit: `fix` → `patch`; `feat`, new
commands/flags, and pre-1.0 behaviour changes → `minor`. Skip it only
for purely internal work (refactors with no output change, tests, docs,
CI). See `.changeset/README.md` for the full format and rules.

## Commands

```bash
pnpm install           # uses vendor/ tarballs
pnpm build             # pinned public OpenAPI → matching SDK, CLI, and dist/
pnpm dev               # turbo: tsx packages/cli/src/dev.ts (persistent)
pnpm check             # oxlint + tsgo + oxfmt --check
pnpm check:lint        # oxlint --type-aware
pnpm check:type        # tsgo --noEmit
pnpm check:format      # oxfmt --check
pnpm fix               # oxlint --fix && oxfmt
pnpm sync:forge        # re-vendor from FORGE_REPO (default ../forge)
```

End-to-end smoke tests against a real Cloudflare account:

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...
bash packages/cli/e2e/_generated/run-e2e.sh [--zone ZONE_ID] [--product NAME]
```

## Publishing

Per-PR and per-`main`-commit prereleases via `.github/workflows/prerelease.yml` → [pkg-pr-new](https://pkg.pr.new). Install a published PR or commit with:

```bash
pnpm i https://pkg.pr.new/cloudflare/cf/cf@<sha>
# or
pnpm i https://pkg.pr.new/cloudflare/cf/cf@<branch-name>
```

The previous `publish-{alpha,,cf}.sh` scripts have been removed. Per-commit
prereleases flow through pkg-pr-new. Versioned beta and stable releases use
Changesets: `.github/workflows/changesets.yml` opens/updates the Version
Packages PR when changesets exist and publishes to npm after that PR is merged.
Publishing uses npm trusted publishing (OIDC), not a long-lived `NPM_TOKEN`.

`tsdown` builds in production mode (`NODE_ENV=production` →
sourcemaps off, minified) when invoked by the prerelease workflow.
`PACKAGE_PRERELEASE_LABEL` may be supplied to tsdown's `define` configuration,
but no current source module reads it, so the binary does not self-report the
branch or ref name.

## Product Direction

The following is the product direction that shaped the repository; dated
milestones in the original planning material are historical rather than a
statement of current release status. Design decisions should track the
following north-star, captured
from the agents-week blog post, "What's coming to cf (and Wrangler!)
over the next 6 months", the Forge RFC, and the API-First post.

The order of bullets below roughly tracks "most immediately
constraining on this repo" to "future-facing".

### Core positioning

- **cf is the CLI for all of Cloudflare, not just the developer
  platform.** DNS, access rules, domain purchase — anything the API
  exposes. Wrangler is/was the CLI for the developer platform; cf
  supersedes it by covering everything. In fact, cf IS the next version
  of Wrangler: the public blog positions it as "an early version of
  what the next version of Wrangler will look like as a technical
  preview." Over coming months cf + Wrangler converge; `wrangler` as
  a separate command may be preserved as a `@cloudflare/wrangler-legacy`
  delegate target for users who can't migrate off its bundler.
- **Agent-first.** cf is the primary way AI agents will drive
  Cloudflare, analogous to `gh` for GitHub or `glab` for GitLab. This
  motivates forge (auto-generate every endpoint, no gaps), global
  install (`cf *` permission scope, not `npx *`), and machine-readable
  command metadata.
- **Dogfood our own API surface.** cf uses the Fern-generated
  TypeScript SDK produced by `@cloudflare/forge-transformer-sdk-ts`
  and imported through `#sdk`, same as any external consumer. Do not
  bypass the SDK with direct `fetch` calls just
  because cf lives next to forge — the only exception is
  `lib/raw-fetch.ts` for endpoints whose response shape doesn't fit
  the SDK envelope. The explicit goal is that cf is a template for
  how any internal team should consume the Cloudflare API.
- **Ship every fix immediately.** Patch releases for every bug fix
  (TanStack style). Bug fix turnaround measured in minutes/hours, not
  weeks/months. The pkg-pr-new prerelease pipeline supports this —
  don't batch fixes waiting for a "release window".

### Consistency rules (preferred by Forge, with spec/overlay exceptions)

From the Forge RFC, these are the vocabulary and shapes to prefer for new overlays. The current generated catalogue also inherits deliberate operation names and HTTP semantics from product specs. Investigate a contradiction in Forge/spec metadata before treating it as a cf emitter bug.

- Prefer `get` over `info`; existing spec operations include `cf vectorize info` under the top-level-hidden `vectorize` root.
- Always `--force`, never `--skip-confirmations` / `--yes` / `-y`
  variants.
- Output is JSON by default. There are no global `--json`, `--ndjson`, `--pretty`, or `--format` controls; the first three names are reserved for future output controls. Endpoint schemas can still expose ordinary operation arguments named `--format` or `--fields`.
- The usual SDK/HTTP mapping is `.get`/`.list` → `GET`, `.create` → `POST`, `.delete` → `DELETE`, and `.edit` → `PATCH` or `PUT`. This is not universal: current specs include POST-based list/get operations, PUT-based create/delete operations, and a POST-based edit operation. Preserve the authoritative operation unless the product spec or overlay is itself wrong.
- 6 different pagination schemes across the API today is a known
  inconsistency (see `PRD API Pagination Alignment`). cf inherits
  whatever forge normalises to; don't hand-roll alternatives.

### Cross-cutting platform decisions

- **Cloudflare config format** (`worker` / `containers` plus account settings).
  The Worker's top-level `env` mirrors runtime `env.*`
  binding names; `exports` describes Durable Objects and Containers
  as per-class resources; `triggers` describes HTTP routes, custom domains,
  cron schedules, queues, and email. Config schema is
  identical to the API metadata body — zero translation between
  "what you write" and "what the API receives". Programmatic config is a
  single default `defineConfig()` export from `cloudflare.config.ts`. cf reads
  only its account settings; resource handling remains with project tooling.
- **Global installation across package managers.** npm (`npm i -g cf`),
  pip, cargo. Wrangler-2-style delegation: if a project has a local
  cf pinned, the global one delegates to it so teammates share a
  version. Implications for this repo:
  - No code path may assume it's the only cf in the process tree.
  - Persistent state (auth tokens, caches, and CLI state) must be
    cross-version compatible — any schema bump needs a migration
    path, not a "this version writes fields the older delegate
    can't read" drift.
  - Global permission scope is `cf *`, not `npx *` — relevant to how
    the CLI is invoked from agent runners like OpenCode.
- **Bundled Node runtime, single-binary distribution (unshipped proposal).**
  Today cf is the npm package `cf`, its `bin/cf` launches the built ESM, and a
  compatible Node runtime plus external runtime dependencies are required.
  The design proposal is a single executable per
  (OS × arch) with Node embedded — similar to Bun, Deno, or
  `pkg`-built tools. Users never see Node directly. Sizing
  expectations:
  - Per-platform binary: ~245–265 MB (Node ~50–60 MB + cf's bundled
    JS ~5–10 MB + bundled `@cloudflare/autoconfig` and framework
    adapters ~3 MB + vendored forge ~3 MB + **miniflare ≈185 MB** +
    misc deps). Miniflare is now a hard runtime dep for `--local`
    (workerd ~140 MB, miniflare ~26 MB, sharp + libvips ~19 MB), and
    it dominates the budget.
  - Total release artifacts: ~5 platforms × ~255 MB ≈ 1.25 GB; each
    user downloads one.
  - Comparable to `gcloud` (~250 MB). Much larger than `aws` v2
    (~60 MB bundled Python) or Go-distributed `gh` (~15 MB).
  - Distribution channels (npm / pip / cargo) wrap the same
    per-platform binary; the package manager's job is fetching
    the right binary for the host platform, not building
    anything.
  - Update mechanism should consider delta patching to keep
    upgrade churn manageable given the binary size.
  - Implication for the codebase: dependencies count toward this
    budget. Be deliberate about adding heavy deps; tree-shake-
    friendly (ESM, no side effects) is preferred. The
    chunked-output cooperation between `tsdown` and `lazy-command`
    is an asset here — only the chunks a user touches load into
    memory at runtime.

  **Why not Go or Rust** (would shrink to ~15–25 MB):
  - `@cloudflare/autoconfig` is TypeScript and tightly coupled
    to npm tooling. Porting to Go/Rust is a significant rewrite
    of an already-shipped package; the alternative (run
    autoconfig as a Node subprocess) reintroduces a Node bundle
    and erases the size win.
  - Forge SDK + transformer are TypeScript. Code generation
    would need a separate TS build step, or full forge port.
  - Miniflare types + dev-registry walker for `--local` are
    TypeScript.
  - 3–6 months of porting + ongoing TS↔native split for forge.
    Pushes birthday-week GA significantly.

  ~70 MB of that is acceptable for a 2026 CLI on developer machines /
  CI runners / Codespaces, and the 50 MB Go/Rust delta isn't worth a
  multi-month delay on a one-time install. Miniflare's ~185 MB is a
  separate question and the one worth revisiting: shipping workerd
  only on demand (a lazily-fetched sidecar, or a `cf[-local]` split
  package) would cut the download roughly 3×. Not a stage-1 concern,
  but don't let the budget quietly normalise.

  **Keep the option open** for a future Go/Rust rewrite by:
  - Avoiding dynamic Node features (eval, runtime
    monkey-patching) in `src/`.
  - Keeping SDK consumption clean (so a Rust SDK could swap in).
  - Keeping the dev-server / autoconfig contracts subprocess-
    based where they cross language boundaries.

- **Lazy config validation.** Future project config readers must validate on
  demand per-subsection. `cf dns` must succeed even when Worker
  bindings config is invalid. Do not reintroduce wrangler's
  validate-everything-upfront pattern. This is a direct constraint
  on how project config support evolves.
- **Container-friendly OAuth.** `cf auth login` and `cf auth create` use the
  OAuth 2.0 Device Authorization Grant (RFC 8628) by default through
  `@cloudflare/workers-auth`. The flow prints a verification URL and user code,
  optionally opens the URL (`--no-browser` suppresses this), and polls until
  the user approves it. It does not host a callback server, so it works in
  containers, Codespaces, remote VMs, and SSH sessions. `--no-device` opts
  back into the authorization-code-with-PKCE flow and its callback server on
  `localhost:8877`. The earlier WebSocket-relay proposal in workers-sdk
  discussion #13117 predated server-side Device Authorization Grant support
  and is superseded; do not reimplement either flow in cf's façade.
- **`cf dev` delegates to dev-server implementations.** It is not
  JavaScript-specific and cf does not bundle a default dev server. The
  allowlist currently recognizes `@cloudflare/vite-plugin`, fallback
  `wrangler`, `cloudflare-py-dev-server`, and
  `cloudflare-rs-dev-server`. Each implementation exposes a delegate binary
  with `dev` and `build` subcommands. cf uses the same discovery and spawning
  machinery for both. A former `--local` fast-path design was deleted;
  `--local` now spawns its own Miniflare. Discovery happens via the project's
  manifest (`package.json` / `pyproject.toml` / `Cargo.toml`).
- **Build Output Specification.** Under `.cloudflare/output/v0/`, a required top-level
  `config.json` carries account settings and `buildContext`; each Worker
  directory contains `worker.config.json` plus `bundle/`, `assets/`, or both;
  and each Container directory contains `container.config.json`. Build tools produce the
  output; `cf build` validates it, and deploy/version-upload/trigger workflows
  consume it through `@cloudflare/build-output-utils`. Deploy and version
  upload then use `@cloudflare/deploy-helpers`. Additional Worker directories
  are valid; deploy, Preview deploy, version upload, trigger deploy, and startup
  checks select one with `--worker <name>`, otherwise cf uses the required
  `workers.default`.
  Output config is a deployment artifact whose manifest identifies the bundled
  entrypoint and modules.
- **Forge is cf-exclusive.** Wrangler customisations that cf will need
  to carry over via forge annotations (not hand-written in this repo):
  interactive wizards (`wrangler pipelines`), browser-opening
  (`wrangler browser`), and scoped API token minting (`wrangler r2`).
  Generic piped secret input has already shipped for OpenAPI fields marked
  `x-sensitive`. When adding such behavior, prefer
  extending forge over adding switches in `packages/cli/src/`.

### The one test to apply when adding a capability

From the Forge RFC and API-First post, the single most-important
decision rule:

> Before hand-wiring a feature into cf, ask: "Should users of the API
> also have access to this?"
>
> If yes: it belongs at the platform / API layer (with cf picking it
> up generically via forge), NOT as a cf-specific hand-written
> affordance.
>
> If no (truly CLI-only, like interactive wizards): it belongs in
> forge as a method-level annotation so every _future_ generated CLI
> can emit the same affordance consistently.
>
> If it only works in cf as a bespoke switch in `packages/cli/src/`:
> reassess. You're probably on the wrong path.

## Planning status

Treat the implementation and tests as ground truth for current status and
remaining GA work.

## Follow-ups

- **`no-console` oxlint rule is NOT enforced.** The CLI has many direct
  `console.*` calls and no single logger abstraction. Enabling would require
  inline disables everywhere or a logger refactor.
- **Remaining compound workflows** (`wrangler versions secret`,
  `wrangler pages secret`,
  Worker rollback, `r2 lifecycle/lock add`, `pipelines setup`)
  are not generated — they require parsing, read-modify-write, or multiple
  endpoints. The generated surface does include Pages deployment rollback, R2
  lifecycle get/update, and R2 lock get/update/delete. Close useful remaining
  cases through upstream API coverage, shared helpers, or a bounded
  hand-written design.
- **`--local` spawns a fresh Miniflare on every invocation** (~1–2 s).
  If a dev server is already holding the persist root, cf could talk
  to it instead of spawning a second runtime over the same SQLite
  tree. This reuse is deliberately deferred.
  The concurrent-writer half is closed by Miniflare Shared Storage
  (workers-sdk#15169), adopted via `unsafeEnableSharedStorage` +
  `isolatedResourcePersistencePath` + `unsafeDevRegistryPath`.
- **R2 object parity is incomplete.** The generated
  `cf r2 buckets objects` surface supports get, upload, delete, list, and
  list-body bulk-delete through the REST API. Wrangler's S3-style `r2 object`
  surface still has
  operations and options cf cannot express, including download-to-file,
  richer storage-class/fetch options, R2 SQL, and manifest-driven bulk
  upload. Closing those gaps requires additional API schema coverage or a
  bounded hand-written/shared client for S3- and manifest-specific operations.
  `test_bugs/r2-object-not-generated.md` is the current
  residual inventory despite retaining its historical slug.

Container SSH is a bounded hand-written leaf in `src/commands/containers/ssh`, registered in `hand-written.ts`. It adapts cf authentication to the same `@cloudflare/containers-shared` SSH options and transport used by Wrangler.

`containers/images/list` and `containers/images/delete` are hand-written leaves
registered with parent `containers/images`. They use the shared registry image
operations from `@cloudflare/containers-shared`; cf supplies authentication,
confirmation, and JSON output. Added leaves can target existing nested generated
groups through slash-separated parent paths. Keep their sidecars and collision
guards in sync. The image commands use the released
`@cloudflare/containers-shared@0.21.1` package.
