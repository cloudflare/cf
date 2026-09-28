import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * json command group
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "json",
	describe: "Operations for devtools.json",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
