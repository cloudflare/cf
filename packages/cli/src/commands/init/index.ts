import { withTelemetry } from "../../lib/telemetry/index.js";
import workersCommand, {
	INIT_TELEMETRY_SAFE_FLAGS,
	initBuilder,
	initWorkers,
	toInitWorkersOptions,
} from "./workers.js";
import type { CommonYargsOptions } from "../../lib/cli-types.js";
import type { InitArgs } from "./workers.js";
import type { Argv, CommandModule } from "yargs";

const initCommand: CommandModule<CommonYargsOptions, InitArgs> & {
	describe: string;
} = {
	command: "init [directory]",
	describe: "Create a new Cloudflare project or set up an existing one",

	builder: (yargs: Argv<CommonYargsOptions>) =>
		initBuilder(yargs)
			.command(
				withTelemetry(
					{
						...workersCommand,
						describe: `${workersCommand.describe} [default]`,
					},
					{
						command: "init workers",
						classification: { safeFlags: INIT_TELEMETRY_SAFE_FLAGS },
					}
				)
			)
			.epilogue(
				"Running cf init without a subcommand runs cf init workers. " +
					"An empty directory, or one containing only .git, receives a new hello-world Worker. " +
					"A directory with other files is set up with autoconfig instead. " +
					"When no directory is given, cf asks for one; non-interactive runs must pass it. " +
					"Use ./workers to initialize a directory named workers."
			),

	handler: async (argv) => {
		await initWorkers(toInitWorkersOptions(argv));
	},
};

export default initCommand;
