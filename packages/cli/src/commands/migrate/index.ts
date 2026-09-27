import { theme } from "../../lib/ui/index.js";
import {
	detectWranglerMigrationBundler,
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
			description: `Bundler to use in the migrated project (defaults to vite when @cloudflare/vite-plugin is declared, otherwise wrangler)`,
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
			description: `Install cf as a project dependency (use --no-install to skip)`,
		});
}

type MigrateArgs = InferArgs<typeof builder>;
type MigrationBundler = NonNullable<MigrateArgs["bundler"]>;

function printDetectedBundler(bundler: MigrationBundler): void {
	console.log(
		theme.muted(
			bundler === "vite"
				? "Using the Vite bundler because @cloudflare/vite-plugin is declared. Pass --bundler wrangler to override."
				: "Using the Wrangler bundler because @cloudflare/vite-plugin is not declared. Pass --bundler vite to override."
		)
	);
}

const migrateCommand: CommandModule<CommonYargsOptions, MigrateArgs> = {
	command: "migrate [path]",
	describe: "Migrate a Wrangler project to cf",
	builder,
	handler: async (args) => {
		const configPath = await resolveWranglerConfigPath(args.path);
		const bundler =
			args.bundler ?? (await detectWranglerMigrationBundler(configPath));
		if (args.bundler === undefined) {
			printDetectedBundler(bundler);
		}
		await runWranglerMigration(configPath, {
			bundler,
			dryRun: args["dry-run"],
			force: args.force,
			installDependencies: args.install,
		});
	},
};

export default migrateCommand;
