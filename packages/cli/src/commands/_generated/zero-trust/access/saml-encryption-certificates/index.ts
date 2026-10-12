import $getpem from "./get-pem.js";
import $get from "./get.js";
import $list from "./list.js";
import $rotate from "./rotate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * saml-encryption-certificates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "saml-encryption-certificates",
	describe: "Operations for access.saml-encryption-certificates",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($getpem)
			.command($list)
			.command($rotate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
