import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * connector-telemetry-snapshots-latest command
 * @generated from apis/overlays/connector-telemetry-snapshots-latest.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "connector-telemetry-snapshots-latest",
	describe: "connector-telemetry-snapshots-latest",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
