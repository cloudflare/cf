import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * settings command group
 * @generated from apis/overlays/d1.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "settings",
	describe: "turn AI-generated D1 Insights on or off for your account",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
