import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { makeExecutable, nodeScript } from "../../helpers/executable.js";
import { runCf } from "../../helpers/run-cf.js";

/**
 * cloudflare/cf#60: in npm/Bun workspaces the Worker's tool is hoisted to
 * the workspace root's node_modules, where Node resolution finds it from
 * the Worker's directory.
 */
describe("cf build in a workspace with hoisted tools", () => {
	runInTempDir();
	const std = mockConsoleMethods();
	afterEach(() => vi.restoreAllMocks());

	it("runs a wrangler declared in the Worker's package.json but hoisted to the workspace root", async () => {
		await seed({
			"package.json": JSON.stringify({
				name: "workspace",
				workspaces: ["controlplane"],
			}),
			"controlplane/package.json": JSON.stringify({
				name: "controlplane",
				devDependencies: { wrangler: "4.163.0" },
			}),
			"node_modules/wrangler/package.json": JSON.stringify({
				name: "wrangler",
				version: "4.163.0",
			}),
			"node_modules/wrangler/bin/cf-wrangler.js": nodeScript(
				'require("node:fs").writeFileSync("delegate-started.out", "started");'
			),
		});
		makeExecutable("node_modules/wrangler/bin/cf-wrangler.js");
		process.chdir(resolve("controlplane"));

		await runCf(["build"]).catch(() => undefined);

		expect(std.err).not.toMatch(/but is not installed/);
		expect(existsSync("delegate-started.out")).toBe(true);
	});

	it("runs Vite for a Worker directory without its own package.json, with the plugin at the workspace root", async () => {
		await seed({
			"package.json": JSON.stringify({
				name: "workspace",
				workspaces: ["packages/*"],
				devDependencies: { "@cloudflare/vite-plugin": "^2.0.0-rc.0" },
			}),
			"packages/api/package.json": JSON.stringify({ name: "api" }),
			"packages/api/src/register/cloudflare.config.ts": "export default {};",
			"packages/api/src/register/vite.config.ts": `import { cloudflare } from '@cloudflare/vite-plugin'; export default { plugins: [cloudflare()] };`,
			"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
				version: "2.0.0-rc.0",
			}),
			"node_modules/vite/package.json": JSON.stringify({
				bin: { vite: "cli.js" },
			}),
			"node_modules/.bin/vite": nodeScript('require("../vite/cli.js");'),
			"node_modules/vite/cli.js": nodeScript(
				'require("node:fs").writeFileSync("argv.json", JSON.stringify(process.argv.slice(2)));'
			),
		});
		makeExecutable("node_modules/vite/cli.js");
		makeExecutable("node_modules/.bin/vite", { npmBin: true });
		process.chdir(resolve("packages/api/src/register"));

		await runCf(["build", "--mode", "staging"]).catch(() => undefined);

		expect(std.err).not.toMatch(/No Cloudflare dev server is installed/);
		expect(existsSync("argv.json")).toBe(true);
		expect(JSON.parse(readFileSync("argv.json", "utf8"))[0]).toBe("build");
	});
});
