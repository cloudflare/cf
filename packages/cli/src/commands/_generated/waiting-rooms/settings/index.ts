import $edit from "./edit.js";
import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * settings command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "settings",
	describe: "Zone-level waiting room defaults and cookie configuration",

	builder: (yargs) => {
		return yargs
			.command($edit)
			.command($get)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
