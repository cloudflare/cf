import $indicators from "./indicators/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tags command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tags",
	describe: "Operations for events.dataset.tags",

	builder: (yargs) => {
		return yargs
			.command($indicators)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
