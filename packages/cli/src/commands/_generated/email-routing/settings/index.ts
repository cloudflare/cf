import $edit from "./edit.js";
import $get from "./get.js";
import $replace from "./replace.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * settings command group
 * @generated from apis/overlays/email-routing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "settings",
	describe: "Inspect and update Email Routing settings",

	builder: (yargs) => {
		return yargs
			.command($edit)
			.command($get)
			.command($replace)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
