import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * available-alerts command group
 * @generated from apis/overlays/alerting.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "available-alerts",
	describe: "Operations for available-alerts",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
