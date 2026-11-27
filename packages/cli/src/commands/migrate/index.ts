import {
	resolveWranglerConfigPath,
	runWranglerMigration,
} from "../../lib/wrangler-migration.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("path", {
			type: "string",
			description: `Path to a Wrangler configuration file`,
		})
		.option("bundler", {
			choices: ["vite", "wrangler"] as const,
			description: `Bundler to use in the migrated project, unless its framework setup chooses one (defaults to vite when @cloudflare/vite-plugin is declared, otherwise wrangler)`,
		})
		.option("dry-run", {
			type: "boolean",
			default: false,
			description: `Show the files that would change without writing them`,
		})
		.option("force", {
			type: "boolean",
			default: false,
			description: `Run even if the Git worktree is not clean`,
		})
		.option("install", {
			type: "boolean",
			default: true,
			description: `Install the packages the migrated project needs and set up its framework (use --no-install to skip both)`,
		});
}

type MigrateArgs = InferArgs<typeof builder>;

const migrateCommand: CommandModule<CommonYargsOptions, MigrateArgs> = {
	command: "migrate [path]",
	describe: "Migrate a Wrangler project to cf",
	builder,
	handler: async (args) => {
		const configPath = await resolveWranglerConfigPath(args.path);
		await runWranglerMigration(configPath, {
			bundler: args.bundler,
			dryRun: args["dry-run"],
			force: args.force,
			installDependencies: args.install,
		});
	},
};

export default migrateCommand;
