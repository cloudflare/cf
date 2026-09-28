import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * subnets command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "subnets",
	describe: "Operations for asn.subnets",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
