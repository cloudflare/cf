import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * invite command group
 * @generated from apis/overlays/organization.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "invite",
	describe: "Operations for invite",

	builder: (yargs) => {
		return yargs
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
