# Factory

A Flue app on Cloudflare Workers. Verified GitHub App `issues.opened` deliveries
go to one durable `IssueTriage` agent per repository issue.

The `classify-issue-type` skill defines the only initial capability: assign
**Bug**, **Feature**, or **Task**. Clef Flash (`@cf/cloudflare/clef-flash`) makes
that decision through its typed `choice` API. Flue uses Workers AI's
`@cf/meta/llama-3.3-70b-instruct-fp8-fast` only to activate the skill and invoke
the bound tool. No external model API key is needed.

The tool changes only the GitHub issue type. It leaves existing types unchanged,
including on webhook redelivery, and never adds comments, labels, assignees, or
priorities. Add future capabilities as separate skills and tools in the agent.

## Setup

From the repository root:

```sh
pnpm install
pnpm --filter @cloudflare/factory test
pnpm --filter @cloudflare/factory check:type
pnpm --filter @cloudflare/factory build
```

This package uses the workspace's `cf` CLI for all Worker scripts:

```sh
pnpm --filter @cloudflare/factory dev
pnpm --filter @cloudflare/factory build
pnpm --filter @cloudflare/factory deploy --account <account-id>
```

Builds emit `.cloudflare/output/v0/`. `cloudflare.config.ts` declares the AI
binding and SQLite-backed `FlueIssueTriageAgent` export. The Vite config adapts
Flue's Wrangler-shaped entrypoint customizer to Cloudflare Vite v2's cf config;
keep the Flue plugin before the Cloudflare plugin. No Wrangler CLI is required.

For local GitHub integration, copy `.dev.vars.example` to `.dev.vars` and fill
in `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, and `GITHUB_WEBHOOK_SECRET`.
The private key may use escaped `\n` newlines. Downloaded GitHub PKCS#1 keys are
converted to PKCS#8 for Workers' Web Crypto authentication. Keep these files out of Git.
Workers AI requires an authenticated Cloudflare account even during local dev.

## GitHub App

Create and install a GitHub App on the repositories to triage:

- Repository permission: **Issues: Read and write**. Metadata read is automatic.
- Subscribe to **Issues** events. Only the `opened` action is dispatched.
- Webhook content type: `application/json`.
- Webhook URL: `https://<worker-host>/channels/github/webhook`.
- Set a webhook secret matching the Worker's `GITHUB_WEBHOOK_SECRET`.
- Generate a private key and configure it as `GITHUB_APP_PRIVATE_KEY`.
- Ensure the organization has active issue types named `Bug`, `Feature`, and `Task`.

Outbound calls use GitHub App installation authentication from the verified
delivery's installation ID. A personal access token is not used. GitHub issue
types require organization-owned repositories; the app does not substitute labels.

After deploying, configure the secrets with cf. These commands prompt securely
for the values; use the same `--account` as deployment:

```sh
pnpm --filter @cloudflare/factory exec cf workers secrets update GITHUB_APP_ID --worker cf-factory --type secret_text --account <account-id>
pnpm --filter @cloudflare/factory exec cf workers secrets update GITHUB_APP_PRIVATE_KEY --worker cf-factory --type secret_text --account <account-id>
pnpm --filter @cloudflare/factory exec cf workers secrets update GITHUB_WEBHOOK_SECRET --worker cf-factory --type secret_text --account <account-id>
```

For a PEM file, pass `--text @/absolute/path/to/private-key.pem` to the private-key
command. For automated multi-secret changes, prefer `cf workers secrets bulk`
with a protected JSON body file. Never put secret values in shell arguments or
committed configuration. GitHub App client secrets are not needed for this flow.

## Routes and tests

- `GET /health`: `{ "status": "ok" }`, including before secrets are configured.
- `POST /channels/github/webhook`: Flue's signed GitHub webhook ingress.
- The triage agent has no public HTTP mount; only verified webhooks dispatch it.

Vitest exercises the real Hono and Flue GitHub routes with signed requests and
mocks agent dispatch. It also checks Clef output validation, the three issue
types, preservation of an existing type, and type-only GitHub updates.
These tests do not call Workers AI or GitHub. A live end-to-end smoke test requires
the installed GitHub App, configured secrets, and an opened issue.
