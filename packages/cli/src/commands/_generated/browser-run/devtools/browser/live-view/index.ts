import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * live-view command group
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "live-view",
	describe: "Operations for devtools.browser.live-view",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
