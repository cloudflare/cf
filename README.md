# cf

`cf` — the unified Cloudflare CLI, published under the unscoped `cf` npm
package. cf is currently in beta and requires Node.js 22 or newer.

The API surface is generated end-to-end from the Cloudflare OpenAPI spec via
[`@cloudflare/forge`](https://github.com/cloudflare/forge), with a thin yargs
shell plus bounded hand-written workflows. The generated metadata in this
checkout contains **2,991 leaf commands across 163 top-level namespaces**:
2,959 spec-backed operations plus 32 hand-written-only leaves; two
spec-backed operations have hand-written overrides. Of the total, 1,902
records across 74 namespaces have `hideCommand` false or absent; 1,089 inherit
it from hidden or early-access roots. That flag suppresses the affected roots
from top-level help, not their nested help after selection, and every command
remains invokable. These counts move with the pinned Forge OpenAPI release.

This repo contains the CLI package plus the code generator that produces its
per-API command surface. The Forge runtime and TypeScript SDK transformer are
vendored as tarballs until they are published to npm. The OpenAPI document is
not vendored: normal generation downloads a pinned Forge release asset, while
the generated SDK and command tree are committed to this repo.

For the agent-facing version of this doc — design rules, invariants,
"where to edit" map, anti-patterns, and Wrangler parity triage — see
[`AGENTS.md`](./AGENTS.md) and [`packages/cli/AGENTS.md`](./packages/cli/AGENTS.md).
The compatibility corpus is documented in
[`packages/wrangler-tests/README.md`](./packages/wrangler-tests/README.md).

## Layout

```
cf/
├── packages/cli/                   # cf — CLI + its generator
│   ├── src/                          # Hand-written CLI runtime (yargs)
│   │   ├── index.ts                    # entry; lazy-registers generated +
│   │   │                                # hand-written commands
│   │   ├── dev.ts                      # tsx wrapper for `pnpm dev`
│   │   ├── version.ts                  # package.json version (+ test override)
│   │   ├── commands/                   # hand-written: auth, complete, dev,
│   │   │   │                            # build/deploy, Workers check/triggers/versions,
│   │   │   │                            # schema, tools;
│   │   │   │                            # bounded generated-tree additions/
│   │   │   │                            # overrides for AI, Registrar, D1,
│   │   │   │                            # and Workers
│   │   │   └── _generated/             # committed generated yargs modules + metadata
│   │   │                                # (DO NOT EDIT — regenerated as a unit)
│   │   ├── lib/                        # auth, oauth, context resolution,
│   │   │                                # global CLI state,
│   │   │                                # output, prompts, raw-fetch (binary),
│   │   │                                # lazy-command, input-validation
│   │   │                                # (@file token), local + local-runtime
│   │   │                                # (--local), delegate, build-output +
│   │   │                                # deploy-* (cf deploy), etc.
│   │   ├── sdk/                        # committed SDK from the pinned OpenAPI
│   │   └── __tests__/                  # vitest + MSW harness (unit + command)
│   ├── generator/                    # forge transformer that emits
│   │                                  # src/commands/_generated/
│   ├── e2e/                          # 114 product fixtures + a generated
│   │                                  # bash runner that hits a real CF account
│   ├── bin/cf                        # loads dist/delegate.mjs; imports
│   │                                  # dist/index.mjs only if not re-execing local cf
│   ├── generate.ts                   # fetch OpenAPI → initFromOpenApi → emit → oxfmt
│   ├── tsdown.config.ts              # ESM bundler config (chunked output)
│   ├── vitest.config.mts             # in-package test harness config
│   ├── turbo.json                    # per-package turbo config
│   └── package.json
├── packages/wrangler-tests/        # imported wrangler test corpus, retargeted
│                                    # at cf (aliases cf → ../cli/src/index.ts)
├── fixtures/                       # cf dev discovery fixtures (Vite plugin +
│                                    # Wrangler projects)
├── usecases/                       # per-command usage-scenario YAML catalogue
├── vendor/                         # vendored tarballs: forge + SDK transformer
├── patches/                        # pnpm patches: autoconfig, deploy-helpers,
│                                    # workers-utils
├── scripts/sync-forge.ts           # re-vendor pipeline (FORGE_REPO=...)
├── .github/workflows/              # CI, Changesets publish, prerelease + bench
├── turbo.json                      # task orchestration
├── pnpm-workspace.yaml             # blockExoticSubdeps + allowBuilds
├── .oxlintrc.jsonc                 # type-aware lint via oxlint-tsgolint
└── .oxfmtrc.jsonc                  # tabs, double quotes, printWidth 80
```

## Tooling

Aligned with `workers-sdk`:

- **turbo** — task orchestration (remote cache, signed)
- **oxfmt** — formatting (tabs, double quotes, printWidth 80)
- **oxlint** — type-aware linting via `oxlint-tsgolint`
- **tsgo** (`@typescript/native-preview`) — type checking, no `tsc`
- **tsdown** (Rolldown-based) — chunked-ESM bundler for `dist/`. Replaced
  `tsup` so command modules can be dynamically imported by chunk; pairs
  with `lib/lazy-command.ts` to keep `cf --help` and single-command
  startup fast.
- **pnpm 10** with `blockExoticSubdeps` +
  `allowBuilds: { esbuild: true, workerd: true }`

Testing is split across two packages:

- **`packages/cli/`** — a first-class vitest + MSW harness
  (`packages/cli/vitest.config.mts`) driving in-package unit and
  command-level tests under `src/__tests__/` (currently 67 test files,
  covering auth/profiles, config, context, build output, build/deploy,
  Workers check/triggers/version creation, D1 migrations, `cf dev`, `--local`,
  and MSW-mocked generated commands). Run with
  `pnpm test` from the cli package.
- **`packages/wrangler-tests/`** — the imported Wrangler test corpus
  (currently 118 test files),
  re-targeted at cf's entry point (its vitest config aliases `cf` →
  `../cli/src/index.ts`) and using MSW for HTTP mocking.

Additional confidence comes from the Forge type system, `tsgo` over the
generated tree, the `e2e/` JSON fixtures driving a generated bash runner
against a real Cloudflare account, and the `cli-startup-bench.yml`
workflow that hyperfines `cf --help` cold start for non-Markdown changes on PRs
and pushes to `main`.

## Commands

```bash
pnpm install              # install deps (uses vendor/ tarballs for forge)
pnpm build                # generate from pinned Forge OpenAPI + build dist/
pnpm dev                  # tsx packages/cli/src/dev.ts (persistent, via turbo)
pnpm check                # lint + type + format
pnpm check:lint           # oxlint --type-aware --deny-warnings
pnpm check:type           # tsgo --noEmit
pnpm check:format         # oxfmt --check
pnpm fix                  # autofix lint + reformat
pnpm sync:forge           # re-vendor forge from FORGE_REPO (default ../forge)
```

Generation downloads the pinned public Forge `openapi.forge.json` release
asset identified in `packages/cli/generate.ts`. It regenerates the committed
SDK when the entrypoint is missing, the pinned revision changes, or a local
bundle override is supplied.

End-to-end smoke tests against a real Cloudflare account:

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...
bash packages/cli/e2e/_generated/run-e2e.sh [--zone ZONE_ID] [--product NAME]
```

## What cf reads (and doesn't)

Ordinary generated API commands do NOT read your project's Worker definition.
They read only the account settings from `cloudflare.config.ts`'s default
export; they do not inspect its `worker` or `containers` fields. Project Worker configuration is the
dev/build implementation's domain. The hand-written `cf init`, `cf dev`,
`cf build`, `cf deploy`, `cf workers versions create`, `cf workers check`,
and `cf workers triggers deploy` workflows may run `@cloudflare/autoconfig`,
delegate a project command or implementation, and read standardized Build
Output.
`--local` doesn't read it either — it uses cf's global persisted state by
default, or `<dir>/v3` beneath the directory supplied with `--persist-to` (see
`packages/cli/AGENTS.md`).

This means your `cf dns records list` does not validate the configured Worker
and cannot fail merely because a binding field is invalid. Loading the account
settings still evaluates the TypeScript module and default config wrapper, so syntax,
import, and top-level runtime errors can surface.

What cf does read:

| File                                                                         | When                                                             | Owner                                                   | Purpose                                                                                                                                   |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cloudflare.config.ts`                                                       | When resolving account/region                                    | `lib/project-settings.ts`                               | Project account and compliance defaults from the default export.                                                                          |
| `cloudflare.config.ts` Worker definition                                     | `cf workers types`, and `cf init` after installing a new project | `commands/workers/types/generate.ts`                    | Generates `.cloudflare/types/index.d.ts` from the Worker, its compatibility date, and its flags.                                          |
| `~/.config/cloudflare/state.json`                                            | On interactive CLI startup                                       | `lib/state.ts`                                          | Records whether the shell-completion tip has been displayed.                                                                              |
| `~/.config/cloudflare/state/v3/`                                             | With `--local`                                                   | `lib/local-runtime.ts`                                  | Global Miniflare resource state; overridden by `--persist-to`.                                                                            |
| `.cloudflare/output/v0/config.json` and `workers/default/worker.config.json` | Build/deploy/version/check/trigger workflows                     | `@cloudflare/build-output-utils`, `lib/build-output.ts` | Standardized output produced by an implementation. `cf build` validates the default Worker; other workflows can pick one with `--worker`. |

What cf does NOT read:

- the `worker` field outside type generation, or the `containers` field, from
  `cloudflare.config.ts` (the dev-server impl reads them)
- `wrangler.jsonc` / `wrangler.toml`
- `pyproject.toml` worker config
- `Cargo.toml` worker config
- `package.json` worker config

If a feature seems to require cf to parse worker config, it's
either (a) better implemented as a forge annotation, (b) better
served by the local-explorer's runtime binding inventory
(`GET /local/workers`), or (c) a `cf dev` impl concern. See
`AGENTS.md` for the principle and concrete examples (`--binding`, `--preview`)
ruled out by this rule.

## Divergences from Wrangler

cf's command surface is generated from the Cloudflare OpenAPI spec, so several
Wrangler UX behaviors have no direct equivalent.

- **`pages_build_output_dir` detection** — Wrangler reads project configuration (`wrangler.json`, `wrangler.jsonc`, or `wrangler.toml`) to distinguish Workers projects from Pages projects and redirects accordingly. cf does not use Wrangler project configuration for this redirect; its `cf pages *` commands are generated separately from the OpenAPI surface.

- **Service environments (`--env`, `--legacy-env`)** — deliberately not carried over as cross-cutting Wrangler semantics. Wrangler's `[env.staging]` inheritance model is replaced by TypeScript `cloudflare.config.ts` and a flat lifecycle `--mode` input on `cf build`, `cf deploy`, `cf workers versions create`, and `cf workers triggers deploy`. Generated API commands do not interpret service environments; one Pages deployment-list leaf has an endpoint-local `--env` filter.

- **Multi-env warnings** — tied to service environments; not
  applicable.

- **OAuth device-flow default** — cf uses device authorization by default for explicit login, named-profile creation, and implicit first-use login. Wrangler defaults to its callback flow and uses `--device` to opt in. In cf, `--no-browser` leaves the verification link and code in the terminal, while `--no-device` selects authorization-code + PKCE with a localhost callback.

- **`wrangler versions secret put/list/delete/bulk`** — cf exposes Worker version, deployment, secret, and version-upload primitives, but not Wrangler's dedicated version-scoped secret command tree and binding-builder UX.

- **`wrangler pages secret put/delete/list`** — Pages secrets live inside
  project environment variables. Current Wrangler mutates them via
  `PATCH /pages/projects/{name}`. cf exposes the generated Pages project edit
  operation, but not a dedicated `cf pages secret *` surface, config inference,
  or JSON/`.env` secret parser.

- **`wrangler secret put` / `secret bulk [file]`** — the API has direct
  Worker secret-write endpoints, but the target schema classifies them as
  SDK-only, so cf emits no equivalent write commands. Wrangler additionally
  provides its positional JSON/`.env`/stdin parser and per-secret report.

- **`wrangler tail` log streaming** — cf has no Worker tail command. The Worker
  tail-session operations are SDK-only, and cf does not consume their
  WebSocket. (Pages tail descriptors remain ordinary generated API commands,
  but likewise have no streaming consumer.)
  Any future streaming consumer requires a dedicated hand-written design; it
  is too narrow to generalise as a Forge primitive.

- **"Create a new Worker if not found" prompt** — Wrangler can offer a minimal ESM multipart Worker upload when a secret operation finds no Worker. cf surfaces the API error instead.

- **`wrangler.toml` account_id resolution** — cf uses the account settings in
  `cloudflare.config.ts`'s default export instead.

- **`cf <product> list` does not auto-paginate.** Wrangler often walks the
  cursor or offers an all-pages mode; cf returns a single API page and callers
  paginate manually via the underlying op's cursor / page flags.
  Closing this is gated on a forge `x-forge-list-pagination`
  annotation so the generator emits a paginated loop only for ops
  that opt in. See `AGENTS.md` "List pagination (intentional divergence)".

- **`cf --local` has a narrower surface than Wrangler's.** cf starts an
  ephemeral Miniflare instance over global persisted state
  (`~/.config/cloudflare/state/v3`, or `<dir>/v3` for `--persist-to`) and routes
  supported requests through the local-explorer API. Local coverage includes
  common KV, D1, and R2 data-plane operations, but not control-plane resource
  creation/deletion, `cf d1 query` (`cf d1 raw` works), Wrangler's additional
  S3 convenience workflows, or cold-shell Durable Object and Workflow access.
  cf also does not support Wrangler's `--binding`, `--preview`, or automatic
  project-config updates after resource creation.

## Followups

- **Wrangler convenience workflows.** Version-scoped secrets, Pages secrets,
  Worker rollback, R2 lifecycle/lock add/remove, and `pipelines setup` remain
  absent as dedicated cf UX. cf does expose the underlying Pages deployment
  rollback, R2 lifecycle get/update, and R2 lock get/update/delete operations.
  The remaining conveniences require parsing, read-modify-write, or
  multi-product orchestration.

- **`--local`: avoid the per-invocation Miniflare spawn.** cf already enables Shared Storage with an isolated persistence path and the common dev registry, but each command still starts its own Miniflare (~1–2 s). Compatible peers can share data today; dispatching through an existing peer instead of starting the cf-owned cold fallback remains open.

## Vendored packages (interim)

Two Cloudflare packages aren't on npm yet, so their tarballs are committed
to `vendor/`:

- `cloudflare-forge-0.1.0.tgz`
- `cloudflare-forge-transformer-sdk-ts-0.1.0.tgz`

The vendored Forge packages are referenced from `packages/cli/package.json`
via `file:` specifiers. The CLI declares exact dependency versions, and the
committed lockfile currently resolves the patched copies. The root
`package.json` registers the matching patches under
`pnpm.patchedDependencies`.

To refresh the vendored **forge** tarballs:

```bash
pnpm sync:forge
```

The script (`scripts/sync-forge.ts`) builds the Forge TypeScript SDK transformer
in a sibling Forge checkout (defaults to `../forge`; override with
`FORGE_REPO=/path/to/checkout`; skip that build with
`FORGE_SKIP_PREBUILD=1`), repacks **only the two
forge-managed tarballs** (`forge`, `forge-transformer-sdk-ts`) into
`vendor/`, rewrites their `file:` specifiers in `packages/cli/package.json`,
reinstalls, and formats the affected package manifests.

Once the Forge packages are published to npm, drop the tarballs, replace the
`file:` specifiers with npm versions, and delete `scripts/sync-forge.ts`.

## Generated formatting

The generator post-formats TypeScript with oxfmt as the last step of
`pnpm generate` (see `packages/cli/generate.ts`). Previously
`formatTypeScript()` (biome wasm) was called inside the generator
itself — that coupled every forge consumer to biome. Now formatting
happens here, after `forge.finalize()`, so forge stays
dependency-free.

## Publishing

Per-PR / per-`main`-commit prereleases via
[`.github/workflows/prerelease.yml`](./.github/workflows/prerelease.yml)
→ [pkg-pr-new](https://pkg.pr.new). The workflow runs independently on pull
requests and pushes to `main`; install a published PR or commit build with:

```bash
pnpm i https://pkg.pr.new/cloudflare/cf/cf@<sha>
# or
pnpm i https://pkg.pr.new/cloudflare/cf/cf@<branch-name>
```

Prereleases flow through pkg-pr-new on pull requests and pushes to `main`.

Versioned releases use Changesets: pending changesets produce a Version
Packages PR, and merging it publishes `cf` to npm through trusted-publishing
OIDC. While prerelease mode is active, Changesets publishes versions such as
`1.0.0-beta.0` under the `beta` npm dist-tag.

`tsdown` builds in production mode (`NODE_ENV=production` →
sourcemaps off, minified) when invoked by the prerelease workflow.
The workflow also sets `PACKAGE_PRERELEASE_LABEL`, and `tsdown.config.ts`
defines it when present, but the current runtime does not read that value.

## License

Licensed under either the [Apache License 2.0](./LICENSE-APACHE) or the
[MIT License](./LICENSE-MIT), at your option.
