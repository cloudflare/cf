import $get from "./get.js";
import $replace from "./replace.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * initial-resolved-ip command group
 * @generated from apis/overlays/network.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "initial-resolved-ip",
	describe: "Operations for subnets.initial-resolved-ip",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($replace)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
