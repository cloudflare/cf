import $hostnameassociations from "./hostname-associations/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * certificate-authorities command
 * @generated from apis/overlays/certificate-authorities.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "certificate-authorities",
	describe: "certificate-authorities",

	builder: (yargs) => {
		return yargs
			.command($hostnameassociations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
