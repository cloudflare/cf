import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bindings command group
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bindings",
	describe: "Operations for dispatch-namespaces.scripts.bindings",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
