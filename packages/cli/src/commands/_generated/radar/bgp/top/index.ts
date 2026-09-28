import $ases from "./ases/index.js";
import $prefixes from "./prefixes.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "top",
	describe: "Operations for bgp.top",

	builder: (yargs) => {
		return yargs
			.command($prefixes)
			.command($ases)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
