import $directive from "./directive.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * user-agents command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "user-agents",
	describe: "Operations for robots-txt.top.user-agents",

	builder: (yargs) => {
		return yargs
			.command($directive)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
