import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dcv-delegation command group
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dcv-delegation",
	describe: "Operations for dcv-delegation",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
