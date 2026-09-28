import $report from "./report/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zones command group
 * @generated from apis/overlays/spectrum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zones",
	describe: "Operations for analytics.zones",

	builder: (yargs) => {
		return yargs
			.command($report)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
