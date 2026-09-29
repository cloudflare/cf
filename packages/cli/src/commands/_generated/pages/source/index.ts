import $connect from "./connect.js";
import $disconnect from "./disconnect.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * source command group
 * @generated from apis/overlays/pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "source",
	describe: "Operations for source",

	builder: (yargs) => {
		return yargs
			.command($connect)
			.command($disconnect)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
