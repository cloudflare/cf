import { formatOutput } from "#lib/output.js";
import {
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
	command: "list <database>",
	describe: "View a list of unapplied migration files",
	builder,
	handler: async (argv): Promise<void> => {
		const ctx = await openMigrationsContext(argv);
		const { unapplied } = await readMigrationState(ctx);

		formatOutput(
			unapplied.map((migration) => ({ Name: migration })),
			{ quiet: argv.quiet }
		);
	},
};

export default command;
