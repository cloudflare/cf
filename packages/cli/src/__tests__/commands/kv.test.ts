import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * End-to-end network tests for `cf kv` commands, driven through the real
 * `runMain` → yargs → SDK → `globalThis.fetch` stack with MSW standing
 * in for the Cloudflare API.
 *
 * kv is an interesting harness target for three reasons:
 *  - **Account-scoped URLs.** Every endpoint is
 *    `/accounts/{id}/storage/kv/...`; the account id is resolved from
 *    `CLOUDFLARE_ACCOUNT_ID` (set in ENV so no interactive picker /
 *    `/accounts` round-trip fires).
 *  - **Raw-bytes output.** `kv keys get` bypasses the SDK envelope and
 *    writes the response body verbatim via `process.stdout.write`
 *    (lib/raw-fetch.ts), so it's asserted against a stdout-write spy
 *    rather than the JSON console.log path.
 *  - **Delete confirmation.** `kv namespaces delete` runs through
 *    `confirmDelete`; without `--force` in a non-TTY it aborts before
 *    any request (proven by the `onUnhandledRequest: "error"` guard).
 *
 * `runInTempDir` isolates HOME/XDG so a developer's stored OAuth token
 * can't substitute for the fake env token under test.
 */
describe("cf kv (network)", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const ACCT = `${TEST_BASE_URL}/accounts/test-account`;

	let logSpy: ReturnType<typeof vi.spyOn>;
	let outSpy: ReturnType<typeof vi.spyOn>;
	let errSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		outSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
		errSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});

	afterEach(() => {
		logSpy.mockRestore();
		outSpy.mockRestore();
		errSpy.mockRestore();
	});

	function stdout(): string {
		return logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
	}
	function rawStdout(): string {
		return outSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("");
	}
	function stderr(): string {
		return errSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("");
	}

	it("namespaces list — unwraps the envelope and prints JSON", async () => {
		server.use(
			http.get(`${ACCT}/storage/kv/namespaces`, () =>
				HttpResponse.json({
					success: true,
					result: [
						{ id: "ns-1", title: "prod" },
						{ id: "ns-2", title: "staging" },
					],
				})
			)
		);

		const { exitCode } = await runCf(["kv", "namespaces", "list"], ENV);

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("prod");
		expect(stdout()).toContain("ns-2");
		expect(stdout()).not.toContain("success");
	});

	it("namespaces list — warns when the API reports another page", async () => {
		server.use(
			http.get(`${ACCT}/storage/kv/namespaces`, () =>
				HttpResponse.json({
					success: true,
					result: Array.from({ length: 20 }, (_, id) => ({ id: `ns-${id}` })),
					result_info: { page: 1, per_page: 20, count: 20, total_count: 49 },
				})
			)
		);

		const { exitCode } = await runCf(["kv", "namespaces", "list", "-q"], ENV);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toHaveLength(20);
		expect(stderr()).toContain(
			"Showing 20 of 49 results (page 1 of 3); use --page 2 for more."
		);
	});

	it("namespaces list — stamps the bearer token and cf headers", async () => {
		let headers: Headers | undefined;
		server.use(
			http.get(`${ACCT}/storage/kv/namespaces`, ({ request }) => {
				headers = request.headers;
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		await runCf(["kv", "namespaces", "list"], ENV);

		expect(headers?.get("authorization")).toBe("Bearer test-token");
		expect(headers?.get("user-agent")).toMatch(/^cf-cli\//);
	});

	it("namespaces create — POSTs the title in the request body", async () => {
		let body: unknown;
		server.use(
			http.post(`${ACCT}/storage/kv/namespaces`, async ({ request }) => {
				body = await request.json();
				return HttpResponse.json({
					success: true,
					result: { id: "ns-new", title: "my-ns" },
				});
			})
		);

		const { exitCode } = await runCf(
			["kv", "namespaces", "create", "--title", "my-ns"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(body).toEqual({ title: "my-ns" });
		expect(stdout()).toContain("ns-new");
	});

	it("namespaces delete --force — issues the DELETE", async () => {
		let hit = false;
		server.use(
			http.delete(`${ACCT}/storage/kv/namespaces/ns-1`, () => {
				hit = true;
				return HttpResponse.json({ success: true, result: null });
			})
		);

		const { exitCode } = await runCf(
			["kv", "namespaces", "delete", "ns-1", "--force"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(hit).toBe(true);
	});

	it("namespaces delete without --force — aborts before any request", async () => {
		// No DELETE handler registered: if a request fired, the MSW
		// onUnhandledRequest:"error" guard would fail the test.
		const { exitCode } = await runCf(
			["kv", "namespaces", "delete", "ns-1"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(stderr()).toMatch(/non-interactive; pass --force/);
	});

	it("keys get — writes the raw value bytes verbatim to stdout", async () => {
		server.use(
			http.get(
				`${ACCT}/storage/kv/namespaces/ns-1/values/my-key`,
				() =>
					new HttpResponse("hello-value", {
						headers: { "content-type": "application/octet-stream" },
					})
			)
		);

		const { exitCode } = await runCf(
			["kv", "keys", "get", "my-key", "--namespace-id", "ns-1"],
			ENV
		);

		expect(exitCode).toBe(0);
		// Raw path: bytes go through process.stdout.write, NOT console.log.
		expect(rawStdout()).toContain("hello-value");
		expect(stdout()).toBe("");
	});

	it("keys list — returns the namespace's keys", async () => {
		server.use(
			http.get(`${ACCT}/storage/kv/namespaces/ns-1/keys`, () =>
				HttpResponse.json({
					success: true,
					result: [{ name: "k1" }, { name: "k2" }],
				})
			)
		);

		const { exitCode } = await runCf(
			["kv", "keys", "list", "--namespace-id", "ns-1"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("k1");
		expect(stdout()).toContain("k2");
	});

	it("propagates an API error (403) as a thrown failure", async () => {
		server.use(
			http.get(`${ACCT}/storage/kv/namespaces`, () =>
				HttpResponse.json(
					{
						success: false,
						errors: [{ code: 10000, message: "Authentication error" }],
						result: null,
					},
					{ status: 403 }
				)
			)
		);

		await expect(runCf(["kv", "namespaces", "list"], ENV)).rejects.toThrow(
			/403/
		);
		expect(stdout()).toBe("");
	});

	it("--dry-run prints the planned request without hitting the network", async () => {
		// No handler: a real request would trip onUnhandledRequest:"error".
		const { exitCode } = await runCf(
			["kv", "namespaces", "create", "--title", "x", "--dry-run"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("POST");
		expect(stdout()).toContain("/storage/kv/namespaces");
	});
});
