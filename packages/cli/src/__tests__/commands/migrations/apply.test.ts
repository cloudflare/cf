import fs from "node:fs";
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
import { server, setupMsw, TEST_BASE_URL } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";

/**
 * `cf d1 migrations apply` driven through the real `runMain` → yargs → SDK
 * stack, with MSW standing in for the D1 API and a temp cwd for the
 * migrations directory.
 *
 * The assertions concentrate on the wire contract with the `d1_migrations`
 * table — statement order, recorded names, table identifier — because a
 * divergence there does not error, it silently replays or mis-orders
 * someone's schema.
 */
describe("cf d1 migrations apply", () => {
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

	function writeMigrations(files: Record<string, string>): void {
		for (const [name, contents] of Object.entries(files)) {
			const full = `migrations/${name}`;
			fs.mkdirSync(full.slice(0, full.lastIndexOf("/")), { recursive: true });
			fs.writeFileSync(full, contents);
		}
	}

	/**
	 * Mock the query endpoint, capturing every SQL string sent. `applied`
	 * seeds the rows the bookkeeping SELECT returns.
	 */
	function mockQueries(applied: string[] = [], databaseId = DB): string[] {
		const sent: string[] = [];
		server.use(
			http.post(
				`${ACCT}/d1/database/${databaseId}/query`,
				async ({ request }) => {
					const body = (await request.json()) as { sql: string };
					sent.push(body.sql);
					if (body.sql.includes("SELECT")) {
						return HttpResponse.json({
							success: true,
							result: [
								{
									success: true,
									results: applied.map((name, i) => ({ id: i + 1, name })),
								},
							],
						});
					}
					return HttpResponse.json({
						success: true,
						result: [{ success: true, results: [] }],
					});
				}
			)
		);
		return sent;
	}

	/** SQL strings that applied a migration (i.e. carry a bookkeeping INSERT). */
	function migrationStatements(sent: string[]): string[] {
		return sent.filter((sql) => sql.includes("INSERT INTO"));
	}

	it("applies each unapplied migration with its bookkeeping INSERT", async () => {
		writeMigrations({ "0001_users.sql": "CREATE TABLE users (id INTEGER);" });
		const sent = mockQueries();

		const { exitCode } = await runCf(["d1", "migrations", "apply", DB], ENV);

		expect(exitCode).toBe(0);
		const applied = migrationStatements(sent);
		expect(applied).toHaveLength(1);
		expect(applied[0]).toContain("CREATE TABLE users (id INTEGER);");
		expect(applied[0]).toContain(
			`INSERT INTO "d1_migrations" (name)\nvalues ('0001_users.sql');`
		);
		expect(stdout()).toContain("0001_users.sql");
	});

	it("creates the bookkeeping table before reading it", async () => {
		writeMigrations({ "0001_users.sql": "SELECT 1;" });
		const sent = mockQueries();

		await runCf(["d1", "migrations", "apply", DB], ENV);

		expect(sent[0]).toContain('CREATE TABLE IF NOT EXISTS "d1_migrations"');
		expect(sent[0]).toContain("applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
		expect(sent[1]).toContain('FROM "d1_migrations"');
		expect(sent[1]).toContain("ORDER BY id");
	});

	it("orders migrations numerically, not lexically", async () => {
		writeMigrations({
			"1_a.sql": "SELECT 'a';",
			"9_b.sql": "SELECT 'b';",
			"10_c.sql": "SELECT 'c';",
		});
		const sent = mockQueries();

		await runCf(["d1", "migrations", "apply", DB], ENV);

		const names = migrationStatements(sent).map(
			(sql) => /values \('(.+?)'\);/.exec(sql)?.[1]
		);
		expect(names).toEqual(["1_a.sql", "9_b.sql", "10_c.sql"]);
	});

	it("skips migrations already recorded in the table", async () => {
		writeMigrations({
			"0001_a.sql": "SELECT 'a';",
			"0002_b.sql": "SELECT 'b';",
		});
		const sent = mockQueries(["0001_a.sql"]);

		await runCf(["d1", "migrations", "apply", DB], ENV);

		const names = migrationStatements(sent).map(
			(sql) => /values \('(.+?)'\);/.exec(sql)?.[1]
		);
		expect(names).toEqual(["0002_b.sql"]);
	});

	it("records a nested (drizzle) layout path relative to --dir", async () => {
		writeMigrations({ "0000_init/migration.sql": "SELECT 1;" });
		const sent = mockQueries();

		const { exitCode } = await runCf(
			[
				"d1",
				"migrations",
				"apply",
				DB,
				"--dir",
				"migrations",
				"--pattern",
				"migrations/*/migration.sql",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(migrationStatements(sent)[0]).toContain(
			"values ('0000_init/migration.sql');"
		);
	});

	it("honours --table and escapes the identifier", async () => {
		writeMigrations({ "0001_a.sql": "SELECT 1;" });
		const sent = mockQueries();

		await runCf(
			["d1", "migrations", "apply", DB, "--table", '__drizzle"x'],
			ENV
		);

		expect(sent[0]).toContain('CREATE TABLE IF NOT EXISTS "__drizzle""x"');
		expect(migrationStatements(sent)[0]).toContain(
			'INSERT INTO "__drizzle""x" (name)'
		);
	});

	it("normalises CRLF so a compound statement survives the server-side split", async () => {
		writeMigrations({
			"0001_trigger.sql":
				"CREATE TRIGGER t AFTER INSERT ON users\r\nBEGIN\r\n  SELECT 1;\r\nEND;\r\n",
		});
		const sent = mockQueries();

		await runCf(["d1", "migrations", "apply", DB], ENV);

		const sql = migrationStatements(sent)[0] ?? "";
		expect(sql).not.toContain("\r\n");
		expect(sql).toContain("BEGIN\n  SELECT 1;\nEND;");
	});

	it("escapes single quotes in a recorded migration name", async () => {
		writeMigrations({ "0001_o'brien.sql": "SELECT 1;" });
		const sent = mockQueries();

		await runCf(["d1", "migrations", "apply", DB], ENV);

		expect(migrationStatements(sent)[0]).toContain(
			"values ('0001_o''brien.sql');"
		);
	});

	it("uses the database id verbatim without a name lookup", async () => {
		writeMigrations({ "0001_a.sql": "SELECT 1;" });
		const databaseId = DB.toUpperCase();
		let listed = false;
		server.use(
			http.get(`${ACCT}/d1/database`, () => {
				listed = true;
				return HttpResponse.json({ success: true, result: [] });
			})
		);
		const sent = mockQueries([], databaseId);

		const { exitCode } = await runCf(
			["d1", "migrations", "apply", databaseId],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(listed).toBe(false);
		expect(migrationStatements(sent)).toHaveLength(1);
	});

	it("rejects a database name before making an API request", async () => {
		writeMigrations({ "0001_a.sql": "SELECT 1;" });

		await expect(
			runCf(["d1", "migrations", "apply", "production"], ENV)
		).rejects.toThrow(/Expected a D1 database ID.*Database names/s);
	});

	it("does nothing and reports it when everything is applied", async () => {
		writeMigrations({ "0001_a.sql": "SELECT 1;" });
		const sent = mockQueries(["0001_a.sql"]);

		const { exitCode } = await runCf(["d1", "migrations", "apply", DB], ENV);

		expect(exitCode).toBe(0);
		expect(migrationStatements(sent)).toHaveLength(0);
		expect(JSON.parse(stdout())).toEqual([]);
	});

	it("uses Wrangler's affirmative fallback when non-interactive", async () => {
		writeMigrations({ "0001_a.sql": "SELECT 1;" });
		const sent = mockQueries();

		await runCf(["d1", "migrations", "apply", DB], ENV);

		expect(migrationStatements(sent)).toHaveLength(1);
	});

	it("continues after an unsuccessful result like Wrangler", async () => {
		writeMigrations({
			"0001_a.sql": "SELECT 'a';",
			"0002_b.sql": "SELECT 'b';",
			"0003_c.sql": "SELECT 'c';",
		});
		const sent: string[] = [];
		server.use(
			http.post(`${ACCT}/d1/database/${DB}/query`, async ({ request }) => {
				const body = (await request.json()) as { sql: string };
				sent.push(body.sql);
				if (body.sql.includes("SELECT") && !body.sql.includes("INSERT INTO")) {
					return HttpResponse.json({
						success: true,
						result: [{ success: true, results: [] }],
					});
				}
				if (body.sql.includes("0002_b.sql")) {
					return HttpResponse.json({
						success: true,
						result: [{ success: false, results: [] }],
					});
				}
				return HttpResponse.json({
					success: true,
					result: [{ success: true, results: [] }],
				});
			})
		);

		await runCf(["d1", "migrations", "apply", DB], ENV);

		const names = migrationStatements(sent).map(
			(sql) => /values \('(.+?)'\);/.exec(sql)?.[1]
		);
		expect(names).toEqual(["0001_a.sql", "0002_b.sql", "0003_c.sql"]);
	});

	it("errors when the migrations directory is missing", async () => {
		await expect(runCf(["d1", "migrations", "apply", DB], ENV)).rejects.toThrow(
			/No migrations directory/
		);
	});

	it("rejects a --pattern that is not under --dir", async () => {
		writeMigrations({ "0001_a.sql": "SELECT 1;" });

		await expect(
			runCf(
				[
					"d1",
					"migrations",
					"apply",
					DB,
					"--dir",
					"migrations",
					"--pattern",
					"elsewhere/*.sql",
				],
				ENV
			)
		).rejects.toThrow(/must start with "migrations\/"/);
	});
});
