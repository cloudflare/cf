import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * user-policy-checks command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "user-policy-checks",
	describe: "Operations for access.applications.user-policy-checks",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
