import $delete from "./delete.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * passkeys command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "passkeys",
	describe: "Operations for users.passkeys",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
