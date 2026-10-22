import { readFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
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
import type { CommandsMetadata } from "../../lib/command-meta.js";

describe("cf workers identifiers", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const ACCOUNT = `${TEST_BASE_URL}/accounts/test-account`;
	const flags = ["--worker", "--worker-id", "--script-name"];
	const commands = [
		{ args: ["get"], path: "/workers/workers/my-worker" },
		{ args: ["versions", "list"], path: "/workers/workers/my-worker/versions" },
		{
			args: ["versions", "get", "latest"],
			path: "/workers/workers/my-worker/versions/latest",
		},
		{
			args: ["deployments", "list"],
			path: "/workers/scripts/my-worker/deployments",
		},
		{ args: ["secrets", "list"], path: "/workers/scripts/my-worker/secrets" },
	];
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(process.stdout, "write").mockImplementation(() => true);
		vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});

	afterEach(() => vi.restoreAllMocks());

	it.each(["get", "delete"])(
		"%s help lists --worker as an option",
		async (name) => {
			await runCf(["workers", name, "--help"], ENV);
			expect(
				logSpy.mock.calls.map((call: unknown[]) => String(call[0])).join("\n")
			).toContain("--worker");
		}
	);

	for (const { args, path } of commands) {
		it.each(flags)(`${args.join(" ")} accepts %s`, async (flag) => {
			const request = vi.fn(() =>
				HttpResponse.json({ success: true, result: { id: "response-id" } })
			);
			server.use(http.get(`${ACCOUNT}${path}`, request));
			const result = await runCf(["workers", ...args, flag, "my-worker"], ENV);
			expect(result.exitCode).toBe(0);
			expect(request).toHaveBeenCalledOnce();
		});

		it(`${args.join(" ")} still requires a Worker`, async () => {
			await expect(runCf(["workers", ...args], ENV)).rejects.toThrow(
				"--worker <name>"
			);
		});

		it.each(flags)(`${args.join(" ")} previews %s`, async (flag) => {
			await runCf(["workers", ...args, flag, "my/worker", "--dry-run"], ENV);
			const output = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
			expect(output).toMatchObject({
				url: `https://api.cloudflare.com/client/v4/accounts/test-account${path.replace("my-worker", "my%2Fworker")}`,
				pathParams: { worker: "my/worker" },
			});
		});
	}

	it.each(["get", "delete"])(
		"%s retains positional Worker input",
		async (name) => {
			const request = vi.fn(() =>
				HttpResponse.json({ success: true, result: { id: "my-worker" } })
			);
			const route = `${ACCOUNT}/workers/workers/my-worker`;
			server.use((name === "delete" ? http.delete : http.get)(route, request));
			await runCf(
				[
					"workers",
					name,
					"my-worker",
					...(name === "delete" ? ["--force"] : []),
				],
				ENV
			);
			expect(request).toHaveBeenCalledOnce();
		}
	);

	it.each(flags)("delete accepts %s", async (flag) => {
		const request = vi.fn(() =>
			HttpResponse.json({ success: true, result: null })
		);
		server.use(http.delete(`${ACCOUNT}/workers/workers/my-worker`, request));
		await runCf(["workers", "delete", flag, "my-worker", "--force"], ENV);
		expect(request).toHaveBeenCalledOnce();
	});

	it("profile encodes --worker in the raw response request", async () => {
		const request = vi.fn(() => new HttpResponse("profile-data"));
		server.use(
			http.post(
				`${ACCOUNT}/workers/workers/my%2Fworker/versions/latest/profile`,
				request
			)
		);
		await runCf(
			[
				"workers",
				"versions",
				"profile",
				"latest",
				"--worker",
				"my/worker",
				"--duration-ms",
				"10",
			],
			ENV
		);
		expect(request).toHaveBeenCalledOnce();
	});

	it.each(flags)(
		"versions delete sends %s with the version positional",
		async (flag) => {
			const request = vi.fn(() =>
				HttpResponse.json({ success: true, result: null })
			);
			server.use(
				http.delete(
					`${ACCOUNT}/workers/workers/my-worker/versions/latest`,
					request
				)
			);
			await runCf(
				[
					"workers",
					"versions",
					"delete",
					"latest",
					flag,
					"my-worker",
					"--force",
				],
				ENV
			);
			expect(request).toHaveBeenCalledOnce();
		}
	);

	it("uses --worker throughout the secret, version, and deployment sequence", async () => {
		const secret = vi.fn(() =>
			HttpResponse.json({ success: true, result: {} })
		);
		const versions = vi.fn(() =>
			HttpResponse.json({ success: true, result: [] })
		);
		const deployment = vi.fn(() =>
			HttpResponse.json({ success: true, result: {} })
		);
		server.use(
			http.put(`${ACCOUNT}/workers/scripts/my-worker/secrets`, secret),
			http.get(`${ACCOUNT}/workers/workers/my-worker/versions`, versions),
			http.post(`${ACCOUNT}/workers/scripts/my-worker/deployments`, deployment)
		);
		await runCf(
			[
				"workers",
				"secrets",
				"update",
				"API_KEY",
				"--worker",
				"my-worker",
				"--text",
				"value",
				"--type",
				"secret_text",
			],
			ENV
		);
		await runCf(["workers", "versions", "list", "--worker", "my-worker"], ENV);
		await runCf(
			[
				"workers",
				"deployments",
				"create",
				"--worker",
				"my-worker",
				"--versions",
				'[{"version_id":"version-1","percentage":100}]',
				"--strategy",
				"percentage",
			],
			ENV
		);
		expect(secret).toHaveBeenCalledOnce();
		expect(versions).toHaveBeenCalledOnce();
		expect(deployment).toHaveBeenCalledOnce();
	});

	it("advertises the canonical flag and aliases in generated metadata", () => {
		const metadata = JSON.parse(
			readFileSync(
				new URL(
					"../../commands/_generated/_meta/commands.json",
					import.meta.url
				),
				"utf8"
			)
		) as CommandsMetadata;
		for (const { args } of commands) {
			const command = metadata.commands.find(
				(entry) =>
					entry.command ===
					`cf workers ${args.filter((arg) => arg !== "latest").join(" ")}`
			);
			expect(command?.options).toContainEqual(
				expect.objectContaining({
					name: "worker",
					required: true,
					alias: ["script-name", "worker-id"],
				})
			);
			expect(
				command?.options.some((option) => option.name === "worker-id")
			).toBe(false);
		}
		const get = metadata.commands.find(
			(entry) => entry.command === "cf workers get"
		);
		expect(get?.arguments).toMatchObject([{ name: "worker", required: false }]);
	});
});
