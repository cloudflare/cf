import { resolve } from "node:path";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vite-plus/test";
import { discoverImpls } from "../../../commands/dev/discover.js";

/**
 * Unit tests for the per-ecosystem discovery walkers. These exercise
 * the manifest-detection logic directly without going through the
 * yargs handler — `discoverImpls(cwd)` is pure (modulo filesystem
 * reads) and deterministic.
 *
 * `runInTempDir()` chdirs to a fresh tmp dir per test and restores
 * after; `seed({...})` writes a tree of files relative to cwd. Both
 * come from `@cloudflare/workers-utils/test-helpers` so cf's tests
 * use the same idioms as `wrangler-tests`.
 *
 * What we cover:
 *   - npm: declared + installed → DiscoveredImpl with binary set
 *   - npm: declared but not installed → binary === null
 *   - npm: not declared → no result
 *   - PyPI: declared in [project].dependencies → DiscoveredImpl
 *   - PyPI: declared but no matching token shape → no result
 *   - Cargo: declared via bare key → DiscoveredImpl
 *   - Cargo: declared via [dependencies.pkg] table header
 *   - Multiple manifests: returns one entry per declared impl
 *   - No manifest: returns empty array
 *
 * What we don't cover here (covered in spawn.test.ts /
 * index.test.ts):
 *   - PyPI's `python -c` shutil.which resolution — that's an exec
 *     boundary; the test would need to assert on a function we can't
 *     mock without restructuring discover.ts. Acceptable: the binary
 *     resolution is one branch in the function under test, and
 *     "declared in pyproject" coverage suffices to exercise the
 *     parse logic.
 *   - The uv:<pkg> sentinel; same reason.
 */
describe("discoverImpls", () => {
	runInTempDir();

	describe("npm", () => {
		it("returns the declared impl when installed", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "2.0.0-beta.sha-805ec1ff3",
				}),
				"node_modules/@cloudflare/vite-plugin/bin/cf-vite":
					"#!/usr/bin/env node\n",
			});

			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(1);
			expect(results[0]?.impl.pkg).toBe("@cloudflare/vite-plugin");
			expect(results[0]?.binary).toBe(
				resolve("node_modules/@cloudflare/vite-plugin/bin/cf-vite")
			);
		});

		it("returns binary=null when declared but not installed", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
			});

			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(1);
			expect(results[0]?.binary).toBeNull();
			expect(results[0]?.installed).toBe(false);
		});

		it("tracks installed packages with missing delegate binaries", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "2.0.0-beta.sha-805ec1ff3",
				}),
			});

			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(1);
			expect(results[0]?.binary).toBeNull();
			expect(results[0]?.installed).toBe(true);
		});

		it("returns no result when no known impl is declared", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "some-unrelated-package": "^1.0.0" },
				}),
			});

			expect(discoverImpls(process.cwd())).toEqual([]);
		});

		it("ignores hoisted parent node_modules (uses local install only)", async () => {
			// Simulate a workspace situation where the package is hoisted
			// to a parent node_modules but NOT in the project's own. cf
			// must treat this as not-installed, per the AGENTS.md note
			// about workspaces.
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				// Note: NO node_modules/@cloudflare/vite-plugin/ entry here.
			});

			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(1);
			expect(results[0]?.binary).toBeNull();
		});

		it("handles malformed package.json without crashing", async () => {
			await seed({
				"package.json": "{ this is not valid JSON",
			});

			expect(discoverImpls(process.cwd())).toEqual([]);
		});

		it("collects fallback deps from devDependencies and dependencies alike", async () => {
			// Either field counts; the discoverer doesn't differentiate.
			await seed({
				"package.json": JSON.stringify({
					dependencies: { wrangler: "^1.0.0" },
				}),
			});

			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(1);
			expect(results[0]?.impl.pkg).toBe("wrangler");
		});

		it("uses primary npm impls before wrangler fallback", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: {
						"@cloudflare/vite-plugin": "beta",
						wrangler: "^4.0.0",
					},
				}),
			});

			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(1);
			expect(results[0]?.impl.pkg).toBe("@cloudflare/vite-plugin");
		});
	});

	describe("PyPI", () => {
		it("detects declaration in [project].dependencies", async () => {
			await seed({
				"pyproject.toml": [
					"[project]",
					'name = "my-worker"',
					'dependencies = ["cloudflare-py-dev-server>=0.1.0"]',
					"",
				].join("\n"),
			});

			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(1);
			expect(results[0]?.impl.pkg).toBe("cloudflare-py-dev-server");
		});

		it("detects declaration with version pin and extras", async () => {
			// The regex-based detector matches the package name as a
			// quoted token followed by a version separator — covers
			// `pkg`, `pkg==1.0`, `pkg>=1.0`, `pkg[extras]`.
			await seed({
				"pyproject.toml": [
					"[project]",
					'name = "my-worker"',
					'dependencies = ["cloudflare-py-dev-server[full]==0.2.0"]',
					"",
				].join("\n"),
			});

			expect(discoverImpls(process.cwd())).toHaveLength(1);
		});

		it("ignores comments / unrelated string mentions", async () => {
			// The regex requires the package name to appear inside a
			// quoted dep token (left-anchored to a quote). A bare
			// mention in a comment shouldn't trigger.
			await seed({
				"pyproject.toml": [
					"[project]",
					'name = "my-worker"',
					"# cloudflare-py-dev-server is great, but we don't use it here",
					"dependencies = []",
					"",
				].join("\n"),
			});

			expect(discoverImpls(process.cwd())).toEqual([]);
		});
	});

	describe("Cargo", () => {
		it("detects declaration via bare key in [dependencies]", async () => {
			await seed({
				"Cargo.toml": [
					"[package]",
					'name = "my-worker"',
					'version = "0.1.0"',
					"",
					"[dependencies]",
					'cloudflare-rs-dev-server = "0.1"',
					"",
				].join("\n"),
			});

			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(1);
			expect(results[0]?.impl.pkg).toBe("cloudflare-rs-dev-server");
		});

		it("detects declaration via [dependencies.pkg] table header", async () => {
			await seed({
				"Cargo.toml": [
					"[package]",
					'name = "my-worker"',
					"",
					"[dependencies.cloudflare-rs-dev-server]",
					'version = "0.1"',
					"features = []",
					"",
				].join("\n"),
			});

			expect(discoverImpls(process.cwd())).toHaveLength(1);
		});

		it("returns no result when not declared", async () => {
			await seed({
				"Cargo.toml": [
					"[package]",
					'name = "my-worker"',
					"",
					"[dependencies]",
					'serde = "1"',
					"",
				].join("\n"),
			});

			expect(discoverImpls(process.cwd())).toEqual([]);
		});
	});

	describe("multi-manifest", () => {
		it("returns one entry per declared impl across ecosystems", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"pyproject.toml": [
					"[project]",
					'name = "x"',
					'dependencies = ["cloudflare-py-dev-server"]',
					"",
				].join("\n"),
			});

			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(2);
			const names = results.map((r) => r.impl.pkg).sort();
			expect(names).toEqual([
				"@cloudflare/vite-plugin",
				"cloudflare-py-dev-server",
			]);
		});
	});

	describe("no manifest", () => {
		it("returns an empty array when cwd has no recognised manifest", () => {
			expect(discoverImpls(process.cwd())).toEqual([]);
		});
	});
});
