# Design history and planning notes

These notes preserve product rationale, distribution proposals, related follow-ups, development context, including superseded
ideas and unshipped proposals. Dates, estimates, release ambitions, and
follow-up status are not a current roadmap or promises of shipped behavior.
Check the implementation and tests for current status and remaining GA work.

Active working constraints are summarized in [AGENTS.md](../AGENTS.md);
implementation details live in [the architecture reference](architecture.md).
Read this file when investigating why a design was chosen or revisiting a
proposal.

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
- **One request path.** cf sends API requests through its thin runtime
  (`#api`). Every operation is described in
  `#operations/<resource>/…/<op>.js`, which generated and hand-written commands
  import; `lib/api-operations.ts` only has the few no generated command
  calls. Otherwise use `requestApi`. Do not add ad-hoc `fetch` calls — the
  only exception is `lib/raw-fetch.ts` for endpoints whose response shape
  doesn't fit the envelope. The explicit goal is that cf is a template for
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
    adapters ~3 MB + forge ~3 MB + **miniflare ≈185 MB** +
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
    chunked-output cooperation between Vite+ Pack and `lazy-command`
    is an asset here — only the chunks a user touches load into
    memory at runtime.

  **Why not Go or Rust** (would shrink to ~15–25 MB):
  - `@cloudflare/autoconfig` is TypeScript and tightly coupled
    to npm tooling. Porting to Go/Rust is a significant rewrite
    of an already-shipped package; the alternative (run
    autoconfig as a Node subprocess) reintroduces a Node bundle
    and erases the size win.
  - Forge and cf's generator are TypeScript. Code generation
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
  - Keeping API consumption behind `#api` (so a Rust client could swap in).
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

## Follow-ups recorded during development

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
