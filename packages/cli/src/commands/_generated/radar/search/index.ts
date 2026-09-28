import $global from "./global.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * search command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "search",
	describe: "Search Radar data across IPs, ASNs, domains, and locations",

	builder: (yargs) => {
		return yargs
			.command($global)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
