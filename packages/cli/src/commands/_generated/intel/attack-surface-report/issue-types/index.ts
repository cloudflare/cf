import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * issue-types command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "issue-types",
	describe: "Operations for attack-surface-report.issue-types",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
