import $lists from "./lists/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rules command
 * @generated from apis/overlays/rules.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rules",
	describe:
		"Account-level IP lists, hostname lists, and other reusable lists referenced by Rulesets rules",

	builder: (yargs) => {
		return yargs
			.command($lists)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
