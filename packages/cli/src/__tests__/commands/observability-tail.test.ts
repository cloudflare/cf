import { writeFile } from "node:fs/promises";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	scopeTailFilters,
	tailFilters,
	zoneFilter,
} from "../../commands/observability/tail/filters.js";
import { runLiveTail } from "../../commands/observability/tail/stream.js";
import { mockOutputStreams } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

vi.mock("../../commands/observability/tail/stream.js", () => ({
	runLiveTail: vi.fn(),
}));

const ZONE_ID = "0123456789abcdef0123456789abcdef";

const API_ENV = {
	CLOUDFLARE_ACCOUNT_ID: "fixture-account",
	CLOUDFLARE_API_TOKEN: "fixture-token",
	CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
};

const ERROR_FILTERS = {
	filterCombination: "and",
	filters: [
		{ key: "$metadata.level", type: "string", operation: "eq", value: "error" },
	],
};

const runTail = (
	flags: string[],
	env: Record<string, string | undefined> = {}
) => runCf(["observability", "tail", ...flags], env);
const tailOptions = () => vi.mocked(runLiveTail).mock.lastCall?.[0];

describe("cf observability tail", () => {
	runInTempDir();
	setupMsw();
	const std = mockOutputStreams();
	const workerLookup = vi.fn();

	beforeEach(() => {
		workerLookup.mockReset();
		vi.mocked(runLiveTail).mockReset();
		vi.mocked(runLiveTail).mockResolvedValue(undefined);
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.stubEnv("CLOUDFLARE_ZONE_ID", undefined);
		server.use(
			http.get(
				"*/accounts/fixture-account/workers/workers/:worker",
				({ params, request }) => {
					workerLookup(request);
					return HttpResponse.json({
						success: true,
						result: { id: "worker-id", name: params.worker },
					});
				}
			),
			http.get(`${TEST_BASE_URL}/zones`, ({ request }) => {
				const url = new URL(request.url);
				expect(url.searchParams.get("name")).toBe("example.com");
				expect(url.searchParams.get("account.id")).toBe("fixture-account");
				return HttpResponse.json({
					success: true,
					result: [{ id: ZONE_ID, name: "example.com" }],
				});
			})
		);
	});

	it.each(
		[[], ["--all=false"]].map((flags) => ({
			flags,
		}))
	)(
		"requires an explicit selection with $flags before authenticating",
		async ({ flags }) => {
			vi.stubEnv("CLOUDFLARE_ZONE_ID", "0123456789abcdef0123456789abcdef");
			await expect(runTail([...flags])).rejects.toThrow(
				/--all.*--worker.*--zone.*--filters/
			);
			expect(runLiveTail).not.toHaveBeenCalled();
		}
	);

	it("resolves a zone name and narrows it with a filter", async () => {
		const input = JSON.stringify({
			filterCombination: "and",
			filters: [
				{
					key: "$metadata.level",
					type: "string",
					operation: "eq",
					value: "error",
				},
			],
		});
		await runTail(["--zone", "Example.COM", "--filters", input], API_ENV);
		expect(tailOptions()?.body).toEqual(
			scopeTailFilters(tailFilters(input), zoneFilter("example.com"))
		);
		expect(workerLookup).not.toHaveBeenCalled();
	});

	it("resolves a zone ID passed through the global -z alias", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/zones/${ZONE_ID}`, () =>
				HttpResponse.json({
					success: true,
					result: { id: ZONE_ID, name: "Example.COM" },
				})
			)
		);
		await runCf(["-z", ZONE_ID, "observability", "tail"], API_ENV);
		expect(tailOptions()?.body.filters?.[0]).toMatchObject({
			filters: expect.arrayContaining([
				expect.objectContaining({
					key: "cloudflare.zone_name",
					value: "example.com",
				}),
			]),
		});
	});

	it("stops when a zone ID does not exist", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/zones/${ZONE_ID}`, () =>
				HttpResponse.json(
					{ success: false, errors: [{ message: "Zone not found" }] },
					{ status: 404 }
				)
			)
		);
		await expect(runTail(["--zone", ZONE_ID], API_ENV)).rejects.toMatchObject({
			statusCode: 404,
		});
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it("stops if the zone lookup does not provide a domain name", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/zones/${ZONE_ID}`, () =>
				HttpResponse.json({ success: true, result: { id: ZONE_ID } })
			)
		);
		await expect(runTail(["--zone", ZONE_ID], API_ENV)).rejects.toThrow(
			/zone.*domain name/
		);
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it("requires a domain name for a credential-free zone preview", async () => {
		await expect(runTail(["--zone", ZONE_ID, "--dry-run"])).rejects.toThrow(
			/domain name.*--dry-run/
		);
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it.each(
		[
			["--all", "--worker", "my-worker"],
			["--all", "--zone", "example.com"],
			["--worker", "my-worker", "--zone", "example.com"],
			["--all", "--filters", "{}"],
		].map((flags) => ({ flags }))
	)(
		"rejects conflicting selections before authenticating ($flags)",
		async ({ flags }) => {
			await expect(runTail([...flags])).rejects.toThrow(
				/Choose one scope|mutually exclusive/
			);
			expect(workerLookup).not.toHaveBeenCalled();
			expect(runLiveTail).not.toHaveBeenCalled();
		}
	);

	it("uses --filters alone to select matching observability events", async () => {
		const input = JSON.stringify({
			filterCombination: "and",
			filters: [
				{
					key: "$metadata.level",
					type: "string",
					operation: "eq",
					value: "error",
				},
			],
		});
		await runTail(["--filters", input], API_ENV);
		expect(tailOptions()?.body).toEqual(tailFilters(input));
	});

	it.each(
		[[" "], ["first", "--worker", "second"]].map((values) => ({
			values,
		}))
	)(
		"requires one non-empty Worker name with $values before authenticating",
		async ({ values }) => {
			await expect(runTail(["--worker", ...values])).rejects.toThrow(
				/argument|value|single.*Worker/i
			);
			expect(runLiveTail).not.toHaveBeenCalled();
		}
	);

	it("validates the deployed Worker and passes its filters without reading Worker source config", async () => {
		await writeFile(
			"cloudflare.config.ts",
			'export default { accountId: "fixture-account", workers: [{ name: "other-worker", bindings: "invalid-on-purpose" }] };'
		);
		const input = JSON.stringify({
			filterCombination: "or",
			filters: [
				{
					key: "$metadata.level",
					type: "string",
					operation: "eq",
					value: "error",
				},
				{
					key: "$metadata.message",
					type: "string",
					operation: "includes",
					value: "private search",
				},
			],
		});
		vi.mocked(runLiveTail).mockImplementationOnce(async () => {
			expect(workerLookup).toHaveBeenCalledOnce();
		});
		await runTail(
			["--worker", "my-worker-staging", "--filters", input],
			API_ENV
		);
		expect(workerLookup).toHaveBeenCalledWith(
			expect.objectContaining({
				url: `${TEST_BASE_URL}/accounts/fixture-account/workers/workers/my-worker-staging`,
			})
		);
		expect(tailOptions()).toMatchObject({
			accountId: "fixture-account",
			body: { scriptId: "my-worker-staging", ...tailFilters(input) },
		});
		expect(std.out).toBe("");
		expect(std.err).not.toMatch(/private search|fixture-token/);
	});

	it("stops when the deployed Worker does not exist", async () => {
		server.use(
			http.get(
				`${TEST_BASE_URL}/accounts/fixture-account/workers/workers/missing-worker`,
				() =>
					HttpResponse.json(
						{ success: false, errors: [{ message: "Worker not found" }] },
						{ status: 404 }
					)
			)
		);
		await expect(
			runTail(["--worker", "missing-worker"], API_ENV)
		).rejects.toMatchObject({
			statusCode: 404,
		});
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it("selects all observability events with --all", async () => {
		await writeFile(
			"cloudflare.config.ts",
			'export default { workers: [{ name: "other-worker" }] };'
		);
		await runTail(["--all"], API_ENV);
		expect(runLiveTail).toHaveBeenCalledWith(
			expect.objectContaining({
				accountId: "fixture-account",
				body: { filters: [], filterCombination: "and" },
			})
		);
		expect(workerLookup).not.toHaveBeenCalled();
	});

	it("keeps warnings on stderr when quiet suppresses notices", async () => {
		vi.mocked(runLiveTail).mockImplementationOnce(async ({ warn, notice }) => {
			notice?.("Connected to live tail.");
			warn?.("Skipped malformed live tail JSON.");
		});
		await runTail(["--all", "--quiet"], API_ENV);
		expect(std.out).toBe("");
		expect(std.err).toContain("Skipped malformed live tail JSON.");
		expect(std.err).not.toContain("Connected to live tail.");
	});

	it("rejects invalid filters before authenticating", async () => {
		await expect(runTail(["--filters", "{"])).rejects.toThrow(
			/Invalid JSON.*--filters/
		);
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it("requires JSON filters to be provided once", async () => {
		await expect(
			runTail(["--filters", "{}", "--filters", "{}"])
		).rejects.toThrow(/filters.*once/i);
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it("reads nested filters from a relative file and preserves JSON value types", async () => {
		const filters = {
			filterCombination: "and",
			filters: [
				...ERROR_FILTERS.filters,
				{
					kind: "group",
					filterCombination: "or",
					filters: [
						{
							key: "$workers.cpuTimeMs",
							type: "number",
							operation: "gt",
							value: 50,
						},
						{ key: "cached", type: "boolean", operation: "eq", value: true },
					],
				},
			],
		};
		await writeFile("filters.json", JSON.stringify(filters));
		await runTail(["--filters", "@filters.json"], API_ENV);
		expect(tailOptions()?.body).toEqual(filters);
	});

	it.each([
		"[]",
		"{}",
		'{"filterCombination":"xor","filters":[]}',
		'{"filterCombination":"and","filters":{}}',
		'{"filterCombination":"and","filters":[],"scriptId":"other"}',
	])(
		"rejects an invalid filter envelope before authenticating: %s",
		async (input) => {
			await expect(runTail(["--filters", input])).rejects.toThrow(
				/filters.*(JSON object|requires)/
			);
			expect(runLiveTail).not.toHaveBeenCalled();
		}
	);

	it("shows help without credentials or starting live tail", async () => {
		await expect(runTail(["--help"])).resolves.toEqual({
			exitCode: 0,
		});
		expect(std.out).toContain("--filters");
		expect(workerLookup).not.toHaveBeenCalled();
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it("rejects local mode before constructing a tail session", async () => {
		await expect(
			runTail(["--worker", "my-worker", "--local"], API_ENV)
		).rejects.toThrow(/--local.*not supported|not supported.*--local/i);
		expect(runLiveTail).not.toHaveBeenCalled();
	});

	it.each([
		{ flags: ["--all"], body: tailFilters() },
		{
			flags: [
				"--worker",
				"my-worker",
				"--filters",
				JSON.stringify(ERROR_FILTERS),
			],
			body: { scriptId: "my-worker", ...ERROR_FILTERS },
		},
		{
			flags: ["--zone", "example.com"],
			body: {
				filters: [
					expect.objectContaining({
						filters: expect.arrayContaining([
							expect.objectContaining({
								key: "cloudflare.zone_name",
								value: "example.com",
							}),
						]),
					}),
				],
			},
		},
	])(
		"previews $flags without credentials or a connection",
		async ({ flags, body }) => {
			await runTail([...flags, "--dry-run"]);
			expect(JSON.parse(std.out)).toMatchObject({ body });
			expect(workerLookup).not.toHaveBeenCalled();
			expect(runLiveTail).not.toHaveBeenCalled();
		}
	);

	it.each([
		{ baseUrl: undefined, origin: "https://api.fed.cloudflare.com" },
		{
			baseUrl: "http://127.0.0.1:12345/client/v4/",
			origin: "http://127.0.0.1:12345",
		},
	])(
		"keeps previews and streaming on $origin without validating Worker bindings",
		async ({ baseUrl, origin }) => {
			await writeFile(
				"cloudflare.config.ts",
				'export default { accountId: "fixture-account", complianceRegion: "fedramp-high", workers: [{ name: "other-worker", bindings: "invalid-on-purpose" }] };'
			);
			await runTail(["--worker", "my-worker", "--dry-run"], {
				CLOUDFLARE_API_BASE_URL: baseUrl,
			});
			const preview = new URL(JSON.parse(std.out).url);
			await runTail(["--worker", "my-worker"], {
				CLOUDFLARE_API_TOKEN: "fixture-token",
				CLOUDFLARE_API_BASE_URL: baseUrl,
			});
			expect(preview.origin).toBe(origin);
			expect(preview.href).toContain(
				tailOptions()?.client.baseUrl.replace(/\/+$/, "")
			);
		}
	);

	it.each([
		["SIGINT", 130],
		["SIGTERM", 143],
	] as const)(
		"honors the first %s interruption and cleans up signal listeners",
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
			const running = runTail(["--worker", "my-worker"], API_ENV);
			await vi.waitFor(() => expect(runLiveTail).toHaveBeenCalledOnce());
			process.emit(signal);
			process.emit(signal === "SIGINT" ? "SIGTERM" : "SIGINT");
			expect(await running).toEqual({ exitCode });
			expect(process.listenerCount("SIGINT")).toBe(previousInterrupt);
			expect(process.listenerCount("SIGTERM")).toBe(previousTerminate);
		}
	);

	it("removes process signal listeners when the stream fails", async () => {
		const previousInterrupt = process.listenerCount("SIGINT");
		const previousTerminate = process.listenerCount("SIGTERM");
		const error = new Error("Live tail connection failed.");
		vi.mocked(runLiveTail).mockRejectedValueOnce(error);
		await expect(runTail(["--all"], API_ENV)).rejects.toBe(error);
		expect(process.listenerCount("SIGINT")).toBe(previousInterrupt);
		expect(process.listenerCount("SIGTERM")).toBe(previousTerminate);
	});
});
