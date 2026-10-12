import $eligibility from "./eligibility.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * appeals command group
 * @generated from apis/overlays/abuse-reports.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "appeals",
	describe: "Appeal eligibility for abuse reports",

	builder: (yargs) => {
		return yargs
			.command($eligibility)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
