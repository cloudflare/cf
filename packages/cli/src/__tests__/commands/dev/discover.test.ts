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
		it("returns the declared Wrangler delegate when installed", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { wrangler: "^4.136.0" },
				}),
				"node_modules/wrangler/package.json": JSON.stringify({
					name: "wrangler",
					version: "4.136.0",
				}),
				"node_modules/wrangler/bin/cf-wrangler.js": "#!/usr/bin/env node\n",
			});
			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(1);
			expect(results[0]).toMatchObject({
				installed: true,
				installedVersion: "4.136.0",
				binary: resolve("node_modules/wrangler/bin/cf-wrangler.js"),
			});
		});

		it("reports a missing local installation", async () => {
			await seed({
				"package.json": JSON.stringify({
					dependencies: { wrangler: "^4.136.0" },
				}),
			});
			expect(discoverImpls(process.cwd())[0]).toMatchObject({
				installed: false,
				binary: null,
			});
		});

		it("reports a missing delegate in an installed package", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { wrangler: "^4.136.0" },
				}),
				"node_modules/wrangler/package.json": JSON.stringify({
					name: "wrangler",
					version: "4.136.0",
				}),
			});
			expect(discoverImpls(process.cwd())[0]).toMatchObject({
				installed: true,
				binary: null,
			});
		});

		it("ignores a parent project's installation", async () => {
			await seed({
				"node_modules/wrangler/package.json": JSON.stringify({
					name: "wrangler",
					version: "4.136.0",
				}),
				"node_modules/wrangler/bin/cf-wrangler.js": "#!/usr/bin/env node\n",
				"child/package.json": JSON.stringify({
					devDependencies: { wrangler: "^4.136.0" },
				}),
			});
			expect(discoverImpls(resolve("child"))[0]).toMatchObject({
				installed: false,
				binary: null,
			});
		});

		it("leaves Vite command selection to autoconfig", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
			});
			expect(discoverImpls(process.cwd())).toEqual([]);
		});

		it("handles malformed package.json", async () => {
			await seed({ "package.json": "{ this is not valid JSON" });
			expect(discoverImpls(process.cwd())).toEqual([]);
		});

		it("uses primary implementations before Wrangler", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { wrangler: "^4.136.0" },
				}),
				"pyproject.toml":
					'[project]\ndependencies = ["cloudflare-py-dev-server"]\n',
			});
			const results = discoverImpls(process.cwd());
			expect(results).toHaveLength(1);
			expect(results[0]?.impl.pkg).toBe("cloudflare-py-dev-server");
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
		it("returns primary implementations across ecosystems", async () => {
			await seed({
				"pyproject.toml":
					'[project]\ndependencies = ["cloudflare-py-dev-server"]\n',
				"Cargo.toml": '[dependencies]\ncloudflare-rs-dev-server = "0.1"\n',
			});
			expect(
				discoverImpls(process.cwd())
					.map((result) => result.impl.pkg)
					.sort()
			).toEqual(["cloudflare-py-dev-server", "cloudflare-rs-dev-server"]);
		});
	});

	describe("no manifest", () => {
		it("returns an empty array when cwd has no recognised manifest", () => {
			expect(discoverImpls(process.cwd())).toEqual([]);
		});
	});
});
