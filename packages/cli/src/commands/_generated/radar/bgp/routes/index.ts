import $ases from "./ases.js";
import $moas from "./moas.js";
import $paths from "./paths/index.js";
import $pfx2as from "./pfx2as.js";
import $realtime from "./realtime.js";
import $stats from "./stats.js";
import $upstreams from "./upstreams/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * routes command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "routes",
	describe: "Operations for bgp.routes",

	builder: (yargs) => {
		return yargs
			.command($ases)
			.command($moas)
			.command($pfx2as)
			.command($realtime)
			.command($stats)
			.command($paths)
			.command($upstreams)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
