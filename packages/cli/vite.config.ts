import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite-plus";

const testBundle = process.env.CF_TEST_BUNDLE === "1";

export default defineConfig({
	run: {
		tasks: {
			"task:generate": {
				command: "tsx generate.ts",
				cache: false,
			},
			"task:dev": {
				command: "tsx src/dev.ts",
				cache: false,
			},
			"task:build": {
				command: "vp pack",
				dependsOn: [
					"task:generate",
					{ task: "task:build", from: ["dependencies", "devDependencies"] },
				],
				cache: false,
			},
			"task:build:test": {
				command: "node build-test.mjs",
				dependsOn: [
					"task:generate",
					{ task: "task:build", from: ["dependencies", "devDependencies"] },
				],
				cache: false,
			},
			"task:check:type": {
				command: "tsgo --noEmit",
				dependsOn: [
					"task:generate",
					{ task: "task:build", from: ["dependencies", "devDependencies"] },
				],
				cache: false,
			},
			"task:test": {
				command: "vp test run",
				dependsOn: ["task:generate"],
				cache: false,
			},
			"task:test:watch": {
				command: "vp test watch",
				dependsOn: ["task:generate"],
				cache: false,
			},
			"task:test:imports": {
				command:
					"vp test run --maxWorkers=1 --no-file-parallelism --experimental.importDurations.limit=100000 --reporter=default --reporter=./src/__tests__/helpers/import-reporter.ts",
				dependsOn: ["task:generate"],
				cache: false,
			},
		},
	},
	test: {
		// Preserve Vitest 4 mock call history until the suite is reviewed.
		clearMocks: false,
		env: { TZ: "UTC" },
		testTimeout: 30_000,
		pool: "forks",
		retry: 0,
		include: ["src/__tests__/**/*.test.ts", "src/__tests__/**/*.test.tsx"],
		setupFiles: ["src/__tests__/vitest.setup.ts"],
		globals: true,
		unstubEnvs: true,
		server: {
			deps: {
				inline: ["@cloudflare/workers-utils"],
			},
		},
	},
	resolve: {
		alias: [{ find: /^vitest$/, replacement: "vite-plus/test" }],
	},
	pack: {
		deps: {
			resolveDepSubpath: true,
			// These packages require their own files beside the module at runtime.
			neverBundle: [
				"blake3-wasm",
				"miniflare",
				...(testBundle
					? ["@clack/prompts", "ci-info", "tinyexec", "undici"]
					: []),
			],
		},
		// Keep the delegate entry independent of the full command tree.
		entry: {
			index: "src/index.ts",
			delegate: "src/lib/delegate.ts",
			"update-check-worker": "src/update-check-worker.ts",
			config: "src/config.ts",
		},
		format: ["esm"],
		platform: "node",
		target: "node20",
		outDir: "dist",
		clean: true,
		// Vite+ initializes NODE_ENV=development while loading this config.
		// Keep publishable builds minified and without source maps by default.
		sourcemap: false,
		minify: true,
		dts: { entry: ["src/config.ts"] },
		define: {
			...(process.env.PACKAGE_PRERELEASE_LABEL
				? {
						PACKAGE_PRERELEASE_LABEL: JSON.stringify(
							process.env.PACKAGE_PRERELEASE_LABEL
						),
					}
				: {}),
			"process.env.SPARROW_SOURCE_KEY": JSON.stringify(
				process.env.SPARROW_SOURCE_KEY ?? ""
			),
		},
		banner: {
			js: "#!/usr/bin/env node",
		},
		onSuccess: async () => {
			const srcMeta = join("src", "commands", "_generated", "_meta");
			const distMeta = join("dist", "_meta");
			if (existsSync(srcMeta)) {
				mkdirSync(distMeta, { recursive: true });
				cpSync(srcMeta, distMeta, { recursive: true });
			}
		},
	},
});
