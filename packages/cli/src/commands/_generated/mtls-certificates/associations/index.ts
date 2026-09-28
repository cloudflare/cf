import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * associations command group
 * @generated from apis/overlays/mtls-certificates.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "associations",
	describe: "Operations for associations",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
