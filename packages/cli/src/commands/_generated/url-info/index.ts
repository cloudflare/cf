import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * url-info command
 * @generated from apis/overlays/url-info.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "url-info",
	describe: "url-info",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
