import $mfa from "./mfa/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * users command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "users",
	describe: "Operations for users",

	builder: (yargs) => {
		return yargs.command($mfa).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
