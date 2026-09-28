import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * metadata command group
 * @generated from apis/overlays/kv.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "metadata",
	describe: "Operations for metadata",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
