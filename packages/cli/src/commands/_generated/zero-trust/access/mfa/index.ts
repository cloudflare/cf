import $authenticatorcatalog from "./authenticator-catalog/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * mfa command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "mfa",
	describe: "Operations for access.mfa",

	builder: (yargs) => {
		return yargs
			.command($authenticatorcatalog)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
