import $create from "./create.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * retention command group
 * @generated from apis/overlays/logs.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "retention",
	describe: "Operations for control.retention",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
