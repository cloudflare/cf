import $bulkget from "./bulk-get.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * robots command group
 * @generated from apis/overlays/ai-audit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "robots",
	describe: "Operations for robots",

	builder: (yargs) => {
		return yargs
			.command($bulkget)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
