import $reports from "./reports/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * phishguard command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "phishguard",
	describe:
		"PhishGuard user-reported phishing reports — view detected threats for a date range",

	builder: (yargs) => {
		return yargs
			.command($reports)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
