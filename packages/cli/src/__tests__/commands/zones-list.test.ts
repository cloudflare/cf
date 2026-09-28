import { writeFile } from "node:fs/promises";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * End-to-end network tests for a generated command (`cf zones list`),
 * driven through the real `runMain` → yargs → SDK → `globalThis.fetch`
 * stack with MSW standing in for the Cloudflare API.
 *
 * `zones list` is chosen as the harness exemplar because it's a plain
 * GET `/zones` with no account-id resolution (no interactive picker /
 * extra round-trip to mock) — so the test exercises the full request
 * pipeline cf cares about: auth-header stamping, default-header
 * injection, query-param forwarding, response-envelope unwrapping, and
 * JSON stdout formatting.
 *
 * The SDK is pointed at a stable test origin via `CLOUDFLARE_API_BASE_URL`
 * (honoured by `createCommandClient`) and authenticated with a fake
 * `CLOUDFLARE_API_TOKEN`. `runInTempDir` isolates HOME/XDG so a
 * developer's real stored OAuth token can't substitute for the env
 * token under test.
 *
 * NOTE: these are unit tests — the MSW server is configured with
 * `onUnhandledRequest: "error"`, so any request that escapes the mocks
 * (i.e. a real call to api.cloudflare.com) fails the test loudly rather
 * than silently hitting the network.
 */
describe("cf zones list (network)", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
	};

	let logSpy: ReturnType<typeof vi.spyOn>;
	let errSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// formatOutput writes JSON via console.log; capture it.
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		// Silence the error box renderer (stderr) so failing-path tests
		// don't spam the reporter.
		errSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});

	afterEach(() => {
		logSpy.mockRestore();
		errSpy.mockRestore();
	});

	/** Join captured console.log args into a single string for assertions. */
	function stdout(): string {
		return logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
	}

	it("unwraps the result envelope and prints it as JSON", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, () =>
				HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: [
						{ id: "zone-1", name: "example.com" },
						{ id: "zone-2", name: "example.org" },
					],
					result_info: { page: 1, total_pages: 1 },
				})
			)
		);

		const { exitCode } = await runCf(["zones", "list"], ENV);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toEqual([
			{ id: "zone-1", name: "example.com" },
			{ id: "zone-2", name: "example.org" },
		]);
	});

	it("stamps the bearer token and cf default headers on the request", async () => {
		let captured: Headers | undefined;
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, ({ request }) => {
				captured = request.headers;
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		await runCf(["zones", "list"], ENV);

		expect(captured?.get("authorization")).toBe("Bearer test-token");
		expect(captured?.get("user-agent")).toMatch(/^cf-cli\//);
		// X-CF-CLI-Mode is one of the three documented execution modes.
		expect(captured?.get("x-cf-cli-mode")).toMatch(
			/^(interactive|non-interactive|ci)$/
		);
	});

	it("loads supported CLOUDFLARE_ values from .env for the command invocation", async () => {
		const unrelatedName = "CF_UNRELATED_FILE_ONLY_TEST";
		await writeFile(
			".env",
			[
				"CLOUDFLARE_API_TOKEN=file-token",
				`${unrelatedName}=must-not-be-loaded`,
			].join("\n")
		);

		let authorization: string | null = null;
		let fileOnlyValue: string | undefined;
		let unrelatedValue: string | undefined;
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, ({ request }) => {
				authorization = request.headers.get("authorization");
				fileOnlyValue = process.env.CLOUDFLARE_API_TOKEN;
				unrelatedValue = process.env[unrelatedName];
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		const { exitCode } = await runCf(["zones", "list"], {
			CLOUDFLARE_API_TOKEN: undefined,
			CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
			[unrelatedName]: undefined,
		});

		expect(exitCode).toBe(0);
		expect(authorization).toBe("Bearer file-token");
		expect(fileOnlyValue).toBe("file-token");
		expect(unrelatedValue).toBeUndefined();
		expect(process.env.CLOUDFLARE_API_TOKEN).toBeUndefined();
		expect(process.env[unrelatedName]).toBeUndefined();
	});

	it("restores dotenv values when the command fails", async () => {
		await writeFile(".env", "CLOUDFLARE_API_TOKEN=file-token");
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, () =>
				HttpResponse.json(
					{ success: false, errors: [{ message: "failed" }] },
					{ status: 500 }
				)
			)
		);

		await expect(
			runCf(["zones", "list"], {
				CLOUDFLARE_API_TOKEN: undefined,
				CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
			})
		).rejects.toThrow(/500/);

		expect(process.env.CLOUDFLARE_API_TOKEN).toBeUndefined();
	});

	it("forwards filter flags as query parameters", async () => {
		let url: URL | undefined;
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, ({ request }) => {
				url = new URL(request.url);
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		await runCf(
			["zones", "list", "--status", "active", "--per-page", "5"],
			ENV
		);

		expect(url?.searchParams.get("status")).toBe("active");
		expect(url?.searchParams.get("per_page")).toBe("5");
	});

	it("propagates an API error (403) as a thrown failure", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, () =>
				HttpResponse.json(
					{
						success: false,
						errors: [
							{
								code: 9109,
								message: "Unauthorized to access requested resource",
							},
						],
						result: null,
					},
					{ status: 403 }
				)
			)
		);

		// handleError renders the error box (stderr, mocked) then rethrows;
		// runCf only swallows CliExit, so the APIError propagates.
		await expect(runCf(["zones", "list"], ENV)).rejects.toThrow(/403/);
		// Nothing should have been printed to stdout on the failure path.
		expect(stdout()).toBe("");
	});

	it("propagates a success:false envelope on 2xx", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, () =>
				HttpResponse.json({
					success: false,
					errors: [{ code: 1000, message: "not ok" }],
					result: null,
				})
			)
		);

		await expect(runCf(["zones", "list"], ENV)).rejects.toThrow("not ok");
		expect(stdout()).toBe("");
	});

	it("--dry-run prints the planned request without hitting the network", async () => {
		// No handler registered: if --dry-run made a request, the
		// onUnhandledRequest:"error" guard would fail the test.
		const { exitCode } = await runCf(
			["zones", "list", "--status", "active", "--dry-run"],
			ENV
		);

		expect(exitCode).toBe(0);
		const out = stdout();
		expect(out).toContain("GET");
		expect(out).toContain("/zones");
		// dry-run surfaces the query params it would send.
		expect(out).toContain("active");
	});
});
