import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * colos command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "colos",
	describe: "Operations for dex.colos",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
