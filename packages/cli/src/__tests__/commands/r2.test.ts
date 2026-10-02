import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
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
 * End-to-end network tests for `cf r2 buckets` commands, driven through
 * the real `runMain` → yargs → SDK → `globalThis.fetch` stack with MSW
 * standing in for the Cloudflare API.
 *
 * Coverage mirrors the harness exemplar (`zones-list.test.ts`) but for
 * an account-scoped product: every endpoint is `/accounts/{id}/r2/...`,
 * with the account id resolved from `CLOUDFLARE_ACCOUNT_ID` (set in ENV
 * so no interactive picker / `/accounts` round-trip fires). It exercises
 * the full request pipeline cf cares about — auth-header stamping,
 * envelope unwrapping, body POST, delete confirmation, and the
 * dry-run-makes-no-request guarantee.
 *
 * `runInTempDir` isolates HOME/XDG so a developer's stored OAuth token
 * can't substitute for the fake env token under test. The MSW server
 * uses `onUnhandledRequest: "error"`, so any request that escapes the
 * mocks fails the test loudly rather than reaching the real API.
 */
describe("cf r2 buckets (network)", () => {
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
			http.get(`${ACCT}/r2/buckets`, () =>
				HttpResponse.json({
					success: true,
					result: {
						buckets: [{ name: "assets" }, { name: "backups" }],
					},
				})
			)
		);

		const { exitCode } = await runCf(["r2", "buckets", "list"], ENV);

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("assets");
		expect(stdout()).toContain("backups");
		expect(stdout()).not.toContain("success");
	});

	it("list — stamps the bearer token and cf headers", async () => {
		let headers: Headers | undefined;
		server.use(
			http.get(`${ACCT}/r2/buckets`, ({ request }) => {
				headers = request.headers;
				return HttpResponse.json({ success: true, result: { buckets: [] } });
			})
		);

		await runCf(["r2", "buckets", "list"], ENV);

		expect(headers?.get("authorization")).toBe("Bearer test-token");
		expect(headers?.get("user-agent")).toMatch(/^cf-cli\//);
	});

	it("create — POSTs the bucket name in the request body", async () => {
		let body: unknown;
		server.use(
			http.post(`${ACCT}/r2/buckets`, async ({ request }) => {
				body = await request.json();
				return HttpResponse.json({
					success: true,
					result: { name: "my-bucket" },
				});
			})
		);

		const { exitCode } = await runCf(
			["r2", "buckets", "create", "--name", "my-bucket"],
			ENV
		);

		expect(exitCode).toBe(0);
		// create also sends a default storageClass alongside the name.
		expect(body).toMatchObject({ name: "my-bucket" });
		expect(stdout()).toContain("my-bucket");
	});

	it("cors update — sends object-array flags through the generic request path", async () => {
		const rules = [
			{
				allowed: {
					origins: ["https://example.com"],
					methods: ["GET", "PUT"],
				},
			},
		];
		await seed({ "cors-rules.json": JSON.stringify(rules) });
		let body: unknown;
		server.use(
			http.put(`${ACCT}/r2/buckets/my-bucket/cors`, async ({ request }) => {
				body = await request.json();
				return HttpResponse.json({ success: true, result: {} });
			})
		);

		const { exitCode } = await runCf(
			[
				"r2",
				"buckets",
				"cors",
				"update",
				"my-bucket",
				"--rules",
				"@cors-rules.json",
				"--force",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(body).toEqual({ rules });
	});

	it("cors update — previews the parsed object-array body", async () => {
		const rules = [
			{
				allowed: {
					origins: ["https://example.com"],
					methods: ["GET"],
				},
			},
		];

		const { exitCode } = await runCf(
			[
				"r2",
				"buckets",
				"cors",
				"update",
				"my-bucket",
				"--rules",
				JSON.stringify(rules),
				"--dry-run",
			],
			ENV
		);
		const preview = JSON.parse(stdout()) as { body: unknown };

		expect(exitCode).toBe(0);
		expect(preview.body).toEqual({ rules });
	});

	it("cors update — --body takes precedence over object-array flags", async () => {
		const rawBody = {
			rules: [
				{
					allowed: {
						origins: ["https://example.com"],
						methods: ["GET"],
					},
				},
			],
		};
		let body: unknown;
		server.use(
			http.put(`${ACCT}/r2/buckets/my-bucket/cors`, async ({ request }) => {
				body = await request.json();
				return HttpResponse.json({ success: true, result: {} });
			})
		);

		const { exitCode } = await runCf(
			[
				"r2",
				"buckets",
				"cors",
				"update",
				"my-bucket",
				"--body",
				JSON.stringify(rawBody),
				"--rules",
				"not-json",
				"--force",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(body).toEqual(rawBody);
	});

	it("get — fetches a single bucket by name", async () => {
		server.use(
			http.get(`${ACCT}/r2/buckets/my-bucket`, () =>
				HttpResponse.json({
					success: true,
					result: { name: "my-bucket", location: "wnam" },
				})
			)
		);

		const { exitCode } = await runCf(
			["r2", "buckets", "get", "my-bucket"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("wnam");
	});

	it("delete --force — issues the DELETE", async () => {
		let hit = false;
		server.use(
			http.delete(`${ACCT}/r2/buckets/my-bucket`, () => {
				hit = true;
				return HttpResponse.json({ success: true, result: null });
			})
		);

		const { exitCode } = await runCf(
			["r2", "buckets", "delete", "my-bucket", "--force"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(hit).toBe(true);
	});

	it("delete without --force — aborts before any request", async () => {
		// No DELETE handler registered: a request would trip the MSW
		// onUnhandledRequest:"error" guard.
		const { exitCode } = await runCf(
			["r2", "buckets", "delete", "my-bucket"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(stderr()).toMatch(/non-interactive; pass --force/);
	});

	it("propagates an API error (500) as a thrown failure", async () => {
		server.use(
			http.get(`${ACCT}/r2/buckets`, () =>
				HttpResponse.json(
					{
						success: false,
						errors: [{ code: 10001, message: "Internal error" }],
						result: null,
					},
					{ status: 500 }
				)
			)
		);

		await expect(runCf(["r2", "buckets", "list"], ENV)).rejects.toThrow(/500/);
		expect(stdout()).toBe("");
	});

	it("--dry-run prints the planned request without hitting the network", async () => {
		const { exitCode } = await runCf(
			["r2", "buckets", "create", "--name", "x", "--dry-run"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("POST");
		expect(stdout()).toContain("/r2/buckets");
	});
});
