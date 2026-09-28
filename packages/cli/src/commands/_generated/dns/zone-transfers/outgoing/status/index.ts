import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * status command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "status",
	describe: "Operations for zone-transfers.outgoing.status",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
