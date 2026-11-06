import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * audit command group
 * @generated from apis/overlays/billing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "audit",
	describe: "Operations for spend-policies.audit",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
