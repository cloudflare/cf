import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dns command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dns",
	describe:
		"Passive DNS data showing historical DNS resolution records for domains",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
