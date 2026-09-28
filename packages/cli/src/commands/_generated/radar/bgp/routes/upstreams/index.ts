import $timeseries from "./timeseries.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * upstreams command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "upstreams",
	describe: "Operations for bgp.routes.upstreams",

	builder: (yargs) => {
		return yargs
			.command($timeseries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
