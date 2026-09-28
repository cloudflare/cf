import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * reputation command group
 * @generated from apis/overlays/email-sending.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "reputation",
	describe: "Operations for reputation",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
