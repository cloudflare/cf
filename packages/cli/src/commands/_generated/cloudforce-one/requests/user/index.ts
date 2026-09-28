import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * user command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "user",
	describe: "Operations for requests.user",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
