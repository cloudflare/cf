import $domain from "./domain/index.js";
import $internetservices from "./internet-services/index.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $top from "./top.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ranking command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ranking",
	describe:
		"Top domain rankings based on DNS query popularity across the Cloudflare network",

	builder: (yargs) => {
		return yargs
			.command($timeseriesgroups)
			.command($top)
			.command($domain)
			.command($internetservices)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
