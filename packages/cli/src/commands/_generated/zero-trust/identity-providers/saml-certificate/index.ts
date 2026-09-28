import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * saml-certificate command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "saml-certificate",
	describe: "Operations for identity-providers.saml-certificate",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
