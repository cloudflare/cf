import { mkdirSync, writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { runCf } from "../../helpers/run-cf.js";

describe("cf d1 migrations apply --local", () => {
	runInTempDir();

	const databaseId = "38a2e1b9-3a45-4f6e-9d0c-8b7a6c5d4e3f";
	const env = { CLOUDFLARE_API_TOKEN: undefined };
	const local = ["--local", "--persist-to", "state"];
	let log: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		mkdirSync("migrations");
		log = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	async function apply() {
		return runCf(["d1", "migrations", "apply", databaseId, ...local], env);
	}

	async function query(sql: string): Promise<unknown> {
		log.mockClear();
		await runCf(["d1", "raw", databaseId, "--sql", sql, ...local], env);
		return JSON.parse(String(log.mock.calls[0]?.[0]));
	}

	it("applies a 1 MB migration of short statements and records it only once", async () => {
		const sql = [
			"CREATE TABLE items (id INTEGER PRIMARY KEY, value TEXT);",
			...Array.from(
				{ length: 3_200 },
				(_, index) =>
					`INSERT INTO items VALUES (${index}, '${"x".repeat(320)}');`
			),
		].join("\n");
		expect(Buffer.byteLength(sql)).toBeGreaterThan(1_000_000);
		writeFileSync("migrations/0001_large.sql", sql);

		expect((await apply()).exitCode).toBe(0);
		expect(
			await query("SELECT count(*), sum(length(value)) FROM items")
		).toMatchObject([{ results: { rows: [[3_200, 3_200 * 320]] } }]);
		expect((await apply()).exitCode).toBe(0);
		expect(
			await query("SELECT name FROM d1_migrations ORDER BY id")
		).toMatchObject([{ results: { rows: [["0001_large.sql"]] } }]);
	}, 60_000);

	it("preserves triggers, quoted semicolons, comments, and CRLF in values", async () => {
		writeFileSync(
			"migrations/0001_boundaries.sql",
			[
				'CREATE TABLE "items;""quoted" (id INTEGER PRIMARY KEY, `value;field` TEXT);',
				"CREATE TABLE [audit;log] (value TEXT);",
				'CREATE TRIGGER "audit;trigger" AFTER INSERT ON "items;""quoted"',
				"BEGIN",
				"  INSERT INTO [audit;log] VALUES (CASE WHEN NEW.`value;field` = 'semi;colon''s\r\nline' THEN 'matched;value' ELSE 'wrong' END);",
				"  INSERT INTO [audit;log] VALUES ('second;value');",
				"END;",
				"-- A comment with ; CREATE TRIGGER BEGIN END;",
				"/* A block comment with ; and ' */",
				"INSERT INTO \"items;\"\"quoted\" VALUES (1, 'semi;colon''s\r\nline');",
				"-- trailing comment without a newline ;",
			].join("\r\n")
		);

		expect((await apply()).exitCode).toBe(0);
		expect(
			await query('SELECT `value;field` FROM "items;""quoted"')
		).toMatchObject([{ results: { rows: [["semi;colon's\r\nline"]] } }]);
		expect(
			await query("SELECT value FROM [audit;log] ORDER BY rowid")
		).toMatchObject([
			{ results: { rows: [["matched;value"], ["second;value"]] } },
		]);
		expect(await query("SELECT name FROM d1_migrations")).toMatchObject([
			{ results: { rows: [["0001_boundaries.sql"]] } },
		]);
	}, 60_000);

	it("accepts Wrangler-compatible transaction wrappers and deferred foreign keys", async () => {
		writeFileSync(
			"migrations/0001_transaction.sql",
			[
				"BEGIN TRANSACTION;",
				"PRAGMA defer_foreign_keys=ON;",
				"CREATE TABLE parents (id INTEGER PRIMARY KEY);",
				"CREATE TABLE children (parent_id INTEGER REFERENCES parents(id));",
				"INSERT INTO children VALUES (1);",
				"INSERT INTO parents VALUES (1);",
				"COMMIT;",
			].join("\n")
		);

		expect((await apply()).exitCode).toBe(0);
		expect(await query("SELECT parent_id FROM children")).toMatchObject([
			{ results: { rows: [[1]] } },
		]);
		expect(await query("SELECT name FROM d1_migrations")).toMatchObject([
			{ results: { rows: [["0001_transaction.sql"]] } },
		]);
	}, 60_000);

	it("rolls back a failed large migration, retains earlier migrations, and stops before later ones", async () => {
		writeFileSync(
			"migrations/0001_initial.sql",
			"CREATE TABLE items (id INTEGER PRIMARY KEY, value TEXT);\nINSERT INTO items VALUES (0, 'original');"
		);
		writeFileSync(
			"migrations/0002_failure.sql",
			[
				"CREATE TABLE rolled_back (id INTEGER);",
				...Array.from(
					{ length: 3_200 },
					(_, index) =>
						`INSERT INTO items VALUES (${index + 1}, '${"x".repeat(320)}');`
				),
				"INSERT INTO items VALUES (0, 'duplicate');",
			].join("\n")
		);
		writeFileSync(
			"migrations/0003_later.sql",
			"INSERT INTO items VALUES (4000, 'later');"
		);

		await expect(apply()).rejects.toThrow(/UNIQUE constraint failed/);
		expect(await query("SELECT * FROM items ORDER BY id")).toMatchObject([
			{ results: { rows: [[0, "original"]] } },
		]);
		expect(
			await query("SELECT name FROM sqlite_master WHERE name = 'rolled_back'")
		).toMatchObject([{ results: { rows: [] } }]);
		expect(
			await query("SELECT name FROM d1_migrations ORDER BY id")
		).toMatchObject([{ results: { rows: [["0001_initial.sql"]] } }]);

		writeFileSync(
			"migrations/0002_failure.sql",
			"INSERT INTO items VALUES (1, 'recovered');"
		);
		expect((await apply()).exitCode).toBe(0);
		expect(await query("SELECT * FROM items ORDER BY id")).toMatchObject([
			{
				results: {
					rows: [
						[0, "original"],
						[1, "recovered"],
						[4000, "later"],
					],
				},
			},
		]);
		expect(
			await query("SELECT name FROM d1_migrations ORDER BY id")
		).toMatchObject([
			{
				results: {
					rows: [
						["0001_initial.sql"],
						["0002_failure.sql"],
						["0003_later.sql"],
					],
				},
			},
		]);
	}, 60_000);

	it("rolls back the migration when its bookkeeping INSERT fails", async () => {
		writeFileSync(
			"migrations/0001_guard.sql",
			`CREATE TRIGGER reject_migration BEFORE INSERT ON d1_migrations
			WHEN NEW.name = '0002_rejected.sql'
			BEGIN
			  SELECT RAISE(ABORT, 'bookkeeping rejected');
			END;`
		);
		writeFileSync(
			"migrations/0002_rejected.sql",
			"CREATE TABLE rejected (value TEXT);\nINSERT INTO rejected VALUES ('rolled back');"
		);

		await expect(apply()).rejects.toThrow(/bookkeeping rejected/);
		expect(
			await query("SELECT name FROM sqlite_master WHERE name = 'rejected'")
		).toMatchObject([{ results: { rows: [] } }]);
		expect(
			await query("SELECT name FROM d1_migrations ORDER BY id")
		).toMatchObject([{ results: { rows: [["0001_guard.sql"]] } }]);
	}, 60_000);

	it("still rejects an oversized individual statement without recording or partially applying it", async () => {
		writeFileSync(
			"migrations/0001_too_big.sql",
			`CREATE TABLE items (value TEXT);\nINSERT INTO items VALUES ('${"x".repeat(110_000)}');`
		);

		await expect(apply()).rejects.toThrow(/SQLITE_TOOBIG/);
		expect(
			await query("SELECT name FROM sqlite_master WHERE name = 'items'")
		).toMatchObject([{ results: { rows: [] } }]);
		expect(await query("SELECT name FROM d1_migrations")).toMatchObject([
			{ results: { rows: [] } },
		]);
	}, 60_000);
});
