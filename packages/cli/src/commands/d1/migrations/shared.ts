/**
 * Shared plumbing for `cf d1 migrations apply` / `list`.
 *
 * Both commands take the same inputs, target the same database ID, and
 * compute the same applied/unapplied diff — only what they do with the
 * result differs.
 */
import fs from "node:fs";
import { createCommandClient, getAccountId } from "#lib/auth.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { withProgress } from "#lib/progress.js";
import { isId } from "#lib/resolve.js";
import {
	DEFAULT_MIGRATIONS_DIR,
	DEFAULT_MIGRATIONS_TABLE,
	findDrizzleLayoutHint,
	getCreateMigrationsTableQuery,
	getListAppliedMigrationsQuery,
	getMigrationNames,
	getUnappliedMigrationNames,
	normalizeSqlLineEndings,
	resolveMigrationsConfig,
} from "./bookkeeping.js";
import type { Cloudflare } from "#lib/auth.js";
import type { MigrationsConfig } from "./bookkeeping.js";
import type { Argv } from "yargs";

/**
 * `--dir` / `--pattern` — how migration files are discovered. All subcommands.
 *
 * Generic over the incoming argv shape so a positional declared by the
 * caller before this runs survives into `InferArgs`.
 */
export function migrationsFileOptions<T>(yargs: Argv<T>) {
	return yargs
		.option("dir", {
			type: "string",
			description: `Directory containing migration files (default: ${DEFAULT_MIGRATIONS_DIR})`,
		})
		.option("pattern", {
			type: "string",
			description:
				'Glob for discovering migration files under --dir. Defaults to "<dir>/*.sql"; Drizzle\'s nested layout uses "<dir>/*/migration.sql"',
		});
}

/** `--table` — only the subcommands that talk to the database need it. */
export function migrationsTableOption<T>(yargs: Argv<T>) {
	return migrationsFileOptions(yargs).option("table", {
		type: "string",
		description: "Table recording applied migrations",
		default: DEFAULT_MIGRATIONS_TABLE,
	});
}

/** Run one SQL batch against a database, returning the per-statement results. */
export async function executeSql(
	client: Cloudflare,
	accountId: string,
	databaseId: string,
	sql: string,
	label: string,
	local = false
): Promise<SqlResult[]> {
	return withProgress(label, async () => {
		const request = {
			account_id: accountId,
			database_id: databaseId,
			body: { sql: normalizeSqlLineEndings(sql) },
		};
		if (!local) {
			const response = await client.d1.query(request);
			return response?.result ?? [];
		}

		// Miniflare's explorer implements D1's /raw endpoint. Convert its
		// rows-and-columns representation to /query's row-object shape so all
		// migration bookkeeping above the transport stays identical.
		const response = await client.d1.raw(request);
		return (response?.result ?? []).map((result) => {
			const columns = result.results?.columns ?? [];
			const rows = result.results?.rows ?? [];
			return {
				...result,
				results: rows.map((row) =>
					Object.fromEntries(
						columns.map((column, index) => [column, row[index]])
					)
				),
			};
		});
	});
}

export interface SqlResult {
	success?: boolean;
	results?: Record<string, unknown>[];
}

export interface MigrationsContext {
	client: Cloudflare;
	accountId: string;
	databaseId: string;
	config: MigrationsConfig;
	local: boolean;
}

/**
 * Resolve credentials, the database, and the migrations directory. Shared
 * entry point for `apply` and `list`.
 */
export async function openMigrationsContext(argv: {
	database: string;
	dir?: string;
	pattern?: string;
	table: string;
	local?: boolean;
	persistTo?: string;
}): Promise<MigrationsContext> {
	if (!isId(argv.database)) {
		throw new Error(
			`Expected a D1 database ID, but received <database>=${JSON.stringify(argv.database)}. ` +
				"Database names and binding names are not accepted."
		);
	}

	const config = resolveMigrationsConfig({
		dir: argv.dir,
		pattern: argv.pattern,
		table: argv.table,
	});

	if (!fs.existsSync(config.migrationsPath)) {
		throw new Error(
			`No migrations directory at ${config.migrationsPath}.` +
				(argv.dir === undefined ? " Pass --dir to point at one." : "")
		);
	}

	const client = await createCommandClient(argv);
	const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();

	return {
		client,
		accountId,
		databaseId: argv.database,
		config,
		local: argv.local === true,
	};
}

export interface MigrationState {
	applied: string[];
	all: string[];
	unapplied: string[];
}

/**
 * Create the bookkeeping table if absent, read what has been applied, and
 * diff against what is on disk.
 */
export async function readMigrationState(
	ctx: MigrationsContext
): Promise<MigrationState> {
	const { client, accountId, databaseId, config } = ctx;

	await executeSql(
		client,
		accountId,
		databaseId,
		getCreateMigrationsTableQuery(config.migrationsTableName),
		"Preparing",
		ctx.local
	);
	const result = await executeSql(
		client,
		accountId,
		databaseId,
		getListAppliedMigrationsQuery(config.migrationsTableName),
		"Loading",
		ctx.local
	);
	const applied = (
		result[0] as SqlResult & { results: Record<string, unknown>[] }
	).results.map((row) => row.name as string);

	const all = getMigrationNames(config);
	if (all.length === 0) {
		const hint = findDrizzleLayoutHint(config);
		if (hint !== undefined) {
			process.stderr.write(
				`No files matched --pattern "${config.migrationsPattern}", but "${hint}" does match. ` +
					`If an ORM such as drizzle manages your migrations, pass --pattern "${hint}".\n`
			);
		}
	}

	return {
		applied,
		all,
		unapplied: getUnappliedMigrationNames(all, applied),
	};
}
