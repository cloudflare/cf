import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as clack from "@clack/prompts";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	normalizeProjectCommandExit,
	runProjectCommand,
	shouldRelayProjectCommandSignal,
} from "../../../lib/autoconfig.js";
import { makeExecutable, nodeScript } from "../../helpers/executable.js";
import { runCf } from "../../helpers/run-cf.js";

/**
 * Integration tests for `cf dev`. We drive the command through
 * `runCf(["dev", ...])` so the full yargs → handler → discover →
 * spawn pipeline is exercised end-to-end, just inside the same
 * process.
 *
 * Each test sets up a tmp project (manifests + optional fake
 * `node_modules/<impl>/bin/<impl-binary>` fixture), invokes the command, and
 * asserts on:
 *   - the exit code
 *   - the captured stderr / stdout
 *
 * `mockConsoleMethods()` captures `console.log` / `console.error` so
 * we can assert against `std.err` / `std.out`. `runInTempDir()`
 * creates a fresh cwd per test.
 */
describe("cf dev", () => {
	runInTempDir();
	const std = mockConsoleMethods();
	afterEach(() => vi.restoreAllMocks());

	describe("no impl declared", () => {
		it("errors with install hints and exits 1 when no manifest exists", async () => {
			const result = await runCf(["dev"]);

			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(/No Cloudflare dev-server is installed/);
			// Should list every known impl as an install option.
			expect(std.err).toMatch(/@cloudflare\/vite-plugin/);
			expect(std.err).toMatch(/wrangler/);
			expect(std.err).toMatch(/cloudflare-py-dev-server/);
			expect(std.err).toMatch(/cloudflare-rs-dev-server/);
			// And surface install commands.
			expect(std.err).toMatch(/npm install --save-dev/);
			expect(std.err).toMatch(/pip install/);
			expect(std.err).toMatch(/cargo install/);
		});

		it("errors with install hints when package.json declares nothing relevant", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "some-unrelated": "^1.0.0" },
				}),
			});

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(/No Cloudflare dev-server is installed/);
		});
	});

	describe("multiple impls declared", () => {
		it("errors when two ecosystems each declare an impl", async () => {
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

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(
				/Multiple Cloudflare dev-server implementations are configured/
			);
			expect(std.err).toMatch(/@cloudflare\/vite-plugin/);
			expect(std.err).toMatch(/cloudflare-py-dev-server/);
			expect(std.err).toMatch(/A project can only use one dev-server/);
		});

		it("does not treat wrangler fallback as a second impl", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: {
						"@cloudflare/vite-plugin": "beta",
						wrangler: "^4.0.0",
					},
				}),
			});

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(std.err).not.toMatch(/Multiple Cloudflare dev-server/);
			expect(std.err).toMatch(/@cloudflare\/vite-plugin .* is not installed/);
		});
	});

	describe("declared but not installed", () => {
		it("surfaces an install hint specific to the declared impl", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				// No node_modules: declared but not installed.
			});

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(/@cloudflare\/vite-plugin .* is not installed/);
			expect(std.err).toMatch(
				/npm install --save-dev @cloudflare\/vite-plugin@beta/
			);
		});

		it("surfaces the vite version requirement when the delegate is missing", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "2.0.0-beta.sha-805ec1ff3",
				}),
			});

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(/does not include the cf delegate/);
			expect(std.err).toMatch(/@cloudflare\/vite-plugin v2 beta/);
			expect(std.err).toContain("cf dev");
			expect(std.err).toContain("cf build");
			expect(std.err).toContain("cf deploy");
			expect(std.err).toContain("cf previews deploy");
			expect(std.err).not.toMatch(
				/@cloudflare\/vite-plugin .* is not installed/
			);
		});

		it("surfaces the wrangler minimum version when the delegate is missing", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { wrangler: "^4.101.0" },
				}),
				"node_modules/wrangler/package.json": JSON.stringify({
					name: "wrangler",
					version: "4.101.0",
				}),
			});

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(/does not include the cf delegate/);
			expect(std.err).toMatch(/wrangler@4\.136\.0 or newer/);
			expect(std.err).not.toMatch(/wrangler .* is not installed/);
		});

		it("surfaces the cargo hint when the rust impl is declared but missing", async () => {
			await seed({
				"Cargo.toml": [
					"[package]",
					'name = "my-worker"',
					"",
					"[dependencies]",
					'cloudflare-rs-dev-server = "0.1"',
					"",
				].join("\n"),
			});

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(/cloudflare-rs-dev-server .* is not installed/);
			expect(std.err).toMatch(/cargo install cloudflare-rs-dev-server/);
		});
	});

	describe("happy path", () => {
		it("rejects an installed Vite plugin v1 delegate", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "1.61.0" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "1.61.0",
				}),
				"node_modules/@cloudflare/vite-plugin/bin/cf-vite":
					nodeScript("process.exit(0);"),
			});
			makeExecutable("node_modules/@cloudflare/vite-plugin/bin/cf-vite");

			const result = await runCf(["dev"]);

			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(/@cloudflare\/vite-plugin v2 beta/);
			expect(std.err).toMatch(/@cloudflare\/vite-plugin@1\.61\.0 is installed/);
			expect(std.err).toContain("cf dev");
			expect(std.err).toContain("cf build");
			expect(std.err).toContain("cf deploy");
			expect(std.err).toContain("cf previews deploy");
		});

		it("runs the detected framework dev command", async () => {
			await seed({
				"cloudflare.config.ts": "export default {};",
				"package.json": JSON.stringify({
					name: "astro-project",
					dependencies: { astro: "^5.0.0" },
				}),
				"package-lock.json": "{}",
				"node_modules/astro/package.json": JSON.stringify({
					name: "astro",
					version: "5.0.0",
				}),
				"node_modules/.bin/astro": nodeScript(
					'require("node:fs").writeFileSync("astro-argv.out", process.argv.slice(2).join("\\n") + "\\n");'
				),
			});
			makeExecutable("node_modules/.bin/astro", { npmBin: true });

			const result = await runCf(["dev", "--mode", "staging"]);

			expect(result.exitCode).toBe(0);
			expect(
				readFileSync(resolve(process.cwd(), "astro-argv.out"), "utf8")
					.trim()
					.split("\n")
			).toEqual(["dev", "--mode", "staging"]);
		});

		it("runs Vite for a Next.js project with vinext installed", async () => {
			await seed({
				"package.json": JSON.stringify({
					name: "vinext-project",
					dependencies: {
						next: "^16.0.0",
						vinext: "^0.0.1",
					},
				}),
				"package-lock.json": "{}",
				"node_modules/next/package.json": JSON.stringify({
					name: "next",
					version: "16.0.0",
				}),
				"node_modules/vinext/package.json": JSON.stringify({
					name: "vinext",
					version: "0.0.1",
				}),
				"node_modules/.bin/vite": nodeScript(
					'require("node:fs").writeFileSync("vite-argv.out", [...process.argv.slice(2), process.env.CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT].join("\\n") + "\\n");'
				),
			});
			makeExecutable("node_modules/.bin/vite", { npmBin: true });

			const result = await runCf(["dev", "--mode", "staging"]);

			expect(result.exitCode).toBe(0);
			expect(
				readFileSync(resolve(process.cwd(), "vite-argv.out"), "utf8")
					.trim()
					.split("\n")
			).toEqual(["dev", "--mode", "staging", "true"]);
		});

		it("does not treat an undeclared vinext installation (installed but not present in the project's manifest) as a vinext project", async () => {
			await seed({
				"cloudflare.config.ts": "export default {};",
				"package.json": JSON.stringify({
					name: "next-project",
					dependencies: { next: "^16.0.0" },
				}),
				"package-lock.json": "{}",
				"node_modules/next/package.json": JSON.stringify({
					name: "next",
					version: "16.0.0",
				}),
				"node_modules/vinext/package.json": JSON.stringify({
					name: "vinext",
					version: "0.0.1",
				}),
				"node_modules/.bin/next": nodeScript(
					'require("node:fs").writeFileSync("selected-command.out", "next");'
				),
			});
			makeExecutable("node_modules/.bin/next", { npmBin: true });

			const result = await runCf(["dev"]);

			expect(result.exitCode).toBe(0);
			expect(
				readFileSync(resolve(process.cwd(), "selected-command.out"), "utf8")
			).toBe("next");
		});

		it("rejects mode when the detected framework does not support it", async () => {
			await seed({
				"cloudflare.config.ts": "export default {};",
				"package.json": JSON.stringify({
					name: "angular-project",
					dependencies: {
						"@angular/cli": "^22.0.0",
						"@angular/core": "^22.0.0",
					},
				}),
				"package-lock.json": "{}",
				"node_modules/@angular/core/package.json": JSON.stringify({
					name: "@angular/core",
					version: "22.0.0",
				}),
			});

			await expect(runCf(["dev", "--mode", "staging"])).rejects.toThrow(
				"The detected command `npx ng serve` does not currently support `--mode`."
			);
		});

		it("runs a detected Vite dev command with its environment", async () => {
			const logMessage = vi
				.spyOn(clack.log, "message")
				.mockImplementation(() => {});
			const registryPath = resolve(process.cwd(), "shared-registry");
			vi.stubEnv("CLOUDFLARE_REGISTRY_PATH", registryPath);
			vi.stubEnv("DEBUG", "");
			await seed({
				"cloudflare.config.ts": "export default {};",
				"package.json": JSON.stringify({
					name: "vite-project",
					dependencies: { vite: "^7.0.0" },
				}),
				"package-lock.json": "{}",
				"node_modules/vite/package.json": JSON.stringify({
					name: "vite",
					version: "7.0.0",
				}),
				"node_modules/.bin/vite": nodeScript(
					'require("node:fs").writeFileSync("env.out", [process.env.CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT, process.env.CLOUDFLARE_REGISTRY_PATH, process.env.WRANGLER_REGISTRY_PATH, process.env.MINIFLARE_REGISTRY_PATH].join("\\n") + "\\n");'
				),
			});
			makeExecutable("node_modules/.bin/vite", { npmBin: true });

			const result = await runCf(["dev"]);

			expect(result.exitCode).toBe(0);
			expect(logMessage).toHaveBeenCalledWith("Delegating to npx vite", {
				spacing: 0,
			});
			expect(
				readFileSync(resolve(process.cwd(), "env.out"), "utf8")
					.trim()
					.split("\n")
			).toEqual(["true", registryPath, registryPath, registryPath]);
		});

		it("formats delegation without environment overrides", async () => {
			const logMessage = vi
				.spyOn(clack.log, "message")
				.mockImplementation(() => {});

			expect(await runProjectCommand('node -e ""', process.cwd())).toEqual({
				exitCode: 0,
			});
			expect(logMessage).toHaveBeenCalledWith('Delegating to node -e ""', {
				spacing: 0,
			});
		});

		it("preserves quoted arguments containing spaces", async () => {
			expect(
				await runProjectCommand(
					`node -e "process.exit(process.argv[1] === 'hello world' ? 0 : 1)" "hello world"`,
					process.cwd()
				)
			).toEqual({ exitCode: 0 });
		});

		it("hides environment overrides unless DEBUG is set", async () => {
			const logMessage = vi
				.spyOn(clack.log, "message")
				.mockImplementation(() => {});
			vi.stubEnv("DEBUG", "");

			expect(
				await runProjectCommand('node -e ""', process.cwd(), {
					env: { FOO: "bar" },
				})
			).toEqual({ exitCode: 0 });
			expect(logMessage).toHaveBeenCalledWith('Delegating to node -e ""', {
				spacing: 0,
			});
		});

		it("lists environment overrides when DEBUG is set", async () => {
			const logMessage = vi
				.spyOn(clack.log, "message")
				.mockImplementation(() => {});
			vi.stubEnv("DEBUG", "1");

			expect(
				await runProjectCommand('node -e ""', process.cwd(), {
					env: { FOO: "bar", BAZ: "qux" },
				})
			).toEqual({ exitCode: 0 });
			expect(logMessage).toHaveBeenCalledWith(
				[
					'Delegating to node -e "" with environment overrides:',
					"  FOO=bar",
					"  BAZ=qux",
				].join("\n"),
				{ spacing: 0 }
			);
		});

		it("formats a single environment override", async () => {
			const logMessage = vi
				.spyOn(clack.log, "message")
				.mockImplementation(() => {});
			vi.stubEnv("DEBUG", "1");

			expect(
				await runProjectCommand('node -e ""', process.cwd(), {
					env: { FOO: "bar" },
				})
			).toEqual({ exitCode: 0 });
			expect(logMessage).toHaveBeenCalledWith(
				[
					'Delegating to node -e "" with environment override:',
					"  FOO=bar",
				].join("\n"),
				{ spacing: 0 }
			);
		});

		it("preserves a forwarded signal when the command exits cleanly", () => {
			expect(normalizeProjectCommandExit(0, undefined, "SIGINT")).toEqual({
				exitCode: 0,
				signal: "SIGINT",
			});
		});

		it("prefers an observed framework termination signal", () => {
			expect(
				normalizeProjectCommandExit(undefined, "SIGKILL", "SIGINT")
			).toEqual({
				exitCode: 137,
				signal: "SIGKILL",
			});
		});

		it("does not resend Ctrl+C to a Windows framework command", () => {
			expect(shouldRelayProjectCommandSignal("SIGINT", "win32")).toBe(false);
			expect(shouldRelayProjectCommandSignal("SIGTERM", "win32")).toBe(true);
			expect(shouldRelayProjectCommandSignal("SIGINT", "linux")).toBe(true);
		});

		it("rejects arguments for a detected framework command", async () => {
			await seed({
				"cloudflare.config.ts": "export default {};",
				"package.json": JSON.stringify({
					name: "astro-project",
					dependencies: { astro: "^5.0.0" },
				}),
				"package-lock.json": "{}",
				"node_modules/astro/package.json": JSON.stringify({
					name: "astro",
					version: "5.0.0",
				}),
			});

			await expect(runCf(["dev", "--port", "3000"])).rejects.toThrow(
				"Arguments cannot currently be forwarded to the detected dev command `npx astro dev`"
			);
		});

		it("spawns the impl and propagates its exit code", async () => {
			// Lay down a fake implementation at the conventional delegate path.
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "2.0.0-beta.sha-805ec1ff3",
				}),
				"node_modules/@cloudflare/vite-plugin/bin/cf-vite":
					nodeScript("process.exit(0);"),
			});
			makeExecutable("node_modules/@cloudflare/vite-plugin/bin/cf-vite");

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(0);
		});

		it("rejects future Vite plugin major versions", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "next" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "3.0.0-beta.1",
				}),
				"node_modules/@cloudflare/vite-plugin/bin/cf-vite":
					nodeScript("process.exit(0);"),
			});
			makeExecutable("node_modules/@cloudflare/vite-plugin/bin/cf-vite");

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(/@cloudflare\/vite-plugin v2 beta/);
			expect(std.err).toMatch(
				/@cloudflare\/vite-plugin@3\.0\.0-beta\.1 is installed/
			);
		});

		it("propagates a non-zero impl exit code", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "2.0.0-beta.sha-805ec1ff3",
				}),
				"node_modules/@cloudflare/vite-plugin/bin/cf-vite":
					nodeScript("process.exit(17);"),
			});
			makeExecutable("node_modules/@cloudflare/vite-plugin/bin/cf-vite");

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(17);
		});

		it("forwards unknown flags to the impl", async () => {
			// The delegate inherits stdout, so write argv to a file for inspection.
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "2.0.0-beta.sha-805ec1ff3",
				}),
				"node_modules/@cloudflare/vite-plugin/bin/cf-vite": nodeScript(
					'require("node:fs").writeFileSync("argv.out", process.argv.slice(2).join("\\n") + "\\n");'
				),
			});
			makeExecutable("node_modules/@cloudflare/vite-plugin/bin/cf-vite");

			const result = await runCf([
				"dev",
				"--mode",
				"staging",
				"--port",
				"3000",
				"--my-vite-flag",
				"some-positional",
			]);
			expect(result.exitCode).toBe(0);

			const argv = readFileSync(resolve(process.cwd(), "argv.out"), "utf-8")
				.trim()
				.split("\n");
			// First arg is always `dev` (the subcommand cf inserts);
			// the rest are forwarded verbatim. Note unknown flags pass
			// through because of `unknown-options-as-args` in the dev
			// command's parserConfiguration.
			expect(argv).toEqual([
				"dev",
				"--mode",
				"staging",
				"--port",
				"3000",
				"--my-vite-flag",
				"some-positional",
			]);
		});
	});
});
