import $contentfindings from "./content-findings/index.js";
import $findings from "./findings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * data-security command group
 * @generated from apis/overlays/analytics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "data-security",
	describe: "Operations for query.data-security",

	builder: (yargs) => {
		return yargs
			.command($contentfindings)
			.command($findings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
