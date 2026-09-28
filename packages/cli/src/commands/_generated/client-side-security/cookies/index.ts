import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * cookies command group
 * @generated from apis/overlays/client-side-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "cookies",
	describe:
		"Cookies set by your pages with classification and same-site attribute tracking",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
