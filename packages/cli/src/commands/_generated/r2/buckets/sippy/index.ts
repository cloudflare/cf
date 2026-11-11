import $disable from "./disable.js";
import $enable from "./enable.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * sippy command group
 * @generated from apis/overlays/r2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "sippy",
	describe: "Operations for buckets.sippy",

	builder: (yargs) => {
		return yargs
			.command($disable)
			.command($enable)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
