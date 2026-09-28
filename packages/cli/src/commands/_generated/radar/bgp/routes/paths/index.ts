import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * paths command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "paths",
	describe: "Operations for bgp.routes.paths",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
