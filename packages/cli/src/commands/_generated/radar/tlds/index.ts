import $get from "./get.js";
import $list from "./list.js";
import $performance from "./performance/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tlds command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tlds",
	describe: "Top-level domain (TLD) metadata and performance trends",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($performance)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
