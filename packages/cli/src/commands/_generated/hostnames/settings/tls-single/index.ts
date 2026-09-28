import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tls-single command group
 * @generated from apis/overlays/hostnames.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tls-single",
	describe: "Operations for settings.tls-single",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
