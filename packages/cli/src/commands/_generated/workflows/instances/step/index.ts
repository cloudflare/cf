import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * step command group
 * @generated from apis/overlays/workflows.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "step",
	describe: "Operations for instances.step",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
