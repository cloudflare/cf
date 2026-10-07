import $run from "./run.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
import type { CommandModule } from "yargs";
import { withTelemetry } from "#lib/telemetry/index.js";

const command: CommandModule<CommonYargsOptions> = {
	command: "opencode",
	describe: "Run OpenCode through AI Gateway.",
	builder: (yargs) =>
		yargs
			.command(
				withTelemetry($run, { command: "ai opencode run", recordArgs: false })
			)
			.demandCommand(1, "Please specify a subcommand"),
	handler: () => {},
};

export default command;
