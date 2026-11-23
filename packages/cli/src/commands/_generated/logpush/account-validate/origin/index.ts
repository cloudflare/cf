import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * origin command group
 * @generated from apis/overlays/logpush.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "origin",
	describe: "Operations for account-validate.origin",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
