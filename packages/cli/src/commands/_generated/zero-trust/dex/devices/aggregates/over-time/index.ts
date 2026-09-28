import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * over-time command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "over-time",
	describe: "Operations for dex.devices.aggregates.over-time",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
