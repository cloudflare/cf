import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vite-plus/test";
import { makeExecutable, nodeScript } from "../../helpers/executable.js";
import { runCf } from "../../helpers/run-cf.js";
import { buildOutputRootConfig, workerConfig } from "./helpers.js";

/**
 * An Astro build like the reporter's: it writes static pages to `dist/` and
 * succeeds, but it never writes a Build Output Specification because the
 * project has no Cloudflare adapter or Vite plugin.
 */
const astroBuildScript = nodeScript(
	[
		'const fs = require("node:fs");',
		'fs.mkdirSync("dist", { recursive: true });',
		'fs.writeFileSync("dist/index.html", "<html>built</html>");',
		'fs.writeFileSync("astro-build.out", process.argv.slice(2).join("\\n") + "\\n");',
	].join("\n")
);

/** The Wrangler bundler delegate: writes a complete Build Output. */
const wranglerBuildScript = nodeScript(
	[
		'const fs = require("node:fs");',
		'fs.writeFileSync("cf-build-argv.out", process.argv.slice(2).join("\\n") + "\\n");',
		'fs.mkdirSync(".cloudflare/output/v1/workers/default/bundle", { recursive: true });',
		'fs.writeFileSync(".cloudflare/output/v1/config.json", ' +
		JSON.stringify(buildOutputRootConfig()) +
		");",
		'fs.writeFileSync(".cloudflare/output/v1/workers/default/worker.config.json", ' +
		JSON.stringify(workerConfig({ name: "example-site" })) +
		");",
		'fs.writeFileSync(".cloudflare/output/v1/workers/default/bundle/index.js", "export default {}");',
	].join("\n")
);

async function seedMigratedAstroProject(): Promise<void> {
	await seed({
		"cloudflare.config.ts": "export default {};",
		"package.json": JSON.stringify({
			name: "example-site",
			private: true,
			scripts: { build: "astro build" },
			dependencies: { astro: "7.4.10" },
			devDependencies: { cf: "1.0.0-beta.29", wrangler: "4.160.0" },
		}),
		"package-lock.json": "{}",
		"node_modules/astro/package.json": JSON.stringify({
			name: "astro",
			version: "7.4.10",
		}),
		"node_modules/.bin/astro": astroBuildScript,
		"node_modules/wrangler/package.json": JSON.stringify({
			name: "wrangler",
			version: "4.160.0",
		}),
		"node_modules/wrangler/bin/cf-wrangler.js": wranglerBuildScript,
	});
	makeExecutable("node_modules/.bin/astro", { npmBin: true });
	makeExecutable("node_modules/wrangler/bin/cf-wrangler.js");
}

describe("cf deploy on a migrated Astro + Worker project", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	it(
		"completes a --dry-run when the Astro build emits no Build Output " +
			"but the Wrangler bundler is available (#587)",
		async () => {
			await seedMigratedAstroProject();

			const { exitCode } = await runCf(["deploy", "--dry-run"], {
				CI: "true",
			});

			// The framework build runs and succeeds...
			expect(readArgv("astro-build.out")).toEqual([]);
			// ...and the deploy must not die on the missing Build Output the
			// Astro build never wrote, because `cf migrate` configured this
			// project for the Wrangler bundler.
			expect(exitCode).toBe(0);
			expect(std.out).toContain("--dry-run: exiting now.");
			expect(existsSync(".cloudflare/output/v1/config.json")).toBe(true);
		}
	);
});

function readArgv(path: string): string[] {
	return readFileSync(resolve(process.cwd(), path), "utf-8")
		.trim()
		.split("\n");
}
