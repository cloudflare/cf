import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * context command group
 * @generated from apis/overlays/security-center.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "context",
	describe: "Operations for zone-insights.context",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
