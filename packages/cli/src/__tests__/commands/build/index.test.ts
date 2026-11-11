import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { x } from "tinyexec";
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test";
import { runBuild } from "../../../commands/build/index.js";
import { BuildOutputError } from "../../../lib/build-output.js";
import { makeExecutable, nodeScript } from "../../helpers/executable.js";
import { runCf } from "../../helpers/run-cf.js";
import { buildOutputRootConfig, workerConfig } from "../deploy/helpers.js";

vi.mock("tinyexec", { spy: true });

describe("cf build", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	it("errors with install hints when no impl is declared", async () => {
		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(1);
		expect(std.err).toMatch(/No Cloudflare dev server is installed/);
		expect(std.err).toMatch(/@cloudflare\/vite-plugin/);
		expect(std.err).toMatch(/wrangler/);
		// Each install command sits on its own line, outside the error frame.
		expect(std.err).toContain(
			"\n   pip install cloudflare-py-dev-server\n   uv add --dev cloudflare-py-dev-server"
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

		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(1);
		expect(std.err).toMatch(/wrangler@4\.161\.0 or newer/);
		expect(unframe(std.err)).not.toMatch(/wrangler .* is not installed/);
	});

	it("uses the native Vite CLI when the plugin and wrangler are both declared", async () => {
		await seed({
			"package.json": JSON.stringify({
				devDependencies: {
					"@cloudflare/vite-plugin": "beta",
					wrangler: "^4.0.0",
				},
			}),
			"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
				name: "@cloudflare/vite-plugin",
				version: "2.0.0-beta.v.13",
			}),
			"cloudflare.config.ts": "export default {};",
			"vite.config.ts": `import { cloudflare } from "@cloudflare/vite-plugin"; export default { plugins: [cloudflare()] };`,
			"node_modules/vite/package.json": JSON.stringify({
				name: "vite",
				version: "8.1.0",
				bin: { vite: "bin/vite.js" },
			}),
			"node_modules/vite/bin/vite.js": buildScript("vite-worker"),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.161.0",
			}),
			"node_modules/wrangler/bin/cf-wrangler.js": nodeScript(
				'require("node:fs").writeFileSync("wrangler-argv.out", process.argv.slice(2).join("\\n") + "\\n"); process.exit(99);'
			),
		});
		chmod("node_modules/vite/bin/vite.js");
		chmod("node_modules/wrangler/bin/cf-wrangler.js");

		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(0);
		expect(readArgv("argv.out")).toEqual(["build"]);
	});

	it.each([false, true])(
		"passes mode and Preview context to native Vite (Preview: %s)",
		async (isPreview) => {
			vi.stubEnv("CLOUDFLARE_PREVIEW_BUILD", undefined);
			vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "2.0.0-beta.v.13",
				}),
				"cloudflare.config.ts": "export default {};",
				"vite.config.ts": `import { cloudflare } from "@cloudflare/vite-plugin"; export default { plugins: [cloudflare()] };`,
				"node_modules/vite/package.json": JSON.stringify({
					name: "vite",
					version: "8.1.0",
					bin: { vite: "bin/vite.js" },
				}),
				"node_modules/vite/bin/vite.js": buildScript(
					"vite-worker",
					'fs.writeFileSync("env.out", JSON.stringify([process.env.CLOUDFLARE_PREVIEW_BUILD, process.env.CLOUDFLARE_CF_AUTH, process.env.CLOUDFLARE_API_TOKEN]));'
				),
				".env": "CLOUDFLARE_API_TOKEN=file-token",
			});
			chmod("node_modules/vite/bin/vite.js");

			await runBuild("staging", {}, { isPreview });

			expect(readArgv("argv.out")).toEqual(["build", "--mode", "staging"]);
			expect(JSON.parse(readFileSync("env.out", "utf8"))).toEqual([
				isPreview ? "true" : null,
				"true",
				null,
			]);
		}
	);

	it("builds a Preview through Vite+ selected by autoconfig", async () => {
		vi.stubEnv("CLOUDFLARE_PREVIEW_BUILD", undefined);
		await seed({
			"cloudflare.config.ts": "export default {};",
			"vite.config.ts": `import { cloudflare } from "@cloudflare/vite-plugin"; export default { plugins: [cloudflare()] };`,
			"package.json": JSON.stringify({
				devDependencies: {
					"@cloudflare/vite-plugin": "beta",
					"vite-plus": "1.5.0",
					wrangler: "^4.136.0",
				},
			}),
			"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
				version: "2.0.0-beta.v.13",
			}),
			"node_modules/vite-plus/package.json": JSON.stringify({
				name: "vite-plus",
				version: "1.5.0",
				bin: { vp: "bin/vp.js" },
			}),
			"node_modules/vite-plus/bin/vp.js": buildScript(
				"vite-plus-worker",
				'fs.writeFileSync("preview.out", process.env.CLOUDFLARE_PREVIEW_BUILD ?? "");'
			),
		});
		chmod("node_modules/vite-plus/bin/vp.js");

		await runBuild("staging", {}, { isPreview: true });

		expect(readArgv("argv.out")).toEqual(["build", "--mode", "staging"]);
		expect(readFileSync("preview.out", "utf8")).toBe("true");
	});

	it.each([
		["deploy"],
		["workers", "versions", "create"],
		["previews", "deploy", "--preview-name", "feature"],
	])("runs the native Vite build before %s", async (...command) => {
		vi.stubEnv("CLOUDFLARE_PREVIEW_BUILD", undefined);
		await seed({
			"package.json": JSON.stringify({
				devDependencies: { "@cloudflare/vite-plugin": "beta" },
			}),
			"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
				name: "@cloudflare/vite-plugin",
				version: "2.0.0-beta.v.13",
			}),
			"cloudflare.config.ts": "export default {};",
			"vite.config.ts": `import { cloudflare } from "@cloudflare/vite-plugin"; export default { plugins: [cloudflare()] };`,
			"node_modules/vite/package.json": JSON.stringify({
				name: "vite",
				version: "8.1.0",
				bin: { vite: "bin/vite.js" },
			}),
			"node_modules/vite/bin/vite.js": nodeScript(
				[
					'const fs = require("node:fs");',
					'fs.writeFileSync("argv.out", process.argv.slice(2).join("\\n"));',
					'fs.writeFileSync("env.out", process.env.CLOUDFLARE_PREVIEW_BUILD ?? "");',
					"process.exit(17);",
				].join("\n")
			),
		});
		chmod("node_modules/vite/bin/vite.js");

		const { exitCode } = await runCf([...command, "--mode", "staging"]);

		expect(exitCode).toBe(17);
		expect(readArgv("argv.out")).toEqual(["build", "--mode", "staging"]);
		expect(readFileSync("env.out", "utf8")).toBe(
			command[0] === "previews" ? "true" : ""
		);
	});

	it("uses wrangler as the fallback delegate", async () => {
		await seed({
			"package.json": JSON.stringify({
				devDependencies: { wrangler: "^4.0.0" },
			}),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.161.0",
			}),
			"node_modules/wrangler/bin/cf-wrangler.js":
				buildScript("wrangler-worker"),
		});
		chmod("node_modules/wrangler/bin/cf-wrangler.js");

		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(0);
		expect(readArgv("argv.out")).toEqual(["build"]);
	});

	it("keeps stdout for output, sending its messages and the delegate's output to stderr", async () => {
		await seed({
			"package.json": JSON.stringify({
				devDependencies: { wrangler: "^4.0.0" },
			}),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.161.0",
			}),
			"node_modules/wrangler/bin/cf-wrangler.js":
				buildScript("wrangler-worker"),
		});
		chmod("node_modules/wrangler/bin/cf-wrangler.js");
		const stdout = vi
			.spyOn(process.stdout, "write")
			.mockImplementation(() => true);
		const stderr = vi
			.spyOn(process.stderr, "write")
			.mockImplementation(() => true);
		onTestFinished(() => {
			stdout.mockRestore();
			stderr.mockRestore();
		});

		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(0);
		expect(std.out).toBe("");
		expect(stdout).not.toHaveBeenCalled();
		expect(
			stderr.mock.calls.map(([chunk]) => String(chunk)).join("")
		).toContain("Build complete");
		expect(vi.mocked(x).mock.lastCall?.[2]?.nodeOptions?.stdio?.[1]).toBe(
			process.stderr
		);
	});

	it("forwards --mode to the delegate", async () => {
		await seed({
			"package.json": JSON.stringify({
				devDependencies: { wrangler: "^4.0.0" },
			}),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.161.0",
			}),
			"node_modules/wrangler/bin/cf-wrangler.js": buildScript("mode-worker"),
		});
		chmod("node_modules/wrangler/bin/cf-wrangler.js");

		const result = await runCf(["build", "--mode", "staging"]);

		expect(result.exitCode).toBe(0);
		expect(readArgv("argv.out")).toEqual(["build", "--mode", "staging"]);
	});

	it("rejects mode for Preview builds when the framework does not support it", async () => {
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

		await expect(runBuild("staging", {}, { isPreview: true })).rejects.toThrow(
			"The detected command `ng build --prod` does not currently support `--mode`."
		);
	});

	it("runs the detected framework build command", async () => {
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
			"node_modules/.bin/astro": buildScript("astro-worker"),
		});
		chmod("node_modules/.bin/astro", true);

		const result = await runCf(["build", "--mode", "staging"]);

		expect(result.exitCode).toBe(0);
		expect(readArgv("argv.out")).toEqual(["build", "--mode", "staging"]);
		expect(vi.mocked(x).mock.lastCall?.[2]?.nodeOptions?.stdio?.[1]).toBe(
			process.stderr
		);
	});

	it("builds a workspace application with the hoisted framework executable", async () => {
		await seed({
			"package.json": JSON.stringify({
				name: "workspace-root",
				packageManager: "pnpm@10.0.0",
			}),
			"pnpm-workspace.yaml": "packages: ['packages/*']\n",
			"pnpm-lock.yaml": "",
			"packages/app/cloudflare.config.ts": "export default {};",
			"packages/app/package.json": JSON.stringify({
				name: "astro-project",
				dependencies: { astro: "^5.0.0" },
				scripts: { build: "cf build" },
			}),
			"node_modules/astro/package.json": JSON.stringify({
				name: "astro",
				version: "5.0.0",
			}),
			"node_modules/.bin/astro": buildScript("astro-worker"),
		});
		chmod("node_modules/.bin/astro", true);
		process.chdir(resolve("packages/app"));

		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(0);
		expect(readArgv("argv.out")).toEqual(["build"]);
		expect(vi.mocked(x).mock.lastCall?.[0]).toBe("astro");
		expect(std.err).not.toContain("No lock file");
		expect(readFileSync("package.json", "utf8")).toContain(
			'"build":"cf build"'
		);
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
			"node_modules/.bin/vite": buildScript(
				"vinext-worker",
				'fs.writeFileSync("env.out", process.env.CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT ?? "");'
			),
		});
		chmod("node_modules/.bin/vite", true);

		const result = await runCf(["build", "--mode", "staging"]);

		expect(result.exitCode).toBe(0);
		expect(readArgv("argv.out")).toEqual(["build", "--mode", "staging"]);
		expect(readFileSync(resolve(process.cwd(), "env.out"), "utf8")).toBe(
			"true"
		);
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

		await expect(runCf(["build", "--mode", "staging"])).rejects.toThrow(
			"The detected command `ng build --prod` does not currently support `--mode`."
		);
	});

	it("runs a detected Vite build command with its environment", async () => {
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
			"node_modules/.bin/vite": buildScript(
				"vite-worker",
				'fs.writeFileSync("env.out", process.env.CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT ?? "");'
			),
		});
		chmod("node_modules/.bin/vite", true);

		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(0);
		expect(readFileSync(resolve(process.cwd(), "env.out"), "utf8")).toBe(
			"true"
		);
	});

	it("runs a detected Vite Preview build with its combined environment", async () => {
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
			"node_modules/.bin/vite": buildScript(
				"vite-preview-worker",
				'fs.writeFileSync("env.out", [process.env.CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT, process.env.CLOUDFLARE_PREVIEW_BUILD].join("\\n"));'
			),
		});
		chmod("node_modules/.bin/vite", true);

		await runBuild("staging", {}, { isPreview: true });

		expect(readArgv("argv.out")).toEqual(["build", "--mode", "staging"]);
		expect(readFileSync(resolve(process.cwd(), "env.out"), "utf8")).toBe(
			"true\ntrue"
		);
	});

	it("propagates non-zero delegate exit and skips output validation", async () => {
		await seed({
			"package.json": JSON.stringify({
				devDependencies: { wrangler: "^4.0.0" },
			}),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.161.0",
			}),
			"node_modules/wrangler/bin/cf-wrangler.js": nodeScript(
				'require("node:fs").writeFileSync("argv.out", process.argv.slice(2).join("\\n") + "\\n"); process.exit(17);'
			),
		});
		chmod("node_modules/wrangler/bin/cf-wrangler.js");

		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(17);
		expect(readArgv("argv.out")).toEqual(["build"]);
	});

	it.each([
		{ output: "missing", canonical: false },
		{ output: "missing", canonical: true },
		{ output: "malformed", canonical: false },
	])(
		"explains $output Build Output after running Vite (canonical: $canonical)",
		async ({ output, canonical }) => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: {
						"@cloudflare/vite-plugin": "beta",
						...(canonical ? { vite: "8.1.0" } : {}),
					},
				}),
				"cloudflare.config.ts": "export default {};",
				"vite.config.ts": "export default { plugins: [] };",
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					version: "2.0.0-beta.v.13",
				}),
				"node_modules/vite/package.json": JSON.stringify({
					bin: { vite: "cli.js" },
				}),
				"node_modules/.bin/vite": nodeScript(
					'require("node:fs").writeFileSync("argv.out", process.argv.slice(2).join("\\n"));'
				),
				"node_modules/vite/cli.js": nodeScript(
					'require("node:fs").writeFileSync("argv.out", process.argv.slice(2).join("\\n"));'
				),
				...(output === "malformed"
					? { ".cloudflare/output/v0/config.json": "{ invalid json" }
					: {}),
			});
			makeExecutable("node_modules/vite/cli.js");
			makeExecutable("node_modules/.bin/vite", { npmBin: true });
			const build = runBuild();
			await expect(build).rejects.toThrow(BuildOutputError);
			if (output === "missing") {
				await expect(build).rejects.toThrow(
					"Check that your Vite config includes cloudflare() from @cloudflare/vite-plugin."
				);
			} else {
				await expect(build).rejects.toThrow("could not parse JSON");
				await expect(build).rejects.not.toThrow("Check that your Vite config");
			}
			expect(readArgv("argv.out")).toEqual(["build"]);
		}
	);

	it("fails when a successful delegate does not emit build output", async () => {
		await seed({
			"package.json": JSON.stringify({
				devDependencies: { wrangler: "^4.0.0" },
			}),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.161.0",
			}),
			"node_modules/wrangler/bin/cf-wrangler.js": nodeScript(
				'require("node:fs").writeFileSync("argv.out", process.argv.slice(2).join("\\n") + "\\n");'
			),
		});
		chmod("node_modules/wrangler/bin/cf-wrangler.js");

		await expect(runCf(["build"])).rejects.toThrow(BuildOutputError);
	});
});

function buildScript(workerName: string, extra = ""): string {
	const workerDir = ".cloudflare/output/v0/workers/default";
	return nodeScript(
		[
			'const fs = require("node:fs");',
			'fs.writeFileSync("argv.out", process.argv.slice(2).join("\\n") + "\\n");',
			`fs.mkdirSync(${JSON.stringify(`${workerDir}/bundle`)}, { recursive: true });`,
			`fs.writeFileSync(".cloudflare/output/v0/config.json", ${JSON.stringify(buildOutputRootConfig())});`,
			`fs.writeFileSync(${JSON.stringify(`${workerDir}/worker.config.json`)}, ${JSON.stringify(workerConfig({ name: workerName }))});`,
			`fs.writeFileSync(${JSON.stringify(`${workerDir}/bundle/index.js`)}, "export default {}");`,
			extra,
		].join("\n")
	);
}

function chmod(path: string, npmBin = false): void {
	makeExecutable(path, { npmBin });
}

function readArgv(path: string): string[] {
	return readFileSync(resolve(process.cwd(), path), "utf-8").trim().split("\n");
}

/** Join the lines an error frame wrapped, so a long path can't split a phrase. */
function unframe(text: string): string {
	return text.replaceAll("\n│ ", " ");
}
