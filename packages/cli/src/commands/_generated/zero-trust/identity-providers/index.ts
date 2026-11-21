import $federationgrants from "./federation-grants/index.js";
import $samlcertificate from "./saml-certificate/index.js";
import $scim from "./scim/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * identity-providers command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "identity-providers",
	describe: "Operations for identity-providers",

	builder: (yargs) => {
		return yargs
			.command($federationgrants)
			.command($samlcertificate)
			.command($scim)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
