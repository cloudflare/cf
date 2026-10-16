import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * prioritize command group
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "prioritize",
	describe: "Operations for custom-certificates.prioritize",

	builder: (yargs) => {
		return yargs
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
