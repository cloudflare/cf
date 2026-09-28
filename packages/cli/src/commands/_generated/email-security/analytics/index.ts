import $monthlyreport from "./monthly-report/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * analytics command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "analytics",
	describe: "Operations for analytics",

	builder: (yargs) => {
		return yargs
			.command($monthlyreport)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
