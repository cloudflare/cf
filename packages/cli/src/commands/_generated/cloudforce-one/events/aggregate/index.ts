import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * aggregate command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "aggregate",
	describe: "Operations for events.aggregate",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
