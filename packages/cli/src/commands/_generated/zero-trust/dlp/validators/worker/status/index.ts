import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * status command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "status",
	describe: "Data Loss Prevention - retrieve Worker validator status",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
