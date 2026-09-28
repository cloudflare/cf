import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * hostname-associations command group
 * @generated from apis/overlays/origin-tls-client-auth.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "hostname-associations",
	describe: "Operations for hostname-associations",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
