import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * os command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "os",
	describe: "Operations for http.ases.os",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
