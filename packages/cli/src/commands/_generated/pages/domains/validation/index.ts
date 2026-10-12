import $retry from "./retry.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * validation command group
 * @generated from apis/overlays/pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "validation",
	describe: "Operations for domains.validation",

	builder: (yargs) => {
		return yargs
			.command($retry)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
