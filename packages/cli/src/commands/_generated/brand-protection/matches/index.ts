import $bulkdismiss from "./bulk-dismiss.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * matches command group
 * @generated from apis/overlays/brand-protection.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "matches",
	describe: "Operations for matches",

	builder: (yargs) => {
		return yargs
			.command($bulkdismiss)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
