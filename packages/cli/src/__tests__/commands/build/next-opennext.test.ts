import { existsSync, readFileSync } from "node:fs";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it, vi } from "vite-plus/test";
import { makeExecutable, nodeScript } from "../../helpers/executable.js";
import { runCf } from "../../helpers/run-cf.js";

// Next.js below 16 is configured with @opennextjs/cloudflare, whose build
// emits its own Worker in .open-next rather than cf Build Output v1.
const mocks = vi.hoisted(() => ({
	runAutoConfig: vi.fn(),
}));

vi.mock("@cloudflare/autoconfig", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@cloudflare/autoconfig")>();
	mocks.runAutoConfig.mockImplementation(() => {
		// Real setup runs `@opennextjs/cloudflare migrate` and rewrites the
		// project; fail loudly instead of reaching the network.
		throw new Error("framework setup ran");
	});
	return { ...actual, runAutoConfig: mocks.runAutoConfig };
});

const unsupportedRoute = /OpenNext[\s\S]*Wrangler|Wrangler[\s\S]*OpenNext/i;

function nextPackageJson(extra: Record<string, unknown> = {}): string {
	return JSON.stringify({
		name: "next-app",
		dependencies: { next: "15.5.0" },
		scripts: { build: "next build" },
		...extra,
	});
}

describe("cf build for a Next.js 15 project (OpenNext)", () => {
	runInTempDir();
	mockConsoleMethods();

	it("rejects before framework setup changes any project file", async () => {
		const packageJson = nextPackageJson();
		await seed({
			"package.json": packageJson,
			"package-lock.json": "{}",
			"node_modules/next/package.json": JSON.stringify({
				name: "next",
				version: "15.5.0",
			}),
		});

		await expect(runCf(["build"])).rejects.toThrow(unsupportedRoute);

		expect(mocks.runAutoConfig).not.toHaveBeenCalled();
		expect(readFileSync("package.json", "utf8")).toBe(packageJson);
		expect(existsSync("cloudflare.config.ts")).toBe(false);
		expect(existsSync("wrangler.jsonc")).toBe(false);
	});

	it("rejects on a repeat run before building a project OpenNext already set up", async () => {
		await seed({
			"package.json": nextPackageJson({
				devDependencies: { "@opennextjs/cloudflare": "^1.9.0", cf: "*" },
				scripts: {
					build: "next build",
					deploy: "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
				},
			}),
			"package-lock.json": "{}",
			"node_modules/next/package.json": JSON.stringify({
				name: "next",
				version: "15.5.0",
			}),
			"node_modules/@opennextjs/cloudflare/package.json": JSON.stringify({
				name: "@opennextjs/cloudflare",
				version: "1.9.0",
			}),
			"open-next.config.ts": "export default {};",
			"wrangler.jsonc": JSON.stringify({
				name: "next-app",
				main: ".open-next/worker.js",
				compatibility_date: "2025-01-01",
				assets: { directory: ".open-next/assets", binding: "ASSETS" },
			}),
			"cloudflare.config.ts": "export default { name: 'next-app' };",
			// OpenNext builds its own Worker, but no cf Build Output.
			"node_modules/.bin/next": nodeScript(
				[
					'const fs = require("node:fs");',
					'fs.writeFileSync("build-ran.out", "next");',
					'fs.mkdirSync(".open-next/assets", { recursive: true });',
					'fs.writeFileSync(".open-next/worker.js", "export default {}");',
				].join("\n")
			),
		});
		makeExecutable("node_modules/.bin/next", { npmBin: true });

		await expect(runCf(["build"])).rejects.toThrow(unsupportedRoute);

		expect(mocks.runAutoConfig).not.toHaveBeenCalled();
		expect(existsSync("build-ran.out")).toBe(false);
	});
});
