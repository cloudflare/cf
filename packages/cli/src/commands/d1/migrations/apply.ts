import { formatOutput } from "#lib/output.js";
import { confirm } from "#lib/prompt.js";
import { buildMigrationQuery } from "./bookkeeping.js";
import {
	executeSql,
	migrationsTableOption,
	openMigrationsContext,
	readMigrationState,
} from "./shared.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return migrationsTableOption(
		yargs.positional("database", {
			type: "string",
			description: "D1 database ID",
			demandOption: true,
		})
	);
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "apply <database>",
	describe: "Apply any unapplied D1 migrations",
	builder,
	handler: async (argv): Promise<void> => {
		const ctx = await openMigrationsContext(argv);
		const unappliedMigrations = (await readMigrationState(ctx)).unapplied.map(
			(migration) => ({
				name: migration,
				status: "🕒️",
			})
		);

		if (unappliedMigrations.length === 0) {
			formatOutput([], {
				successLabel: "No migrations to apply",
				quiet: argv.quiet,
			});
			return;
		}

		const ok = await confirm(
			`About to apply ${unappliedMigrations.length} migration(s)\n` +
				"Your database may not be available to serve requests during the migration, continue?"
		);
		if (!ok) {
			return;
		}

		for (const migration of unappliedMigrations) {
			const sql = buildMigrationQuery({
				migrationsPath: ctx.config.migrationsPath,
				migrationName: migration.name,
				migrationsTableName: ctx.config.migrationsTableName,
			});

			let success = true;
			let errorNotes: string[] = [];
			try {
				const results = await executeSql(
					ctx.client,
					ctx.accountId,
					ctx.databaseId,
					sql,
					`Applying ${migration.name}`,
					ctx.local
				);

				for (const result of results) {
					if (!result.success) {
						success = false;
					}
				}
			} catch (err) {
				success = false;
				errorNotes = [err instanceof Error ? err.message : String(err)];
			}

			migration.status = success ? "✅" : "❌";

			if (errorNotes.length > 0) {
				throw new Error(errorNotes.join("\n"));
			}
		}

		formatOutput(unappliedMigrations, { quiet: argv.quiet });
	},
};

export default command;
