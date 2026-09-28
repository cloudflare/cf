import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * http-method command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "http-method",
	describe: "Operations for http.locations.http-method",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
