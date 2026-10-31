import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * hostname-associations command group
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "hostname-associations",
	describe: "Operations for certificate-authorities.hostname-associations",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
