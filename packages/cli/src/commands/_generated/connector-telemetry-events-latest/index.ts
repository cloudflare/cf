import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * connector-telemetry-events-latest command
 * @generated from apis/overlays/connector-telemetry-events-latest.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "connector-telemetry-events-latest",
	describe: "connector-telemetry-events-latest",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
