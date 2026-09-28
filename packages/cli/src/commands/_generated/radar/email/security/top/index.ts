import $tlds from "./tlds/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "top",
	describe: "Operations for email.security.top",

	builder: (yargs) => {
		return yargs.command($tlds).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
