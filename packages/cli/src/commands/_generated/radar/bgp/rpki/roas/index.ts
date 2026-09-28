import $timeseries from "./timeseries.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * roas command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "roas",
	describe: "Operations for bgp.rpki.roas",

	builder: (yargs) => {
		return yargs
			.command($timeseries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
