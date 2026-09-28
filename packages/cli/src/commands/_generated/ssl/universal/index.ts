import $settings from "./settings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * universal command group
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "universal",
	describe: "Operations for universal",

	builder: (yargs) => {
		return yargs
			.command($settings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
