import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * profile command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "profile",
	describe: "Operations for billing.profile",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
