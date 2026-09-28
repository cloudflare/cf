import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * raw command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "raw",
	describe: "Operations for investigate.raw",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
