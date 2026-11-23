import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * jobs command group
 * @generated from apis/overlays/logpush.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "jobs",
	describe: "Operations for account-datasets.jobs",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
