import $live from "./live/index.js";
import $overtime from "./over-time/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * aggregates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "aggregates",
	describe: "Operations for dex.devices.aggregates",

	builder: (yargs) => {
		return yargs
			.command($live)
			.command($overtime)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
