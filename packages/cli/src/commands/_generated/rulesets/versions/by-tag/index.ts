import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * by-tag command group
 * @generated from apis/overlays/rulesets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "by-tag",
	describe: "Operations for versions.by-tag",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
