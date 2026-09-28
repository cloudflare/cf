import $asset from "./as-set.js";
import $botnetthreatfeed from "./botnet-threat-feed.js";
import $get from "./get.js";
import $ip from "./ip.js";
import $list from "./list.js";
import $rel from "./rel.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * asns command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "asns",
	describe: "Operations for entities.asns",

	builder: (yargs) => {
		return yargs
			.command($asset)
			.command($botnetthreatfeed)
			.command($get)
			.command($ip)
			.command($list)
			.command($rel)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
