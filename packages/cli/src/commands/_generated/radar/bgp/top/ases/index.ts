import $get from "./get.js";
import $prefixes from "./prefixes.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ases command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ases",
	describe: "Operations for bgp.top.ases",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($prefixes)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
