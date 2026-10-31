import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * usage-limit command group
 * @generated from apis/overlays/observability.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "usage-limit",
	describe: "Operations for usage-limit",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
