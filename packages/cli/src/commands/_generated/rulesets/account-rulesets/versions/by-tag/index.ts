import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * by-tag command group
 * @generated from apis/overlays/rulesets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "by-tag",
	describe: "Operations for account-rulesets.versions.by-tag",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
