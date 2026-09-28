import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rate-limit-analytics command
 * @generated from apis/overlays/rate-limit-analytics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rate-limit-analytics",
	describe: "rate-limit-analytics",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
