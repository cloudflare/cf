import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * protocols command group
 * @generated from apis/overlays/spectrum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "protocols",
	describe: "Operations for protocols",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
