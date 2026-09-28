import $accountrulesets from "./account-rulesets/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rulesets command
 * @generated from apis/overlays/rulesets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rulesets",
	describe: "rulesets",

	builder: (yargs) => {
		return yargs
			.command($accountrulesets)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
