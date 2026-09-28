import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * network-path command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "network-path",
	describe: "Operations for dex.tests.network-path",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
