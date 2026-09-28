import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * connectors command group
 * @generated from apis/overlays/tunnels.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "connectors",
	describe: "Operations for connectors",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
