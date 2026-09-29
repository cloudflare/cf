import path from "node:path";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;

const compatibilityTests = {
	root,
	test: {
		name: "compatibility",
		testTimeout: 15_000,
		pool: "forks" as const,
		isolate: false,
		retry: 0,
		include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
		exclude: ["**/node_modules/**", "**/__tests__/upstream/unported-*.test.ts"],
		setupFiles: path.resolve(root, "src/__tests__/vitest.setup.ts"),
		globalSetup: path.resolve(root, "src/__tests__/vitest.global.ts"),
		globals: true,
		unstubEnvs: true,
	},
	resolve: {
		alias: {
			// The Workflow peer fixture must use the exact Miniflare build cf
			// embeds for local routing. Resolve it from the cli package so tests
			// and cf cannot accidentally join the registry with different builds.
			miniflare: path.resolve(root, "../cli/node_modules/miniflare"),
			// A few Wrangler tests exercise cf internals, but relative imports
			// across workspace package boundaries are forbidden. Keep these
			// test-only entries out of cf's published exports.
			"cf/d1-migrations-bookkeeping": path.resolve(
				root,
				"../cli/src/commands/d1/migrations/bookkeeping.ts"
			),
			// Exercise the compiled CLI. Test-sensitive runtime boundaries are
			// kept external by tsdown, so aliases and vi.mock can still replace
			// prompts, CI detection, and process spawning deterministically.
			cf: path.resolve(root, "../cli/dist/index.mjs"),
			// Route every `@clack/prompts` import (including transitive ones
			// from cf's source) through a bridge module that consumes the
			// shared mock-dialogs queues. Vite resolve.alias hits before
			// node_modules resolution, so this works regardless of where in
			// the workspace the importer lives — vi.mock alone wouldn't
			// intercept cf's `import * as clack from "@clack/prompts"`.
			"@clack/prompts": path.resolve(
				root,
				"src/__tests__/helpers/clack-mock.ts"
			),
			// The compiled bundle imports Undici through native ESM, beyond the
			// reach of a setup-file vi.mock. Keep Undici's API but delegate fetch
			// to the global implementation that MSW intercepts.
			undici: path.resolve(root, "src/__tests__/helpers/undici-mock.ts"),
		},
	},
};

export default defineConfig({
	test: {
		projects: [
			compatibilityTests,
			{
				root,
				test: {
					name: "upstream-inventory",
					pool: "forks",
					isolate: false,
					include: ["**/__tests__/upstream/unported-*.test.ts"],
				},
			},
		],
	},
});
