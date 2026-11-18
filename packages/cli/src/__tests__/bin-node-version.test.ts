import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Regression tests for cloudflare/cf#684: the launcher's startup Node.js
 * check in `bin/cf` must agree with `engines.node` in package.json.
 *
 * The launcher is run in a child Node process with `process.versions.node`
 * overridden by a preload, so each case sees the Node version it simulates.
 */

const binPath = fileURLToPath(new URL("../../bin/cf", import.meta.url));
const packageJsonPath = fileURLToPath(
	new URL("../../package.json", import.meta.url)
);
const engines = JSON.parse(readFileSync(packageJsonPath, "utf8")).engines
	.node as string;

function runLauncherAs(nodeVersion: string) {
	const preload = `Object.defineProperty(process.versions, "node", { value: ${JSON.stringify(
		nodeVersion
	)} });`;
	return spawnSync(
		process.execPath,
		[
			"--import",
			`data:text/javascript,${encodeURIComponent(preload)}`,
			binPath,
			"--version",
		],
		{ encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } }
	);
}

describe("bin/cf startup Node.js version check", () => {
	it("declares the engine range the issue describes", () => {
		expect(engines).toBe("^22.23.0 || ^24.22.0 || ^26.12.0");
	});

	it("rejects an earlier Node 22 release outside the engine range with a version diagnostic", () => {
		const result = runLauncherAs("22.18.0");
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("22.18.0");
		expect(result.stderr).toContain("22.23.0");
	});

	it("points Node 20 users at the supported releases, not 'v22 or newer'", () => {
		const result = runLauncherAs("20.19.0");
		expect(result.status).toBe(1);
		expect(result.stderr).not.toContain("v22 or newer");
		expect(result.stderr).toContain("22.23.0");
		expect(result.stderr).toContain("24.22.0");
		expect(result.stderr).toContain("26.12.0");
	});
});
