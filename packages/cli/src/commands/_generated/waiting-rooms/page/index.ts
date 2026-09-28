import $preview from "./preview.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * page command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "page",
	describe: "Custom HTML waiting page templates and preview rendering",

	builder: (yargs) => {
		return yargs
			.command($preview)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
