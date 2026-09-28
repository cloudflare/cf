import $audit from "./audit/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * logs command group
 * @generated from apis/overlays/organizations.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "logs",
	describe: "Operations for logs",

	builder: (yargs) => {
		return yargs
			.command($audit)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
