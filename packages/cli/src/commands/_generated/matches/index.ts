import $download from "./download/index.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * matches command
 * @generated from apis/overlays/matches.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "matches",
	describe: "matches",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($download)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
