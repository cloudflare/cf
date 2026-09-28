import $destinationexistsdelete from "./destination-exists-delete.js";
import $destination from "./destination/index.js";
import $origin from "./origin/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account-validate command group
 * @generated from apis/overlays/logpush.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account-validate",
	describe: "Operations for account-validate",

	builder: (yargs) => {
		return yargs
			.command($destinationexistsdelete)
			.command($destination)
			.command($origin)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
