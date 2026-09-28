import $policies from "./policies/index.js";
import $review from "./review/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * apps command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "apps",
	describe: "Operations for apps",

	builder: (yargs) => {
		return yargs
			.command($policies)
			.command($review)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
