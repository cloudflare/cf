import $search from "./search.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * scripts command group
 * @generated from apis/overlays/workers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "scripts",
	describe: "Operations for scripts",

	builder: (yargs) => {
		return yargs
			.command($search)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
