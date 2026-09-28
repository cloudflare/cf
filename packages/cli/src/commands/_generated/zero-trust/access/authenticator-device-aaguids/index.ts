import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * authenticator-device-aaguids command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "authenticator-device-aaguids",
	describe: "Operations for access.authenticator-device-aaguids",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
