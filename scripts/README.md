# Forge and OpenAPI updates

The two generator inputs have independent update paths:

| Automation              | Update branch             | Input it updates                                                         |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------ |
| Renovate Forge group    | `renovate/forge`          | Forge package commit in `packages/cli/package.json` and `pnpm-lock.yaml` |
| Update OpenAPI workflow | `automation/update-forge` | OpenAPI revision in `packages/cli/generate.ts`                           |

Renovate follows the newest successful Forge package publication from `main`
and pins its pkg.pr.new URL. It regenerates commands with the existing OpenAPI
pin and adds a patch changeset when generated output changes. Its configuration
lives in `renovate.json5` and `.github/renovate-global.json`.

The OpenAPI workflow runs hourly, manually, or on a `forge-release-published`
repository dispatch. It selects the latest published `openapi@<sha>` release
with an `openapi.forge.json` asset, ignoring package releases, drafts, and
prereleases. It regenerates commands with the existing Forge package pin and
adds a minor changeset. Generation and `pnpm check` must pass before it pushes.

The OpenAPI workflow retains the former `automation/update-forge` branch and
`update-forge` concurrency group so it can continue maintaining existing PRs.
It accepts bot commits with either the old combined title or the new OpenAPI
title; human edits remain protected. After either input update merges, the
other automation refreshes and regenerates its PR against the new `main`.

Run `node scripts/update-openapi.ts --check` to inspect the proposed OpenAPI
update without changing files or PRs. Set `GH_TOKEN` (or `GITHUB_TOKEN`) for
cf's PR and branch operations. Public Forge release requests are anonymous,
and generation and checks run without those credentials. The workflow uses
`GH_ACCESS_TOKEN` when available so its PR updates trigger normal CI.
