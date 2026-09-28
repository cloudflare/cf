import $changes from "./changes.js";
import $snapshot from "./snapshot.js";
import $timeseries from "./timeseries.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * aspa command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "aspa",
	describe: "Operations for bgp.rpki.aspa",

	builder: (yargs) => {
		return yargs
			.command($changes)
			.command($snapshot)
			.command($timeseries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
