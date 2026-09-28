---
slug: ci-confirmations-silently-answer-no
title: Deploy confirmation fallbacks were suspected of silently skipping work in CI
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# Deploy confirmations do not silently skip work in CI

## Historical concern

The deploy-helpers adapter supplies a safe non-interactive fallback of `false` when a confirmation has no explicit fallback. That made it appear possible for an operation guarded by such a prompt to be skipped without a diagnostic or failing exit status.

This was always a code-reading risk; no production deploy skip was observed.

## Current status

**Fixed as an unsupported premise.** The conservative adapter fallback still exists:

- `packages/cli/src/lib/deploy-context.ts` adapts deploy-helpers confirmation options and always passes `fallbackValue ?? defaultValue ?? false`.
- `packages/cli/src/lib/dialog.ts` returns `options.fallbackValue ?? false` in CI/non-interactive execution.
- `cf deploy` has no `--yes` or `--force` option which pre-authorises these deploy-helper decisions.

However, a fresh audit of every relevant deploy-helper call site found no current path where that implicit `false` produces silent success:

- destructive Email Routing reconciliation rejects non-interactive execution before prompting, and an interactive decline throws;
- workers.dev registration and creation throw when declined;
- Custom Domain prompts run only on a TTY; any decline becomes a trigger failure which the caller aggregates and throws;
- remote-config reconciliation auto-approves in ordinary non-interactive mode, while strict mode records a failing exit code before aborting the upload; and
- call sites intended to proceed unattended provide an explicit `true` fallback.

Generated destructive commands use a separate path: `confirmDelete()` in `lib/prompt.ts` prints the selected fallback in non-interactive execution and points at `--force` when it declines.

## Wrangler/deploy-helpers source check

The pinned deploy-helpers bundle and the latest fetched Wrangler source were both checked. Email Routing now rejects destructive non-interactive changes. Custom Domain overwrite prompts still omit options, but they are enclosed by a TTY branch; non-TTY deployment sets the required override flags directly. workers.dev declines throw, and trigger failures are collected into a `UserError` rather than reported as successful deployment.

## Proposed resolution

No cf change is required for the alleged silent-success bug. Keeping the adapter's default conservative is still useful defense for future deploy-helper call sites. A regression test could assert that any new non-interactive decline either throws or sets a failing exit status.

## Verification gap

There is no single test enumerating every deploy-helper confirmation call site. The conclusion therefore rests on source audit, and should be revisited when the pinned deploy-helpers package changes.
