import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * fields command group
 * @generated from apis/overlays/logpush.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "fields",
	describe: "Operations for account-datasets.fields",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
