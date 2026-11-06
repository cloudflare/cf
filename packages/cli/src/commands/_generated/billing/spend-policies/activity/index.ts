import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * activity command group
 * @generated from apis/overlays/billing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "activity",
	describe: "Operations for spend-policies.activity",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
