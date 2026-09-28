import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * device-type command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "device-type",
	describe: "Operations for http.ases.device-type",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
