import path from "node:path";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;

// These tests exercise cf only through runCf(), without importing or mocking
// CLI internals. Run them against the same compiled test bundle used by the
// Wrangler compatibility suite so each worker avoids transforming the command
// graph from source. Tests that need source-level module boundaries stay in the
// source project below.
const compiledFiles = [
	"src/__tests__/command-recommendations.test.ts",
	"src/__tests__/commands/body-bypass-query-params.test.ts",
	"src/__tests__/commands/cli-search.test.ts",
	"src/__tests__/commands/d1.test.ts",
	"src/__tests__/commands/kv.test.ts",
	"src/__tests__/commands/migrations/apply.test.ts",
	"src/__tests__/commands/migrations/create.test.ts",
	"src/__tests__/commands/migrations/list.test.ts",
	"src/__tests__/commands/r2.test.ts",
	"src/__tests__/commands/telemetry.test.ts",
	"src/__tests__/commands/zones-list.test.ts",
	"src/__tests__/dotted-query-params.test.ts",
	"src/__tests__/lib/local-e2e.test.ts",
	"src/__tests__/local-flags.test.ts",
	"src/__tests__/query-params-runtime.test.ts",
] as const;

const sharedTestConfig = {
	testTimeout: 30_000,
	pool: "forks" as const,
	retry: 0,
	setupFiles: ["src/__tests__/vitest.setup.ts"],
	globals: true,
	unstubEnvs: true,
};

export default defineConfig({
	test: {
		projects: [
			{
				root,
				test: {
					...sharedTestConfig,
					name: "source",
					include: [
						"src/__tests__/**/*.test.ts",
						"src/__tests__/**/*.test.tsx",
					],
					exclude: [...compiledFiles],
				},
			},
			{
				root,
				test: {
					...sharedTestConfig,
					name: "compiled",
					include: [...compiledFiles],
				},
				resolve: {
					alias: [
						// run-cf.ts is the only source seam used by this project. Point
						// both of its runtime imports at the compiled public entry.
						{
							find: "../../index.js",
							replacement: path.resolve(root, "dist/index.mjs"),
						},
						{
							find: "../../lib/cli-exit.js",
							replacement: path.resolve(root, "dist/index.mjs"),
						},
						// The test bundle keeps Undici external. Delegate its fetch to
						// globalThis.fetch so MSW can intercept compiled CLI requests.
						{
							find: "undici",
							replacement: path.resolve(
								root,
								"src/__tests__/helpers/undici-mock.ts"
							),
						},
					],
				},
			},
		],
	},
});
