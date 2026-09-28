import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * responses command group
 * @generated from apis/overlays/url-scanner.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "responses",
	describe: "Raw HTTP response data captured during URL scans",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
