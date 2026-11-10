import { writeFile } from "node:fs/promises";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runLiveTail } from "../../commands/observability/tail/stream.js";
import { mockOutputStreams } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

vi.mock("../../commands/observability/tail/stream.js", () => ({
	runLiveTail: vi.fn(),
}));

const API_ENV = {
	CLOUDFLARE_ACCOUNT_ID: "fixture-account",
	CLOUDFLARE_API_TOKEN: "fixture-token",
	CLOUDFLARE_API_BASE_URL: "http://127.0.0.1:1/client/v4",
};

describe("cf observability tail", () => {
	runInTempDir();
	const std = mockOutputStreams();

	beforeEach(() => {
		vi.mocked(runLiveTail).mockReset();
		vi.mocked(runLiveTail).mockResolvedValue(undefined);
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
	});

	it("uses the explicit deployed Worker name without inspecting Worker source config", async () => {
		await writeFile(
			"cloudflare.config.ts",
			'export default { accountId: "fixture-account", workers: [{ name: "other-worker", bindings: "invalid-on-purpose" }] };'
		);
		const result = await runCf(
			["observability", "tail", "--worker", "my-worker-staging"],
			API_ENV
		);
		expect(result.exitCode).toBe(0);
		expect(runLiveTail).toHaveBeenCalledWith(
			expect.objectContaining({
				accountId: "fixture-account",
				body: expect.objectContaining({
					scriptId: "my-worker-staging",
					filterCombination: "and",
				}),
				signal: expect.any(AbortSignal),
			})
		);
		expect(std.out).toBe("");
		expect(std.err).not.toMatch(/fixture-token|wsUrl|signed-secret/);
	});

	it.each(["observability"])(
		"tails the account by default through %s",
		async (root) => {
			await runCf([root, "tail"], API_ENV);
			expect(runLiveTail).toHaveBeenCalledWith(
				expect.objectContaining({
					body: { filters: [], filterCombination: "and" },
				})
			);
		}
	);

	it("rejects a positional Worker name", async () => {
		await expect(
			runCf(["observability", "tail", "my-worker"], API_ENV)
		).rejects.toThrow(/unknown|argument/i);
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it("keeps warnings on stderr when quiet suppresses notices", async () => {
		vi.mocked(runLiveTail).mockImplementationOnce(async ({ warn, notice }) => {
			notice?.("Connected to live tail.");
			warn?.("Skipped malformed live tail JSON.");
		});
		await runCf(["observability", "tail", "--quiet"], API_ENV);
		expect(std.out).toBe("");
		expect(std.err).toContain("Skipped malformed live tail JSON.");
		expect(std.err).not.toContain("Connected to live tail.");
	});

	it("passes account scope without silently selecting a project Worker", async () => {
		await runCf(["observability", "tail"], API_ENV);
		const options = vi.mocked(runLiveTail).mock.calls[0]?.[0];
		expect(options?.accountId).toBe("fixture-account");
		expect(options?.body.scriptId).toBeUndefined();
	});

	it("accepts native telemetry filter groups from a JSON file", async () => {
		const filters = [
			{
				kind: "group",
				filterCombination: "or",
				filters: [
					{
						key: "$metadata.service",
						operation: "eq",
						type: "string",
						value: "my-worker",
					},
					{
						key: "$metadata.message",
						operation: "includes",
						type: "string",
						value: "private search",
					},
				],
			},
		];
		await writeFile("filters.json", JSON.stringify(filters));
		await runCf(
			[
				"observability",
				"tail",
				"--filters",
				"@filters.json",
				"--filter-combination",
				"or",
			],
			API_ENV
		);
		expect(runLiveTail).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({ filters, filterCombination: "or" }),
			})
		);
		expect(std.out).toBe("");
		expect(std.err).not.toContain("private search");
	});

	it.each(["not-json", "{}", "[null]", "[1]"])(
		"rejects invalid --filters %s before opening a session",
		async (filters) => {
			await expect(
				runCf(
					[
						"observability",
						"tail",
						"--worker",
						"my-worker",
						"--filters",
						filters,
					],
					API_ENV
				)
			).rejects.toThrow(/filters|JSON|object|array/i);
			expect(runLiveTail).not.toHaveBeenCalled();
		}
	);

	it.each(["--format", "--sampling-rate", "--ip", "--header"])(
		"rejects unsupported classic option %s instead of ignoring it",
		async (flag) => {
			await expect(
				runCf(
					["observability", "tail", "--worker", "my-worker", flag, "value"],
					API_ENV
				)
			).rejects.toThrow(/unknown|argument|option/i);
			expect(runLiveTail).not.toHaveBeenCalled();
		}
	);

	it("combines shortcut filters using the requested telemetry combination", async () => {
		const native = {
			key: "$metadata.service",
			operation: "eq",
			type: "string",
			value: "my-worker",
		};
		await runCf(
			[
				"observability",
				"tail",
				"--worker",
				"my-worker",
				"--filters",
				JSON.stringify([native]),
				"--status",
				"error",
				"--status",
				"ok",
				"--status",
				"error",
				"--method",
				"get",
				"--method",
				"POST",
				"--search",
				"private message",
				"--version-id",
				"version-123",
				"--filter-combination",
				"or",
			],
			API_ENV
		);
		expect(vi.mocked(runLiveTail).mock.calls[0]?.[0].body).toEqual({
			scriptId: "my-worker",
			filterCombination: "or",
			filters: [
				native,
				{
					key: "$workers.outcome",
					operation: "in",
					type: "string",
					value: "exception,exceededCpu,exceededMemory,unknown,ok",
				},
				{
					kind: "group",
					filterCombination: "or",
					filters: ["GET ", "POST "].map((value) => ({
						key: "$metadata.trigger",
						operation: "starts_with",
						type: "string",
						value,
					})),
				},
				{
					key: "$metadata.message",
					operation: "includes",
					type: "string",
					value: "private message",
				},
				{
					key: "$workers.scriptVersion.id",
					operation: "eq",
					type: "string",
					value: "version-123",
				},
			],
		});
		expect(std.out).toBe("");
		expect(std.err).not.toContain("private message");
	});

	it("previews shortcut filters without credentials", async () => {
		await runCf([
			"observability",
			"tail",
			"--worker",
			"my-worker",
			"--status",
			"canceled",
			"--dry-run",
		]);
		expect(JSON.parse(std.out).body).toEqual({
			scriptId: "my-worker",
			filterCombination: "and",
			filters: [
				{
					key: "$workers.outcome",
					operation: "in",
					type: "string",
					value: "canceled",
				},
			],
		});
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it.each(["--status", "--method", "--search", "--version-id"])(
		"requires a value for %s before authenticating",
		async (flag) => {
			await expect(
				runCf(["observability", "tail", "--worker", "my-worker", flag])
			).rejects.toThrow(/argument|value/i);
			expect(runLiveTail).not.toHaveBeenCalled();
		}
	);

	it.each([
		["--status", "invalid"],
		["--method", ""],
		["--method", "GET /private"],
	])(
		"rejects an invalid %s value before authenticating",
		async (flag, value) => {
			await expect(
				runCf(["observability", "tail", "--worker", "my-worker", flag, value])
			).rejects.toThrow(/values|method/i);
			expect(runLiveTail).not.toHaveBeenCalled();
		}
	);

	it("rejects local mode before constructing a tail session", async () => {
		await expect(
			runCf(
				["observability", "tail", "--worker", "my-worker", "--local"],
				API_ENV
			)
		).rejects.toThrow(/--local.*not supported|not supported.*--local/i);
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it("previews scope and filters without credentials or opening a session", async () => {
		const filters = [
			{
				key: "$metadata.message",
				operation: "includes",
				type: "string",
				value: "hello",
			},
		];
		await runCf([
			"observability",
			"tail",
			"--worker",
			"my-worker",
			"--filters",
			JSON.stringify(filters),
			"--dry-run",
		]);
		expect(runLiveTail).not.toHaveBeenCalled();
		expect(JSON.parse(std.out)).toMatchObject({
			command: "cf observability tail",
			method: "POST",
			body: { scriptId: "my-worker", filters, filterCombination: "and" },
		});
		expect(std.out).not.toContain("fixture-token");
	});

	it("previews account scope without credentials", async () => {
		await runCf(["observability", "tail", "--dry-run"]);
		expect(JSON.parse(std.out)).toMatchObject({
			command: "cf observability tail",
			body: { filters: [], filterCombination: "and" },
		});
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it.each([
		["public", undefined, "https://api.cloudflare.com/client/v4"],
		["fedramp_high", undefined, "https://api.fed.cloudflare.com/client/v4"],
		[
			"fedramp_high",
			"http://127.0.0.1:1/client/v4/",
			"http://127.0.0.1:1/client/v4",
		],
	] as const)(
		"uses %s routing with override %s for the client and credential-free preview",
		async (region, override, expected) => {
			const env = {
				CLOUDFLARE_ACCOUNT_ID: "fixture-account",
				CLOUDFLARE_API_BASE_URL: override,
				CLOUDFLARE_COMPLIANCE_REGION: region,
			};
			await runCf(
				["observability", "tail", "--worker", "my-worker", "--dry-run"],
				env
			);
			expect(JSON.parse(std.out).url).toBe(
				`${expected}/accounts/fixture-account/workers/observability/telemetry/live-tail`
			);
			expect(runLiveTail).not.toHaveBeenCalled();
			await runCf(["observability", "tail", "--worker", "my-worker"], {
				...env,
				CLOUDFLARE_API_TOKEN: "fixture-token",
			});
			expect(
				vi
					.mocked(runLiveTail)
					.mock.calls[0]?.[0].client.baseUrl.replace(/\/+$/, "")
			).toBe(expected);
		}
	);

	it("resolves preview compliance from project settings without validating Worker bindings", async () => {
		await writeFile(
			"cloudflare.config.ts",
			'export default { accountId: "fixture-account", complianceRegion: "fedramp-high", workers: [{ name: "other-worker", bindings: "invalid-on-purpose" }] };'
		);
		await runCf([
			"observability",
			"tail",
			"--worker",
			"my-worker",
			"--dry-run",
		]);
		expect(JSON.parse(std.out).url).toBe(
			"https://api.fed.cloudflare.com/client/v4/accounts/fixture-account/workers/observability/telemetry/live-tail"
		);
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it.each([
		["SIGINT", 130],
		["SIGTERM", 143],
	] as const)(
		"aborts on %s and removes process signal listeners",
		async (signal, exitCode) => {
			const previousInterrupt = process.listenerCount("SIGINT");
			const previousTerminate = process.listenerCount("SIGTERM");
			vi.mocked(runLiveTail).mockImplementationOnce(
				({ signal: abortSignal }) =>
					new Promise((resolve) => {
						abortSignal?.addEventListener("abort", () => resolve(), {
							once: true,
						});
					})
			);
			const running = runCf(
				["observability", "tail", "--worker", "my-worker"],
				API_ENV
			);
			await vi.waitFor(() => expect(runLiveTail).toHaveBeenCalledOnce());
			process.emit(signal);
			expect(await running).toEqual({ exitCode });
			expect(process.listenerCount("SIGINT")).toBe(previousInterrupt);
			expect(process.listenerCount("SIGTERM")).toBe(previousTerminate);
		}
	);
});
