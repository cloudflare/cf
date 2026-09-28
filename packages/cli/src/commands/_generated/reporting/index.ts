import $industry from "./industry/index.js";
import $policies from "./policies/index.js";
import $reports from "./reports/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * reporting command
 * @generated from apis/overlays/reporting.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "reporting",
	describe: "reporting",

	builder: (yargs) => {
		return yargs
			.command($industry)
			.command($policies)
			.command($reports)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
