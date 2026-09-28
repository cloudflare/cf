import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ip-lists command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ip-lists",
	describe: "Curated IP lists used for threat detection and policy enforcement",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
