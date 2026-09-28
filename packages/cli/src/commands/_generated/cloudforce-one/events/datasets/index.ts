import $populate from "./populate/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * datasets command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "datasets",
	describe: "Operations for events.datasets",

	builder: (yargs) => {
		return yargs
			.command($populate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
