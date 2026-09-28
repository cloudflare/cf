import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		testTimeout: 15_000,
		pool: "forks",
		retry: 0,
		include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
		setupFiles: path.resolve(__dirname, "src/__tests__/vitest.setup.ts"),
		globalSetup: path.resolve(__dirname, "src/__tests__/vitest.global.ts"),
		globals: true,
		unstubEnvs: true,
	},
	resolve: {
		alias: {
			// The Workflow peer fixture must use the exact Miniflare build cf
			// embeds for local routing. Resolve it from the cli package so tests
			// and cf cannot accidentally join the registry with different builds.
			miniflare: path.resolve(__dirname, "../cli/node_modules/miniflare"),
			// A few Wrangler tests exercise cf internals, but relative imports
			// across workspace package boundaries are forbidden. Keep these
			// test-only entries out of cf's published exports.
			"cf/d1-migrations-bookkeeping": path.resolve(
				__dirname,
				"../cli/src/commands/d1/migrations/bookkeeping.ts"
			),
			"cf/oauth": path.resolve(__dirname, "../cli/src/lib/oauth/index.ts"),
			// Resolve `cf` to its TypeScript source rather than the built
			// `dist/` bundle. The dist build inlines `@clack/prompts` (and
			// every other dependency) into its chunks, which erases the
			// import specifiers the `@clack/prompts` alias below relies on —
			// so against dist the dialog mocks can't intercept and prompts
			// hang on real stdin. Running from source keeps those specifiers
			// intact and removes any dependency on a fresh build.
			cf: path.resolve(__dirname, "../cli/src/index.ts"),
			// Route every `@clack/prompts` import (including transitive ones
			// from cf's source) through a bridge module that consumes the
			// shared mock-dialogs queues. Vite resolve.alias hits before
			// node_modules resolution, so this works regardless of where in
			// the workspace the importer lives — vi.mock alone wouldn't
			// intercept cf's `import * as clack from "@clack/prompts"`.
			"@clack/prompts": path.resolve(
				__dirname,
				"src/__tests__/helpers/clack-mock.ts"
			),
		},
	},
});
