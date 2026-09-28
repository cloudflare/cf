import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * references command group
 * @generated from apis/overlays/load-balancers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "references",
	describe:
		"Health check configurations that probe origin servers and determine pool availability",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
