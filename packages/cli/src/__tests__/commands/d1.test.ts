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
 * End-to-end network tests for `cf d1` commands, driven through the real
 * `runMain` → yargs → SDK → `globalThis.fetch` stack with MSW standing
 * in for the Cloudflare API.
 *
 * d1 endpoints are account-scoped (`/accounts/{id}/d1/database/...`),
 * with the account id resolved from `CLOUDFLARE_ACCOUNT_ID` (set in ENV
 * so no interactive picker / `/accounts` round-trip fires). The
 * d1-distinctive case is `d1 query <id> --sql`, which POSTs a SQL
 * payload to `.../query` — asserted on the request body here. The rest
 * mirrors the harness exemplar (`zones-list.test.ts`): envelope
 * unwrapping, auth headers, body POST, delete confirmation, error
 * propagation, and the dry-run-makes-no-request guarantee.
 *
 * `runInTempDir` isolates HOME/XDG so a developer's stored OAuth token
 * can't substitute for the fake env token under test. The MSW server
 * uses `onUnhandledRequest: "error"`, so any request that escapes the
 * mocks fails the test loudly rather than reaching the real API.
 */
describe("cf d1 (network)", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const ACCT = `${TEST_BASE_URL}/accounts/test-account`;

	let logSpy: ReturnType<typeof vi.spyOn>;
	let errSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});

	afterEach(() => {
		logSpy.mockRestore();
		errSpy.mockRestore();
	});

	function stdout(): string {
		return logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
	}
	function stderr(): string {
		return errSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("");
	}

	it("list — unwraps the envelope and prints JSON", async () => {
		server.use(
			http.get(`${ACCT}/d1/database`, () =>
				HttpResponse.json({
					success: true,
					result: [
						{ uuid: "db-1", name: "prod" },
						{ uuid: "db-2", name: "staging" },
					],
				})
			)
		);

		const { exitCode } = await runCf(["d1", "list"], ENV);

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("prod");
		expect(stdout()).toContain("db-2");
		expect(stdout()).not.toContain("success");
	});

	it("list — stamps the bearer token and cf headers", async () => {
		let headers: Headers | undefined;
		server.use(
			http.get(`${ACCT}/d1/database`, ({ request }) => {
				headers = request.headers;
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		await runCf(["d1", "list"], ENV);

		expect(headers?.get("authorization")).toBe("Bearer test-token");
		expect(headers?.get("user-agent")).toMatch(/^cf-cli\//);
	});

	it("create — POSTs the database name in the request body", async () => {
		let body: unknown;
		server.use(
			http.post(`${ACCT}/d1/database`, async ({ request }) => {
				body = await request.json();
				return HttpResponse.json({
					success: true,
					result: { uuid: "db-new", name: "my-db" },
				});
			})
		);

		const { exitCode } = await runCf(["d1", "create", "--name", "my-db"], ENV);

		expect(exitCode).toBe(0);
		expect(body).toEqual({ name: "my-db" });
		expect(stdout()).toContain("db-new");
	});

	it("get — fetches a single database by id", async () => {
		server.use(
			http.get(`${ACCT}/d1/database/db-1`, () =>
				HttpResponse.json({
					success: true,
					result: { uuid: "db-1", name: "prod" },
				})
			)
		);

		const { exitCode } = await runCf(["d1", "get", "db-1"], ENV);

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("prod");
	});

	it("query — POSTs the SQL to the /query endpoint", async () => {
		let body: unknown;
		server.use(
			http.post(`${ACCT}/d1/database/db-1/query`, async ({ request }) => {
				body = await request.json();
				return HttpResponse.json({
					success: true,
					result: [{ results: [{ n: 1 }], success: true }],
				});
			})
		);

		const { exitCode } = await runCf(
			["d1", "query", "db-1", "--sql", "SELECT 1"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(body).toEqual({ sql: "SELECT 1" });
		expect(stdout()).toContain("results");
	});

	it("delete --force — issues the DELETE", async () => {
		let hit = false;
		server.use(
			http.delete(`${ACCT}/d1/database/db-1`, () => {
				hit = true;
				return HttpResponse.json({ success: true, result: null });
			})
		);

		const { exitCode } = await runCf(["d1", "delete", "db-1", "--force"], ENV);

		expect(exitCode).toBe(0);
		expect(hit).toBe(true);
	});

	it("delete without --force — aborts before any request", async () => {
		// No DELETE handler registered: a request would trip the MSW
		// onUnhandledRequest:"error" guard.
		const { exitCode } = await runCf(["d1", "delete", "db-1"], ENV);

		expect(exitCode).toBe(0);
		expect(stderr()).toMatch(/non-interactive; pass --force/);
	});

	it("propagates an API error (403) as a thrown failure", async () => {
		server.use(
			http.get(`${ACCT}/d1/database`, () =>
				HttpResponse.json(
					{
						success: false,
						errors: [{ code: 7403, message: "Forbidden" }],
						result: null,
					},
					{ status: 403 }
				)
			)
		);

		await expect(runCf(["d1", "list"], ENV)).rejects.toThrow(/403/);
		expect(stdout()).toBe("");
	});

	it("--dry-run prints the planned query without hitting the network", async () => {
		const { exitCode } = await runCf(
			["d1", "query", "db-1", "--sql", "SELECT 1", "--dry-run"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("POST");
		expect(stdout()).toContain("/d1/database/db-1/query");
	});

	it("--dry-run body matches the request sent by body flags", async () => {
		await runCf(["d1", "query", "db-1", "--sql", "SELECT 1", "--dry-run"], ENV);
		const preview = JSON.parse(stdout()) as {
			method: string;
			url: string;
			body: unknown;
		};
		logSpy.mockClear();

		let requestMethod: string | undefined;
		let requestUrl: URL | undefined;
		let requestBody: unknown;
		server.use(
			http.post(`${ACCT}/d1/database/db-1/query`, async ({ request }) => {
				requestMethod = request.method;
				requestUrl = new URL(request.url);
				requestBody = await request.json();
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		await runCf(["d1", "query", "db-1", "--sql", "SELECT 1"], ENV);

		expect(preview.method).toBe(requestMethod);
		expect(new URL(preview.url).pathname).toBe(requestUrl?.pathname);
		expect(preview.body).toEqual(requestBody);
	});

	it("--dry-run body matches the request sent by --body", async () => {
		const body = '{"sql":"SELECT 1","params":["value"]}';
		await runCf(["d1", "query", "db-1", "--body", body, "--dry-run"], ENV);
		const preview = JSON.parse(stdout()) as { body: unknown };
		logSpy.mockClear();

		let requestBody: unknown;
		server.use(
			http.post(`${ACCT}/d1/database/db-1/query`, async ({ request }) => {
				requestBody = await request.json();
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		await runCf(["d1", "query", "db-1", "--body", body], ENV);

		expect(preview.body).toEqual(requestBody);
	});
});
