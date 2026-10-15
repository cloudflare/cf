import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * preview command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "preview",
	describe:
		"Preview how a monitor configuration evaluates pool health before applying it",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
