import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * page command group
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "page",
	describe: "Operations for devtools.browser.page",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
