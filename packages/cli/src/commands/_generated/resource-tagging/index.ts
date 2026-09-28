import $summary from "./summary/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * resource-tagging command
 * @generated from apis/overlays/resource-tagging.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "resource-tagging",
	describe: "resource-tagging",

	builder: (yargs) => {
		return yargs
			.command($summary)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
