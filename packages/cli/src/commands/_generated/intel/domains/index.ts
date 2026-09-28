import $bulks from "./bulks/index.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * domains command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "domains",
	describe:
		"Domain intelligence — risk scores, categories, and associated infrastructure",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($bulks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
