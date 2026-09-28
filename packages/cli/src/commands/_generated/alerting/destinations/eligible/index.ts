import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * eligible command group
 * @generated from apis/overlays/alerting.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "eligible",
	describe: "Operations for destinations.eligible",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
