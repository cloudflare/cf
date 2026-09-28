import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * auth-methods command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "auth-methods",
	describe: "Operations for casb.applications.auth-methods",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
