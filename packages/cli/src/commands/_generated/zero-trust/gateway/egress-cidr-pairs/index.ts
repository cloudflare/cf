import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * egress-cidr-pairs command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "egress-cidr-pairs",
	describe: "Operations for gateway.egress-cidr-pairs",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
