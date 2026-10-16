import $hostnameassociations from "./hostname-associations/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * certificate-authorities command group
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "certificate-authorities",
	describe: "Operations for certificate-authorities",

	builder: (yargs) => {
		return yargs
			.command($hostnameassociations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
