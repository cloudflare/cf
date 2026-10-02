import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vitest";
import { runBuild } from "../../../commands/build/index.js";
import { BuildOutputError } from "../../../lib/build-output.js";
import { makeExecutable, nodeScript } from "../../helpers/executable.js";
import { runCf } from "../../helpers/run-cf.js";
import { buildOutputRootConfig, workerConfig } from "../deploy/helpers.js";

describe("cf build", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	it("errors with install hints when no impl is declared", async () => {
		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(1);
		expect(std.err).toMatch(/No Cloudflare dev-server is installed/);
		expect(std.err).toMatch(/@cloudflare\/vite-plugin/);
		expect(std.err).toMatch(/wrangler/);
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
		expect(std.err).toMatch(/wrangler@4\.136\.0 or newer/);
		expect(std.err).not.toMatch(/wrangler .* is not installed/);
	});

	it("uses the vite delegate when vite and wrangler are both declared", async () => {
		await seed({
			"package.json": JSON.stringify({
				devDependencies: {
					"@cloudflare/vite-plugin": "beta",
					wrangler: "^4.0.0",
				},
			}),
			"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
				name: "@cloudflare/vite-plugin",
				version: "2.0.0-beta.sha-805ec1ff3",
			}),
			"node_modules/@cloudflare/vite-plugin/bin/cf-vite":
				buildScript("vite-worker"),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.136.0",
			}),
			"node_modules/wrangler/bin/cf-wrangler.js": nodeScript(
				'require("node:fs").writeFileSync("wrangler-argv.out", process.argv.slice(2).join("\\n") + "\\n"); process.exit(99);'
			),
		});
		chmod("node_modules/@cloudflare/vite-plugin/bin/cf-vite");
		chmod("node_modules/wrangler/bin/cf-wrangler.js");

		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(0);
		expect(readArgv("argv.out")).toEqual(["build"]);
	});

	it("uses wrangler as the fallback delegate", async () => {
		await seed({
			"package.json": JSON.stringify({
				devDependencies: { wrangler: "^4.0.0" },
			}),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.136.0",
			}),
			"node_modules/wrangler/bin/cf-wrangler.js":
				buildScript("wrangler-worker"),
		});
		chmod("node_modules/wrangler/bin/cf-wrangler.js");

		const result = await runCf(["build"]);

		expect(result.exitCode).toBe(0);
		expect(readArgv("argv.out")).toEqual(["build"]);
	});

	it("forwards --mode to the delegate", async () => {
		await seed({
			"package.json": JSON.stringify({
				devDependencies: { wrangler: "^4.0.0" },
			}),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.136.0",
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
			"The detected command `npx ng build --prod` does not currently support `--mode`."
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
			"The detected command `npx ng build --prod` does not currently support `--mode`."
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
				version: "4.136.0",
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

	it("fails when a successful delegate does not emit build output", async () => {
		await seed({
			"package.json": JSON.stringify({
				devDependencies: { wrangler: "^4.0.0" },
			}),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.136.0",
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
