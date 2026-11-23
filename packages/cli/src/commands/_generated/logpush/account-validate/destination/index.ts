import $delete from "./delete.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * destination command group
 * @generated from apis/overlays/logpush.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "destination",
	describe: "Operations for account-validate.destination",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
