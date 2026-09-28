import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * monthly-report command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "monthly-report",
	describe: "Operations for analytics.monthly-report",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
