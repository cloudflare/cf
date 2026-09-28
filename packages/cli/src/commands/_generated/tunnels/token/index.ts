import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * token command group
 * @generated from apis/overlays/tunnels.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "token",
	describe: "Operations for token",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
