import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zsks command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zsks",
	describe: "Operations for dnssec.zsks",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
