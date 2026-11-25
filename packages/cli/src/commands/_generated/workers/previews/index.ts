import $deployments from "./deployments/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * previews command group
 * @generated from apis/overlays/workers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "previews",
	describe: "Operations for previews",

	builder: (yargs) => {
		return yargs
			.command($deployments)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
