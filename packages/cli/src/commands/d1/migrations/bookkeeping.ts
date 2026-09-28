/**
 * Wrangler-compatible D1 migration bookkeeping.
 *
 * Ported from `wrangler/src/d1/migrations/helpers.ts` and
 * `wrangler/src/d1/constants.ts`. Every value here is part of a wire
 * contract with a live `d1_migrations` table, so repos can switch between
 * `wrangler d1 migrations apply` and `cf d1 migrations apply` mid-project.
 * Divergence does not error — it replays migrations or applies them in the
 * wrong order. Keep this file behaviourally identical to Wrangler's, and
 * change it only alongside a change there.
 */
import fs from "node:fs";
import path from "node:path";
import { Minimatch } from "minimatch";

export const DEFAULT_MIGRATIONS_DIR = "./migrations";
export const DEFAULT_MIGRATIONS_TABLE = "d1_migrations";

/** Fully-resolved view of one invocation's migration inputs. */
export interface MigrationsConfig {
	/** Absolute path of the directory migrations are read from. */
	migrationsPath: string;
	/** Normalized `--dir` value, relative to cwd. `"."` means cwd itself. */
	migrationsDir: string;
	/** Normalized `--pattern` glob, guaranteed to sit under `migrationsDir`. */
	migrationsPattern: string;
	migrationsTableName: string;
}

/**
 * Canonicalize a relative path or glob for string-prefix comparison:
 * backslashes to forward slashes, `./` and `//` runs collapsed, no
 * trailing slash.
 */
export function normalizeRelativePath(p: string): string {
	const forwardSlashed = p.replace(/\\/g, "/");
	const normalized = path.posix.normalize(forwardSlashed);
	if (normalized.endsWith("/")) {
		return normalized.slice(0, -1);
	}
	return normalized;
}

/**
 * Rewrite `pattern` relative to `dir` by dropping the `${dir}/` prefix.
 * Both must already be normalized. Throws when `pattern` is not under `dir`.
 */
function stripDirPrefix(pattern: string, dir: string): string {
	if (dir === ".") {
		return pattern;
	}
	const prefix = `${dir}/`;
	if (!pattern.startsWith(prefix)) {
		throw new Error(
			`Expected migrations pattern ${JSON.stringify(pattern)} to start with ${JSON.stringify(prefix)}`
		);
	}
	return pattern.slice(prefix.length);
}

export function escapeIdentifier(id: string): string {
	return `"${id.replace(/"/g, '""')}"`;
}

export function getCreateMigrationsTableQuery(
	migrationsTableName: string
): string {
	const escapedTableName = escapeIdentifier(migrationsTableName);
	return `CREATE TABLE IF NOT EXISTS ${escapedTableName}(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);`;
}

export function getListAppliedMigrationsQuery(
	migrationsTableName: string
): string {
	const escapedTableName = escapeIdentifier(migrationsTableName);
	return `SELECT *
		FROM ${escapedTableName}
		ORDER BY id`;
}

/**
 * Resolve `--dir` / `--pattern` / `--table` into a `MigrationsConfig`,
 * rejecting a pattern that isn't under the directory (it could never match).
 */
export function resolveMigrationsConfig(opts: {
	dir?: string;
	pattern?: string;
	table?: string;
	cwd?: string;
}): MigrationsConfig {
	if (opts.pattern !== undefined && opts.dir === undefined) {
		throw new Error(
			`You have set --pattern "${opts.pattern}" but have not set --dir.\n\n` +
				'When --pattern is set, --dir must also be set, and --pattern must start with "<dir>/".'
		);
	}

	const migrationsDir = normalizeRelativePath(
		opts.dir ?? DEFAULT_MIGRATIONS_DIR
	);
	const defaultPattern = normalizeRelativePath(`${migrationsDir}/*.sql`);

	let migrationsPattern: string;
	if (opts.pattern === undefined) {
		migrationsPattern = defaultPattern;
	} else {
		migrationsPattern = normalizeRelativePath(opts.pattern);
		try {
			stripDirPrefix(migrationsPattern, migrationsDir);
		} catch {
			throw new Error(
				`--pattern "${opts.pattern}" must start with "${migrationsDir}/" to match --dir "${migrationsDir}".\n` +
					`Either change --pattern so it starts with "${migrationsDir}/" (for example, "${defaultPattern}"), ` +
					`or change --dir to match the start of your pattern.`
			);
		}
	}

	return {
		migrationsPath: path.resolve(opts.cwd ?? process.cwd(), migrationsDir),
		migrationsDir,
		migrationsPattern,
		migrationsTableName: opts.table ?? DEFAULT_MIGRATIONS_TABLE,
	};
}

/**
 * Recursively list regular files under `dir` whose `dir`-relative path
 * matches `matcher`, forward-slash separated and sorted by
 * {@link compareMigrationPaths}.
 *
 * Prunes with minimatch's `partial: true` mode — before descending, ask
 * whether the subdirectory's relative path could prefix a match. So
 * `*.sql` never recurses, `*\/migration.sql` descends one level, and
 * `**\/*.sql` recurses unconditionally.
 */
function listFilesRelative(dir: string, matcher: Minimatch): string[] {
	const out: string[] = [];
	const stack: Array<{ abs: string; rel: string }> = [{ abs: dir, rel: "" }];

	while (stack.length > 0) {
		const { abs, rel } = stack.pop() as { abs: string; rel: string };
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(abs, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			const childRel = rel === "" ? entry.name : `${rel}/${entry.name}`;
			if (entry.isDirectory()) {
				if (matcher.match(childRel, true /* partial */)) {
					stack.push({ abs: path.join(abs, entry.name), rel: childRel });
				}
			} else if (entry.isFile() && matcher.match(childRel)) {
				out.push(childRel);
			}
		}
	}

	return out.sort(compareMigrationPaths);
}

/**
 * Parse the leading integer from a migration's first path segment.
 * `0001_init.sql` and `0001_init/migration.sql` both yield `1`;
 * `init.sql` yields `NaN`.
 */
function leadingMigrationNumber(relativePath: string): number {
	const firstSegment = relativePath.split("/")[0] ?? "";
	return parseInt(firstSegment.split("_")[0] ?? "", 10);
}

function compareSegments(a: string, b: string): number {
	const aNum = leadingMigrationNumber(a);
	const bNum = leadingMigrationNumber(b);
	if (aNum !== bNum) {
		// `NaN !== NaN` is true, so unprefixed paths land here too. Guard with
		// isFinite and fall through to the lex tiebreaker below.
		if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
			return aNum - bNum;
		}
		if (Number.isFinite(aNum)) {
			return -1;
		}
		if (Number.isFinite(bNum)) {
			return 1;
		}
	}
	if (a < b) {
		return -1;
	}
	if (a > b) {
		return 1;
	}
	return 0;
}

/**
 * Order two migration paths by the leading integer of each path segment,
 * lex on ties, numbered before unnumbered.
 *
 * Numeric ordering matters for inconsistently-padded prefixes
 * (`1_a.sql`, `9_b.sql`, `10_c.sql`) — a lex sort would run `10_c.sql`
 * between `1_a.sql` and `9_b.sql`.
 */
export function compareMigrationPaths(a: string, b: string): number {
	const aSegments = a.split("/");
	const bSegments = b.split("/");
	const shared = Math.min(aSegments.length, bSegments.length);
	for (let i = 0; i < shared; i++) {
		const cmp = compareSegments(aSegments[i] ?? "", bSegments[i] ?? "");
		if (cmp !== 0) {
			return cmp;
		}
	}
	return aSegments.length - bSegments.length;
}

/**
 * Migration names matching the configured pattern, as paths relative to
 * `migrationsDir` — this is the exact string recorded in the migrations
 * table, so it must stay `migrationsDir`-relative.
 */
export function getMigrationNames(config: MigrationsConfig): string[] {
	const dirRelativePattern = stripDirPrefix(
		config.migrationsPattern,
		config.migrationsDir
	);
	return listFilesRelative(
		config.migrationsPath,
		new Minimatch(dirRelativePattern, { dot: false })
	);
}

export function getUnappliedMigrationNames(
	migrations: string[],
	appliedMigrations: string[]
): string[] {
	const unappliedMigrations: Array<string> = [];

	for (const migration of migrations) {
		if (!appliedMigrations.includes(migration)) {
			unappliedMigrations.push(migration);
		}
	}

	return unappliedMigrations;
}

/** Highest current migration number plus one. Unnumbered files are ignored. */
export function getNextMigrationNumber(config: MigrationsConfig): number {
	const matchedNames = getMigrationNames(config);
	const migrationNumbers = matchedNames
		.map((name) => leadingMigrationNumber(name))
		.filter((n) => Number.isFinite(n));
	return Math.max(...migrationNumbers, 0) + 1;
}

/**
 * When the configured pattern matched nothing but drizzle's nested layout
 * does match on disk, name the pattern that would work. Runs its own narrow
 * walk, so only call it in the no-matches branch.
 */
export function findDrizzleLayoutHint(
	config: MigrationsConfig
): string | undefined {
	const drizzleFiles = listFilesRelative(
		config.migrationsPath,
		new Minimatch("*/migration.sql", { dot: false })
	);
	if (drizzleFiles.length === 0) {
		return undefined;
	}
	return normalizeRelativePath(`${config.migrationsDir}/*/migration.sql`);
}

/**
 * Normalize structural CRLF line endings without touching quoted values,
 * quoted identifiers, or comment bodies.
 *
 * The D1 query API splits multi-statement SQL on `;` server-side and
 * mishandles CRLF inside a compound statement such as a
 * `CREATE TRIGGER ... BEGIN ... END;` body, so a `.sql` file checked out
 * with Windows line endings is silently corrupted without this.
 *
 * Duplicated from wrangler (`d1/splitter.ts`) because cf has nowhere shared
 * to put it yet. The durable fix is the API not splitting this way, or the
 * normalization living next to the endpoint in the SDK — see
 * `test_bugs/d1-query-no-crlf-normalization.md`. Delete this when that
 * lands rather than copying it a third time.
 */
export function normalizeSqlLineEndings(sql: string): string {
	let normalized = "";
	let quoteEnd: "'" | '"' | "`" | "]" | undefined;
	let inLineComment = false;
	let inBlockComment = false;

	for (let index = 0; index < sql.length; index++) {
		const char = sql[index];
		const nextChar = sql[index + 1];

		if (quoteEnd !== undefined) {
			normalized += char;
			if (char === quoteEnd) {
				if (nextChar === quoteEnd) {
					normalized += nextChar;
					index++;
				} else {
					quoteEnd = undefined;
				}
			}
			continue;
		}

		if (inLineComment) {
			if (char === "\r" && nextChar === "\n") {
				normalized += "\n";
				index++;
				inLineComment = false;
			} else {
				normalized += char;
				inLineComment = char !== "\n";
			}
			continue;
		}

		if (inBlockComment) {
			if (char === "\r" && nextChar === "\n") {
				normalized += "\n";
				index++;
			} else {
				normalized += char;
				if (char === "*" && nextChar === "/") {
					normalized += nextChar;
					index++;
					inBlockComment = false;
				}
			}
			continue;
		}

		if (char === "-" && nextChar === "-") {
			normalized += "--";
			index++;
			inLineComment = true;
			continue;
		}

		if (char === "/" && nextChar === "*") {
			normalized += "/*";
			index++;
			inBlockComment = true;
			continue;
		}

		if (char === "'" || char === '"' || char === "`") {
			normalized += char;
			quoteEnd = char;
			continue;
		}

		if (char === "[") {
			normalized += char;
			quoteEnd = "]";
			continue;
		}

		if (char === "\r" && nextChar === "\n") {
			normalized += "\n";
			index++;
			continue;
		}

		normalized += char;
	}

	return normalized;
}

/**
 * The SQL sent for one migration: the file's contents plus the bookkeeping
 * row, in a single statement batch.
 *
 * Bundling the INSERT is what keeps the migrations table from drifting out
 * of step with what actually ran, and it is what wrangler does — so cf must
 * match it. Whether the pair is genuinely atomic is unverified: D1 has no
 * transactions, `exec()` explicitly does not roll back, and multi-statement
 * REST `/query` appears to be `exec`-shaped, which would make wrangler's
 * "the migration will be rolled back" promise untrue for both CLIs. If that
 * is confirmed, the failure semantics here need revisiting — see
 * `test_bugs/d1-migrations-no-new-config-path.md`.
 */
export function buildMigrationQuery({
	migrationsPath,
	migrationName,
	migrationsTableName,
}: {
	migrationsPath: string;
	migrationName: string;
	migrationsTableName: string;
}): string {
	const migration = fs.readFileSync(
		path.join(migrationsPath, migrationName),
		"utf8"
	);
	const escapedTableName = escapeIdentifier(migrationsTableName);
	return `${migration}
INSERT INTO ${escapedTableName} (name)
values ('${migrationName.replace(/'/g, "''")}');`;
}
