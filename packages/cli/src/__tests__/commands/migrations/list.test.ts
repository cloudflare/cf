import fs from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server, setupMsw, TEST_BASE_URL } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";

/** `cf d1 migrations list`, with Wrangler's result rendered as JSON. */
describe("cf d1 migrations list", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const ACCT = `${TEST_BASE_URL}/accounts/test-account`;
	const DB = "38a2e1b9-3a45-4f6e-9d0c-8b7a6c5d4e3f";

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

	function writeMigrations(files: Record<string, string>): void {
		for (const [name, contents] of Object.entries(files)) {
			const full = `migrations/${name}`;
			fs.mkdirSync(full.slice(0, full.lastIndexOf("/")), { recursive: true });
			fs.writeFileSync(full, contents);
		}
	}

	function mockQueries(applied: string[] = [], databaseId = DB): string[] {
		const sent: string[] = [];
		server.use(
			http.post(
				`${ACCT}/d1/database/${databaseId}/query`,
				async ({ request }) => {
					const body = (await request.json()) as { sql: string };
					sent.push(body.sql);
					return HttpResponse.json({
						success: true,
						result: [
							{
								success: true,
								results: body.sql.includes("SELECT")
									? applied.map((name, i) => ({ id: i + 1, name }))
									: [],
							},
						],
					});
				}
			)
		);
		return sent;
	}

	it("reports the unapplied set", async () => {
		writeMigrations({
			"0001_a.sql": "SELECT 1;",
			"0002_b.sql": "SELECT 1;",
		});
		mockQueries(["0001_a.sql"]);

		const { exitCode } = await runCf(["d1", "migrations", "list", DB], ENV);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toEqual([{ Name: "0002_b.sql" }]);
	});

	it("never applies anything", async () => {
		writeMigrations({ "0001_a.sql": "SELECT 1;" });
		const sent = mockQueries();

		await runCf(["d1", "migrations", "list", DB], ENV);

		expect(sent.filter((sql) => sql.includes("INSERT INTO"))).toHaveLength(0);
	});

	it("uses the database id verbatim without a lookup", async () => {
		writeMigrations({ "0001_a.sql": "SELECT 1;" });
		const databaseId = DB.toUpperCase();
		let listed = false;
		server.use(
			http.get(`${ACCT}/d1/database`, () => {
				listed = true;
				return HttpResponse.json({ success: true, result: [] });
			})
		);
		mockQueries([], databaseId);

		const { exitCode } = await runCf(
			["d1", "migrations", "list", databaseId],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(listed).toBe(false);
	});

	it("rejects a database name before making an API request", async () => {
		writeMigrations({ "0001_a.sql": "SELECT 1;" });

		await expect(
			runCf(["d1", "migrations", "list", "production"], ENV)
		).rejects.toThrow(/Expected a D1 database ID.*Database names/s);
	});

	it("hints at the nested pattern when a drizzle layout matched nothing", async () => {
		writeMigrations({ "0000_init/migration.sql": "SELECT 1;" });
		mockQueries();

		const { exitCode } = await runCf(["d1", "migrations", "list", DB], ENV);

		expect(exitCode).toBe(0);
		expect(stderr()).toContain("migrations/*/migration.sql");
		expect(JSON.parse(stdout())).toEqual([]);
	});
});
