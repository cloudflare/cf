import $bytimes from "./bytimes/index.js";
import $summaries from "./summaries/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * events command group
 * @generated from apis/overlays/spectrum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "events",
	describe: "Operations for analytics.events",

	builder: (yargs) => {
		return yargs
			.command($bytimes)
			.command($summaries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
