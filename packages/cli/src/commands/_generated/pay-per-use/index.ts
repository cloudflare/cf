import $enableddomains from "./enabled-domains/index.js";
import $usagereports from "./usage-reports/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * pay-per-use command
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "pay-per-use",
	describe: "pay-per-use",

	builder: (yargs) => {
		return yargs
			.command($enableddomains)
			.command($usagereports)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
