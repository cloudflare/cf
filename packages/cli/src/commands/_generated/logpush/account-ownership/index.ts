import $create from "./create.js";
import $validate from "./validate/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account-ownership command group
 * @generated from apis/overlays/logpush.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account-ownership",
	describe: "Operations for account-ownership",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($validate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
