import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * details command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "details",
	describe: "Operations for events.details",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
