import disableCommand from "./disable.js";
import enableCommand from "./enable.js";
import statusCommand from "./status.js";
import type { Argv, CommandModule } from "yargs";

const telemetryCommand: CommandModule & { describe: string } = {
	command: "telemetry",
	describe: "Configure whether cf collects anonymous usage telemetry",
	builder: (yargs: Argv) =>
		yargs
			.command(statusCommand)
			.command(enableCommand)
			.command(disableCommand)
			.demandCommand(1, "Please specify a subcommand"),
	handler: () => {},
};

export default telemetryCommand;
