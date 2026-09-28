import { defineConfig } from "vitest/config";

/**
 * Vitest config for the cf CLI package.
 *
 * Mirrors `packages/wrangler-tests/vitest.config.mts`'s shape so that
 * patterns developed there port cleanly into this package, but with a
 * narrower scope: tests live under `src/__tests__/` and exercise cf's
 * own source directly (relative imports), not the published `cf` npm
 * package.
 *
 * The wrangler-tests package re-targets the imported wrangler test
 * corpus at the published `cf` entry point — those are integration-
 * level. The tests added here are unit/integration coverage authored
 * specifically for cf modules (e.g. `commands/dev/`), kept colocated
 * with the source they cover so refactors travel together.
 */
export default defineConfig({
	test: {
		testTimeout: 30_000,
		// Forks pool: each test file runs in its own process. We rely on
		// per-test cwd manipulation (`runInTempDir`) for the dev-command
		// tests, and a forked pool means one test's chdir can't leak
		// into another worker's cwd.
		pool: "forks",
		retry: 0,
		include: ["src/__tests__/**/*.test.ts", "src/__tests__/**/*.test.tsx"],
		setupFiles: ["src/__tests__/vitest.setup.ts"],
		globals: true,
		unstubEnvs: true,
	},
	resolve: {
		// Mirror wrangler-tests' clack alias if/when cf tests need to
		// mock interactive prompts. Not required by the dev-command
		// tests (no clack flows in `cf dev`), so left out for now —
		// add the alias if a future cf test exercises an interactive
		// surface.
		alias: {},
	},
});
