/**
 * Test setup. Loaded by Vitest before any test files; vite.config.ts
 * wires this in via `setupFiles`.
 *
 * Currently a no-op (kept as a hook for future test infrastructure —
 * mocking ci-info, intercepting clack prompts, etc.). Previously
 * unmasked commands behind `CF_HIDE_COMMANDS` but that env-var gate
 * was deleted with the yargs-takeover refactor; hidden generated
 * products are now unconditionally registered (only filtered from
 * `--help` via yargs' `describe: false` semantic).
 *
 * Per-test isolation of cf's global config dir (so a developer's
 * stored OAuth token can't leak into tests that assume
 * an unauthenticated environment) is opt-in via `runInTempDir()` from
 * `@cloudflare/workers-utils/test-helpers`, called inside the relevant
 * `describe` block — matching the wrangler convention.
 */
export {};
