import fs from "node:fs";
import path from "node:path";
import {
	compareMigrationPaths,
	findDrizzleLayoutHint,
	getMigrationNames,
	getNextMigrationNumber,
	normalizeSqlLineEndings,
	resolveMigrationsConfig,
} from "cf/d1-migrations-bookkeeping";
import { describe, it } from "vite-plus/test";
import { runInTempDir } from "../../helpers/run-in-tmp";
import type { MigrationsConfig } from "cf/d1-migrations-bookkeeping";

function seedProjectFiles(files: string[]): void {
	for (const file of files) {
		const absolute = path.resolve(file);
		fs.mkdirSync(path.dirname(absolute), { recursive: true });
		fs.writeFileSync(absolute, "-- test migration");
	}
}

function migrationsConfig(
	props: { dir?: string; pattern?: string; cwd?: string } = {}
): MigrationsConfig {
	return resolveMigrationsConfig({
		dir: props.dir ?? "migrations",
		pattern: props.pattern,
		cwd: props.cwd,
	});
}

describe("normalizeSqlLineEndings()", () => {
	it("should preserve CRLF inside quoted SQL values and identifiers", ({
		expect,
	}) => {
		const sql =
			"SELECT 'single''quote\r\nvalue', \"double\r\nquote\", `backtick\r\nquote`, [bracket\r\nquote]; -- don't stop scanning\r\n/* block\r\ncomment */\r\nSELECT 1;";

		expect(normalizeSqlLineEndings(sql)).toBe(
			"SELECT 'single''quote\r\nvalue', \"double\r\nquote\", `backtick\r\nquote`, [bracket\r\nquote]; -- don't stop scanning\n/* block\ncomment */\nSELECT 1;"
		);
	});
});

describe("getMigrationNames", () => {
	runInTempDir();

	const cases: Array<{
		name: string;
		files: string[];
		pattern?: string;
		expected: string[];
	}> = [
		{
			name: "returns an empty array for an empty directory",
			files: [],
			expected: [],
		},
		{
			name: "returns top-level .sql files sorted lexicographically with the default pattern",
			files: [
				"migrations/0003_add_indexes.sql",
				"migrations/0001_create_tables.sql",
				"migrations/0002_add_columns.sql",
				"migrations/0005_update_views.sql",
				"migrations/0004_drop_unused.sql",
			],
			expected: [
				"0001_create_tables.sql",
				"0002_add_columns.sql",
				"0003_add_indexes.sql",
				"0004_drop_unused.sql",
				"0005_update_views.sql",
			],
		},
		{
			name: "ignores non-SQL files under the default pattern",
			files: [
				"migrations/0001_create_tables.sql",
				"migrations/0002_add_columns.sql",
				"migrations/README.md",
				"migrations/config.json",
			],
			expected: ["0001_create_tables.sql", "0002_add_columns.sql"],
		},
		{
			name: "does not pick up nested .sql files with the default pattern",
			files: [
				"migrations/0001_create_tables.sql",
				"migrations/test_data/destroy.sql",
			],
			expected: ["0001_create_tables.sql"],
		},
		{
			name: "picks up nested .sql files when migrations_pattern is configured",
			files: [
				"migrations/0000_init/migration.sql",
				"migrations/0001_users/migration.sql",
			],
			pattern: "migrations/*/migration.sql",
			expected: ["0000_init/migration.sql", "0001_users/migration.sql"],
		},
		{
			name: "matches files by whatever extension `migrations_pattern` specifies, not just `.sql`",
			files: [
				"migrations/0001_init.up.sql",
				"migrations/0002_users.up.sql",
				"migrations/0099_legacy.sql",
			],
			pattern: "migrations/*.up.sql",
			expected: ["0001_init.up.sql", "0002_users.up.sql"],
		},
		{
			name: "returns names relative to migrations_dir even when the pattern has a literal sub-segment between migrations_dir and the first glob",
			files: [
				"migrations/sub/0001_x.sql",
				"migrations/sub/0002_y.sql",
				"migrations/ignored.sql",
			],
			pattern: "migrations/sub/*.sql",
			expected: ["sub/0001_x.sql", "sub/0002_y.sql"],
		},
		{
			name: "recursively finds .sql files 3 levels deep when migrations_pattern uses **",
			files: [
				"migrations/0001_top.sql",
				"migrations/feature_a/0002_mid.sql",
				"migrations/feature_b/sub/0003_deep.sql",
			],
			pattern: "migrations/**/*.sql",
			expected: [
				"0001_top.sql",
				"feature_a/0002_mid.sql",
				"feature_b/sub/0003_deep.sql",
			],
		},
		{
			name: "ignores nested .sql files that the configured pattern can't reach",
			files: ["migrations/test_data/destroy.sql"],
			pattern: "migrations/*.sql",
			expected: [],
		},
		{
			name: "does not descend into subdirectories the configured pattern cannot reach",
			files: [
				"migrations/0001_real.sql",
				"migrations/node_modules/pkg/0001/migration.sql",
			],
			expected: ["0001_real.sql"],
		},
		{
			name: "descends arbitrarily deep when migrations_pattern uses `**`",
			files: ["migrations/very/deeply/nested/0001_init.sql"],
			pattern: "migrations/**/*.sql",
			expected: ["very/deeply/nested/0001_init.sql"],
		},
	];

	for (const testCase of cases) {
		it(testCase.name, ({ expect }) => {
			fs.mkdirSync("migrations", { recursive: true });
			seedProjectFiles(testCase.files);
			expect(
				getMigrationNames(migrationsConfig({ pattern: testCase.pattern }))
			).toEqual(testCase.expected);
		});
	}

	it("works end-to-end when migrations_dir / migrations_pattern are absolute Windows-style backslash paths", ({
		expect,
	}) => {
		const absoluteDir = path.resolve("migrations").replaceAll("/", "\\");
		seedProjectFiles([
			"migrations/0001_init/migration.sql",
			"migrations/0002_users/migration.sql",
		]);
		const config = migrationsConfig({
			dir: absoluteDir,
			pattern: `${absoluteDir}\\*\\migration.sql`,
		});
		expect(getMigrationNames(config)).toEqual([
			"0001_init/migration.sql",
			"0002_users/migration.sql",
		]);
	});
});

describe("maybeLogHint", () => {
	runInTempDir();

	it("logs an actionable hint when nested files match `*/migration.sql` (drizzle layout) but the configured pattern finds nothing", ({
		expect,
	}) => {
		seedProjectFiles(["migrations/0000_init/migration.sql"]);
		expect(findDrizzleLayoutHint(migrationsConfig())).toBe(
			"migrations/*/migration.sql"
		);
	});

	it("does not log a hint for nested .sql files that aren't named `migration.sql`", ({
		expect,
	}) => {
		seedProjectFiles(["migrations/test_data/destroy.sql"]);
		expect(findDrizzleLayoutHint(migrationsConfig())).toBeUndefined();
	});

	it("does not log a hint when there are no nested files at all", ({
		expect,
	}) => {
		seedProjectFiles(["migrations/0001_init.sql"]);
		expect(findDrizzleLayoutHint(migrationsConfig())).toBeUndefined();
	});
});

describe("getMigrationNames ordering", () => {
	runInTempDir();

	const cases: Array<{
		name: string;
		files: string[];
		pattern?: string;
		expected: string[];
	}> = [
		{
			name: "sorts zero-padded migrations in numeric order",
			files: [
				"migrations/0010_j.sql",
				"migrations/0002_b.sql",
				"migrations/0001_a.sql",
				"migrations/0100_h.sql",
			],
			expected: ["0001_a.sql", "0002_b.sql", "0010_j.sql", "0100_h.sql"],
		},
		{
			name: "sorts inconsistently-padded numeric prefixes in numeric order, NOT lexicographic",
			files: [
				"migrations/1_a.sql",
				"migrations/9_b.sql",
				"migrations/10_c.sql",
			],
			expected: ["1_a.sql", "9_b.sql", "10_c.sql"],
		},
		{
			name: "gives a deterministic order for files with the same numeric prefix (the old comparator returned 0)",
			files: [
				"migrations/0001_beta.sql",
				"migrations/0001_alpha.sql",
				"migrations/0001_gamma.sql",
			],
			expected: ["0001_alpha.sql", "0001_beta.sql", "0001_gamma.sql"],
		},
		{
			name: "gives a deterministic order for files without a numeric prefix (the old comparator returned 0)",
			files: [
				"migrations/migrate.sql",
				"migrations/init.sql",
				"migrations/seed.sql",
			],
			expected: ["init.sql", "migrate.sql", "seed.sql"],
		},
		{
			name: "puts numbered files before unnumbered files",
			files: [
				"migrations/setup.sql",
				"migrations/0002_users.sql",
				"migrations/cleanup.sql",
				"migrations/0001_init.sql",
			],
			expected: ["0001_init.sql", "0002_users.sql", "cleanup.sql", "setup.sql"],
		},
		{
			name: "uses the directory's numeric prefix for nested drizzle-style layouts",
			files: [
				"migrations/10_c/migration.sql",
				"migrations/2_b/migration.sql",
				"migrations/1_a/migration.sql",
			],
			pattern: "migrations/*/migration.sql",
			expected: [
				"1_a/migration.sql",
				"2_b/migration.sql",
				"10_c/migration.sql",
			],
		},
	];

	for (const testCase of cases) {
		it(testCase.name, ({ expect }) => {
			seedProjectFiles(testCase.files);
			expect(
				getMigrationNames(migrationsConfig({ pattern: testCase.pattern }))
			).toEqual(testCase.expected);
		});
	}
});

describe("compareMigrationPaths", () => {
	it("orders numbered files inside a shared numbered directory numerically", ({
		expect,
	}) => {
		const files = [
			"0001_posts/10_c.sql",
			"0001_posts/1_a.sql",
			"0001_posts/9_b.sql",
		];
		expect(files.sort(compareMigrationPaths)).toEqual([
			"0001_posts/1_a.sql",
			"0001_posts/9_b.sql",
			"0001_posts/10_c.sql",
		]);
	});
});

describe("getNextMigrationNumber", () => {
	runInTempDir();

	const cases: Array<{
		name: string;
		files: string[];
		pattern?: string;
		expected: number;
	}> = [
		{
			name: "returns 1 for an empty directory",
			files: [],
			expected: 1,
		},
		{
			name: "returns highest top-level number + 1 for flat layouts (default pattern)",
			files: ["migrations/0001_create.sql", "migrations/0002_users.sql"],
			expected: 3,
		},
		{
			name: "counts numbered directories the same as numbered files when the pattern matches both",
			files: [
				"migrations/0001_create.sql",
				"migrations/0002_users.sql",
				"migrations/0099_nested/migration.sql",
			],
			pattern: "migrations/**/*.sql",
			expected: 100,
		},
		{
			name: "ignores files in unnumbered subdirectories (default pattern)",
			files: ["migrations/0001_create.sql", "migrations/test_data/destroy.sql"],
			expected: 2,
		},
		{
			name: "collapses multiple files inside a single numbered directory to one number",
			files: [
				"migrations/0001_init/01.sql",
				"migrations/0001_init/02.sql",
				"migrations/0001_init/99.sql",
			],
			pattern: "migrations/**/*.sql",
			expected: 2,
		},
		{
			name: "uses only files that match `migrations_pattern` — top-level files are invisible under a nested-only pattern",
			files: [
				"migrations/0099_stale_topfile.sql",
				"migrations/0001_init/migration.sql",
				"migrations/0002_users/migration.sql",
			],
			pattern: "migrations/*/migration.sql",
			expected: 3,
		},
		{
			name: "uses only files that match `migrations_pattern` — nested files are invisible under a flat-only pattern",
			files: [
				"migrations/0001_create.sql",
				"migrations/0099_drizzle/migration.sql",
			],
			pattern: "migrations/*.sql",
			expected: 2,
		},
		{
			name: "returns 1 when `migrations_pattern` matches nothing at all",
			files: [
				"migrations/0001_init/migration.sql",
				"migrations/0002_users/migration.sql",
			],
			expected: 1,
		},
	];

	for (const testCase of cases) {
		it(testCase.name, ({ expect }) => {
			fs.mkdirSync("migrations", { recursive: true });
			seedProjectFiles(testCase.files);
			expect(
				getNextMigrationNumber(migrationsConfig({ pattern: testCase.pattern }))
			).toBe(testCase.expected);
		});
	}
});

describe("resolveMigrationsConfig", () => {
	it("is a no-op when migrations_pattern is not set", ({ expect }) => {
		expect(() => migrationsConfig()).not.toThrow();
	});

	it("is a no-op when migrations_pattern is not set even if migrations_dir is", ({
		expect,
	}) => {
		expect(() => migrationsConfig({ dir: "db/migrations" })).not.toThrow();
	});

	const accepted: Array<[string, string, string, string?, string?]> = [
		[
			"accepts pattern that literally starts with migrations_dir",
			"migrations",
			"migrations/*.sql",
		],
		[
			"accepts nested drizzle-style pattern",
			"migrations",
			"migrations/*/migration.sql",
		],
		[
			"accepts deeply nested pattern with deeply nested dir",
			"db/migrations",
			"db/migrations/**/*.sql",
		],
		[
			"normalises `./` prefix on migrations_dir before comparing",
			"./migrations",
			"migrations/*.sql",
		],
		[
			"normalises trailing `/` on migrations_dir before comparing",
			"migrations/",
			"migrations/*.sql",
		],
		[
			"normalises `./` prefix on migrations_pattern before comparing",
			"migrations",
			"./migrations/*.sql",
		],
		[
			"normalises a Windows drive-letter path with backslashes",
			"C:\\some\\windows\\path",
			"C:\\some\\windows\\path\\*\\migration.sql",
			"C:/some/windows/path",
			"C:/some/windows/path/*/migration.sql",
		],
		[
			'accepts `migrations_dir: "."` with a pattern rooted at the project root',
			".",
			"./*.sql",
			".",
			"*.sql",
		],
		[
			"accepts matching absolute paths",
			"/abs/migrations",
			"/abs/migrations/*.sql",
		],
		[
			"accepts Windows-style absolute paths with backslashes",
			"C:\\Users\\Dave\\proj\\migrations",
			"C:\\Users\\Dave\\proj\\migrations\\*.sql",
		],
		[
			"accepts a Windows-style dir with a forward-slash pattern (typical config)",
			"C:\\Users\\Dave\\proj\\migrations",
			"C:/Users/Dave/proj/migrations/*/migration.sql",
		],
	];

	for (const [name, dir, pattern, expectedDir, expectedPattern] of accepted) {
		it(name, ({ expect }) => {
			const config = migrationsConfig({ dir, pattern });
			expect(config.migrationsDir).toBe(
				expectedDir ??
					dir.replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/$/, "")
			);
			expect(config.migrationsPattern).toBe(
				expectedPattern ?? pattern.replaceAll("\\", "/").replace(/^\.\//, "")
			);
		});
	}

	it("rejects migrations_pattern set without an explicit migrations_dir, with an actionable hint", ({
		expect,
	}) => {
		const call = () => resolveMigrationsConfig({ pattern: "migrations/*.sql" });

		expect(call).toThrow(/have not set --dir/);
		expect(call).toThrow(/--dir must also be set/);
	});

	const rejected: Array<[string, string, string]> = [
		[
			"rejects pattern with wrong literal prefix, with an actionable hint",
			"migrations",
			"schema/*.sql",
		],
		[
			"rejects a top-level `*.sql` pattern when dir is a subdirectory",
			"migrations",
			"*.sql",
		],
		[
			"rejects a globstar-prefix pattern (must start with the literal dir)",
			"migrations",
			"**/*.sql",
		],
		[
			"rejects a pattern that only partially overlaps the dir name",
			"migrations",
			"migrationsfoo/*.sql",
		],
		[
			"rejects mismatched absolute paths",
			"/abs/migrations",
			"/abs/other/*.sql",
		],
		[
			"rejects mixing absolute dir with relative pattern",
			"/abs/migrations",
			"migrations/*.sql",
		],
		[
			"rejects mixing relative dir with absolute pattern",
			"migrations",
			"/abs/migrations/*.sql",
		],
		[
			"rejects mismatched Windows-style absolute paths",
			"C:\\Users\\Dave\\proj\\migrations",
			"C:\\Users\\Dave\\proj\\other\\*.sql",
		],
	];

	for (const [name, dir, pattern] of rejected) {
		it(name, ({ expect }) => {
			expect(() => migrationsConfig({ dir, pattern })).toThrow();
		});
	}
});
