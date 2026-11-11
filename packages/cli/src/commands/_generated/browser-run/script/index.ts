import $create from "./create.js";
import $execute from "./execute.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * script command group
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "script",
	describe: "Operations for script",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($execute)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
