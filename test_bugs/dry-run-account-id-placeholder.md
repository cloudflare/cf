---
slug: dry-run-account-id-placeholder
title: Generated dry runs ignored silently resolvable account IDs
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# Generated dry runs ignored silently resolvable account IDs

## Historical symptom

An account-scoped generated command run with `--dry-run` printed `<account-id>` in its URL unless the account had been placed directly on argv. It ignored an account available from the environment or project/user state, so the preview could differ from the live request target.

## Current status

Fixed. `packages/cli/src/lib/context.ts` now provides `resolveAccountIdSilent()`. It reads, in order:

1. `CLOUDFLARE_ACCOUNT_ID`;
2. the `settings.accountId` export from `cloudflare.config.ts`; and
3. the active workers-auth profile's cached account.

It returns `undefined` when none is available and does not prompt, enumerate accounts over the network, or announce a selected account. The old document's references to `.cfrc` and `~/.config/cf/config.json` are obsolete.

`packages/cli/generator/emit/handler/dry-run.ts` calls the silent resolver for account-scoped commands before formatting the preview URL, falling back to the literal `<account-id>` only when there is no silently available value.

Active tests in `packages/cli/src/__tests__/lib/context.test.ts` cover the environment, project settings, cached-profile, and absent cases, including the no-prompt/no-network behavior. The Wrangler-ported deletion dry-run test also expects the resolved account in the preview.

This fix applies to generated API commands. It does not fix the separate hand-written deploy dry-run authentication issue tracked in `deploy-dry-run-resolves-auth-first.md`.
