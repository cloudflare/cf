import $applications from "./applications.js";
import $by from "./by/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * get command group
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "get",
	describe: "Operations for applications.get",

	builder: (yargs) => {
		return yargs
			.command($applications)
			.command($by)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
