# cf

## 1.0.0-beta.10

### Minor Changes

- 5725210: Update the generated command surface and vendored Forge packages for
  Forge OpenAPI release `10cdded1d9e93c9b055e27cac83b397b2bd7f0c6`.

## 1.0.0-beta.9

### Minor Changes

- b26d943: Update the generated command surface and vendored Forge packages for
  Forge OpenAPI release `4322e43f4f29a33c7cc9be83ead916d6bc17fa73`.

## 1.0.0-beta.8

### Patch Changes

- 8782301: Update Workers authentication to the latest release

  Use `@cloudflare/workers-auth` 0.11.0 for cf's bundled authentication flows.

## 1.0.0-beta.7

### Patch Changes

- 146c3c1: Preserve existing Worker secrets during `cf deploy`

  Update `@cloudflare/deploy-helpers` to inherit secret bindings from the previous Worker version, including secrets that are not declared in `cloudflare.config.ts`. This prevents a redeploy from removing secrets added through the API or CLI. Align the other workers-sdk packages used by cf with their current releases.

## 1.0.0-beta.6

### Patch Changes

- 3d4dbc1: Reject local mode for Worker version uploads and trigger deployments

  Fail `cf workers versions create --local` and `cf workers triggers deploy --local` before building or making deployment API requests, including with `--prebuilt` or `--dry-run`. These commands only support remote deployment; their help now explains this restriction instead of advertising local simulation options.

- 57dc71d: Fix `cf registrar registrations check` so positional domains are sent in the request body.

  Allow several domains as separate positional arguments, including in the registrar sandbox command, and show the same body in `--dry-run` output.

## 1.0.0-beta.5

### Patch Changes

- adf3373: Update autoconfig and codemods for setup and migration fixes

  Use the autoconfig release that generates `cf workers types` for cf projects. Use the codemods release that reports Vite source map and asset migration guidance accurately.

## 1.0.0-beta.4

### Minor Changes

- 7da026f: Offer to migrate Wrangler projects before running autoconfig

  When `cf dev`, `cf build`, or the build phase of `cf deploy` finds a Wrangler
  JSON, JSONC, or TOML configuration in a project that is not yet configured for
  cf, it now offers to run the existing `cf migrate` flow. Accepting the prompt
  migrates the project and continues the requested command; declining preserves
  the existing autoconfig behavior. Non-interactive runs do not migrate
  automatically.

- 900c9ac: Expose `cf workers secrets update` and `cf workers secrets bulk`.

### Patch Changes

- 0d3e88b: Allow prebuilt Build Output with a recorded mode to deploy without `--mode`

  Validate the recorded build mode when a command explicitly requests a mode. This lets `cf deploy --prebuilt` use output from Vite and other builders that record their default mode without requiring the user to repeat it. Use the account ID and compliance region recorded in Build Output without reevaluating source config. When the output omits an account ID, use environment or profile account selection in the built region.

- 8797f9a: Run Vite development and build commands for Next.js projects that have vinext installed.

## 1.0.0-beta.3

### Minor Changes

- 804b62d: Nest CLI telemetry settings under cf cli

  Move telemetry settings from `cf telemetry` to `cf cli telemetry`.

- f3934b9: Choose the `cf migrate` bundler from the project

  `cf migrate` now uses the Vite bundler only when `@cloudflare/vite-plugin` is declared next to the Wrangler configuration, and uses the Wrangler bundler otherwise. Previously, every project defaulted to Vite, so migrations of non-Vite Workers reported Vite-only follow-ups even though `cf build` would continue to use Wrangler. Pass `--bundler vite` or `--bundler wrangler` to choose explicitly.

- b4112c2: Allow `cf` commands to use these variables from `.env` files:
  - `CLOUDFLARE_ACCESS_CLIENT_ID`
  - `CLOUDFLARE_ACCESS_CLIENT_SECRET`
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_COMPLIANCE_REGION`
  - `CLOUDFLARE_ZONE_ID`
  - `WRANGLER_API_ENVIRONMENT` (legacy)

  The allowlist is intentional: other variables, such as
  `CLOUDFLARE_API_BASE_URL`, are not loaded from project files. Files are merged
  from lowest to highest precedence: `.env`, `.env.local`, then, when `--mode` is
  set, `.env.<mode>` and `.env.<mode>.local`. Values already present in the
  process environment override every file.

  File values are applied only while the relevant part of `cf` is running and
  are removed afterward. Mixed commands such as `deploy` run their delegated
  build before loading the values, then make their API calls with the values
  available. When a cloudflared-backed command needs file values, it makes them
  available only while `cf` resolves configuration or makes API calls, then
  restores them before starting cloudflared.

- ef96427: Add `cf pages deploy` with Pages deployment guidance

  Direct existing legacy Pages projects to `wrangler pages deploy` when a Wrangler
  Pages cache exists. Direct new projects to `cf deploy` for Pages on Workers
  without attempting a deployment.

- 804b62d: Record CLI search queries and pseudonymous agent session keys in usage telemetry,
  with coverage for hand-written Access and Tunnel commands and completion setup.
- 3a0d8a2: Use the Vite plugin v2 beta for delegated Worker development and builds

  Require the Vite plugin v2 beta delegate and recommend installing it through
  the `beta` npm tag. Projects using delegated Vite commands must upgrade because
  Vite plugin v1 is no longer accepted as a local runtime implementation.

### Patch Changes

- 804b62d: Honor DO_NOT_TRACK=1 as an opt-out for cf telemetry.
- 8d04f8f: Only list delegated environment overrides when `DEBUG` is set

  `cf dev` and `cf build` still announce the framework command they delegate to,
  but the registry and build-output environment variables passed to it are now
  printed only when `DEBUG` is set.

## 1.0.0-beta.2

### Minor Changes

- c91850c: Add `cf access curl`

  Make authenticated curl requests to Access applications while preserving curl
  arguments after `--` and cloudflared's optional unauthenticated fallback.
  The fallback accepts cloudflared's `--allow-request` and `-ar` spellings.

- bc5a76d: Add `cf access login`

  Authenticate with an Access application through the managed cloudflared binary.
  FedRAMP projects use the corresponding Access flow automatically.

- b893188: Add `cf access ssh-config`

  Print cloudflared-backed SSH configuration, including short-lived certificate
  configuration when requested.
  The generated configuration invokes `cloudflared access ssh-gen` for
  certificate renewal.

- 8b37b80: Add `cf access ssh-gen`

  Generate a short-lived Access SSH certificate through the managed cloudflared
  binary.
  FedRAMP projects use the corresponding certificate flow automatically.

- 2d22c8e: Add `cf access tcp`

  Proxy TCP, SSH, RDP, and SMB connections through Access. Service-token secrets
  are passed to cloudflared through its environment rather than its arguments.

- 8de820c: Add `cf access token`

  Print the cached JWT for an Access application through the managed cloudflared
  binary.
  The application URL follows cloudflared's positional command contract.

- dce3a84: Add `cf migrate` for Wrangler projects

  Convert a Wrangler JSON, JSONC, or TOML configuration to `cloudflare.config.ts` using `@cloudflare/codemods`. The command supports Vite and Wrangler bundlers, dry runs, clean-worktree protection, and reports any manual follow-up work left by the migration. Pass `--no-install` to skip installing `cf` in the migrated project.

- 510cd7f: Add `cf init` for creating and setting up projects

  `cf init [directory]` creates a hello-world Worker in a new or empty directory (a `.git` directory is allowed) using the `@cloudflare/vite-plugin` v2 beta, then installs dependencies with the package manager you pick. After installing, it generates `.cloudflare/types/index.d.ts` with the same generator as `cf workers types`; with `--no-install`, `cf dev` or the new project's `typecheck` script (`cf workers types && tsc`) generates them later. Directories that already contain files are configured with autoconfig instead. If you leave out the directory, cf asks which one to use, and it shows the target before making changes. When it finishes, cf lists the next steps, starting with `cf dev`. `cf init workers [directory]` is the default initializer and currently behaves the same way, leaving room for other product initializers.

  ```sh
  cf init my-worker
  ```

- 1d49813: Add local command discovery with `cf cli search`

  Search the complete CLI command catalogue, including hidden commands, and return five ranked JSON matches with short summaries. Show agent-specific discovery guidance before help output when an agent is detected. API command help now points to `cf schema` for the exact request details.

- 0aa8371: Add `cf tunnels diag`

  Collect logs, metrics, system information, and network diagnostics from a local
  cloudflared instance.
  Target a specific metrics endpoint, container, or Kubernetes pod and omit
  individual diagnostic sections when needed.

- 2568df0: Add `cf tunnels login`

  Authorize cloudflared in the browser and download the origin certificate
  required for locally managed tunnels. FedRAMP projects use cloudflared's
  FedRAMP login endpoint automatically.

- 227ac5f: Add `cf tunnels ready`

  Check the readiness endpoint of a local cloudflared instance. The `--metrics`
  address is required.

- b2a8f73: Add `cf tunnels tail`

  Stream structured logs from remote cloudflared connectors, with filters for
  connectors, events, levels, and sampling.
  Management tokens can be supplied through `TUNNEL_MANAGEMENT_TOKEN` so they do
  not appear in the long-lived cf process arguments.

### Patch Changes

- d41736b: Improve terminal colour contrast on light and dark backgrounds.

  Route terminal styling through a semantic palette designed to remain legible on both light and dark backgrounds.

- 095aab5: Summarize long OAuth scope lists after login

  Show the full OAuth scope list when five or fewer scopes were selected. For
  larger selections, show the scope count and direct users to `cf auth whoami`
  for the complete list.

## 1.0.0-beta.1

### Minor Changes

- 318864a: Add `--worker` to Build Output deploy workflows

  `cf deploy`, `cf previews deploy`, `cf workers versions create`, `cf workers triggers deploy`, and `cf workers check` now accept `--worker <name>` to use a named Worker from the Build Output instead of the default Worker. The name matches the Worker's configured name. An unknown name fails before any API request and lists the available Workers.

- 48ea34c: Update the generated command surface and vendored Forge packages for
  Forge OpenAPI release `9ce6bb8d58de35e7efd8bedc4b398b69fc1a8025`.

## 1.0.0-beta.0

### Major Changes

- bb11d12: Release the cf 1.0 beta

  Begin the public beta series for cf 1.0. Changesets will publish this release
  and subsequent prereleases under the `beta` npm dist-tag.

## 0.15.0

### Minor Changes

- 015751c: Show available npm updates in the interactive version banner and refresh the
  cached latest version once a day in a detached background process.
- 8786c88: Add a `cloudflare` bin alias

  Installing `cf` now also provides a `cloudflare` command that runs the same
  CLI as `cf`. Local-install delegation still resolves the `cf` bin entry.

- 0957f83: Name renamed API inputs from their Fern names

  Generated flags and positionals for renamed inputs take their names from `x-fern-parameter-name` on path, query, and header parameters and from `x-fern-property-name` on request-body properties at any depth. Path parameters honour these renames, and the request URL, SDK call, and `--dry-run` preview read the renamed argument.

  Flags that change with this release: `mesh nodes` commands take `--node-id`, `ai-search` namespace-scoped commands take `--namespace` and `--instance-id`, `ai-search tokens get|update|delete` take `--token-id`, `ai-search move` takes `--source-namespace`, `workflows instances create` takes `--instance-retention-success` and `--instance-retention-error`, `hyperdrive create` takes `--integration-integration`, and `cloudforce-one threat-events create` takes `--account-id-body`.

- 10594b9: Move Quick Tunnel and named Tunnel run commands under `cf tunnels`.

  Use `cf tunnels quick-start <url>` instead of `cf tunnel quick-start <url>`,
  and `cf tunnels run [tunnel]` instead of `cf tunnel run [tunnel]`.

- e62b730: Support Containers in Worker Preview deployments

  Deploy Container applications declared in Preview Build Output alongside their Worker, including locally built images. Preserve local images so a Preview can be redeployed from the same Build Output.

- 1fe5dbd: Remove `cf agent-context` and the generated `agent-context.json` catalogue.

  Use `cf schema` for request and response schemas, `cf tools` for MCP tool
  definitions, or `--help` for command usage.

- c6f7502: Update the generated command surface and vendored Forge packages for
  Forge OpenAPI release `089e233b40b224ada94b473a441384b1331cee75`.

### Patch Changes

- 478ed10: Command listings and shell completions show concise OpenAPI operation summaries. Leaf command help and MCP tool definitions show the full operation descriptions.
- 015751c: Skip update checks when shell completion follows a global option value.

  Recognise the completion command without mistaking a value such as a profile named `complete` for the command.

- 12433b0: Add `cf login` as a compatibility alias for `cf auth login`

  Users familiar with `wrangler login` can keep using the same command shape. cf
  runs the standard `cf auth login` flow and notes that authentication commands
  are under `cf auth`.

## 0.14.0

### Minor Changes

- 7a74e9d: Replace third-party coding-agent detection with first-party contract detection
  and record the detected harness identifier on command telemetry.
- 8143f34: Add `cf previews deploy` for Worker Preview deployments.
- d87bfcd: Add temporary Quick Tunnels with `cf tunnel quick-start`

  Expose a local service through a randomly assigned `trycloudflare.com` URL
  without requiring a Cloudflare account. cf downloads and manages the required
  cloudflared binary and stops it when cf exits.

  ```sh
  cf tunnel quick-start http://localhost:3000
  ```

- 6e56dd4: Add `cf tunnel run` for starting named Cloudflare Tunnels with the cf-managed
  cloudflared binary. The command can fetch a run token with the current cf
  authentication or accept an explicit token, matching Wrangler's command
  surface.
- dd5b6c1: Update the generated command surface and vendored Forge packages for
  Forge OpenAPI release `340185328910f351dff68f3c3296228af5f353a0`.
- 8811b4e: Add `cf workers types`

  Generate `.cloudflare/types/index.d.ts` from the Worker defined in
  `cloudflare.config.ts`, including compatibility-date-specific runtime types by
  default. Pass `--include-runtime=false` to generate config-inferred types only.

### Patch Changes

- 2f9a350: Make deploy dry runs send no API requests

  `cf deploy --dry-run`, `cf workers versions create --dry-run`, and
  `cf workers triggers deploy --dry-run` no longer resolve credentials or an
  account. Previously `cf deploy --dry-run` still looked up the Worker's latest
  deployment with an empty token, which the API rejected with error 9106.

- e199b4f: Make `@cloudflare/config` and `@cloudflare/build-output-utils` runtime dependencies
- 8143f34: Require commands that consume prebuilt Build Output to pass the same `--mode` recorded when the artifact was built. This applies to `cf deploy`, `cf previews deploy`, `cf workers versions create`, `cf workers triggers deploy`, and `cf workers check` when using `--prebuilt`.
- 4a3c775: Validate Build Output mode before deploying

  Deploy commands now verify that Build Output was produced with the mode requested by `--mode`. This prevents an existing or newly built artifact for one deployment target from being uploaded to another target accidentally.

## 0.13.0

### Minor Changes

- 3790a55: Regenerate the CLI from Forge OpenAPI revision `29a99767`

  Update the generated SDK and command surface to the 2026-09-22 public API
  specification. This refresh adds newly published operations, removes operations
  that are no longer surfaced, and incorporates updated request and response
  schemas.

- 7d6fd80: Add opt-out anonymous usage telemetry.

  cf now collects non-user-identifying command usage, sanitized flags, duration,
  error type, and environment metadata to help prioritize fixes and improvements.
  Positional values, account and zone identifiers, request bodies, file contents,
  error messages, and credentials are never collected. Telemetry can be disabled
  with `cf telemetry disable` or `CF_SEND_TELEMETRY=false`.

- 76ea082: Regenerate the CLI from Forge OpenAPI revision `d92075c0`

  Update the generated SDK and command surface to the 2026-09-23 public API
  specification. This refresh adds Managed Defense vulnerability discovery,
  moves Calls and MOQ operations under Realtime, restores Spectrum analytics,
  and incorporates updated request and response schemas.

## 0.12.0

### Minor Changes

- 5aa6d11: Add Container build, push, and deploy workflows
  - `cf containers build <path> --tag <name:tag> [--push]`
  - `cf containers push --tag <name:tag>`
  - `cf deploy [--containers-rollout immediate|gradual|none]`
  - `cf workers versions create`

  `cf containers build` builds an image from a Dockerfile and can upload it to
  Cloudflare's managed registry with `--push`. Use `--path-to-docker` to select a
  Docker binary. Builds without `--push` do not require Cloudflare credentials.

  `cf containers push` uploads an existing local image to Cloudflare's managed
  registry.

  `cf deploy` now consumes standard and Durable Object-managed Container
  configuration and images from Workers Build Output. It uploads local images and
  applies supported application settings for Containers referenced by the Worker.
  Use `--containers-rollout` to select an immediate or gradual rollout, or `none`
  to leave deployed Containers unchanged.

  `cf workers versions create` records Container metadata and prepares referenced
  and local images for Durable Object-managed Containers. It does not apply
  Container applications.

- 5a8e8cd: Add `cf containers images list` and `cf containers images delete`

  List managed registry images and delete an image tag with `cf containers images delete <image:tag>`.

- 5c028ca: Add `cf containers ssh`

  Connect to a running Container with `cf containers ssh <id>`.

- e1f443e: Support the current Cloudflare config and Build Output Specification

  Load project account and compliance settings from the `defineConfig()` default
  export. Update `cf build`, `cf deploy`, `cf workers versions create`, `cf
workers check`, and `cf workers triggers deploy` to consume the latest Build
  Output v0 resource files. Delegated build and dev commands now require
  `@cloudflare/vite-plugin` 1.57.0 or newer, or Wrangler 4.136.0 or newer.

- b132b1b: Forward modes to detected framework commands

  `cf build --mode <mode>` and `cf dev --mode <mode>` now forward the selected
  mode when the detected framework command supports it. Unsupported modes fail
  before invoking an incompatible command.

## 0.11.0

### Minor Changes

- 55ec2b8: Improve domain registration safety and extension-specific input

  Check authoritative availability and pricing before collecting registration
  input, then show a detailed billable review and require explicit confirmation
  before submission. Recheck availability after interactive input so the quoted
  price and registration status are current.

  Load extension-specific schemas at runtime to validate registration fields,
  accept reusable contacts from inline JSON or an `@file`, and return structured
  missing fields from partial dry runs. Agents can use those labelled choices and
  acknowledgements to complete the body before checking availability and asking
  for approval to register.

- a84b2ea: Suggest close visible command names when users mistype top-level or nested commands. Hidden commands remain excluded, while unrelated input and existing help behavior remain unchanged.
- a30239f: Register `--mode` as a global flag

  Use the selected mode when evaluating function-form exports from
  `cloudflare.config.ts`, while continuing to forward it to project development
  and build implementations. API fields that would collide with the global flag
  are temporarily omitted from generated and runtime-schema flags. Body fields
  remain available through `--body`; query, path, and header fields are
  temporarily unavailable until the upstream schemas stop using the reserved
  name.

- 44d5123: Move Worker version and trigger commands under `cf workers`

  **Breaking:** Rename `cf versions upload` to `cf workers versions create` and
  `cf triggers deploy` to `cf workers triggers deploy`; the old root command
  paths are no longer available. `cf workers versions create` now uses cf's
  Build Output workflow: it builds the project unless `--prebuilt` is passed,
  then uploads a Worker Version without deploying it. Scripts that used the
  former generated `cf workers versions create` request-body flags must migrate
  to Build Output and the command's build and upload options.

- 528c84e: Support JSON-valued flags for arrays of objects in API request bodies. For
  example, `cf workers deployments create --versions '[{"version_id":"v1","percentage":100}]'`
  now builds the corresponding `versions` array without requiring `--body`.
- 3c95154: Add `--prebuilt` support to `cf workers triggers deploy`

  Skip the project build and apply triggers from existing Build Output when the
  flag is passed.

- 85a1187: Add `cf workers check` startup profiling

  Profile a Worker's local module-evaluation startup and write a Chrome DevTools CPU profile. The command builds through cf's standard Build Output flow by default, or consumes existing output with `--prebuilt`.

- fd3a6c8: Use OAuth device authorization by default

  `cf auth login` and `cf auth create` now use the OAuth 2.0 Device
  Authorization Grant, so authentication works in containers, Codespaces, remote
  VMs, and SSH sessions without exposing a localhost callback. Pass `--no-device`
  to use the previous localhost callback flow. First-use account resolution also
  uses device authorization, and explicit `--scopes` now accepts the full scope
  catalog registered for cf's production OAuth app without changing the default
  permissions.

### Patch Changes

- 44d5123: Skip API token resolution for upload dry runs

  `cf deploy --dry-run` and `cf workers versions create --dry-run` now validate
  Build Output and preview the upload without loading an API token. Account
  resolution is still required, but users with an account configured can run
  these checks without logging in.

- 8be2717: Format delegated environment overrides as a readable list

  `cf dev` and `cf build` now display environment overrides on separate indented lines, with count-aware labels for easier scanning.

- 143c126: Filter generated commands by `x-fern-audiences`, excluding operations that do
  not target `cf-cli` when audiences are explicitly declared.
- 44d5123: Publish complete metadata for hand-written commands

  Include hand-written command paths and options in `_meta/commands.json`, so
  shell completions, MCP tool definitions, and agent context cover the complete
  CLI surface. Also publish `_meta/hand-written-commands.json` with command
  provenance and override details for documentation and tooling consumers.

- 566bf7e: Update `@cloudflare/autoconfig` to 0.4.5 and `@cloudflare/config` to 0.12.0.

## 0.10.0

### Minor Changes

- 54160ed: Regenerate the CLI from Forge OpenAPI revision `cb229d4a`

  Update the generated SDK and command surface to the 2026-09-08 public API
  specification. This refresh adds newly published operations, removes operations
  that are no longer surfaced, and incorporates updated request and response
  schemas.

- 5322bc8: Add OSC 9;4 terminal progress support

  Supported terminals can now show indeterminate `cf` progress outside the terminal buffer, such as in the tab title area or OS taskbar. Set `CF_NO_OSC_PROGRESS=1` to disable this globally, or `CF_FORCE_OSC_PROGRESS=1` to enable it for an unrecognized compatible terminal.

### Patch Changes

- 3e65350: Use the available terminal width when rendering help

  Previously, yargs limited help output to 80 columns even in wider terminals,
  causing command descriptions to wrap unnecessarily. Help output now uses the
  detected terminal width while retaining the 80-column fallback when no width is
  available.

## 0.9.1

### Patch Changes

- 9046bf3: Fix `cf auth login` OAuth scope validation.

## 0.9.0

### Minor Changes

- d1ccf04: Make `cf registrar registrations create` aware of per-TLD requirements

  Registration requirements differ per extension — `.travel` requires a
  "travel industry" acknowledgement, `.uk` requires a registrant type — and those
  rules live in the extension's registration schema, not in the OpenAPI spec,
  where `acknowledgements` and `contract_extensions` are untyped objects and the
  registrant address is missing entirely. The generated command's static fields
  could not express extension-specific registration requirements.

  The command now fetches the extension's schema
  (`GET /registrar/extensions/{name}`) and drives itself from it:
  - The domain is a positional: `cf registrar registrations create example.travel`.
    Its extension is derived from the name (longest suffix first, so `co.uk` beats
    `uk`), or set explicitly with `--extension`.
  - `cf registrar registrations create <domain> --help` lists the fields **that
    extension** requires, nested ones included
    (`--contacts-registrant-postal-info-name`). Without a domain, `--help` makes
    no network request.
  - Required fields you didn't pass are prompted for interactively, including
    registry acknowledgements; non-interactive runs get one clear
    `--<flag> is required` error instead.
  - Input is validated against the schema — required fields, enums, `const`
    acknowledgements, string patterns, and numeric bounds — before anything is
    sent.
  - `--body '<json>'` still takes a complete payload and skips the schema lookup;
    its `domain_name` can supply the positional domain, and conflicting input is
    rejected before confirmation.

  **Registration is now confirmation-gated.** It charges the account's default
  payment method and cannot be refunded, so it prompts before registering; pass
  `--force` in scripts. A non-interactive run without `--force` aborts without
  registering.

- 9a2c982: Add autoconfig routing to `cf dev`, `cf build`, `cf deploy`, and `cf versions upload`

  `cf dev` and `cf build` now detect and configure supported projects before running their canonical framework command or an installed Cloudflare implementation. Before uploading, `cf deploy` and `cf versions upload` follow the same build behavior as `cf build`. Pass `--prebuilt` to upload existing build output without building.

- 5018dec: Regenerate the CLI from Forge OpenAPI revision `730ac0e5`

  Update the generated SDK and command surface to the 2026-09-01 public API
  specification. This refresh adds newly published operations, removes deprecated
  operations that are no longer surfaced, and incorporates updated request and
  response schemas.

- c259f23: Spawn Miniflare for `--local` instead of requiring a running dev session

  `cf <command> --local` now starts Miniflare over cf's persisted state and
  disposes it after the command, so no dev server needs to be running.
  `--local-endpoint` is replaced by Wrangler-compatible `--persist-to <dir>`.
  Unsupported explorer routes tell users to retry without `--local`, and shared
  storage avoids concurrent writers to the same state tree.

- 318f1f3: Export Cloudflare configuration helpers from `cf/config`

  `cf/config` now provides the complete typed configuration-authoring API used by `cloudflare.config.ts`.

- 0885f02: Support partial Build Output Worker manifests

  Update the experimental Build Output dependencies so Worker manifests declare
  whether their module inventory is complete. Partial manifests now discover
  JavaScript modules and source maps before `cf` assembles the deployment bundle.

- d1ccf04: Flatten nested runtime-schema objects into per-field flags

  Commands backed by runtime JSON schemas now expose nested object properties as
  kebab-joined flags. For example, `cf ai run` accepts
  `--web-search-options-user-location-city London` and assembles the corresponding
  nested request body, matching flags generated from documented API schemas.

  This replaces the single JSON flag previously emitted for an introspectable
  nested object. Use the new child flags, or `--body` when passing the complete
  object as JSON.

- 432d3de: Add `cf d1 migrations` for D1 database migrations

  Closes the gap that kept migrated repos on a `wrangler.jsonc` and a `wrangler`
  devDependency for one job. Three subcommands:
  - `cf d1 migrations apply <database>` — apply every unapplied migration
  - `cf d1 migrations list <database>` — report unapplied migrations as JSON
  - `cf d1 migrations create <message>` — scaffold a numbered migration file

  The database is identified by **ID only**, used verbatim in API requests; names
  and binding names are not accepted. `--dir` (default `./migrations`), `--pattern`
  (default `<dir>/*.sql`) and `--table` (default `d1_migrations`) are flags rather
  than Worker config, so the command does not read Worker definitions. `apply` and
  `list` still use normal account resolution, including the project `settings`
  export. `cf d1 migrations create` needs no credentials and makes no network
  calls.

  Bookkeeping is wire-compatible with `wrangler d1 migrations apply` — same
  `d1_migrations` table shape, same `<dir>`-relative recorded names, same numeric
  ordering — so a project can switch between the two without replaying or
  mis-ordering migrations. Pass `--dir <dir> --pattern "<dir>/*/migration.sql"`
  for Drizzle's nested layout. The optional `--table` flag only changes the name
  of the Wrangler-compatible bookkeeping table.

  The persisted bookkeeping contract matches Wrangler. cf deliberately takes
  flags instead of Wrangler config, requires a database ID, and renders results as
  JSON.

  `--local` applies and lists migrations against Miniflare's persisted D1 state,
  with Wrangler-compatible `--persist-to` support and no Cloudflare credentials.

### Patch Changes

- fec31d6: Support the Build Output Specification settings config that records the build mode.
- 057a1c1: Unwrap paginated command output so JSON contains the result array instead of the SDK response envelope.
- a48370b: Allow delegated development tools to use cf authentication

  cf now identifies itself to delegated development tools so integrations can select cf's authentication profiles instead of Wrangler's. The bundled workers-auth package is also updated to the current compatible version.

- 6f0eb22: Support Build Output trees containing multiple named Workers while continuing to deploy the default Worker.
- d1ccf04: Send unconstrained schema fields as JSON instead of text

  Commands driven by a runtime schema (`cf ai run`, `cf registrar registrations
create`) type a field the schema says nothing about — `{}`, as Workers AI
  declares `response_format.json_schema` — as a string. `--response-format-json-schema
'{"type":"object"}'` therefore arrived at the API as that literal text rather
  than as an object.

  Such a field now takes a JSON value, falling back to the literal text when the
  value isn't JSON, so a field that constrains nothing still accepts anything.

- d1ccf04: Resolve the account for schema-backed `--help` without signing in again

  `cf ai run <model> --help` and `cf registrar registrations create <domain>
--help` fetch a schema, so they need an account ID, and they resolved one from
  the environment and `cloudflare.config.ts` only. A signed-in user with neither
  set was told to `cf auth login` — while every other command worked, because
  those consult the account cache and auto-select a sole account.

  Both `--help` screens now do the same: the profile's cached account, then the
  one account the credentials can see. Several accounts with none chosen still
  prints the fallback rather than interrupting `--help` with a picker.

  When the account resolves but the API turns the request down, the reason now
  says what to do about it: update `CLOUDFLARE_API_TOKEN` or run `cf auth login`
  for rejected credentials, and check token permissions for one missing scope.

## 0.8.0

### Minor Changes

- 4cbe28e: Add `cf deploy --dispatch-namespace`

  Users can now deploy Workers for Platforms user Workers to a dispatch namespace with `cf deploy`.

- 4cbe28e: Add `cf deploy --secrets-file`

  Users can now upload secrets from a JSON or dotenv file when deploying a Worker.

- 7f55891: Add `cf triggers deploy` for deploying Worker trigger configuration after a versions upload.
- 661a07a: Give `cf ai run` per-model input flags

  `/ai/run/{model_name}` accepts a different request body for every model, so the
  generated command could only ever offer the union of a few models' fields
  (`--text`, `--prompt`, `--guidance`, …) — accurate for none of them. `cf ai run`
  is now hand-written and reads the chosen model's input schema from
  `/ai/models/schema` at run time:
  - `cf ai run <model> --help` lists **that model's** fields, with types, defaults
    and enum choices. `cf ai run --help` on its own makes no network request.
  - Input is validated against the model's schema before the request goes out, so
    a mistyped or missing field fails with the field's own name instead of an
    opaque API error. Array and object fields take one JSON value.
  - `--body '<json>'` (or `--body @payload.json`) still takes a raw payload, and is
    the fallback when the schema can't be fetched — offline, unauthenticated, or a
    model this account can't access.
  - Binary model responses, including generated audio and images, are written to
    stdout byte-for-byte so they can be redirected to a file.

  **Breaking:** the old flag union is gone. Fields that models genuinely accept
  (`--prompt`, `--max-tokens`, …) still work, now validated per model; flags that
  no longer apply to the chosen model are rejected rather than silently sent.

### Patch Changes

- 4cbe28e: Upload sourcemaps from Build Output manifests

  `cf deploy` now uploads sourcemaps whenever they are included in the Build Output manifest.

## 0.7.0

### Minor Changes

- 4a08aaf: Remove legacy context commands and configuration

  `cf context`, `.cfrc`, and `~/.config/.cf/config.json` are no longer supported. Configure account and compliance-region defaults through the named `settings` export in `cloudflare.config.ts`; provide zones with `--zone` or `CLOUDFLARE_ZONE_ID`. The one-time shell-completion tip is preserved in cf's canonical global state directory.

- 57ed8a2: Resolve project account and compliance-region defaults from `cloudflare.config.ts`

  Account and compliance-region selection now check the named `settings` export after their environment variables. API requests no longer resolve `accountId` or `complianceRegion` from `.cfrc` or cf's global user defaults.

### Patch Changes

- c540388: Include authorised accounts in `cf auth whoami` output

  The command now returns an `accounts` array containing the ID and name of
  each account available to the active credentials. Account discovery is
  paginated and permission-aware, and failures do not hide other authentication
  details.

- 9f77694: Ignore hidden API operations that do not declare a successful response during generation.

## 0.6.0

### Minor Changes

- 0b8f7d2: Read the Build Output Specification via `@cloudflare/build-output-utils`

  `cf build` and `cf deploy` now read the build output through the shared
  `@cloudflare/build-output-utils` package instead of a hand-rolled reader.
  This adopts the current spec shape: `readBuildOutput()` returns a
  `workers` array (currently always the single `default` Worker at
  `.cloudflare/output/v0/workers/default/`), whose config is named
  `config.json` (previously `worker.config.json`), plus an optional
  top-level `config.json` holding shared settings. cf consumes the one
  `default` Worker (`workers[0]`).

  This is an experimental feature; build tools emitting the older
  `worker.config.json` layout must update to the `default`-Worker
  `config.json` shape.

### Patch Changes

- 494ff9d: Reuse workers-auth for account selection

  Account resolution continues to honor `CLOUDFLARE_ACCOUNT_ID`, `.cfrc`, and account defaults stored in cf's user configuration before delegating discovery to the shared workers-auth flow. A single accessible account is selected automatically, while an interactive selection is cached so subsequent commands do not prompt again.

## 0.5.0

### Minor Changes

- 843233a: Add profile support:
  - Manage named OAuth profiles with `cf auth create`, `delete`, `activate`, `deactivate`, and `list`.
  - Select a profile for one command with `--profile`, or bind one to a directory with `cf auth activate`.
  - Credential selection follows this order: `CLOUDFLARE_API_TOKEN`, `--profile`, the nearest directory binding, then the default profile.

## 0.4.0

### Minor Changes

- 110aee6: Re-vendor forge against the 2026-07-20 public API spec

  Bumps the vendored `@cloudflare/forge` and `@cloudflare/forge-transformer-sdk-ts` tarballs to `PUBLIC_OPENAPI_REVISION` `4f820945` (the 2026-07-20 public spec) and regenerates the command surface — 119 products / 2682 commands. `autorag` is now surfaced as `ai-search`.

- b9ccd5a: Adopt the shared cf authentication layer

  Use `@cloudflare/workers-auth/cf` for OAuth identity, scopes, credential storage, refresh, and future keyring support. OAuth credentials now use the shared JSON profile layout under the Cloudflare config directory.

  `cf auth login` also gains `--browser` / `--no-browser` (print the auth URL instead of opening a browser) and `--scopes` (request a specific set of OAuth scopes).

## 0.3.0

### Minor Changes

- 4bafe9f: Generate and use the Fern SDK from the same OpenAPI bundle as the CLI commands.

### Patch Changes

- 4bafe9f: Preview the actual parsed and reconstructed request body in generated command dry runs.

## 0.2.0

### Minor Changes

- f0e27dd: Add compliance region to project context

  `cf context set compliance-region public|fedramp_high` stores the compliance
  region in `.cfrc` or user config. Also resolved from `CLOUDFLARE_COMPLIANCE_REGION`.
  When set to `fedramp_high`, API requests route to `api.fed.cloudflare.com`.

- de5f1bd: Support Durable Object exports on deploy

  Bump `@cloudflare/deploy-helpers` to `0.4.0` (and its peers `@cloudflare/workers-utils` to `0.26.0` and `@cloudflare/workers-auth` to `0.4.2`), which removes the `"Durable Object exports are not currently supported."` error and enables real Durable Object export handling during `cf deploy` and `cf versions upload`.

- 16d17fb: Add `--dry-run`, `--message` and `--tag` args to `cf deploy`
- 16d17fb: Turn on strict mode in `cf deploy`
- 16d17fb: Add `cf versions upload` command to upload a new Worker Version without deploying it

### Patch Changes

- e9deb90: Surface body `account_id` / `zone_id` fields as flags when they aren't URL path params

  The generator dropped any body field named `account_id` / `accountId` /
  `zone_id` / `zoneId` on the assumption it was the context-resolved
  path-param container. That assumption is wrong for operations that
  carry such an id in the request body rather than the URL — e.g.
  `cf r2 buckets domains custom create` (required body `zoneId`),
  `cf zones create` (body `account.id`), `cf workers domains update`, and
  `cf secrets-store system-stores create`. The skip is now path-aware:
  the field is dropped only when the operation's URL actually templates
  that container, so these commands now expose the corresponding
  `--zone-id` / `--account-id` flag.

- 2c7058b: Restore discriminator field default on oneOf bodies

  The `--type` flag on `workers secrets update` lost its `default: "secret_text"` when the conflicts-suppress-default rule was introduced, causing an unhelpful interactive prompt asking users to pick between `secret_text` and `secret_key`.

- 50c8318: Percent-encode path params in raw-URL request codepaths

  Commands that build the request URL themselves rather than calling the
  typed SDK method — the `--body` escape hatch, raw-bytes/raw-text
  responses (`fetchRawBytes`, e.g. `cf kv keys get`), multipart and
  `--file` uploads, and header-bearing ops — previously embedded path
  params into the URL un-encoded. A subject id containing a
  URL-significant character (e.g. a KV key `foo/bar`) split into extra
  path segments and hit the wrong resource. These params are now
  `encodeURIComponent`-encoded to match the typed SDK's behaviour, and
  `--dry-run` previews the same encoded URL.

- e9deb90: Make the group-implies `.check()` discriminator-aware for `oneOf` bodies

  A nested `oneOf` body object (e.g. pipelines `sinks create`'s `config`,
  which is R2-credentials vs `r2_data_catalog`) surfaces a single flattened
  set of `--<parent>-*` leaves spanning every variant, and forge marks
  each variant's required leaves with `required: true`. The generated
  group-implies `.check()` demanded **all** of them whenever any
  `--<parent>-*` flag was set, so supplying one variant's fields tripped
  the check demanding another variant's required leaves — leaving
  `--body` as the only way to reach non-first variants.

  The `.check()` is now variant-aware: a required leaf that `.conflicts()`
  with a flag the user actually set belongs to a different `oneOf`
  variant and is no longer demanded. This is derived purely from the
  existing `oneOf` conflict metadata and is a pure relaxation (it never
  rejects a previously-valid invocation). Both
  `cf pipelines sinks create --type r2 …` and `--type r2_data_catalog …`
  are now expressible via per-field `--config-*` flags; the same fix also
  unblocks `cf abuse-reports create`.

- f0e27dd: Rename `CLOUDFLARE_BASE_URL` to `CLOUDFLARE_API_BASE_URL`

  Aligns the env var name with `@cloudflare/workers-utils` and wrangler.

## 0.1.0

### Minor Changes

- f6f4c4f: Add `cf build` command

  `cf build` now discovers the project's Cloudflare implementation and delegates to its `build` verb. `cf deploy` runs the same build step before uploading unless `--prebuilt` is passed, and successful builds are validated against the Build Output Specification before deployment continues.

- 3939c4c: Replace the handrolled OAuth implementation with the shared `@cloudflare/workers-auth` package

  `cf auth login` / `logout` / `whoami` now use Cloudflare's shared OAuth engine
  (PKCE flow, callback server, token refresh) instead of cf's own implementation,
  while keeping cf's own OAuth identity (client ID and consent pages). Notable
  changes:
  - Tokens are now stored as JSONC in cf's XDG-compliant config directory (e.g.
    `~/.config/.cf/auth.jsonc`) instead of `~/.cf/config.toml`. You will need to
    run `cf auth login` once to re-authenticate.
  - `cf auth login --token <token>` has been removed. Set the
    `CLOUDFLARE_API_TOKEN` environment variable to authenticate with an API token.
  - The implicit fallback to Wrangler's stored OAuth token has been removed. Use
    `CLOUDFLARE_API_TOKEN` or `cf auth login`.

  Token resolution is now: `CLOUDFLARE_API_TOKEN` environment variable, then cf's
  stored OAuth token (refreshed if expired).

- 9205356: Delegate to a project-pinned cf install

  A globally-installed cf, run as a bare `cf` inside a project that pins its own copy, now re-execs that local copy and propagates its exit code (Wrangler 2 style), so collaborators and CI stay on the version a project pins. Explicit one-shot runs are honoured as-is and never delegate: `npx cf@<version>`, `npx <prerelease-url>`, and `pnpm dlx cf` run exactly the copy you asked for.

- d2a4762: Auto-provision bindings on `cf deploy`

  `cf deploy` now provisions missing resources (KV namespaces, D1 databases, R2
  buckets, AI Search and Agent Memory namespaces) before uploading, matching the
  autoprovisioning flow that moved into `@cloudflare/deploy-helpers`. When a
  binding lacks an ID, cf connects it to an existing resource or creates a new one
  (prompting interactively, or using a generated name in non-interactive/CI runs).

  cf never reads or writes your source Worker config, so provisioned resource IDs
  are not written back — future deploys reuse the resources via inherited
  bindings instead.

- 8f464ea: Add `cf deploy` for prebuilt Cloudflare build output

  `cf deploy` now reads a project from a prebuilt format matching the Cloudflare Build Output Specification and deploys it. The command also accepts a `--mode` flag, but it is currently parsed as a no-op for future mode-specific deployment behavior.

- 11ad38d: Drop client-side input "hardening"

  cf no longer pre-validates user input before sending it to the API:
  - **Path params / string positionals.** Generated commands previously
    ran `validateResourceId` / `validateStringInput` to reject `..`, URL
    operators (`?` `#` `%`), and control characters. These are gone.
  - **`--body` / flag-built bodies.** `parseBody` / `setNestedValue`
    previously rejected control characters at every depth, capped nesting,
    and blocked `__proto__` / `constructor` / `prototype` keys. These are
    gone too.
  - **`--dry-run` output** no longer includes the always-`"passed"`
    `validation` field.

  Rationale: cf is a client-side CLI driving the user's own credentials —
  there is no trust boundary, so "hardening" an id or body value guards
  nothing the user couldn't do by calling the API directly. Correct wire
  encoding is the SDK's job: path params are percent-encoded
  (`encodeURIComponent(...)`) and bodies are JSON-serialised (control
  bytes escape into valid JSON). The API is the authority on what a value
  may contain.

  Practical effect: values the old checks rejected (e.g. a body field
  containing `\r` or a NUL byte, an id containing `%`) now pass straight
  through to the API instead of erroring locally.

- b639242: Use a generic confirmation prompt for destructive commands without a
  forge-supplied message

  Plain DELETE commands now prompt with "This permanently deletes the
  resource. Continue?" instead of "Delete <noun> '<id>'? This cannot be
  undone." The command already names the resource, so the prompt no longer
  repeats it. Operations annotated with `x-forge-require-confirmation`
  still surface their bespoke message verbatim. This also retires the
  per-op noun derivation from the delete-confirm code path.

- eed8a30: Exit non-zero when a required positional argument is missing

  Running a leaf command without its required positional (e.g.
  `cf r2 buckets delete` with no bucket name) now fails with a usage error
  and a non-zero exit code, instead of printing the command's help and
  exiting 0. Invoking a command _group_ without a subcommand (e.g.
  `cf r2 buckets`) still shows that group's help and exits 0.

  Previously both cases produced yargs' "Not enough non-option arguments"
  message, which the top-level `.fail` handler treated as group help — so a
  genuine missing-argument mistake was silently swallowed (exit 0), a poor
  default for scripts and agents. Generated group shells now demand a
  subcommand with the distinct "Please specify a subcommand" message (the
  hand-written groups already did), letting the handler tell the two cases
  apart.

- b639242: Verb-only spinner and success labels

  Progress and success labels are now verb-only ("Creating" / "Created",
  "Deleting" / "Deleted", "Loading" / "Loaded", "Updating" / "Updated")
  rather than verb + resource noun ("Creating record"). The command the
  user just typed already names the resource, so the spinner no longer
  repeats it. Batch spinners read "Updating: batch 2/3". This retires the
  English-pluralisation heuristics (singularization, verb-segment walk-up)
  that previously derived the noun.

### Patch Changes

- 05c6d4d: Stop oneOf-variant flags from spuriously erroring with "mutually exclusive"

  Flags caught up in a forge-derived `.conflicts()` relationship no longer carry a
  yargs `default`. yargs applies defaults before it runs the conflicts check, so a
  defaulted variant flag (e.g. `cf ai run`'s image-task `guidance: 7.5`) was always
  seen as "present" and collided with its siblings — `cf ai run <model> --text foo`
  failed with "Arguments text and guidance are mutually exclusive". The API applies
  these spec defaults server-side anyway, so omitting them is correct.

  Temporary fix: this only stops the error. The broader `cf ai run` UX (per-model
  flags / discovery) is tracked separately.

- 3939c4c: Re-vendor `@cloudflare/workers-auth` and `@cloudflare/workers-utils` with injectable OAuth identity + token storage

  cf now consumes the upstream build where the OAuth flow's identity (client
  ID, consent pages, callback, storage) and the env-credential resolver are
  injectable, rather than relying on vendored-only behaviour. The global config
  directory is resolved via the new options-based
  `getGlobalConfigPath({ appName: "cf", useLegacyHomeDir: false })` instead of
  the deprecated `getGlobalWranglerConfigPath`. No user-facing behaviour change.

- a98fa88: Fix `cf deploy` asset upload failing with a 400 "Invalid Content-Type header"

  `@cloudflare/deploy-helpers` and `@cloudflare/workers-utils` pinned different
  undici versions, so the multipart `FormData` built by deploy-helpers was not
  `instanceof FormData` inside workers-utils' `fetch`. undici only serialises a
  body as `multipart/form-data` when it recognises its own `FormData` class, so
  the upload went out without the multipart boundary and the API rejected it.

  Pin a single undici version via a pnpm override so both packages share one
  module instance and the asset upload serialises correctly.

- a98fa88: Surface the real API error message when a deploy fails

  `cf deploy` errors thrown by the upload pipeline come from
  `@cloudflare/workers-utils`' `APIError` — a different class from the forge
  SDK's, whose actionable detail lives in `.notes` rather than the
  `.error.errors` envelope. `handleError` only recognised the forge SDK's
  `APIError`, so these fell through to the generic `Error` branch and printed
  only "A request to the Cloudflare API (…) failed." with no reason.

  `handleError` now renders the workers-utils `APIError` notes (plus status
  and code), turning an opaque deploy failure into an actionable one.

  Additionally, the deploy logger now implements `debugWithSanitization`, the
  channel workers-utils uses for request/response bodies. Without it, `DEBUG=1`
  showed the request/response envelope but never the body — hiding the API's
  own error text. Bodies are redacted by default (matching wrangler's
  `WRANGLER_LOG_SANITIZE`); set `WRANGLER_LOG_SANITIZE=false` to include them.

- 9fa0f66: Surface a friendly error for missing or empty `--file` arguments

  Generated commands that accept `--file <path>` (e.g. `cf vectorize
insert --file vectors.ndjson`, R2 uploads, secrets bulk import) now
  report `Cannot read invalid or empty file: <path>` when the file is
  missing, unreadable, or zero bytes — instead of leaking a raw `node:fs`
  `ENOENT` stack trace (which also exposed the resolved absolute cwd path)
  or silently POSTing an empty body that the API rejects with an opaque
  HTTP 500.

  The check lives in a single `readFileForFlag` helper in the generator's
  `--file` codepath, so it applies uniformly to every generated
  `--file`-accepting command rather than per product.

- 6ec9ca6: Fix wire spelling of dotted query parameters

  Query parameters whose API name contains a dot — e.g. `name.exact`,
  `content.contains`, `comment.present`, `tag.absent` on
  `cf dns records list`, and the equivalents on audit-logs, custom
  hostnames, firewall access rules, zones, and zero-trust device lists —
  were sent under the wrong key. The CLI emitted the flag's camelCase
  spelling (`?nameExact=…`) instead of the dotted wire name
  (`?name.exact=…`), so the API silently ignored the filter.

  The generator now keys its query-param map by the flag's camelCase (the
  same spelling `argv` exposes) rather than the wire name's camelization,
  so the lookup resolves to the correct wire key. Underscore-spelled
  params (`per_page`, `tag_match`) were already correct and are
  unaffected.

- e3d98d9: Stop advertising universal options that aren't registered on the CLI

  The generated command catalogue (`_meta/commands.json`) mirrored forge's
  `UNIVERSAL_OPTIONS` onto every command, but the yargs builder never
  registers those options — so flags like `--fields` / `--ndjson` (which
  are reserved/unimplemented) were listed in the catalogue and shell/agent
  tooling even though `yargs.strict()` rejects them at runtime.

  `generator/metadata.ts` now only emits a universal option when it is
  actually wired into the builder (an allowlist that is empty today),
  keeping `commands.json` in sync with the real CLI surface. No change to
  any emitted command module.

- 6b7f446: Consume `@cloudflare/deploy-helpers` and `@cloudflare/workers-utils` from the npm registry instead of vendored tarballs

  Both packages are now published, so cf depends on them via npm version
  ranges (`deploy-helpers@^0.2.2`, `workers-utils@^0.24.0`) and the vendored
  tarballs are dropped. The published builds still ship esbuild's throwing
  `__require` Proxy, so the ESM `__require`-shim patches remain (retargeted to
  the new versions), and `pnpm.overrides` pins each to a single exact version
  so every transitive reference collapses onto the one patched copy. No
  user-facing behaviour change.

## 0.0.6

### Patch Changes

- 2eafc16: `cf` 0.0.6: shell completions overhaul, command-surface restructure, and metadata correctness fixes

  This release replaces the custom shell-completions stack with [`@bomb.sh/tab`](https://github.com/bombshell-dev/tab), restructures the command surface to track the underlying API hierarchy more closely, corrects the metadata sidecars consumed by MCP catalogues and agent tools, and bumps the minimum Node version.

  #### Breaking changes
  - **Minimum Node version is now 22.** Previously was 20. Running cf on Node 20 now prints a friendly error from `bin/cf` and exits before loading the bundle.
  - **Shell completions installation moves from `cf completions install` to `cf complete <shell>`.** Append the output of `cf complete bash` (or `zsh` / `fish` / `powershell`) to your shell rc file. The old `cf completions install` and `cf completions uninstall` subcommands have been removed, along with the `cf completions <bash|zsh|fish>` subcommands.
  - **Command surface restructured.** Some product groups have been added at the top level (`autorag`, `dispatch-namespaces`, `email-sending`, `smart-shield`, `workers-builds`); some that used to live inside other groups have been hoisted (`workflows` from `cf workers workflows`, `logs` from `cf accounts logs`, `google-tag-gateway` from `cf zones google-tag-gateway`); and a few have been removed entirely (`builds`, `memberships`, `workers-for-platforms` — its dispatch-namespaces commands now live under the new top-level `dispatch-namespaces` group). Within products, sub-command paths have been re-shaped to match the underlying API hierarchy more closely. Net effect: ~2,750 commands across 110+ products (slightly fewer than 0.0.5's ~2,790 due to renames and deduplication).

  #### What's new
  - **Shell completions via `@bomb.sh/tab`.** One install line per shell (`cf complete bash >> ~/.bashrc`). Completions cover commands, subcommands, and options.
  - **Universal `@<path>` file ingestion.** Any string-typed body flag accepts `--<flag> @path/to/file`. The leading `@` reads the file with the appropriate format (text, binary, base64, or JSON, depending on the field's overlay annotation). Bare values without `@` pass through unchanged.
  - **Interactive prompting for required fields.** When stdin is a TTY and a required field is missing, cf prompts: text fields get `clack.text`, fields whose OpenAPI spec marks them `x-sensitive: true` get `clack.password` (masked input), and enum fields get `clack.select` with the spec-allowed choices. Sensitivity is detected from the spec, not a name heuristic.
  - **Confirmation prompts for destructive operations.** All DELETE operations and non-DELETE operations explicitly marked destructive via `x-forge-require-confirmation` prompt before proceeding. `--force` / `-f` bypasses. Non-interactive runs emit a CI-friendly error.
  - **`cf complete`, `cf schema`, `cf agent-context`, `cf tools`** hand-written commands for shell completions, raw OpenAPI schema dumping, agent-context bundling, and MCP tool definitions.
  - **`--local` flag** for routing eligible commands through a local Miniflare session via `--local-endpoint`. Phase 1; auto-discovery is forthcoming.
  - **Fast startup.** Every product registers as a lazy yargs shell via `lazyCommand`; only the modules a command actually touches load into memory.
  - **`cf auth login --token`, `cf auth logout`, `cf auth whoami`** for token-based and OAuth authentication, with Wrangler OAuth token fallback (read from `~/.wrangler/config/default.toml`).
  - **Helpful Node-version error.** Pre-22 Node now prints an actionable message from `bin/cf` before any runtime imports try to load.

  #### Fixes
  - **Metadata correctness sweep.** `commands.json` and `agent-context.json` now correctly carry positional arguments, enum choices, container path params, and overlay-driven defaults that were previously silently dropped — roughly 1,500 commands have updated argument or option metadata. Closes the latent drift between the cf CLI's runtime behaviour and the metadata sidecars consumed by MCP catalogues, agent contexts, and shell-completion tooling.
  - **No more fabricated `default: false` on optional booleans.** Spec-silent optional boolean body fields no longer leak a default value into the metadata.

  #### Notes
  - Output is JSON. JSON payloads go to stdout; status messages (spinners, success markers, error boxes) go to stderr. No `--format` / `--ndjson` flag — pipe through `jq -c '.[]'` for newline-delimited output.
  - Account ID and API token are resolved from environment variables (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`) and stored credentials only — there are no `--account-id` or `--api-token` flags.
