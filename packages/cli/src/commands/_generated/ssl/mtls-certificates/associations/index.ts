import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * associations command group
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "associations",
	describe: "Operations for mtls-certificates.associations",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
