import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * spoof command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "spoof",
	describe: "Operations for email.security.top.tlds.spoof",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
