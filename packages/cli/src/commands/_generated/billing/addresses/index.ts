import $validate from "./validate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * addresses command group
 * @generated from apis/overlays/billing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "addresses",
	describe: "Operations for addresses",

	builder: (yargs) => {
		return yargs
			.command($validate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
