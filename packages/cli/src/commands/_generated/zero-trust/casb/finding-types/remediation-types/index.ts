import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * remediation-types command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "remediation-types",
	describe: "Operations for casb.finding-types.remediation-types",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
