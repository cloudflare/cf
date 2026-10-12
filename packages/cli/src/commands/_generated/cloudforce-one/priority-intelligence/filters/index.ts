import $generate from "./generate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * filters command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "filters",
	describe: "Operations for priority-intelligence.filters",

	builder: (yargs) => {
		return yargs
			.command($generate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
