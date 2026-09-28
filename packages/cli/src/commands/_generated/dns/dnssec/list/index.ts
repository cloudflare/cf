import $zsks from "./zsks.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * list command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "list",
	describe: "Operations for dnssec.list",

	builder: (yargs) => {
		return yargs.command($zsks).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
