import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rollouts command group
 * @generated from apis/overlays/containers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rollouts",
	describe: "Manage rollouts for scheduler-backed applications",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
