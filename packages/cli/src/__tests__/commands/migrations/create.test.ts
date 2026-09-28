import fs from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";

/**
 * `cf d1 migrations create`. Entirely local: MSW is armed with no handlers and
 * `onUnhandledRequest: "error"`, so any outbound request would fail the
 * test — which is the assertion that this command needs no credentials.
 */
describe("cf d1 migrations create", () => {
	runInTempDir();
	setupMsw();

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

	it("writes a numbered file and needs no network or credentials", async () => {
		const { exitCode } = await runCf(
			["d1", "migrations", "create", "add users table"],
			// No CLOUDFLARE_API_TOKEN — this must not need one.
			{}
		);

		expect(exitCode).toBe(0);
		expect(fs.readdirSync("migrations")).toEqual(["0001_add_users_table.sql"]);
		expect(
			fs.readFileSync("migrations/0001_add_users_table.sql", "utf8")
		).toMatch(/^-- Migration number: 0001 \t \d{4}-\d{2}-\d{2}T/);
		expect(JSON.parse(stdout()).name).toBe("0001_add_users_table.sql");
	});

	it("rejects --local because create is already local", async () => {
		await expect(
			runCf(["d1", "migrations", "create", "test", "--local"], {})
		).rejects.toThrow(
			/--local is not supported.*only creates a migration file on your local filesystem.*do not need --local/s
		);
		expect(fs.existsSync("migrations")).toBe(false);
	});

	it("numbers from the highest existing migration, not the count", async () => {
		fs.mkdirSync("migrations", { recursive: true });
		fs.writeFileSync("migrations/0007_earlier.sql", "SELECT 1;");

		await runCf(["d1", "migrations", "create", "next"], {});

		expect(fs.existsSync("migrations/0008_next.sql")).toBe(true);
	});

	it("ignores unnumbered migrations when picking the next number", async () => {
		fs.mkdirSync("migrations", { recursive: true });
		fs.writeFileSync("migrations/init.sql", "SELECT 1;");
		fs.writeFileSync("migrations/0002_second.sql", "SELECT 1;");

		await runCf(["d1", "migrations", "create", "third"], {});

		expect(fs.existsSync("migrations/0003_third.sql")).toBe(true);
	});

	it("refuses a name that the configured --pattern would not match", async () => {
		fs.mkdirSync("migrations", { recursive: true });

		await expect(
			runCf(
				[
					"d1",
					"migrations",
					"create",
					"next",
					"--dir",
					"migrations",
					"--pattern",
					"migrations/*/migration.sql",
				],
				{}
			)
		).rejects.toThrow(/would not match it/);
	});

	it("rejects a message containing a path separator", async () => {
		await expect(
			runCf(["d1", "migrations", "create", "nested/thing"], {})
		).rejects.toThrow(/path separator/);
	});

	it("creates the migrations directory when absent", async () => {
		expect(fs.existsSync("custom")).toBe(false);

		const { exitCode } = await runCf(
			["d1", "migrations", "create", "first", "--dir", "custom"],
			{}
		);

		expect(exitCode).toBe(0);
		expect(fs.readdirSync("custom")).toEqual(["0001_first.sql"]);
	});

	it("matches the proposed path with Wrangler's full glob", async () => {
		await expect(
			runCf(
				["d1", "migrations", "create", "first", "--dir", "migration[s]"],
				{}
			)
		).rejects.toThrow(/would not match/);
	});

	it("never clobbers an existing migration", async () => {
		fs.mkdirSync("migrations", { recursive: true });
		fs.writeFileSync("migrations/0001_dupe.sql", "SELECT 'original';");

		const { exitCode } = await runCf(
			["d1", "migrations", "create", "dupe"],
			{}
		);

		// Same message, but the number advances, so the original survives.
		expect(exitCode).toBe(0);
		expect(fs.readFileSync("migrations/0001_dupe.sql", "utf8")).toBe(
			"SELECT 'original';"
		);
		expect(fs.existsSync("migrations/0002_dupe.sql")).toBe(true);
	});

	it("errors clearly when the target path is occupied by a directory", async () => {
		fs.mkdirSync("migrations/0001_odd.sql", { recursive: true });

		// The directory is not matched by the default `*.sql` file pattern, so
		// numbering does not skip past it and the target path collides.
		await expect(
			runCf(["d1", "migrations", "create", "odd"], {})
		).rejects.toThrow(/EISDIR|directory/i);
	});
});
