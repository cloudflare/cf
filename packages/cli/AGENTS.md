# cf (`packages/cli`)

Cloudflare CLI. Yargs-based, TypeScript, ESM, Node ≥ 22.

This package IS the CLI. It also owns the generator that produces its
per-API command surface (`generator/` → `src/commands/_generated/`).

## Critical Invariant: Contain API Knowledge

The cross-cutting runtime (`src/index.ts` and generic helpers under `src/lib/`) must remain a generic shell over whatever commands the generator emits into `src/commands/_generated/`. Product-specific behavior belongs in Forge unless it is one of the deliberately bounded hand-written exceptions below or the universal zone-name resolver used by global `--zone`.

- `src/index.ts` imports `generatedCommands` and registers them in a loop
- each generated top-level command root is registered through `lazyCommand`; selecting it loads the root's statically imported group/leaf subtree
- Adding a new API product is a forge change, not a cf change

If a generic runtime or generator change starts branching on a product name, first look for a Forge/OpenAPI annotation. The existing Worker-name derivation is a narrowly scoped generator exception. The runtime exception is likewise contained: `context.ts` delegates non-ID global zone values to `resolve.ts`, which validates the domain and calls `client.zones.list()` for the selected account. Do not use either as permission to spread product checks through the runtime.

**Documented exceptions:** `src/commands/hand-written.ts` is the central registry for every hand-written root, generated-parent presentation override, generated leaf override, added leaf command, and generated-tree subgroup. `generator/hand-written-overrides.ts` consumes the non-root entries during generation. `ai/run` and `registrar/registrations/create` replace spec-backed leaves; `workers/check`, `workers/types`, nested `workers/versions/create`, advisory-only `pages/deploy`, the cloudflared-backed `tunnels/quick-start` and `tunnels/run`, and the process-backed `access/*` workflows add local workflow leaves; Access also exposes its otherwise hidden generated parent; and `d1/migrations` plus `workers/triggers` add subgroups with no matching one-shot spec operation. Keep the implementations contained in their command directories, register them once in `hand-written.ts`, and retain drift guards for product-scoped entries.

## Wrangler Parity Triage

Classify a Wrangler difference before treating it as a cf bug:

- Missing or incorrect API CRUD belongs in the OpenAPI schema or a Forge
  overlay, then comes back through generation.
- Dev servers, builds, uploads, triggers, and other lifecycle mechanics belong
  to their project implementation or the shared library that owns the
  contract; cf should remain a coordinator and adapter.
- Different JSON-first output, ID-first inputs, config avoidance, or other
  deliberate cf semantics are not parity bugs by themselves.
- Truly CLI-only, multi-endpoint orchestration needs an explicitly bounded
  hand-written command, central registry metadata, and drift coverage.

Do not close a parity gap by adding product branches to generic runtime code.
Prefer an API/schema fix, a Forge annotation, or a shared primitive with a real
second consumer.

## Where to Edit

| Task                        | Location                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Fix a generated command     | Overlay in `@cloudflare/forge` → regenerate                                                                           |
| Hand-written root command   | `src/commands/{auth,build,cli,completions,dev,deploy,init}/`, `schema.ts`, or `tools.ts`                              |
| Generated-tree exception    | `src/commands/{access,ai,registrar,d1,previews,tunnels,workers}/` plus the central registry and generator integration |
| Hand-written registry/meta  | `src/commands/hand-written.ts`, per-command `meta.json`, `generator/hand-written-overrides.ts`                        |
| Auth / token / OAuth        | `src/lib/auth.ts`, `src/lib/oauth/`                                                                                   |
| Runtime value resolution    | `src/lib/context.ts`, `src/lib/resolve.ts`, `src/lib/project-settings.ts`                                             |
| Global CLI state            | `src/lib/state.ts`                                                                                                    |
| Local request routing       | `src/lib/local.ts`, `src/lib/local-runtime.ts`, `src/lib/registry.ts`                                                 |
| Build/deploy conversion     | `src/lib/{build-output,deploy-context,deploy-input}.ts`                                                               |
| Help labels and flag groups | yargs configuration in `src/index.ts` (no custom renderer)                                                            |
| Generator output shape      | `generator/index.ts`, `generator/generator.ts`                                                                        |
| Metadata JSON shape         | `generator/metadata.ts` and `generator/index.ts`                                                                      |
| Shell completions           | `src/commands/completions/index.ts` (`@bomb.sh/tab`, backed by complete `commands.json` metadata)                     |

## Build

```bash
pnpm generate          # pinned public OpenAPI → matching SDK + commands
pnpm build             # generate, then Vite+ Pack build
pnpm --filter cf dev   # tsx src/dev.ts (no generate, no bundle)
pnpm --filter cf check:type
pnpm --filter cf test
```

Those commands are shown from the repository root. Package scripts invoke
Vite+ tasks declared in `vite.config.ts`. Build, type-check, and test tasks
depend on generation, including when invoked from this package directory.
Build and type-check tasks also build workspace dependencies first. `pnpm dev`
starts the source entry without generation or bundling. Task caching is disabled.

`pnpm generate` downloads the pinned Forge `openapi.forge.json` release asset,
uses the committed matching SDK when its entrypoint exists and recorded
revision is current, and regenerates the SDK when the entrypoint is missing,
the pin changes, or a local bundle override is supplied. Generation initializes
Forge from the finalized OpenAPI, then runs
`transform(transformer) → finalize(...) → vp fmt`. Finalize clears
`src/commands/_generated/`; the post-step formats the emitted TypeScript.

## Hand-Written Commands

`auth`, `complete`, `dev`, `build`, `deploy`, `migrate`, `cli`, `schema`, and `tools` are root entries in `src/commands/hand-written.ts`, registered lazily by `src/index.ts`. `cf cli telemetry` is the telemetry-settings path. `cf migrate` uses `@cloudflare/codemods` to convert a Wrangler configuration to `cloudflare.config.ts` and report manual follow-up work. `cf dev` analyzes and, when needed, configures a project before running its canonical framework command, with an installed Cloudflare implementation as fallback. `cf build` follows the same routing and validates the resulting Build Output. `cf previews deploy [preview-name]` builds with Preview context and uploads the default Worker from the resulting Preview Build Output, or the one selected with `--worker`. `cf deploy`, `cf workers versions create`, and `cf workers triggers deploy` build first unless `--prebuilt` is passed, then read Build Output and call `@cloudflare/deploy-helpers`; trigger deployment applies only the configured triggers. Deploy-helper provisioning is enabled for supported bindings.

`previews` uses a generated group containing the hand-written `previews deploy` workflow. Its parent override opts into `createIfMissing`, so generation creates an empty API parent when the pinned schema has no Preview CLI operations. Future schema operations join the same group without colliding with a hand-written root.

The registry's other entries are spliced into the generated tree via `generator/hand-written-overrides.ts`: leaf overrides for `cf ai run` and `cf registrar registrations create`; added leaves for `cf workers check`, `cf workers types`, nested `cf workers versions create`, `cf tunnels quick-start`, `cf tunnels run`, and the process-backed `cf access` workflows; and subgroups for `cf d1 migrations` and `cf workers triggers`. The cloudflared-backed Tunnel and Access leaves delegate to the cf-managed cloudflared binary alongside their generated API-backed operations. `cf workers check` profiles the default Worker emitted through Build Output, or the one selected with `--worker`. `cf workers types` is the bounded source-config exception: it validates the Worker in the nearest `cloudflare.config.ts` and writes `.cloudflare/types/index.d.ts`. Version creation remains a project-aware Build Output workflow while the raw upload operations are SDK-only. D1 migration apply targets a database identified by ID only, with `--dir` / `--pattern` / `--table` as flags rather than config; its bookkeeping is wire-compatible with `wrangler d1 migrations apply`.

## Dotenv and Child Processes

Any command that starts or delegates to another process must explicitly review
whether the child should inherit file-sourced Cloudflare credentials. The
default is that it should not. Add every resolved command name, including
aliases, to `GLOBAL_DOTENV_EXCLUSIONS` in `src/lib/dotenv.ts` when the child
does not intentionally consume those values. Commands that own dotenv loading
or do not consume Cloudflare credentials also belong in the exclusions.

If the parent needs dotenv values before spawning—for example, to call the API
or resolve the compliance region—use `withCloudflareDotEnv()` only around that
work. Its callback must finish, restoring the file values, before the child is
started. Do not suppress normal inheritance of values that were already
exported in the invoking environment.

Tests for these commands must show both sides of the boundary: file values are
available to the parent where required and sensitive file values are absent
when the child process starts. Update the exclusion tests whenever a command
or alias is added.

## Global Flags

`--zone` (`-z`), `--profile`, `--mode` (`-m`), `--quiet` (`-q`), `--help` (`-h`), `--version` (`-v`), `--local`, and `--persist-to`. `--mode` is available as `ctx.mode` when function-form exports in `cloudflare.config.ts` are evaluated. `--persist-to` is valid only with `--local`; local mode starts and disposes a Miniflare instance over cf's state without requiring a running dev server. Hand-written root commands reject `--local`, and generated endpoints without an explorer equivalent return a specific error. Every generated command gets `--dry-run` (mutating and read alike — reads show URL/method/path params without a body preview). Almost every body operation gets `--body`; explicit `--file` is limited to eligible binary, multipart, and other non-JSON upload shapes. Destructive commands get `--force` (`-f`) at runtime. API fields that would emit an exact `--mode` flag are temporarily omitted until their upstream schemas stop using the reserved name. Body fields can still be supplied through `--body`; query, path, and header fields are temporarily unavailable.

Normal structured API results are pretty-printed JSON. Null mutation results leave stdout empty and may print a TTY-only success marker on stderr. Endpoints declared as raw bytes or raw text write their payload directly to stdout, and some raw-byte commands accept `--text` to decode as UTF-8. Callers needing newline-delimited JSON can pipe structured results through `jq -c '.[]'` or similar; there is no global output-format `--format` / `--ndjson` flag, though some leaves use those words for endpoint-specific API parameters.

Account ID is resolved from the environment, the account settings in
`cloudflare.config.ts`'s default export, and workers-auth. The API token comes from
`CLOUDFLARE_API_TOKEN`; otherwise cf uses a stored, automatically refreshed
OAuth profile. There are no `--account-id` or `--api-token` flags.
Named OAuth profiles are selected by `--profile` or the nearest directory
binding, with the default profile as fallback.

### Reserved cross-cutting names and current collisions

`src/index.ts` documents the following design reservations, but they are not an enforced deny-list. Yargs scopes options to leaves, and the generated surface already contains exact `--mode` and `--remote` flags sourced from OpenAPI. Check the generated tree before claiming that a reserved name is unavailable, and avoid adding new collisions casually.

- `--remote` — force production-API routing if local ever becomes the
  default in some context.
- `--cwd` — run as if from a different working directory (matches
  wrangler's `--cwd`). Project workflows currently resolve from
  `process.cwd()`; this name is reserved for an explicit override.
- `--config` / `-c` — explicit Cloudflare config-file path.
- `--experimental-*` — opt-in gates for unreleased features; reserved
  as a namespace.
- `--json`, `--ndjson`, `--pretty` — potential output-format toggles. Normal structured results are JSON today, while raw response endpoints remain raw; these names are claimed so future formatting choices do not collide.

`--remote` currently appears on a generated Pay Per Crawl command. Exact API fields named `mode` are temporarily omitted because `--mode` is global. The remaining exact names are not root options and are normally rejected outside a leaf that defines them. See the `Reserved (future)` comment block in `src/index.ts`'s `buildCli` for the design list; the comment does not itself register or reject options.

## Runtime Value Priority (highest → lowest)

- Account: `CLOUDFLARE_ACCOUNT_ID` → project `cloudflare.config.ts` →
  workers-auth selection.
- Compliance region: `CLOUDFLARE_COMPLIANCE_REGION` → project
  `cloudflare.config.ts` → `public`.
- Zone: positional value → `--zone` → `CLOUDFLARE_ZONE_ID`.

## Generated (DO NOT EDIT)

- `src/commands/_generated/` — yargs command files + `_meta/*.json`
- `src/sdk/` — committed SDK matching the pinned Forge OpenAPI revision

Both outputs are tracked in git, owned by `pnpm generate`, and must not be hand-edited. The SDK is rewritten when its entrypoint is missing, the recorded OpenAPI revision changes, or a preview bundle is supplied. Shell-completion scripts are no longer generated — `cf complete` (backed by `@bomb.sh/tab`) reads the complete generated and hand-written command tree from `_meta/commands.json`. `_meta/hand-written-commands.json` republishes the hand-written subset with root/leaf/subgroup/override provenance.

## Formatting

Generated TS is formatted by Vite+ as the last step of `pnpm generate`
(see `generate.ts`). Historical `formatTypeScript()` calls inside forge's
transformer are removed — forge stays formatter-agnostic.

## Anti-Patterns

- **IMPORTANT: Never add JSDoc `@param` / `@returns` tags — they're
  redundant noise next to typed signatures.** Keep comments sparse and
  high-signal: explain _why_, not _what_. Don't narrate the code.
- Never add product-name branches to cross-cutting `src/index.ts` or `src/lib/`; keep the documented exceptions contained: command exceptions in their own directories and the universal zone-name resolver in `context.ts` and `resolve.ts`
- Share code only when a real second consumer has matching semantics. Keep
  cf-specific UX, generated-command runtime, and thin adapters local; do not
  extract them solely to reduce line count. Existing shared boundaries include
  workers-auth, autoconfig, build-output-utils, deploy-helpers, workers-utils,
  and containers-shared.
- Reuse `UNIVERSAL_OPTIONS`, `MUTATING_OPTIONS`, `BODY_OPTIONS`, and related Forge definitions where they own a flag. Keep generator-owned generic flags such as `--dry-run`, `--force`, and raw-output `--text` synchronized between the emitter and metadata. This is a current gap for `--force`: many generated delete handlers expose it at runtime while `commands.json` omits it, so completion/tool consumers do not yet see the full destructive-command flag surface.
- Never hard-code HTTP verbs — derive from finalized OpenAPI `opInfo.method`
- Never use `new Date()` in generated metadata — use `"build-time"` for
  deterministic output
- Never reintroduce `tsc`. Type checking uses `tsgo`.
- Never reintroduce `tsup` — Vite+ Pack emits chunked ESM that cooperates
  with `lazy-command` dynamic imports.

## Publishing

Per-PR and `main`-commit prereleases flow through [pkg-pr-new](https://pkg.pr.new) via `.github/workflows/prerelease.yml` on pull requests and pushes to `main`. Install a published PR or commit with:

```bash
pnpm i https://pkg.pr.new/cloudflare/cf/cf@<sha>
# or
pnpm i https://pkg.pr.new/cloudflare/cf/cf@<branch-name>
```

The old `scripts/publish-{alpha,,cf}.sh` scripts have been removed. Versioned
beta and stable releases use Changesets: `.github/workflows/changesets.yml`
opens or updates a Version Packages PR while changesets are pending, then
publishes to npm after that PR is merged. npm authentication uses
trusted-publishing OIDC rather than a long-lived token.

Vite+ Pack emits a minified bundle without source maps by default. The version in `package.json` is the source of truth for the public `cf` package.

`containers/ssh` is a hand-written leaf that shares SSH options, authorization requests, and transport with Wrangler through `@cloudflare/containers-shared`. Keep product wiring in the command directory and implementation changes upstream.

`containers/images/list` and `containers/images/delete` are hand-written leaves
registered with parent `containers/images`. They use the shared registry image
operations from `@cloudflare/containers-shared`; cf supplies authentication,
confirmation, and JSON output. Added leaves can target existing nested generated
groups through slash-separated parent paths. Keep their sidecars and collision
guards in sync. The image commands use the released
`@cloudflare/containers-shared@0.20.3` package.
