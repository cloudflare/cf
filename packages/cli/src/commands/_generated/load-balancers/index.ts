import $account from "./account/index.js";
import $monitorgroups from "./monitor-groups/index.js";
import $monitors from "./monitors/index.js";
import $pools from "./pools/index.js";
import $previews from "./previews/index.js";
import $regions from "./regions/index.js";
import $searches from "./searches/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * load-balancers command
 * @generated from apis/overlays/load-balancers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "load-balancers",
	describe:
		"Distribute traffic across origin pools with health monitoring, geo-steering, and failover",

	builder: (yargs) => {
		return yargs
			.command($account)
			.command($monitorgroups)
			.command($monitors)
			.command($pools)
			.command($previews)
			.command($regions)
			.command($searches)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
