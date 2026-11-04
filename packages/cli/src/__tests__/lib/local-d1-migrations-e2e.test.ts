import { mkdirSync, writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCf } from "../helpers/run-cf.js";

/**
 * `cf d1 migrations apply --local` through the real local runtime, driving
 * the case reported in cloudflare/cf#509: a migration file larger than D1's
 * per-statement limit, whose statements are all short. D1 rejects a
 * statement over roughly 100 KB with SQLITE_TOOBIG, so the whole file must
 * not be sent as one statement — wrangler splits the SQL before sending, and
 * `cf d1 migrations apply` promises the same result.
 */
describe("cf d1 migrations apply --local end to end", () => {
	runInTempDir();

	let log: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		log = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		log.mockRestore();
	});

	it(
		"applies a migration file larger than D1's statement limit when every statement is short",
		async () => {
			const databaseId = "38a2e1b9-3a45-4f6e-9d0c-8b7a6c5d4e3f";
			mkdirSync("migrations");

			const statements = ["CREATE TABLE t (id INTEGER PRIMARY KEY, v TEXT);"];
			for (let i = 0; i < 4000; i++) {
				statements.push(`INSERT INTO t VALUES (${i}, '${"x".repeat(40)}');`);
			}
			const migration = `${statements.join("\n")}\n`;
			// Well over D1's ~100 KB per-statement limit, yet no statement is.
			expect(migration.length).toBeGreaterThan(100_000);
			writeFileSync("migrations/0001_big.sql", migration);

			const env = { CLOUDFLARE_API_TOKEN: undefined };
			const local = ["--local", "--persist-to", "state"];

			const applied = await runCf(
				["d1", "migrations", "apply", databaseId, ...local],
				env
			);
			expect(applied.exitCode).toBe(0);

			// The bookkeeping row landed too: the migration is no longer unapplied.
			log.mockClear();
			const listed = await runCf(
				["d1", "migrations", "list", databaseId, ...local],
				env
			);
			expect(listed.exitCode).toBe(0);
			expect(
				JSON.parse(
					log.mock.calls.map((call: unknown[]) => String(call[0])).join("\n")
				)
			).toEqual([]);
		},
		120_000
	);
});
