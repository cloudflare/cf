import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * `--file` only fills the multipart payload field (`_headers` for Pages
 * deployments). Every other `format: binary` field needs its own flag;
 * before this, a Pages Direct Upload could not include `_worker.js`.
 */
describe("multipart binary fields beyond the payload", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
		DO_NOT_TRACK: "1",
	};
	const DEPLOYMENTS_URL = `${TEST_BASE_URL}/accounts/test-account/pages/projects/site/deployments`;
	const WORKER =
		"export default { fetch: (request, env) => env.APP.fetch(request) };\n";
	const ROUTES = '{"version":1,"include":["/*"],"exclude":[]}\n';

	let logSpy: ReturnType<typeof vi.spyOn>;
	let errSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
		writeFileSync("_worker.js", WORKER);
		writeFileSync("_routes.json", ROUTES);
	});

	afterEach(() => {
		logSpy.mockRestore();
		errSpy.mockRestore();
	});

	it("uploads each file to its own form field", async () => {
		let form: FormData | undefined;
		server.use(
			http.post(DEPLOYMENTS_URL, async ({ request }) => {
				form = await request.formData();
				return HttpResponse.json({ success: true, result: { id: "d1" } });
			})
		);

		const { exitCode } = await runCf(
			[
				"pages",
				"deployments",
				"create",
				"site",
				"--manifest",
				"{}",
				"--branch",
				"main",
				"--worker-js",
				"@_worker.js",
				"--routes-json",
				"@_routes.json",
				"--quiet",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		if (!form) {
			throw new Error("No deployment request was sent");
		}
		expect(form.get("manifest")).toBe("{}");
		expect(form.get("branch")).toBe("main");
		const worker = form.get("_worker.js");
		expect(worker).toBeInstanceOf(File);
		expect(await (worker as File).text()).toBe(WORKER);
		expect((worker as File).name).toBe("_worker.js");
		expect(await (form.get("_routes.json") as File).text()).toBe(ROUTES);
		// The payload field is only sent when --file is passed.
		expect(form.has("_headers")).toBe(false);
	});

	it.each([
		["worker-js", "_worker.js", WORKER],
		["worker-js", "_worker.js", "_worker.js"],
		["worker-js", "_worker.js", ""],
		["routes-json", "_routes.json", ROUTES],
		["redirects", "_redirects", "/old /new 301\n"],
		["worker-bundle", "_worker.bundle", "--boundary\r\n// λ\n--boundary--\r\n"],
		[
			"functions-filepath-routing-config-json",
			"functions-filepath-routing-config.json",
			'{"routes":[]}\n',
		],
	])(
		"uploads inline --%s content as a file named %s (%j)",
		async (flag, field, content) => {
			let form: FormData | undefined;
			server.use(
				http.post(DEPLOYMENTS_URL, async ({ request }) => {
					form = await request.formData();
					return HttpResponse.json({ success: true, result: { id: "d1" } });
				})
			);
			const { exitCode } = await runCf(
				["pages", "deployments", "create", "site", `--${flag}=${content}`],
				ENV
			);
			expect(exitCode).toBe(0);
			const file = form?.get(field) as File;
			expect(file).toBeInstanceOf(File);
			expect(file.name).toBe(field);
			expect(Buffer.from(await file.arrayBuffer())).toEqual(
				Buffer.from(content)
			);
		}
	);

	it("uploads an empty file token consistently with other body flags", async () => {
		writeFileSync("empty.js", "");
		let form: FormData | undefined;
		server.use(
			http.post(DEPLOYMENTS_URL, async ({ request }) => {
				form = await request.formData();
				return HttpResponse.json({ success: true, result: { id: "d1" } });
			})
		);
		await runCf(
			["pages", "deployments", "create", "site", "--worker-js", "@empty.js"],
			ENV
		);
		const worker = form?.get("_worker.js") as File;
		expect(worker).toBeInstanceOf(File);
		expect(worker.name).toBe("empty.js");
		expect(worker.size).toBe(0);
	});

	it.each([
		["worker-js", "_worker.js"],
		["routes-json", "_routes.json"],
		["redirects", "_redirects"],
		["worker-bundle", "_worker.bundle"],
		[
			"functions-filepath-routing-config-json",
			"functions-filepath-routing-config.json",
		],
	])("previews --%s as a multipart body", async (flag, filename) => {
		const { exitCode } = await runCf(
			[
				"pages",
				"deployments",
				"create",
				"site",
				"--manifest",
				"{}",
				`--${flag}`,
				`@${filename}`,
				"--dry-run",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		const preview = JSON.parse(String(logSpy.mock.calls[0]?.[0])) as {
			bodyKind: string;
			body: Record<string, unknown>;
		};
		expect(preview.bodyKind).toBe("multipart");
		expect(preview.body[flag]).toBe(`@${filename}`);
		expect(preview.body.manifest).toBe("{}");
	});

	it.each([
		["@", "must be followed by a file path"],
		["@missing.js", "--worker-js: cannot read file"],
		["@directory", "--worker-js: cannot read file"],
	])(
		"rejects invalid file token %s before sending the request",
		async (token, message) => {
			mkdirSync("directory");
			let called = false;
			server.use(
				http.post(DEPLOYMENTS_URL, () => {
					called = true;
					return HttpResponse.json({ success: true, result: null });
				})
			);

			await expect(
				runCf(
					[
						"pages",
						"deployments",
						"create",
						"site",
						"--manifest",
						"{}",
						"--worker-js",
						token,
						"--quiet",
					],
					ENV
				)
			).rejects.toThrow(message);
			expect(called).toBe(false);
		}
	);

	it.each([
		["redirects", "_redirects"],
		["worker-bundle", "_worker.bundle"],
		[
			"functions-filepath-routing-config-json",
			"functions-filepath-routing-config.json",
		],
	])("uploads --%s to the original field %s", async (flag, field) => {
		writeFileSync("input.bin", Buffer.from([0, 255, 128, 10]));
		let form: FormData | undefined;
		server.use(
			http.post(DEPLOYMENTS_URL, async ({ request }) => {
				form = await request.formData();
				return HttpResponse.json({ success: true, result: { id: "d1" } });
			})
		);
		await runCf(
			[
				"pages",
				"deployments",
				"create",
				"site",
				"--manifest",
				"{}",
				`--${flag}`,
				"@input.bin",
			],
			ENV
		);
		if (!form) {
			throw new Error("No deployment request was sent");
		}
		const file = form.get(field) as File;
		expect(file).toBeInstanceOf(File);
		expect(file.name).toBe("input.bin");
		expect(Buffer.from(await file.arrayBuffer())).toEqual(
			Buffer.from([0, 255, 128, 10])
		);
		expect(form.has("_headers")).toBe(false);
	});

	it("combines --file with an additional file and preserves filenames from native paths", async () => {
		mkdirSync("upload dir");
		const path = join("upload dir", "worker λ.js");
		writeFileSync(path, WORKER);
		writeFileSync("headers.txt", "/*\n  X-Test: example\n");
		let form: FormData | undefined;
		server.use(
			http.post(DEPLOYMENTS_URL, async ({ request }) => {
				form = await request.formData();
				return HttpResponse.json({ success: true, result: { id: "d1" } });
			})
		);
		await runCf(
			[
				"pages",
				"deployments",
				"create",
				"site",
				"--manifest",
				"{}",
				"--file",
				"headers.txt",
				"--worker-js",
				`@${path}`,
			],
			ENV
		);
		if (!form) {
			throw new Error("No deployment request was sent");
		}
		const worker = form.get("_worker.js") as File;
		expect(worker.name).toBe("worker λ.js");
		expect(await worker.text()).toBe(WORKER);
		expect(await (form.get("_headers") as File).text()).toBe(
			"/*\n  X-Test: example\n"
		);
	});

	it.each([
		["@_worker.js", "_worker.js"],
		[WORKER, "source"],
	])(
		"uploads source %j as a file named %s without a primary file",
		async (source, filename) => {
			let form: FormData | undefined;
			server.use(
				http.post(
					`${TEST_BASE_URL}/accounts/test-account/cloudforce-one/v2/requests/threat-intelligence/rfi-id/assets/upload`,
					async ({ request }) => {
						form = await request.formData();
						return HttpResponse.json({
							success: true,
							result: { id: "asset-id" },
						});
					}
				)
			);
			await runCf(
				[
					"cloudforce-one",
					"requests",
					"assets",
					"upload",
					"rfi-id",
					"--project-type",
					"threat-intelligence",
					"--source",
					source,
				],
				ENV
			);
			if (!form) {
				throw new Error("No asset upload request was sent");
			}
			const file = form.get("source") as File;
			expect(file).toBeInstanceOf(File);
			expect(file.name).toBe(filename);
			expect(Buffer.from(await file.arrayBuffer())).toEqual(
				Buffer.from(WORKER)
			);
			expect(form.has("file")).toBe(false);
		}
	);

	it("publishes the new flags in the command catalog", () => {
		const metadata = JSON.parse(
			readFileSync(
				new URL(
					"../../commands/_generated/_meta/commands.json",
					import.meta.url
				),
				"utf8"
			)
		);
		const pages = metadata.commands.find(
			(entry: { command: string }) =>
				entry.command === "cf pages deployments create"
		);
		for (const name of [
			"worker-js",
			"routes-json",
			"redirects",
			"worker-bundle",
			"functions-filepath-routing-config-json",
		]) {
			expect(pages.options).toContainEqual(
				expect.objectContaining({ name, type: "string", required: false })
			);
		}
		const assets = metadata.commands.find(
			(entry: { command: string }) =>
				entry.command === "cf cloudforce-one requests assets upload"
		);
		expect(assets.options).toContainEqual(
			expect.objectContaining({
				name: "source",
				type: "string",
				required: false,
			})
		);
	});
});
