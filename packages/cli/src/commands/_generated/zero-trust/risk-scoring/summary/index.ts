import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * summary command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "summary",
	describe: "User Risk Scoring - retrieve account risk score summaries",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
