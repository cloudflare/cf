import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * http-version command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "http-version",
	describe: "Operations for http.top.locations.http-version",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
