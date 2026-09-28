import { describe, expect, it } from "vitest";
import {
	compareMigrationPaths,
	escapeIdentifier,
	normalizeRelativePath,
	normalizeSqlLineEndings,
	resolveMigrationsConfig,
} from "../../../commands/d1/migrations/bookkeeping.js";

/**
 * Unit tests for the wrangler-compatible pieces. These encode a wire
 * contract with a live `d1_migrations` table, so they are the tests that
 * matter most if this file is ever refactored — a divergence here does not
 * error, it replays or mis-orders someone's production schema.
 *
 * Cases ported from `wrangler/src/d1/migrations/helpers.ts`.
 */
describe("compareMigrationPaths", () => {
	function sorted(names: string[]): string[] {
		return [...names].sort(compareMigrationPaths);
	}

	it("orders by leading integer, not lexically", () => {
		expect(sorted(["10_c.sql", "1_a.sql", "9_b.sql"])).toEqual([
			"1_a.sql",
			"9_b.sql",
			"10_c.sql",
		]);
	});

	it("treats inconsistent zero-padding as equivalent", () => {
		expect(sorted(["0002_b.sql", "1_a.sql", "00003_c.sql"])).toEqual([
			"1_a.sql",
			"0002_b.sql",
			"00003_c.sql",
		]);
	});

	it("takes the number from a nested layout's directory segment", () => {
		expect(
			sorted([
				"0010_c/migration.sql",
				"0001_a/migration.sql",
				"0009_b/migration.sql",
			])
		).toEqual([
			"0001_a/migration.sql",
			"0009_b/migration.sql",
			"0010_c/migration.sql",
		]);
	});

	it("sorts numbered migrations before unnumbered ones", () => {
		expect(sorted(["init.sql", "0001_a.sql"])).toEqual([
			"0001_a.sql",
			"init.sql",
		]);
	});

	it("falls back to lex order for unnumbered migrations", () => {
		expect(sorted(["beta.sql", "alpha.sql"])).toEqual([
			"alpha.sql",
			"beta.sql",
		]);
	});

	it("breaks numeric ties lexically", () => {
		expect(sorted(["0001_b.sql", "0001_a.sql"])).toEqual([
			"0001_a.sql",
			"0001_b.sql",
		]);
	});
});

describe("escapeIdentifier", () => {
	it("quotes and doubles embedded quotes", () => {
		expect(escapeIdentifier("d1_migrations")).toBe('"d1_migrations"');
		expect(escapeIdentifier('we"ird')).toBe('"we""ird"');
	});
});

describe("normalizeRelativePath", () => {
	it("canonicalises separators, leading ./ and trailing /", () => {
		expect(normalizeRelativePath("./migrations/")).toBe("migrations");
		expect(normalizeRelativePath("migrations\\nested")).toBe(
			"migrations/nested"
		);
		expect(normalizeRelativePath("migrations//x")).toBe("migrations/x");
		expect(normalizeRelativePath(".")).toBe(".");
	});
});

describe("resolveMigrationsConfig", () => {
	it("defaults the directory and pattern during config resolution", () => {
		const config = resolveMigrationsConfig({});
		expect(config.migrationsDir).toBe("migrations");
		expect(config.migrationsPattern).toBe("migrations/*.sql");
		expect(config.migrationsTableName).toBe("d1_migrations");
	});

	it("accepts a nested pattern under the dir", () => {
		const config = resolveMigrationsConfig({
			dir: "migrations",
			pattern: "migrations/*/migration.sql",
		});
		expect(config.migrationsPattern).toBe("migrations/*/migration.sql");
	});

	it("rejects a pattern outside the dir with an actionable message", () => {
		expect(() =>
			resolveMigrationsConfig({ dir: "migrations", pattern: "other/*.sql" })
		).toThrow(/must start with "migrations\/"/);
	});

	it("rejects a pattern when no directory was supplied", () => {
		expect(() =>
			resolveMigrationsConfig({ pattern: "migrations/*.sql" })
		).toThrow(/have not set --dir/);
	});

	it("treats --dir . as the project root", () => {
		const config = resolveMigrationsConfig({ dir: "." });
		expect(config.migrationsDir).toBe(".");
		expect(config.migrationsPattern).toBe("*.sql");
	});
});

describe("normalizeSqlLineEndings", () => {
	it("converts structural CRLF to LF", () => {
		expect(normalizeSqlLineEndings("SELECT 1;\r\nSELECT 2;\r\n")).toBe(
			"SELECT 1;\nSELECT 2;\n"
		);
	});

	it("leaves CRLF inside a single-quoted string alone", () => {
		expect(normalizeSqlLineEndings("SELECT 'a\r\nb';\r\n")).toBe(
			"SELECT 'a\r\nb';\n"
		);
	});

	it("leaves CRLF inside a quoted identifier alone", () => {
		expect(normalizeSqlLineEndings('SELECT "a\r\nb";\r\n')).toBe(
			'SELECT "a\r\nb";\n'
		);
	});

	it("handles bracket-quoted identifiers", () => {
		expect(normalizeSqlLineEndings("SELECT [a\r\nb];\r\n")).toBe(
			"SELECT [a\r\nb];\n"
		);
	});

	it("normalises inside line and block comments", () => {
		expect(normalizeSqlLineEndings("-- note\r\nSELECT 1;")).toBe(
			"-- note\nSELECT 1;"
		);
		expect(normalizeSqlLineEndings("/* a\r\nb */\r\nSELECT 1;")).toBe(
			"/* a\nb */\nSELECT 1;"
		);
	});

	it("preserves an escaped quote inside a string", () => {
		expect(normalizeSqlLineEndings("SELECT 'it''s';\r\n")).toBe(
			"SELECT 'it''s';\n"
		);
	});

	it("keeps a compound statement body intact", () => {
		const sql =
			"CREATE TRIGGER t AFTER INSERT ON users\r\nBEGIN\r\n  SELECT 1;\r\nEND;\r\n";
		expect(normalizeSqlLineEndings(sql)).toBe(
			"CREATE TRIGGER t AFTER INSERT ON users\nBEGIN\n  SELECT 1;\nEND;\n"
		);
	});
});
