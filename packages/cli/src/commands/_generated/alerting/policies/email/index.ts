import $details from "./details.js";
import $unsubscribe from "./unsubscribe.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * email command group
 * @generated from apis/overlays/alerting.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "email",
	describe: "Operations for policies.email",

	builder: (yargs) => {
		return yargs
			.command($details)
			.command($unsubscribe)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
