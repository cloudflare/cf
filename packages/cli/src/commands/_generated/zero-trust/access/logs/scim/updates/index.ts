import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * updates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "updates",
	describe: "Operations for access.logs.scim.updates",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
