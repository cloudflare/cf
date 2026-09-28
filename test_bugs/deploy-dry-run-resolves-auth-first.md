---
slug: deploy-dry-run-resolves-auth-first
title: cf deploy --dry-run still requires a resolvable account
status: Active
fix-location: cf-only
last-verified: 2026-09-16
---

# `cf deploy --dry-run` still requires a resolvable account

## Symptom

`cf deploy --dry-run` and `cf workers versions create --dry-run` no longer need an API token, but they are not fully account-free or offline validation commands. They build and parse Build Output, then fail if no account ID can be resolved.

## Current status

Active in this narrower form on cf HEAD. Both commands share `runUpload()` in `packages/cli/src/commands/deploy/shared.ts`. Its current order is:

1. run the implementation build unless `--prebuilt` was supplied;
2. read and parse Build Output;
3. use an empty auth token for a dry run, otherwise call `getAuthToken()`;
4. unconditionally call `getAccountId()`;
5. initialise deploy-helpers and call `deploy()` or `versionsUpload()` with the dry-run flag in the assembled props.

The local token branch is `argv["dry-run"] ? "" : await getAuthToken()`, so a dry run succeeds without an API token when `CLOUDFLARE_ACCOUNT_ID`, project settings, or the cached profile supplies the account. However, `getAccountId()` can still enumerate accounts or prompt when none is available locally, so this is not an account-free path.

The imported versions test now clears `CLOUDFLARE_API_TOKEN` and actively verifies that `cf workers versions create --prebuilt --dry-run` succeeds. Its shared account mock still supplies an account ID, so it correctly proves the token-free behavior without claiming an account-free contract. The focused test passes on this checkout.

## Impact and workaround

`cf build` remains the account-free offline workaround used by migrated projects. It proves that the selected implementation can produce valid Build Output, but it does not exercise the later Build Output-to-deploy-props translation. A truly credential-free deploy dry run would cover that extra layer.

## Required fix

If dry-run validation can operate without an account, use the silent resolver and tolerate no result rather than calling interactive/network account paths. Add coverage that clears the account environment variable, project setting, and stored OAuth account before invoking each shared command with `--dry-run`.
