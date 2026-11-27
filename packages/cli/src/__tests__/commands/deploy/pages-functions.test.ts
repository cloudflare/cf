import { readdirSync, readFileSync, statSync } from "node:fs";
import { sep } from "node:path";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test";
import { setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	buildDelegateWasCalled,
	buildOutputRootConfig,
	mockDefaultHandlers,
	mockWorkerUpload,
	recordRequests,
	seedBuildDelegate,
	workerConfig,
} from "./helpers.js";

const ciInfo = vi.hoisted(() => ({ isCI: false }));
vi.mock("ci-info", () => ({ default: ciInfo }));

function setTTY(
	stream: NodeJS.ReadStream | NodeJS.WriteStream,
	isTTY: boolean
) {
	const descriptor = Object.getOwnPropertyDescriptor(stream, "isTTY");
	Object.defineProperty(stream, "isTTY", { configurable: true, value: isTTY });
	onTestFinished(() => {
		if (descriptor) {
			Object.defineProperty(stream, "isTTY", descriptor);
		} else {
			Reflect.deleteProperty(stream, "isTTY");
		}
	});
}

const buildOutput = {
	".cloudflare/output/v1/config.json": buildOutputRootConfig(),
	".cloudflare/output/v1/workers/default/worker.config.json": workerConfig(),
	".cloudflare/output/v1/workers/default/bundle/index.js":
		"export default { fetch() { return new Response('ok'); } }",
};
const credentials = {
	CLOUDFLARE_API_TOKEN: "test-api-token",
	CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID,
};

function projectPaths() {
	return readdirSync(".", { encoding: "utf8", recursive: true })
		.filter((file) => file !== "home" && !file.startsWith(`home${sep}`))
		.sort();
}

describe("cf deploy with legacy Pages Functions", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();

	it.each([
		{ name: "CI with a terminal", ci: true, stdinTTY: true, args: [] },
		{ name: "piped stdin", ci: false, stdinTTY: false, args: [] },
		{
			name: "piped stdin with --quiet --dry-run",
			ci: false,
			stdinTTY: false,
			args: ["--quiet", "--dry-run"],
		},
	])(
		"stops before building or uploading in $name",
		async ({ ci, stdinTTY, args }) => {
			ciInfo.isCI = ci;
			onTestFinished(() => {
				ciInfo.isCI = false;
			});
			setTTY(process.stdin, stdinTTY);
			setTTY(process.stderr, true);
			const requests = recordRequests();
			await seedBuildDelegate();
			await seed({
				...buildOutput,
				"index.html": "<h1>Legacy Pages</h1>",
				"functions/hello.js":
					"export const onRequest = () => new Response('hello');",
			});
			const paths = projectPaths();
			const snapshot = Object.fromEntries(
				paths
					.filter((file) => statSync(file).isFile())
					.map((file) => [file, readFileSync(file)])
			);

			await expect(runCf(["deploy", ...args], credentials)).rejects.toThrow(
				"Migrate your Pages Functions to a Worker"
			);

			expect(std.err).toContain("omit the Pages Functions");
			expect(std.err).toContain("/migration-guides/migrate-from-pages/");
			expect(std.err).not.toContain("wrangler pages deploy");
			expect(std.err).not.toContain("No Cloudflare dev server");
			expect(std.out).toBe("");
			expect(buildDelegateWasCalled()).toBe(false);
			expect(requests).toEqual([]);
			expect(projectPaths()).toEqual(paths);
			for (const [file, contents] of Object.entries(snapshot)) {
				expect(readFileSync(file)).toEqual(contents);
			}
		}
	);

	it("keeps the build delegate fallback for unrelated detection failures", async () => {
		await seedBuildDelegate();
		await seed(buildOutput);
		mockDefaultHandlers();
		const upload = mockWorkerUpload();

		await expect(runCf(["deploy"], credentials)).resolves.toEqual({
			exitCode: 0,
		});

		expect(buildDelegateWasCalled()).toBe(true);
		expect(upload.metadata?.main_module).toBe("index.js");
	});
});
