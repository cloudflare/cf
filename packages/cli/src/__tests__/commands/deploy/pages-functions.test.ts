import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createMockDeployContext } from "../../helpers/mock-deploy-context.js";
import { setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	mockDefaultHandlers,
	mockWorkerUpload,
} from "./helpers.js";
import type * as Tinyexec from "tinyexec";

// Project commands (package installs, builds) must not run for a legacy Pages
// Functions project; record any attempt instead of spawning it.
const commands = vi.hoisted(() => ({ calls: [] as string[] }));
vi.mock("tinyexec", async (importOriginal) => {
	const actual = await importOriginal<typeof Tinyexec>();
	return {
		...actual,
		x: (file: string, args: string[] = []) => {
			commands.calls.push([file, ...args].join(" "));
			throw new Error(`unexpected project command: ${file} ${args.join(" ")}`);
		},
	};
});

vi.mock("../../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

const PACKAGE_JSON = JSON.stringify({ name: "pages-app", private: true });
const WRANGLER_TOML = [
	'name = "pages-app"',
	'pages_build_output_dir = "./public"',
	'compatibility_date = "2025-01-01"',
	"",
].join("\n");

async function runDeploy(argv: string[]): Promise<number> {
	try {
		return (await runCf(argv)).exitCode;
	} catch {
		return 1;
	}
}

// https://github.com/cloudflare/cf/issues/809
describe("cf deploy — legacy Pages Functions project, unattended", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(async () => {
		commands.calls = [];
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		await seed({
			"package.json": PACKAGE_JSON,
			"wrangler.toml": WRANGLER_TOML,
			"public/index.html": "<h1>hello</h1>",
			"functions/api/hello.js":
				'export const onRequest = () => new Response("hello from functions");',
		});
	});

	it.each([[["deploy"]], [["deploy", "--dry-run"]]])(
		"`cf %s` explains how to migrate the Pages Functions instead of setting up a static site",
		async (argv) => {
			const upload = mockWorkerUpload();

			const exitCode = await runDeploy(argv);

			// Actionable guidance naming the Pages Functions project.
			if (!argv.includes("--dry-run")) {
				expect(exitCode).not.toBe(0);
			}
			expect(std.err).toMatch(/Pages Functions/);
			expect(std.err).toMatch(/functions\//);
			// It must not treat the project as a static site that drops functions/.
			expect(std.err).not.toMatch(/Framework: Static/);

			// Nothing is installed, built or published.
			expect(commands.calls).toEqual([]);
			expect(upload.metadata).toBeUndefined();

			// The project's files are left as they were.
			expect(readFileSync("package.json", "utf8")).toBe(PACKAGE_JSON);
			expect(readFileSync("wrangler.toml", "utf8")).toBe(WRANGLER_TOML);
			expect(existsSync("cloudflare.config.ts")).toBe(false);
			expect(existsSync("wrangler.config.ts")).toBe(false);
			expect(existsSync(".gitignore")).toBe(false);
			expect(readdirSync(".").sort()).toEqual(
				["functions", "package.json", "public", "wrangler.toml"].sort()
			);
		}
	);
});
