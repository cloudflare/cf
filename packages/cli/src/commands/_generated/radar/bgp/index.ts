import $hijacks from "./hijacks/index.js";
import $ips from "./ips/index.js";
import $leaks from "./leaks/index.js";
import $routes from "./routes/index.js";
import $rpki from "./rpki/index.js";
import $timeseries from "./timeseries.js";
import $top from "./top/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bgp command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bgp",
	describe:
		"BGP routing data — prefix announcements, AS-level stats, route leaks, and hijack events",

	builder: (yargs) => {
		return yargs
			.command($timeseries)
			.command($hijacks)
			.command($ips)
			.command($leaks)
			.command($routes)
			.command($rpki)
			.command($top)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
