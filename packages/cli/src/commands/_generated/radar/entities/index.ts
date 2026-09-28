import $asns from "./asns/index.js";
import $get from "./get.js";
import $locations from "./locations/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * entities command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "entities",
	describe:
		"Look up ASNs, IPs, domains, and locations with metadata and traffic summaries",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($asns)
			.command($locations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
