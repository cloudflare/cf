import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * health command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "health",
	describe: "View the current health of an origin pool",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
