import $get from "./get.js";
import $submit from "./submit.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * urls command group
 * @generated from apis/overlays/brand-protection.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "urls",
	describe: "Operations for urls",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($submit)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
