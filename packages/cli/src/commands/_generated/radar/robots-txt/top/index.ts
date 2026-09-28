import $domaincategories from "./domain-categories.js";
import $useragents from "./user-agents/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "top",
	describe: "Operations for robots-txt.top",

	builder: (yargs) => {
		return yargs
			.command($domaincategories)
			.command($useragents)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
