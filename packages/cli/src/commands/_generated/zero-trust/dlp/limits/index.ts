import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * limits command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "limits",
	describe: "Data Loss Prevention - view account limits and resource quotas",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
