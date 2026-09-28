import $types from "./types/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * indicator command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "indicator",
	describe: "Operations for events.indicator",

	builder: (yargs) => {
		return yargs
			.command($types)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
