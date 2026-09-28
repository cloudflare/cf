import $get from "./get.js";
import $set from "./set.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * emergency-disconnect command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "emergency-disconnect",
	describe: "Operations for devices.emergency-disconnect",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($set)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
