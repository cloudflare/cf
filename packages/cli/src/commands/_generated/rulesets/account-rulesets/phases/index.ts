import $get from "./get.js";
import $update from "./update.js";
import $versions from "./versions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * phases command group
 * @generated from apis/overlays/rulesets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "phases",
	describe: "Operations for account-rulesets.phases",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($update)
			.command($versions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
