import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
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

describe.each(["create", "update"])("cf priority-intelligence %s", (method) => {
	runInTempDir();
	setupMsw();
	const env = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const args = [
		"cloudforce-one",
		"priority-intelligence",
		method,
		...(method === "update" ? ["priority-id"] : []),
		"--requirement",
		"example",
	];
	const url = `${TEST_BASE_URL}/accounts/test-account/cloudforce-one/v2/priority-intelligence${method === "update" ? "/priority-id" : ""}`;
	const clauses = [
		{
			actors: [],
			attacker_countries: [],
			target_countries: [],
			target_industries: [],
			categories: [],
			techniques: [],
			cves: [],
			keywords: ["example"],
		},
	];
	const branches = [[{ field: "event", op: "contains", value: "example" }]];
	let log: ReturnType<typeof vi.spyOn>;
	let stderr: ReturnType<typeof vi.spyOn>;
	let error: ReturnType<typeof vi.spyOn>;
	beforeEach(() => {
		log = vi.spyOn(console, "log").mockImplementation(() => {});
		error = vi.spyOn(console, "error").mockImplementation(() => {});
		stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});
	afterEach(() => {
		log.mockRestore();
		error.mockRestore();
		stderr.mockRestore();
	});

	it.each([false, true])(
		"sends complete nested arrays (file input: %s)",
		async (file) => {
			await seed({
				"clauses file.json": JSON.stringify(clauses),
				"branches file.json": JSON.stringify(branches),
			});
			let body: unknown;
			server.use(
				http.all(url, async ({ request }) => {
					expect(request.method).toBe(method === "create" ? "POST" : "PUT");
					body = await request.json();
					return HttpResponse.json({
						success: true,
						result: { id: "priority-id" },
					});
				})
			);
			const { exitCode } = await runCf(
				[
					...args,
					"--intent-clauses",
					file ? "@clauses file.json" : JSON.stringify(clauses),
					"--intent-indicators",
					"example",
					"--intent-unsupported-terms",
					"example",
					"--query-branches",
					file ? "@branches file.json" : JSON.stringify(branches),
					"--query-version",
					"1",
				],
				env
			);
			expect(exitCode).toBe(0);
			expect(body).toMatchObject({
				requirement: "example",
				intent: {
					clauses,
					indicators: ["example"],
					unsupported_terms: ["example"],
				},
				query: { branches, version: 1 },
			});
		}
	);

	it.each([false, true])(
		"rejects partial nested objects (dry run: %s)",
		async (dryRun) => {
			const request = vi.fn(() =>
				HttpResponse.json({ success: true, result: {} })
			);
			server.use(http.all(url, request));
			for (const [flags, missing] of [
				[
					[
						"--intent-indicators",
						"example",
						"--intent-unsupported-terms",
						"example",
					],
					"--intent-clauses",
				],
				[["--query-version", "1"], "--query-branches"],
			] as const) {
				await expect(
					runCf([...args, ...flags, ...(dryRun ? ["--dry-run"] : [])], env)
				).rejects.toThrow(missing);
			}
			expect(request).not.toHaveBeenCalled();
		}
	);

	it("omits unused optional parents", async () => {
		let body: Record<string, unknown> | undefined;
		server.use(
			http.all(url, async ({ request }) => {
				body = (await request.json()) as Record<string, unknown>;
				return HttpResponse.json({ success: true, result: {} });
			})
		);
		expect((await runCf(args, env)).exitCode).toBe(0);
		expect(body).toHaveProperty("requirement", "example");
		expect(body).not.toHaveProperty("intent");
		expect(body).not.toHaveProperty("query");
	});
});
